import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BankedPoints {
  [tabId: string]: {
    [studentId: string]: number;
  };
}

interface BankState {
  // State
  bankedPoints: BankedPoints;
  sidebarVisible: boolean;
  
  // Actions
  setBankedPoints: (tabId: string, studentId: string, points: number) => void;
  incrementBankedPoints: (tabId: string, studentId: string, increment: number) => void;
  withdrawAllPoints: (tabId: string, studentId: string) => number;
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
}

export const useBankStore = create<BankState>()(
  persist(
    (set, get) => ({
      // Initial state
      bankedPoints: {},
      sidebarVisible: true,
      
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
      
      toggleSidebar: () => {
        set((state) => ({ sidebarVisible: !state.sidebarVisible }));
      },
      
      setSidebarVisible: (visible) => {
        set({ sidebarVisible: visible });
      },
    }),
    {
      name: 'banked-points',
    }
  )
); 