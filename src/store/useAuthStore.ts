import { create } from 'zustand';
import api from '@/lib/axios';
import type { AuthUser } from '@/types';

const EXPIRY_MINUTES = 40;            // must match sanctum.expiration
const REFRESH_BEFORE = 5;             // refresh this many minutes before expiry
const REFRESH_MS     = (EXPIRY_MINUTES - REFRESH_BEFORE) * 60 * 1000;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh(refreshFn: () => Promise<void>) {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    try {
      await refreshFn();
    } catch {
      // refresh failed — 401 interceptor will handle redirect
    }
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
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      set({ user: null, loading: false });
      return;
    }

    try {
      const { data } = await api.get('/me');
      set({ user: data, loading: false });

      // Check how much time is left and schedule refresh accordingly
      const expiresAt = sessionStorage.getItem('token_expires_at');
      if (expiresAt) {
        const msLeft = Number(expiresAt) - Date.now();
        const refreshIn = msLeft - REFRESH_BEFORE * 60 * 1000;
        if (refreshIn > 0) {
          if (refreshTimer) clearTimeout(refreshTimer);
          refreshTimer = setTimeout(async () => {
            try { await get().refreshToken(); } catch { /* 401 interceptor handles it */ }
          }, refreshIn);
        } else {
          // Less than 20 min left — refresh immediately
          await get().refreshToken();
        }
      } else {
        scheduleRefresh(() => get().refreshToken());
      }
    } catch {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('token_expires_at');
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('token_expires_at', String(Date.now() + EXPIRY_MINUTES * 60 * 1000));
    set({ user: data.user });
    scheduleRefresh(() => get().refreshToken());
  },

  register: async (name, email, password, passwordConfirmation) => {
    const { data } = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('token_expires_at', String(Date.now() + EXPIRY_MINUTES * 60 * 1000));
    set({ user: data.user });
    scheduleRefresh(() => get().refreshToken());
  },

  refreshToken: async () => {
    const { data } = await api.post('/refresh');
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('token_expires_at', String(Date.now() + EXPIRY_MINUTES * 60 * 1000));
    // Schedule the next refresh
    scheduleRefresh(() => get().refreshToken());
  },

  logout: async () => {
    clearRefreshTimer();
    try {
      await api.post('/logout');
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('token_expires_at');
      set({ user: null });
    }
  },
}));
