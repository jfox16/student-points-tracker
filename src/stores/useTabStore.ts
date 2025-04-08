import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tab, TabId } from '../types/tab.type';
import { generateUuid } from '../utils/generateUuid';

interface TabState {
  // State
  tabs: Tab[];
  activeTabId: string | null;
  
  // Computed
  activeTab: Tab | null;
  
  // Actions
  addTab: () => void;
  deleteTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  duplicateTab: (id: TabId) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [],
      activeTabId: null,
      
      // Computed values
      get activeTab() {
        const { tabs, activeTabId } = get();
        return tabs.find(tab => tab.id === activeTabId) || null;
      },
      
      // Actions
      addTab: () => {
        const newTab: Tab = {
          id: generateUuid(),
          name: `Tab ${get().tabs.length + 1}`,
          tabOptions: {
            columns: 8,
            sortBy: 'name',
            sortOrder: 'asc',
          },
        };
        set(state => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));
      },
      
      deleteTab: (id) => {
        set(state => ({
          tabs: state.tabs.filter(tab => tab.id !== id),
          activeTabId: state.activeTabId === id ? state.tabs[0]?.id || null : state.activeTabId,
        }));
      },
      
      setActiveTab: (id) => set({ activeTabId: id }),
      
      updateTab: (id, updates) => {
        set(state => ({
          tabs: state.tabs.map(tab =>
            tab.id === id ? { ...tab, ...updates } : tab
          ),
        }));
      },
      
      duplicateTab: (id) => {
        const { tabs } = get();
        const tabToDuplicate = tabs.find(tab => tab.id === id);
        
        if (!tabToDuplicate) return;
        
        const newId = generateUuid();
        const newTab: Tab = {
          ...tabToDuplicate,
          id: newId,
          name: `${tabToDuplicate.name} (Copy)`
        };
        
        set(state => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newId
        }));
      }
    }),
    {
      name: 'tab-storage'
    }
  )
); 