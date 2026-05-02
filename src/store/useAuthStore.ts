import { create } from 'zustand';
import api from '@/lib/axios';
import type { AuthUser } from '@/types';

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    try {
      const { data } = await api.get('/me');
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user });
  },

  register: async (name, email, password, passwordConfirmation) => {
    const { data } = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    localStorage.setItem('token', data.token);
    set({ user: data.user });
  },

  logout: async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    set({ user: null });
  },
}));