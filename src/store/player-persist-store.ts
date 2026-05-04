'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PlayerPersistState {
  savedIndex: number | null;
  savedAnswer: string | number | string[] | null;
  shouldRestore: boolean;
  saveBeforeRefresh: (index: number, answer: string | number | string[] | null | undefined) => void;
  consumeRestore: () => { index: number; answer: string | number | string[] | null } | null;
}

export const usePlayerPersistStore = create<PlayerPersistState>()(
  persist(
    (set, get) => ({
      savedIndex: null,
      savedAnswer: null,
      shouldRestore: false,

      saveBeforeRefresh: (index, answer) =>
        set({ savedIndex: index, savedAnswer: answer ?? null, shouldRestore: true }),

      consumeRestore: () => {
        const { savedIndex, savedAnswer, shouldRestore } = get();
        if (!shouldRestore || savedIndex === null) return null;
        set({ savedIndex: null, savedAnswer: null, shouldRestore: false });
        return { index: savedIndex, answer: savedAnswer };
      },
    }),
    {
      name: 'player-persist',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return sessionStorage;
      }),
    }
  )
);
