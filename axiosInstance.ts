import axios from 'axios';

// Для разработки используем полные URL к Django
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000/media';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('MEDIA_BASE_URL:', MEDIA_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к каждому запросу
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Для отладки
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      // Если токен истек или невалиден, очищаем localStorage и перенаправляем на логин
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE_URL, MEDIA_BASE_URL };