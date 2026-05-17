import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(
    'mindcare_token'
  );

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(
        'mindcare_token'
      );

      localStorage.removeItem(
        'mindcare_user'
      );

      if (
        window.location.pathname.startsWith(
          '/app'
        )
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);