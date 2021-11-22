import throttle from 'lodash.throttle';
import { useMemo } from 'react';
import create from 'zustand';
import { logger } from '@utils/logger';

const useLocalStorageCache = create(() => ({} as Record<string, any>));

export function useLocalStorage<T>(key: string, initialValue: T) {
  // using useMemo to execute synchronous code in render just once.
  // this hook comes before useLocalStorageCache because we want to load
  // values into the cache before accessing them.
  useMemo(() => {
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
  const storedValue = useLocalStorageCache((cache) => cache[key] || initialValue) as T;

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage. It's throttled to prevent
  // frequent writes to localStorage, which can be costly.
  const setValue = useMemo(
    () =>
      throttle(
        (value: T | ((current: T) => T)) => {
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
        },
        300,
        { trailing: true, leading: true }
      ),
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}
