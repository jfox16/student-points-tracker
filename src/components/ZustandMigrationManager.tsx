import { useEffect } from 'react';
import { useStudentStore } from '../stores/useStudentStore';
import { useTabStore } from '../stores/useTabStore';
import { useAppOptionsStore } from '../stores/useAppOptionsStore';

/**
 * This component initializes the Zustand stores with default values if they are empty.
 * It should be included once in your app, before any components that use the Zustand stores.
 */
export const ZustandMigrationManager = () => {
  const { students, addStudent } = useStudentStore();
  const { tabs, addTab } = useTabStore();

  useEffect(() => {
    // Initialize with at least one tab if none exist
    if (tabs.length === 0) {
      addTab();
    }
  }, [tabs.length, addTab]);

  return null;
}; 