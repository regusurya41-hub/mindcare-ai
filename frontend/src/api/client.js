import axios from 'axios';

/*
|--------------------------------------------------------------------------
| API Base URL
|--------------------------------------------------------------------------
| Backend routes are mounted under:
| /api/v1
|
| Example:
| POST /api/v1/auth/login
| POST /api/v1/auth/signup
| GET  /api/v1/auth/me
|--------------------------------------------------------------------------
*/

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://mindcare-ai-3.onrender.com/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('mindcare_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      'API ERROR:',
      error.response?.data || error.message
    );

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

export default api;   