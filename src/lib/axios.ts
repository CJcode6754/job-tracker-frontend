import axios from 'axios';
import { clearAuth } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      clearAuth();
    } else if (status === 403) {
      import('sonner').then(({ toast }) => toast.error("You don't have permission to do that."));
    } else if (status >= 500) {
      import('sonner').then(({ toast }) => toast.error("Server error. Please try again later."));
    }

    return Promise.reject(error);
  }
);

export default api;
