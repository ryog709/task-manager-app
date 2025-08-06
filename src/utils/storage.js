import { STORAGE_KEYS } from './constants';

class StorageManager {
  constructor() {
    this.storage = window.localStorage;
  }

  get(key) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  set(key, value) {
    try {
      const item = JSON.stringify(value);
      this.storage.setItem(key, item);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded', error);
        // TODO: Implement IndexedDB fallback
      }
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  clear() {
    try {
      Object.keys(STORAGE_KEYS).forEach((key) => {
        this.storage.removeItem(STORAGE_KEYS[key]);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  getTasks() {
    return this.get(STORAGE_KEYS.TASKS) || [];
  }

  setTasks(tasks) {
    return this.set(STORAGE_KEYS.TASKS, tasks);
  }

  getSettings() {
    return (
      this.get(STORAGE_KEYS.SETTINGS) || {
        theme: 'system',
        animations: true,
        notifications: false,
      }
    );
  }

  setSettings(settings) {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  getStats() {
    return (
      this.get(STORAGE_KEYS.STATS) || {
        totalCreated: 0,
        totalCompleted: 0,
        totalDeleted: 0,
        categoryStats: {},
      }
    );
  }

  setStats(stats) {
    return this.set(STORAGE_KEYS.STATS, stats);
  }

  exportData() {
    const data = {
      tasks: this.getTasks(),
      settings: this.getSettings(),
      stats: this.getStats(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.tasks) this.setTasks(data.tasks);
      if (data.settings) this.setSettings(data.settings);
      if (data.stats) this.setStats(data.stats);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storage = new StorageManager();
