import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5051/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const externalApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 