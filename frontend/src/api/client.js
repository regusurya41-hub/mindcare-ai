import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://mindcare-ai-tn9d.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindcare_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mindcare_token');
      localStorage.removeItem('mindcare_user');
    }

    return Promise.reject(error);
  }
);