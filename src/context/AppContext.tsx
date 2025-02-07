
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Tab, TabId } from '../types/tab.type';
import { AppOptions } from '../types/appOptions.type';
import { TabOptions } from '../types/tabOptions.type';

import { generateUuid } from '../utils/generateUuid';
import { useDebounce } from '../utils/useDebounce';
import { useLocalStorage, LocalStorageKey } from '../utils/useLocalStorage';

interface AppContextValue {
  appOptions: AppOptions
  updateAppOptions: (updates: Partial<AppOptions>) => void;
}

export const DEFAULT_APP_OPTIONS: Required<AppOptions> = {
  enableDingSound: true,
  enableKeybinds: true,
}

const AppContext = createContext<AppContextValue|undefined>(undefined);

export const AppContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const [savedAppOptions, setSavedAppOptions] = useLocalStorage(LocalStorageKey.APP_OPTIONS, {});
  const [appOptions, setAppOptions] = useState<AppOptions>(savedAppOptions);

  const updateAppOptions = useCallback((updates: Partial<AppOptions>) => {
    setAppOptions({
      ...appOptions,
      ...updates,
    });
  }, [
    appOptions,
    setAppOptions,
  ]);

  const debouncedSaveAppOptions = useDebounce(() => {
    setSavedAppOptions(appOptions);
  }, 1000);

  useEffect(() => {
    setSavedAppOptions(appOptions);
  }, [
    appOptions
  ])

  const value: AppContextValue = {
    appOptions,
    updateAppOptions,
  };

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
