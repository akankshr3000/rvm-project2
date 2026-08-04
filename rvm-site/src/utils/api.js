import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Auto-attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rvm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally and add connectivity logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 🔴 Added Connectivity Debug Logging
    if (!err.response) {
      console.error('NETWORK ERROR: Backend server might be down or unreachable.', err.message);
    } else {
      console.error(`API ERROR (${err.response?.status}):`, err.response?.data?.message || err.message);
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('rvm_token');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
