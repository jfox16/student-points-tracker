
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Tab, TabId } from '../types/tabTypes';
import useLocalStorage, { LocalStorageKey } from '../utils/useLocalStorage';
import { useDebounce } from '../utils/useDebounce';

interface TabContextValue {
  activeTab: Tab;
  setActiveTabId: (id: TabId) => void;
  addTab: () => void;
  tabs: Tab[];
  updateTab: (id: TabId, updates: Partial<Tab>) => void;
  deleteTab: (id: TabId) => void;
}

export const DEFAULT_TAB = {
  id: 'default1',
  students: [],
  name: '',
}

interface LocalStorageTabData {
  activeTabId?: TabId,
  tabs: Tab[];
}

const DEFAULT_TABS: LocalStorageTabData = {
  tabs: [
    {
      id: 'default1',
      name: 'Class 1',
      students: [],

    },
    {
      id: 'default2',
      name: 'Class 2',
      students: [],
    }
  ]
}

const TabContext = createContext<TabContextValue|undefined>(undefined);

export const TabContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const [savedTabData, setSavedTabData] = useLocalStorage<LocalStorageTabData>(LocalStorageKey.SAVED_TABS, DEFAULT_TABS);
  const [tabs, setTabs] = useState<Tab[]>(savedTabData.tabs);
  const [activeTabId, setActiveTabId] = useState<TabId|undefined>(savedTabData.activeTabId);

  useEffect(() => {
    const isValid = tabs.some(tab => tab.id === activeTabId);

    if (!isValid) {
      console.log('activeTabId is invalid. setting to', tabs[0].id);
      setActiveTabId(tabs[0]?.id);
    }
  }, [
    activeTabId,
    tabs,
  ])

  useEffect(() => {
    console.log('tabs updated', tabs);
  }, [
    tabs
  ])

  const debouncedSaveTabData = useDebounce(setSavedTabData, 500);

  useEffect(() => {
    const tabData: LocalStorageTabData = {
      activeTabId,
      tabs
    };
    debouncedSaveTabData(tabData);
  }, [
    activeTabId,
    debouncedSaveTabData,    
    tabs
  ]);

  const activeTab = useMemo(() => {
    const active = tabs.find(tab => tab.id === activeTabId);
    return active ?? DEFAULT_TAB;
  }, [
    activeTabId,
    tabs,
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
    setTabs,
    tabs,
  ])

  const updateTab = useCallback((id: TabId, updates: Partial<Tab>) => {
    const newTabs = tabs.map(tab => {
      return tab.id === id ? { ...tab, ...updates } : tab;
    });
    setTabs(newTabs);
  }, [
    setTabs,
    tabs,
  ]);

  const deleteTab = useCallback((id: TabId) => {
    const newTabs = tabs.filter(tab => {
      return tab.id !== id;
    });
    setTabs(newTabs);
  }, [
    setTabs,
    tabs,
  ])

  const value: TabContextValue = useMemo(() => {
    return {
      activeTab,
      setActiveTabId,
      addTab,
      deleteTab,
      tabs,
      updateTab
    };
  }, [
    activeTab,
    setActiveTabId,
    addTab,
    deleteTab,
    tabs,
    updateTab,
  ])

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
}

export const useTabContext = (): TabContextValue => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabContext must be used within an TabContextProvider');
  }
  return context;
};
