import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Tab, TabId } from '../types/tab.type';
import { DEFAULT_TAB_OPTIONS } from '../context/TabContext';
import { generateUuid } from '../utils/generateUuid';
import { generateStudents } from '../context/TabContext';

export const DEFAULT_TAB: Tab = {
  id: '',
  students: [],
  name: '',
  tabOptions: DEFAULT_TAB_OPTIONS,
}

export const DEFAULT_TABS: Tab[] = [
  {
    ...DEFAULT_TAB,
    id: 'default1',
    name: 'Class 1',
    tabOptions: { ...DEFAULT_TAB_OPTIONS }
  },
  {
    ...DEFAULT_TAB,
    id: 'default2',
    name: 'Class 2',
    tabOptions: { ...DEFAULT_TAB_OPTIONS }
  }
]

interface TabState {
  // State
  tabs: Tab[];
  activeTabId: TabId | undefined;
  
  // Computed
  activeTab: Tab;
  
  // Actions
  setTabs: (tabs: Tab[]) => void;
  setActiveTabId: (id: TabId) => void;
  
  addTab: () => void;
  updateTab: (id: TabId | undefined, updates: Partial<Tab>) => void;
  deleteTab: (id: TabId | undefined) => void;
  updateActiveTab: (updates: Partial<Tab>) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      // Initial state
      tabs: [],
      activeTabId: undefined,
      
      // Computed getters
      get activeTab() {
        const { tabs, activeTabId } = get();
        const active = tabs.find(tab => tab.id === activeTabId);
        return active ?? DEFAULT_TAB;
      },
      
      // Basic setters
      setTabs: (tabs) => set({ tabs }),
      setActiveTabId: (id) => set({ activeTabId: id }),
      
      // Tab management
      addTab: () => {
        const id = generateUuid();
        const students = generateStudents(32);
        const newTab = {
          ...DEFAULT_TAB,
          id,
          students,
        };
        
        set(state => ({
          tabs: [...state.tabs, newTab]
        }));
      },
      
      updateTab: (id, updates) => {
        set(state => ({
          tabs: state.tabs.map(tab => 
            tab.id === id ? { ...tab, ...updates } : tab
          )
        }));
      },
      
      deleteTab: (id) => {
        set(state => ({
          tabs: state.tabs.filter(tab => tab.id !== id),
        }));
      },
      
      updateActiveTab: (updates) => {
        const { activeTab, updateTab } = get();
        updateTab(activeTab.id, updates);
      },
    }),
    {
      name: 'tabs-storage',
      storage: createJSONStorage(() => localStorage),
      // Initialize default tabs if none exist
      onRehydrateStorage: () => (state) => {
        if (!state || !state.tabs || state.tabs.length === 0) {
          const newTabs = [...DEFAULT_TABS];
          for (const tab of newTabs) {
            tab.students = generateStudents();
          }
          state?.setTabs(newTabs);
          state?.setActiveTabId(newTabs[0].id);
        }
      }
    }
  )
); 