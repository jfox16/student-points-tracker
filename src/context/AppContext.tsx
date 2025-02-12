
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { AppOptions } from '../types/appOptions.type';
import { useDebounce } from '../utils/useDebounce';
import { useLocalStorage, LocalStorageKey } from '../utils/useLocalStorage';

interface AppContextValue {
  appOptions: AppOptions
  updateAppOptions: (updates: Partial<AppOptions>) => void;
}

export const DEFAULT_APP_OPTIONS: Required<AppOptions> = {
  enableKeybinds: true,
  pointSound: 'pop',
  reverseOrder: false,
}

const AppContext = createContext<AppContextValue|undefined>(undefined);

export const AppContextProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const [savedAppOptions, setSavedAppOptions] = useLocalStorage<AppOptions>(LocalStorageKey.APP_OPTIONS, {...DEFAULT_APP_OPTIONS});
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
    debouncedSaveAppOptions();
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
