import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppOptions {
  reverseOrder: boolean;
  enableKeybinds: boolean;
  pointSound: 'ding' | 'bell' | 'none';
}

interface AppOptionsState {
  appOptions: AppOptions;
  setAppOptions: (options: Partial<AppOptions>) => void;
}

export const useAppOptionsStore = create<AppOptionsState>()(
  persist(
    (set) => ({
      appOptions: {
        reverseOrder: false,
        enableKeybinds: true,
        pointSound: 'ding',
      },
      setAppOptions: (options) =>
        set((state) => ({
          appOptions: { ...state.appOptions, ...options },
        })),
    }),
    {
      name: 'app-options-storage',
    }
  )
); 