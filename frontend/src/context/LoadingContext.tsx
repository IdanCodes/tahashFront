import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  addLoading: () => void;
  removeLoading: () => void;
  onFinishLoading: (cb: () => void) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const finishLoadCbs = useRef<(() => void)[]>([]);
  const isLoading = count > 0;

  function addLoading() {
    setCount((c) => c + 1);
  }

  function removeLoading() {
    setCount((c) => c - 1);
  }

  function onFinishLoading(cb: () => void) {
    finishLoadCbs.current.push(cb);
  }

  useEffect(() => {
    if (!isLoading) return;
    finishLoadCbs.current.forEach((cb) => {
      cb();
    });
    finishLoadCbs.current = [];
  }, [isLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading: isLoading,
        addLoading: addLoading,
        removeLoading: removeLoading,
        onFinishLoading: onFinishLoading,
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
