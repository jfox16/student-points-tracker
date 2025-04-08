import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  depositPoints: (students: { id: string }[]) => void;
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
      
      depositPoints: (students) => {
        const { bankedPoints } = get();
        const activeTabId = localStorage.getItem('tab-storage')
          ? JSON.parse(localStorage.getItem('tab-storage') || '{}')?.state?.activeTabId
          : '';
        
        if (!activeTabId || !students.length) return;
        
        const totalPoints = Object.values(bankedPoints[activeTabId] || {}).reduce(
          (sum, points) => sum + (points || 0), 
          0
        );
        
        if (totalPoints <= 0) return;
        
        const pointsPerStudent = Math.floor(totalPoints / students.length);
        
        if (pointsPerStudent <= 0) return;
        
        set((state) => {
          const newBankedPoints = { ...state.bankedPoints };
          
          // Reset all banked points for current tab
          if (newBankedPoints[activeTabId]) {
            newBankedPoints[activeTabId] = {};
          }
          
          return { bankedPoints: newBankedPoints };
        });
        
        // Update student points using studentStore
        // This would typically be done by calling a method on useStudentStore
        // but we'll leave that for another implementation
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