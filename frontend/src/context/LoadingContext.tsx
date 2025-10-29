import { createContext, ReactNode, useContext, useState } from "react";

interface LoadingContextType {
  isLoading: boolean;
  addLoading: (loader: string) => void;
  removeLoading: (loader: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loaderMap, setLoaderMap] = useState<Map<string, number>>(new Map());
  const isLoading = loaderMap.size > 0;

  function addLoading(loader: string) {
    setLoaderMap((map) => {
      const newMap = new Map(map);
      const newValue = (newMap.get(loader) ?? 0) + 1;
      newMap.set(loader, newValue);

      return newMap;
    });
  }

  function removeLoading(loader: string) {
    setLoaderMap((map) => {
      const newMap = new Map(map);
      const newValue = (newMap.get(loader) ?? 0) - 1;

      if (newValue <= 0) newMap.delete(loader);
      else newMap.set(loader, newValue);

      return newMap;
    });
  }

  return (
    <LoadingContext.Provider
      value={{
        isLoading: isLoading,
        addLoading: addLoading,
        removeLoading: removeLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Use the loading context
 * @param loaderName A string to identify the caller
 */
export function useLoading(loaderName: string) {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside a LoadingProvider");

  const addLoading = () => ctx.addLoading(loaderName);
  const removeLoading = () => ctx.removeLoading(loaderName);
  return {
    isLoading: ctx.isLoading,
    addLoading,
    removeLoading,
  };
}
