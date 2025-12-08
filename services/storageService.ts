// Local Storage Service for persisting data in the browser
export class StorageService {
  private static PREFIX = 'millionaires_club_';

  // Save data to localStorage
  static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Load data from localStorage
  static load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  }

  // Remove data from localStorage
  static remove(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  // Clear all app data
  static clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  // Export all data as JSON (for backup)
  static exportData(): string {
    const data: Record<string, any> = {};
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => {
        data[key] = localStorage.getItem(key);
      });
    return JSON.stringify(data, null, 2);
  }

  // Import data from JSON (for restore)
  static importData(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }
}

// Storage keys
export const STORAGE_KEYS = {
  MEMBERS: 'members',
  LOANS: 'loans',
  TRANSACTIONS: 'transactions',
  CONTRIBUTIONS: 'contributions',
  COMMUNICATION_LOGS: 'communication_logs',
  LAST_SYNC: 'last_sync'
};

// Update last sync timestamp whenever data is saved
const originalSave = StorageService.save;
StorageService.save = function<T>(key: string, data: T): void {
  originalSave.call(this, key, data);
  if (key !== STORAGE_KEYS.LAST_SYNC) {
    originalSave.call(this, STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }
};
