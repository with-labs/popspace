import { useEffect } from 'react';
import create from 'zustand';
import { logger } from '../../utils/logger';

const useLocalStorageCache = create(() => ({} as Record<string, any>));

export function useLocalStorage<T>(key: string, initialValue: T) {
  const storedValue = useLocalStorageCache((cache) => cache[key] || initialValue) as T;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        useLocalStorageCache.setState({
          [key]: JSON.parse(stored),
        });
      }
    } catch (err) {
      logger.error(`Error loading useLocalStorage value for ${key}: ${err}`);
      window.localStorage.removeItem(key);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // sync it to other instances of the hook via the global cache
      useLocalStorageCache.setState({ [key]: valueToStore });
    } catch (error) {
      logger.error(`Error setting useLocalStorage value for ${key}: ${value}: ${error}`);
      throw new Error('Error setting local storage');
    }
  };

  return [storedValue, setValue] as const;
}
