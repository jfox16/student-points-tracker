import { create } from "zustand";

interface SaveStatusState {
  isSaving: boolean;
  isSaved: boolean;
  setSaving: (isSaving: boolean) => void;
  setSaved: (isSaved: boolean) => void;
}

export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  isSaving: false,
  isSaved: false,
  setSaving: (isSaving) => set({ isSaving, isSaved: false }),
  setSaved: (isSaved) => set({ isSaved, isSaving: false }),
})); 