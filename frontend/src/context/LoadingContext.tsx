import { createContext, ReactNode, useContext, useState } from "react";

interface LoadingContextType {
  isLoading: boolean;
  addLoading: () => void;
  removeLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const isLoading = count > 0;

  function addLoading() {
    setCount((c) => c + 1);
  }

  function removeLoading() {
    setCount((c) => c - 1);
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

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside a LoadingProvider");
  return ctx;
}
