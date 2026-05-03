import { create } from 'zustand';
import api from '@/lib/axios';
import type { JobApplication, ApplicationStatus } from '@/types';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ApplicationStore {
  applications: JobApplication[];
  loading: boolean;
  pagination: PaginationMeta | null;
  fetchApplications: (params?: Record<string, string | number>) => Promise<void>;
  addApplication: (data: Record<string, unknown>) => Promise<void>;
  updateApplication: (id: number, updates: Record<string, unknown>) => Promise<void>;
  deleteApplication: (id: number) => Promise<void>;
  moveApplication: (id: number, status: ApplicationStatus) => void;
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  loading: false,
  pagination: null,

  fetchApplications: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/applications', { 
        params: {
          per_page: 200,
          ...params,
        }
      });
      // Handle paginated response
      const applications = data.data || data;
      const pagination = data.meta || null;
      set({ applications, pagination, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addApplication: async (formData) => {
    const { data } = await api.post('/applications', formData);
    set((state) => ({ applications: [data, ...state.applications] }));
  },

  updateApplication: async (id, updates) => {
    const app = get().applications.find((a) => a.id === id);
    if (!app) return;
    const { data } = await api.put(`/applications/${app.hash_id}`, updates);
    set((state) => ({
      applications: state.applications.map((a) => (a.id === id ? data : a)),
    }));
  },

  deleteApplication: async (id) => {
    const app = get().applications.find((a) => a.id === id);
    if (!app) return;
    await api.delete(`/applications/${app.hash_id}`);
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== id),
    }));
  },

  moveApplication: (id, status) => {
    const previous = get().applications;
    const app = previous.find((a) => a.id === id);
    if (!app) return;
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    }));
    api.put(`/applications/${app.hash_id}`, { status }).catch(() => {
      set({ applications: previous });
    });
  },
}));