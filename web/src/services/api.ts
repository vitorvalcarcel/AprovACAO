import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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
  (error: AxiosError<any>) => {
    
    // 1. Erro de Conexão / Network Error
    if (!error.response) {
      dispatchToast('error', 'Erro de Conexão', 'Não foi possível contatar o servidor. Verifique sua internet.');
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
      // Se for uma lista (novo formato do Back para validação de campos), 
      // NÃO mostramos toast genérico. Deixamos o componente tratar (pintar input de vermelho).
      if (Array.isArray(data)) {
        return Promise.reject(error); 
      }
      
      // Se for objeto com mensagem (regra de negócio), mostramos Toast
      if (data && data.mensagem) {
        dispatchToast('error', 'Atenção', data.mensagem);
        return Promise.reject(error);
      }
    }

    // 4. Erro 500 (Server Error)
    if (status >= 500) {
      dispatchToast('error', 'Erro no Servidor', 'Ocorreu um erro interno. Tente novamente mais tarde.');
    }

    return Promise.reject(error);
  }
);

export default api;