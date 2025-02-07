import { useState, useEffect } from "react";

export enum LocalStorageKey {
  APP_OPTIONS = 'app_options',
  SAVED_TABS = 'saved_tabs',
}

export function useLocalStorage<T>(key: LocalStorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        console.log('Loading from local storage:', { key, storedValue })
      }
      else {
        console.log('No existing data in local storage.')
      }
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error("Error reading local storage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    console.log('Saving to local storage:', { key, value })
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
