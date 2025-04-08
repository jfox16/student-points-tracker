import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KeybindState {
  keyBindingsMap: Record<string, string>;
  setKeyBinding: (studentId: string, key: string) => void;
  removeKeyBinding: (studentId: string) => void;
}

export const useKeybindStore = create<KeybindState>()(
  persist(
    (set) => ({
      keyBindingsMap: {},
      setKeyBinding: (studentId, key) =>
        set((state) => ({
          keyBindingsMap: {
            ...state.keyBindingsMap,
            [studentId]: key,
          },
        })),
      removeKeyBinding: (studentId) =>
        set((state) => {
          const { [studentId]: _, ...rest } = state.keyBindingsMap;
          return {
            keyBindingsMap: rest,
          };
        }),
    }),
    {
      name: 'keybind-storage',
    }
  )
); 