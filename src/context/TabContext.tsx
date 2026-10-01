
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Student } from '../types/student.type';
import { Tab, TabId } from '../types/tab.type';
import { TabOptions } from '../types/tabOptions.type';
import { cloneTab } from '../utils/cloneTab';
import { generateUuid } from '../utils/generateUuid';
import { moveItem } from '../utils/moveItem';
import { withMissingControlGroupNames } from '../utils/classroomLayout';
import { useDebounce } from '../utils/useDebounce';
import { useLocalStorage, LocalStorageKey } from '../utils/useLocalStorage';
import useDocumentTitle from '../utils/useDocumentTitle';

interface TabContextValue {
  tabs: Tab[];
  addTab: () => void;
  updateTab: (id: TabId|undefined, updates: Partial<Tab>) => void;
  deleteTab: (id: TabId|undefined) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  duplicateTab: (id: TabId) => void;
  activeTab: Tab;
  updateActiveTab: (updates: Partial<Tab>) => void;
  setActiveTabId: (id: TabId) => void;
}

export const DEFAULT_TAB_OPTIONS: Required<TabOptions> = {
  columns: 8,
  viewMode: 'list',
}

export const DEFAULT_TAB: Tab = {
  id: '',
  students: [],
  name: '',
  tabOptions: DEFAULT_TAB_OPTIONS,
}

export const defaultStudentName = (index: number) => `Student ${index + 1}`;

export const nextDefaultStudentName = (students: { name: string }[]) => {
  const usedNames = new Set(students.map((student) => student.name));
  let number = 1;
  while (usedNames.has(`Student ${number}`)) number += 1;
  return `Student ${number}`;
};

export const nameUnnamedStudents = (students: Student[]) =>
  students.map((student, index) =>
    student.name?.trim()
      ? student
      : { ...student, name: defaultStudentName(index) },
  );

export const generateStudents = (n: number = 30) =>
  Array.from({ length: n }, (_, index) => ({
    id: generateUuid(),
    name: defaultStudentName(index),
    points: 0,
  }));

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

  const defaultStudents = useMemo(() => {
    return generateStudents();
  }, [])

  const [savedTabData, setSavedTabData] = useLocalStorage<LocalStorageTabData>(LocalStorageKey.SAVED_TABS, {});
  const [tabs, setTabs] = useState<Tab[]>(savedTabData?.tabs ?? [{ ...DEFAULT_TAB, students: defaultStudents }]);
  const [activeTabId, setActiveTabId] = useState<TabId|undefined>(savedTabData.activeTabId);

  const [documentTitle, setDocumentTitle] = useDocumentTitle();
  const didMigrateSavedTabs = useRef(false);

  useEffect(() => {
    if (didMigrateSavedTabs.current) return;
    didMigrateSavedTabs.current = true;

    setTabs((currentTabs) => {
      let changed = false;
      const nextTabs = currentTabs.map((tab) => {
        const students = nameUnnamedStudents(tab.students ?? []);
        const studentsChanged = students.some((student, studentIndex) =>
          student.name !== tab.students?.[studentIndex]?.name
        );
        const classroomLayout = withMissingControlGroupNames(tab.classroomLayout);
        const layoutChanged = classroomLayout !== tab.classroomLayout;
        if (!studentsChanged && !layoutChanged) return tab;

        changed = true;
        return {
          ...tab,
          ...(studentsChanged ? { students } : {}),
          ...(layoutChanged ? { classroomLayout } : {}),
        };
      });
      return changed ? nextTabs : currentTabs;
    });
  }, []);

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
    const isActiveTabIdValid = tabs.some(tab => tab.id === activeTabId);
    if (!isActiveTabIdValid) {
      setActiveTabId(tabs[0]?.id);
    }
  }, [
    activeTabId,
    tabs,
  ]);

  const saveTabData = useCallback(() => {
    const tabData: LocalStorageTabData = {
      activeTabId,
      tabs
    };
    setSavedTabData(tabData)
  }, [
    activeTabId,
    tabs,
    setSavedTabData,
  ]);

  const debouncedSaveTabData = useDebounce(saveTabData, 1000);

  useEffect(() => {
    debouncedSaveTabData();
  }, [
    debouncedSaveTabData,
    tabs
  ])

  const activeTab = useMemo(() => {
    const active = tabs.find(tab => tab.id === activeTabId);
    return active ?? DEFAULT_TAB;
  }, [
    activeTabId,
    tabs,
  ]);

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
  ]);

  const moveTab = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((currentTabs) => moveItem(currentTabs, fromIndex, toIndex));
  }, []);

  const duplicateTab = useCallback((id: TabId) => {
    const sourceIndex = tabs.findIndex((tab) => tab.id === id);
    const source = tabs[sourceIndex];
    if (!source) return;

    const newTab = cloneTab(source);
    setTabs([
      ...tabs.slice(0, sourceIndex + 1),
      newTab,
      ...tabs.slice(sourceIndex + 1),
    ]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const updateActiveTab = useCallback((updates: Partial<Tab>) => {
    updateTab(activeTab.id, updates);
  }, [
    activeTab.id,
    updateTab,
  ]);

  // Update document title with tab.name
  useEffect(() => {
    let title = 'Student Points Tracker';
    if (activeTab.name) {
      title = `${activeTab.name} - Student Points Tracker`;
    }
    if (title !== documentTitle) {
      setDocumentTitle(title);
    }
  }, [
    activeTab.name,
    documentTitle,
    setDocumentTitle,
  ]);

  useEffect(() => {
    const tabOptions = activeTab.tabOptions ?? {};

    const isActiveTabOptionsValid = Object.keys(DEFAULT_TAB_OPTIONS).every(
      key => key in tabOptions
    );

    if (!isActiveTabOptionsValid) {
      updateActiveTab({
        tabOptions: {
          ...DEFAULT_TAB_OPTIONS,
          ...tabOptions,
        }
      })
    }
  }, [
    activeTab.tabOptions,
    updateActiveTab,
  ])

  const value: TabContextValue = useMemo(() => {
    const value = {
      tabs,
      addTab,
      deleteTab,
      moveTab,
      duplicateTab,
      updateTab,
      activeTab,
      updateActiveTab,
      setActiveTabId,
    };
    return value;
  }, [
    tabs,
    addTab,
    deleteTab,
    moveTab,
    duplicateTab,
    updateTab,
    activeTab,
    updateActiveTab,
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
