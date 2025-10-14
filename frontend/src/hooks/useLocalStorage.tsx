import React, { useCallback, useState } from "react";

// initialValue = undefined -> initial value is the stored value
// if a value is already stored, doesn't replace it
export function useLocalStorage<T>(
  key: string,
  initialValue: T | undefined = undefined,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (key.length == 0)
      throw new Error("useLocalStorage: key must be non-empty!");

    const item = window.localStorage.getItem(key);
    try {
      if (item) return JSON.parse(item);
      if (initialValue) localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch {
      console.error(`localStorage value of '${key}' is not valid: "${item}"`);
      return initialValue;
    }
  });

  // undefined -> remove item from storage
  const setValue = useCallback(
    (newValue: React.SetStateAction<T>) => {
      if (newValue === undefined) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
    },
    [key],
  );

  return [storedValue, setValue];
}
