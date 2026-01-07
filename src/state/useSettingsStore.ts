import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QualityLevel = 'high' | 'medium' | 'low';
export type Theme = 'dark' | 'light';

interface SettingsState {
  quality: QualityLevel;
  shadows: boolean;
  showStats: boolean;
  theme: Theme;
  setQuality: (quality: QualityLevel) => void;
  setShadows: (enabled: boolean) => void;
  setShowStats: (enabled: boolean) => void;
  setTheme: (theme: Theme) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      quality: 'high',
      shadows: true,
      showStats: false,
      theme: 'dark',
      setQuality: (quality) => set({ quality }),
      setShadows: (shadows) => set({ shadows }),
      setShowStats: (showStats) => set({ showStats }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'reaction-forge-settings',
    }
  )
);

