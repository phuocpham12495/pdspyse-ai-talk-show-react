import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'vi' | 'en') => void;
}

export const useSettingsStore = create<SettingsState>()(persist((set) => ({
  theme: 'light',
  language: 'vi',
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}), {
  name: 'settings-store',
}));
