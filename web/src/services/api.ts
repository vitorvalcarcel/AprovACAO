import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 1. Interface expandida para controlar retry e queue
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _retry?: boolean; 
}

// 2. Configurações de Retry (Rápido: 1s)
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 3. Variáveis para controle de Refresh Token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 13000,
});

let isRedirecting = false;

const dispatchToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
  window.dispatchEvent(new CustomEvent('toast-event', {
    detail: { type, title, message }
  }));
};

const dispatchMaintenance = () => {
  window.dispatchEvent(new CustomEvent('maintenance-event'));
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {

    const config = error.config as CustomAxiosRequestConfig;
    const url = config?.url;
    const response = error.response;

    // --- 1. Lógica de Retry (Erro de Rede / Timeout) ---
    if (!response && config && (config._retryCount || 0) < MAX_RETRIES) {
      if (url && !url.includes('/actuator/health')) {
        config._retryCount = (config._retryCount || 0) + 1;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return api(config);
      }
    }

    // --- 2. Queda Definitiva (500 ou Sem Resposta após Retries) ---
    if (url && !url.includes('/actuator/health')) {
      if (!response || response.status >= 500) {
        dispatchMaintenance();
        return Promise.reject(error);
      }
    }

    // --- 3. Refresh Token (Erro 401 ou 403) ---
    if ((response?.status === 401 || response?.status === 403) && config && !config._retry) {

      if (url?.includes('/auth/login') || url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers['Authorization'] = 'Bearer ' + token;
          return api(config);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('Sem refresh token');
        }

        const { data } = await axios.post(api.defaults.baseURL + '/auth/refresh', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;

        processQueue(null, accessToken);

        config.headers['Authorization'] = 'Bearer ' + accessToken;
        return api(config);

      } catch (refreshError) {
        processQueue(refreshError, null);

        if (!isRedirecting) {
          isRedirecting = true;
          dispatchToast('info', 'Sessão Expirada', 'Faça login novamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- 4. Erros 400 (Bad Request) ---
    if (response?.status === 400) {
      const data = response.data;
      if (Array.isArray(data)) {
        return Promise.reject(error);
      }
      if (data && data.mensagem) {
        dispatchToast('error', 'Atenção', data.mensagem);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export interface IFeedbackDTO {
  tipo: 'BUG' | 'SUGESTAO' | 'ELOGIO' | 'OUTRO';
  mensagem: string;
}

export const enviarFeedback = async (dados: IFeedbackDTO) => {
  const response = await api.post('/feedbacks', dados);
  return response.data;
};

export default api;