/**
 * Storage Service - LocalStorage wrapper for data persistence
 * Provides simple key-value storage with JSON serialization
 */

export const STORAGE_KEYS = {
  MEMBERS: 'millionaires_club_members',
  LOANS: 'millionaires_club_loans',
  TRANSACTIONS: 'millionaires_club_transactions',
  COMMUNICATION_LOGS: 'millionaires_club_communication_logs',
  CONTRIBUTION_HISTORY: 'contribution_history',
  LAST_SYNC: 'millionaires_club_last_sync',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const StorageService = {
  /**
   * Save data to localStorage
   */
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  },

  /**
   * Load data from localStorage
   */
  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },

  /**
   * Clear all app data from localStorage
   */
  clearAll: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Export all data as JSON
   */
  exportData: (): string => {
    const data: Record<string, unknown> = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        data[key] = JSON.parse(item);
      }
    });
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data from JSON
   */
  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};
