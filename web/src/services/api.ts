import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

let isRedirecting = false;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !isRedirecting) {
        isRedirecting = true;
        console.warn("Sessão expirada. Redirecionando...");
        
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;