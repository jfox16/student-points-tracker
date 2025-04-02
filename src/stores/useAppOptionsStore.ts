import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppOptions } from '../types/appOptions.type';

const DEFAULT_APP_OPTIONS: AppOptions = {
  enableKeybinds: true,
  pointSound: 'ding',
  reverseOrder: false,
};

interface AppOptionsState {
  appOptions: AppOptions;
  updateAppOptions: (updates: Partial<AppOptions>) => void;
}

export const useAppOptionsStore = create<AppOptionsState>()(
  persist(
    (set) => ({
      appOptions: DEFAULT_APP_OPTIONS,
      updateAppOptions: (updates) =>
        set((state) => ({
          appOptions: {
            ...state.appOptions,
            ...updates,
          },
        })),
    }),
    {
      name: 'app-options',
    }
  )
); 