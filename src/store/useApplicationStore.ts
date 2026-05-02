import { create } from 'zustand';
import api from '@/lib/axios';
import type { JobApplication, ApplicationStatus } from '@/types';

interface ApplicationStore {
  applications: JobApplication[];
  loading: boolean;
  fetchApplications: (params?: Record<string, string>) => Promise<void>;
  addApplication: (data: Partial<JobApplication>) => Promise<void>;
  updateApplication: (id: number, updates: Partial<JobApplication>) => Promise<void>;
  deleteApplication: (id: number) => Promise<void>;
  moveApplication: (id: number, status: ApplicationStatus) => void;
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  loading: false,

  fetchApplications: async (params = {}) => {
    set({ loading: true });
    const { data } = await api.get('/applications', { params });
    set({ applications: data, loading: false });
  },

  addApplication: async (formData) => {
    const { data } = await api.post('/applications', formData);
    set((state) => ({ applications: [data, ...state.applications] }));
  },

  updateApplication: async (id, updates) => {
    const { data } = await api.put(`/applications/${id}`, updates);
    set((state) => ({
      applications: state.applications.map((a) => (a.id === id ? data : a)),
    }));
  },

  deleteApplication: async (id) => {
    await api.delete(`/applications/${id}`);
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== id),
    }));
  },

  moveApplication: (id, status) => {
    // Optimistic update — move card instantly in UI
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    }));
    // Sync with API in background, revert on failure
    api.put(`/applications/${id}`, { status }).catch(() => {
      get().fetchApplications();
    });
  },
}));