import { useState, useEffect, useCallback } from 'react';

import type { LocalStorageData } from '../types';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from '../utils/localStorage';

export function useLocalStorage() {
  const [data, setData] = useState<LocalStorageData>(() =>
    loadFromLocalStorage()
  );

  // Save data to localStorage whenever it changes
  const updateData = useCallback((updates: Partial<LocalStorageData>) => {
    setData(current => {
      const updated = { ...current, ...updates };
      saveToLocalStorage(updates);
      return updated;
    });
  }, []);

  // Refresh data from localStorage (useful for syncing between tabs)
  const refreshData = useCallback(() => {
    setData(loadFromLocalStorage());
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'irish-game-app' && e.newValue) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshData]);

  return {
    data,
    updateData,
    refreshData,
    userProgress: data.userProgress,
    settings: data.settings,
    gameHistory: data.gameHistory,
    vocabularyCache: data.vocabularyCache,
  };
}
