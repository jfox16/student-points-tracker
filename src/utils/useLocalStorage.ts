import { useState, useEffect } from "react";

export enum LocalStorageKey {
  SAVED_TABS = 'saved_tabs',
}

function useLocalStorage<T>(key: LocalStorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    console.log('Saving to local storage', { key, value })
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
