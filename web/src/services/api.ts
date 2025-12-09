import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Endereço do Backend Java
});

// Antes de qualquer requisição sair, verifica se tem um token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Se tiver token, anexa ele no cabeçalho
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;