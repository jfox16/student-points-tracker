
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Tab, TabId } from '../types/tab.type';
import { generateUuid } from '../utils/generateUuid';
import { useDebounce } from '../utils/useDebounce';
import { useLocalStorage, LocalStorageKey } from '../utils/useLocalStorage';
import { TabOptions } from '../types/tabOptions.type';

interface TabContextValue {
  tabs: Tab[];
  addTab: () => void;
  updateTab: (id: TabId|undefined, updates: Partial<Tab>) => void;
  deleteTab: (id: TabId|undefined) => void;
  activeTab: Tab;
  setActiveTabId: (id: TabId) => void;
}

export const DEFAULT_TAB: Tab = {
  id: '',
  students: [],
  selectedStudentIds: new Set(),
  name: '',
}

export const DEFAULT_TAB_OPTIONS: TabOptions = {
  columns: 8,
  fontSize: 16,
}

export const generateStudents = (n: number = 30) => {
  const students = Array.from({ length: n }, (_, i) => ({
    id: '',
    name: '',
    points: 0,
  }));

  for (const student of students) {
    student.id = generateUuid();
  }

  return students;
}

interface LocalStorageTabData {
  activeTabId?: TabId,
  tabs?: Tab[];
}

const DEFAULT_TABS: Tab[] = [
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

const TabContext = createContext<TabContextValue|undefined>(undefined);

export const TabContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const [savedTabData, setSavedTabData] = useLocalStorage<LocalStorageTabData>(LocalStorageKey.SAVED_TABS, {});
  const [tabs, setTabs] = useState<Tab[]>(savedTabData?.tabs ?? []);
  const [activeTabId, setActiveTabId] = useState<TabId|undefined>(savedTabData.activeTabId);

  useEffect(() => {
    if (tabs.length === 0) {
      const newTabs = [ ...DEFAULT_TABS ];
      for (const tab of newTabs) {
        tab.students = generateStudents();
      }
      setTabs(newTabs);
    }
  }, [
    tabs
  ])

  useEffect(() => {
    const isValid = tabs.some(tab => tab.id === activeTabId);

    if (!isValid) {
      setActiveTabId(tabs[0]?.id);
    }
  }, [
    activeTabId,
    tabs,
  ]);

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
    const id = generateUuid();
    const students = generateStudents(32);
    const newTab = {
      ...DEFAULT_TAB,
      id,
      students,
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

  const updateTab: TabContextValue['updateTab'] = useCallback((id, updates) => {
    const newTabs = tabs.map(tab => {
      return tab.id === id ? { ...tab, ...updates } : tab;
    });
    setTabs(newTabs);
  }, [
    setTabs,
    tabs,
  ]);

  const deleteTab: TabContextValue['deleteTab'] = useCallback((id) => {
    const newTabs = tabs.filter(tab => {
      return tab.id !== id;
    });
    setTabs(newTabs);
  }, [
    setTabs,
    tabs,
  ])

  const value: TabContextValue = useMemo(() => {
    const value = {
      tabs,
      addTab,
      deleteTab,
      updateTab,
      activeTab,
      setActiveTabId,
    };
    return value;
  }, [
    tabs,
    addTab,
    deleteTab,
    updateTab,
    activeTab,
    setActiveTabId,
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
