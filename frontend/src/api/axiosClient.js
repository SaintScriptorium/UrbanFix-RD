import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Adjunta el token a cada request saliente en vez de repetir el header en
// cada llamada de authService/reportService. Épica 2 (reportes) reutilizará
// este mismo cliente sin tocar esta parte.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbanfix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
