
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Tab, TabId } from '../types/tabTypes';

interface AppContextValue {
  activeTabId: TabId | undefined;
  addTab: () => void;
  tabs: Tab[];
  updateTab: (id: TabId, updates: Partial<Tab>) => void;
}

const DEFAULT_TAB = {
  id: 'default',
  students: [],
  tabName: 'Default Tab',
}

const AppContext = createContext<AppContextValue|undefined>(undefined);

export const AppContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'default',
      students: [],
      tabName: '',
    }
  ]);

  const [activeTabId, setActiveTabId] = useState<TabId|undefined>();

  useEffect(() => {
    // If active tab id no longer exists, reset to first tab or undefined
    const tabIdExists = tabs.some(tab => tab.id === activeTabId);

    if (!tabIdExists) {
      setActiveTabId(tabs[0] ? tabs[0].id : undefined);
    }
  }, [
    tabs
  ])

  const addTab = useCallback(() => {
    const id = uuidv4();
    const newTab = {
      ...DEFAULT_TAB,
      id,
    }
    const newTabs = [
      ...tabs,
      newTab
    ];
    setTabs(newTabs);
  }, [
    
  ])

  const updateTab = useCallback((id: TabId, updates: Partial<Tab>) => {
    const newTabs = tabs.map(tab => {
      return tab.id === id ? { ...tab, ...updates } : tab;
    });

    setTabs(newTabs);
  }, [

  ])

  const value = useMemo(() => {
    return {
      activeTabId,
      addTab,
      tabs,
      updateTab
    };
  }, [
    activeTabId,
    addTab,
    tabs,
    updateTab,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
