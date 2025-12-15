import { AppConfig } from '../types';
import { DEFAULT_CONFIG, STORAGE_KEY } from '../constants';

export const getConfig = (): AppConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse config", e);
    }
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = (config: AppConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const resetConfig = (): AppConfig => {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_CONFIG;
};