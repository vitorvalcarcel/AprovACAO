import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 1. Interface para controlar as tentativas na configuração da requisição
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

// 2. Configurações de Tempo (Estratégia para ~13 segundos totais)
// 3 tentativas x 4 segundos de espera = 12 segundos + tempo de processamento
const MAX_RETRIES = 3; 
const RETRY_DELAY = 4000; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  // 3. Define um limite de tempo por requisição (se o back travar processando)
  timeout: 13000, 
});

let isRedirecting = false;

// Função auxiliar para disparar o evento que o ToastContext escuta
const dispatchToast = (type: 'success'|'error'|'info', title: string, message?: string) => {
  window.dispatchEvent(new CustomEvent('toast-event', {
    detail: { type, title, message }
  }));
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

    // --- Lógica de Retry (Espera antes de falhar) ---
    // Se for erro de rede (!error.response) e ainda tivermos tentativas
    if (!error.response && config && (config._retryCount || 0) < MAX_RETRIES) {
        // Ignora retry se for o próprio health check
        if (url && !url.includes('/actuator/health')) {
            config._retryCount = (config._retryCount || 0) + 1;
            
            // Pausa a execução por 4 segundos
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            
            // Tenta a requisição novamente
            return api(config);
        }
    }

    // --- Detecção de Queda Definitiva (Após as tentativas falharem) ---
    if (url && !url.includes('/actuator/health')) {
      // Se não tem resposta (Back off) ou Erro 500+
      if (!error.response || error.response.status >= 500) {
        if (window.location.pathname !== '/manutencao') {
          window.location.href = '/manutencao';
          return Promise.reject(error);
        }
      }
    }

    // Se chegou aqui e não tem response, rejeita
    if (!error.response) {
       return Promise.reject(error);
    }

    const status = error.response.status;
    const data = error.response.data;

    // 2. Erro 403 (Proibido/Sessão Expirada)
    if (status === 403) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !isRedirecting) {
        isRedirecting = true;
        dispatchToast('info', 'Sessão Expirada', 'Por favor, faça login novamente.');
        
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 3. Erro 400 (Bad Request - Validação ou Negócio)
    if (status === 400) {
      // Se for lista de erros de validação (array)
      if (Array.isArray(data)) {
        return Promise.reject(error); 
      }
      
      // Se for erro de negócio (Objeto DadosErro do Java: { mensagem: "..." })
      if (data && data.mensagem) {
        dispatchToast('error', 'Atenção', data.mensagem);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// --- INTERFACES E MÉTODOS DE FEEDBACK (Novos) ---

export interface IFeedbackDTO {
  tipo: 'BUG' | 'SUGESTAO' | 'ELOGIO' | 'OUTRO';
  mensagem: string;
}

export const enviarFeedback = async (dados: IFeedbackDTO) => {
  const response = await api.post('/feedbacks', dados);
  return response.data;
};

export default api;