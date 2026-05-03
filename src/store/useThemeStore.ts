import { create } from 'zustand';

export const THEMES = [
  'light', 'dark', 'cupcake', 'emerald', 'corporate', 'lofi', 'luxury', 'dracula', 'business', 
  'night', 'winter', 'dim', 'nord', 'sunset',
] as const;

export type Theme = typeof THEMES[number];

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const saved = (localStorage.getItem('theme') as Theme) ?? 'light';
document.documentElement.setAttribute('data-theme', saved);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: saved,
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));
