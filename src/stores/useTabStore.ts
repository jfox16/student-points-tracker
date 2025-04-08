import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tab, TabId } from '../types/tab.type';
import { generateUuid } from '../utils/generateUuid';
import { useSaveStatusStore } from "./useSaveStatusStore";

const saveTabs = async (tabs: Tab[]) => {
  // Simulate saving to local storage
  localStorage.setItem('tabs', JSON.stringify(tabs));
};

interface TabState {
  // State
  tabs: Tab[];
  activeTabId: TabId | null;
  
  // Computed
  activeTab: Tab | null;
  
  // Actions
  addTab: () => void;
  deleteTab: (id: TabId) => void;
  setActiveTab: (id: TabId) => void;
  updateTab: (id: TabId, changes: Partial<Tab>) => Promise<void>;
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
          name: "New Tab",
          students: [],
          tabOptions: {
            columns: 1,
          },
        };
        
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));
      },
      
      deleteTab: (id) => {
        set((state) => {
          const newTabs = state.tabs.filter((tab) => tab.id !== id);
          const newActiveTabId = 
            state.activeTabId === id 
              ? newTabs[0]?.id || null 
              : state.activeTabId;
              
          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
          };
        });
      },
      
      setActiveTab: (id) => set({ activeTabId: id }),
      
      updateTab: async (id, changes) => {
        const { setSaving, setSaved } = useSaveStatusStore.getState();
        setSaving(true);
        
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, ...changes } : tab
          ),
        }));

        try {
          await saveTabs(get().tabs);
          setSaved(true);
        } catch (error) {
          console.error("Failed to save tabs:", error);
        }
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