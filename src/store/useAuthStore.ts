import { create } from 'zustand';
import api from '@/lib/axios';
import type { AuthUser } from '@/types';

const EXPIRY_MINUTES = 40;
const REFRESH_BEFORE = 5;
const REFRESH_MS     = (EXPIRY_MINUTES - REFRESH_BEFORE) * 60 * 1000;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh(refreshFn: () => Promise<void>) {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    try { await refreshFn(); } catch { /* 401 interceptor handles redirect */ }
  }, REFRESH_MS);
}

function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const { data } = await api.get('/me');
      if (data && typeof data === 'object' && data.id) {
        set({ user: data, loading: false });
        scheduleRefresh(() => get().refreshToken());
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    const token = data.plainTextToken || data.token;
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user: data.user, token });
      scheduleRefresh(() => get().refreshToken());
    }
  },

  register: async (name, email, password, passwordConfirmation) => {
    const { data } = await api.post('/register', {
      name, email, password,
      password_confirmation: passwordConfirmation,
    });
    const token = data.plainTextToken || data.token;
    if (token) {
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user: data.user, token });
      scheduleRefresh(() => get().refreshToken());
    }
  },

  refreshToken: async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const { data } = await api.post('/refresh');
    if (data.plainTextToken) {
      localStorage.setItem('auth_token', data.plainTextToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.plainTextToken}`;
    }
    scheduleRefresh(() => get().refreshToken());
  },

  logout: async () => {
    clearRefreshTimer();
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      await api.post('/logout');
    } finally {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, token: null });
    }
  },
}));

export function clearAuth() {
  clearRefreshTimer();
  localStorage.removeItem('auth_token');
  delete api.defaults.headers.common['Authorization'];
  useAuthStore.setState({ user: null, loading: false, token: null });
}
