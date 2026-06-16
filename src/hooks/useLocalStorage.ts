import { useState, useCallback } from 'react';

/**
 * Custom hook that synchronizes React state with localStorage.
 * Enables persistent data across browser sessions for tracking footprint history.
 *
 * @template T - The type of the stored value
 * @param key - The localStorage key to use
 * @param initialValue - The default value if nothing is stored
 * @returns A stateful value and a setter function (same API as useState)
 *
 * @example
 * ```tsx
 * const [data, setData] = useLocalStorage<EmissionData>('footprint', null);
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
