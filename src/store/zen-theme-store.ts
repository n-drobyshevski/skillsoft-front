'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ZenTheme = 'dark' | 'light';

interface ZenThemeState {
  zenTheme: ZenTheme;
  setZenTheme: (theme: ZenTheme) => void;
  toggleZenTheme: () => void;
}

export const useZenThemeStore = create<ZenThemeState>()(
  persist(
    (set, get) => ({
      zenTheme: 'dark',
      setZenTheme: (theme) => set({ zenTheme: theme }),
      toggleZenTheme: () =>
        set({ zenTheme: get().zenTheme === 'dark' ? 'light' : 'dark' }),
    }),
    {
      name: 'zen-theme',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return localStorage;
      }),
      partialize: (state) => ({ zenTheme: state.zenTheme }),
    }
  )
);

export const useZenTheme = () => useZenThemeStore((s) => s.zenTheme);
export const useToggleZenTheme = () => useZenThemeStore((s) => s.toggleZenTheme);
export const useSetZenTheme = () => useZenThemeStore((s) => s.setZenTheme);
