import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSaveStatusStore } from './useSaveStatusStore';

export type SortOption = 'name' | 'points' | 'banked';

interface BankedPoints {
  [tabId: string]: {
    [studentId: string]: number;
  };
}

interface BankState {
  // State
  bankedPoints: BankedPoints;
  sidebarVisible: boolean;
  sortOption: SortOption;
  
  // Actions
  setBankedPoints: (tabId: string, studentId: string, points: number) => void;
  incrementBankedPoints: (tabId: string, studentId: string, increment: number) => void;
  withdrawAllPoints: (tabId: string, studentId: string) => number;
  depositPoints: (tabId: string, studentId: string, points: number) => Promise<void>;
  withdrawPoints: (tabId: string, studentId: string, points: number) => Promise<void>;
  clearPoints: (tabId: string) => Promise<void>;
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  setSortOption: (option: SortOption) => void;
}

export const useBankStore = create<BankState>()(
  persist(
    (set, get) => ({
      // Initial state
      bankedPoints: {},
      sidebarVisible: true,
      sortOption: 'name',
      
      // Actions
      setBankedPoints: (tabId, studentId, points) => {
        set((state) => {
          const newBankedPoints = { ...state.bankedPoints };
          
          if (!newBankedPoints[tabId]) {
            newBankedPoints[tabId] = {};
          }
          
          newBankedPoints[tabId][studentId] = points;
          
          return { bankedPoints: newBankedPoints };
        });
      },
      
      incrementBankedPoints: (tabId, studentId, increment) => {
        set((state) => {
          const newBankedPoints = { ...state.bankedPoints };
          
          if (!newBankedPoints[tabId]) {
            newBankedPoints[tabId] = {};
          }
          
          const currentPoints = newBankedPoints[tabId][studentId] || 0;
          newBankedPoints[tabId][studentId] = currentPoints + increment;
          
          return { bankedPoints: newBankedPoints };
        });
      },
      
      withdrawAllPoints: (tabId, studentId) => {
        const { bankedPoints } = get();
        const currentPoints = bankedPoints[tabId]?.[studentId] || 0;
        
        if (currentPoints > 0) {
          set((state) => {
            const newBankedPoints = { ...state.bankedPoints };
            
            if (newBankedPoints[tabId]) {
              newBankedPoints[tabId][studentId] = 0;
            }
            
            return { bankedPoints: newBankedPoints };
          });
        }
        
        return currentPoints;
      },
      
      depositPoints: async (tabId, studentId, points) => {
        const { setSaving, setSaved } = useSaveStatusStore.getState();
        setSaving(true);
        
        set((state) => ({
          bankedPoints: {
            ...state.bankedPoints,
            [tabId]: {
              ...state.bankedPoints[tabId],
              [studentId]: (state.bankedPoints[tabId]?.[studentId] || 0) + points,
            },
          },
        }));

        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate saving
          setSaved(true);
        } catch (error) {
          console.error("Failed to save banked points:", error);
        }
      },
      
      withdrawPoints: async (tabId, studentId, points) => {
        const { setSaving, setSaved } = useSaveStatusStore.getState();
        setSaving(true);
        
        set((state) => ({
          bankedPoints: {
            ...state.bankedPoints,
            [tabId]: {
              ...state.bankedPoints[tabId],
              [studentId]: Math.max(0, (state.bankedPoints[tabId]?.[studentId] || 0) - points),
            },
          },
        }));

        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate saving
          setSaved(true);
        } catch (error) {
          console.error("Failed to save banked points:", error);
        }
      },
      
      clearPoints: async (tabId) => {
        const { setSaving, setSaved } = useSaveStatusStore.getState();
        setSaving(true);
        
        set((state) => ({
          bankedPoints: {
            ...state.bankedPoints,
            [tabId]: {},
          },
        }));

        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate saving
          setSaved(true);
        } catch (error) {
          console.error("Failed to save banked points:", error);
        }
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarVisible: !state.sidebarVisible }));
      },
      
      setSidebarVisible: (visible) => {
        set({ sidebarVisible: visible });
      },

      setSortOption: (option) => {
        set({ sortOption: option });
      },
    }),
    {
      name: 'banked-points',
    }
  )
); 