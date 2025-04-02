import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage, LocalStorageKey } from '../utils/useLocalStorage';
import { Student } from '../types/student.type';

interface BankedPoints {
  [studentId: string]: number;
}

interface BankContextValue {
  bankedPoints: BankedPoints;
  depositPoints: (updates: BankedPoints) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

export enum SortOption {
  ALPHABETICAL = 'alphabetical',
  LAST_NAME = 'lastName',
  POINTS = 'points'
}

const BankContext = createContext<BankContextValue | undefined>(undefined);

export const BankContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bankedPoints, setBankedPoints] = useLocalStorage<BankedPoints>(LocalStorageKey.BANKED_POINTS, {});
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.ALPHABETICAL);

  const depositPoints = useCallback((updates: BankedPoints) => {
    setBankedPoints(prev => ({
      ...prev,
      ...updates
    }));
  }, [setBankedPoints]);

  const value: BankContextValue = {
    bankedPoints,
    depositPoints,
    sortOption,
    setSortOption,
  };

  return (
    <BankContext.Provider value={value}>
      {children}
    </BankContext.Provider>
  );
};

export const useBankContext = (): BankContextValue => {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBankContext must be used within a BankContextProvider');
  }
  return context;
}; 