import React, { useCallback, useState } from "react";

// initialValue = undefined -> initial value is the stored value
// if a value is already stored, doesn't replace it
export function useSessionStorage<T>(
  key: string,
  initialValue: T | undefined = undefined,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (key.length == 0)
      throw new Error("useSessionStorage: key must be non-empty!");

    const item = window.sessionStorage.getItem(key);
    try {
      if (item) return JSON.parse(item);
      if (initialValue)
        sessionStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch {
      console.error(`sessionStorage value of '${key}' is not valid: "${item}"`);
      return initialValue;
    }
  });

  // undefined -> remove item from storage
  const setValue = useCallback(
    (newValue: React.SetStateAction<T>) => {
      if (newValue === undefined) window.sessionStorage.removeItem(key);
      else window.sessionStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
    },
    [key],
  );

  return [storedValue, setValue];
}
