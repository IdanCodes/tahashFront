import { CompDisplayInfo } from "@shared/interfaces/comp-display-info";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { redirectToError } from "../utils/errorUtils";

interface ActiveCompContextType {
  displayInfo: CompDisplayInfo | null;
}

const ActiveCompContext = createContext<ActiveCompContextType | undefined>(
  undefined,
);

export function ActiveCompProvider({ children }: { children: ReactNode }) {
  const [displayInfo, setDisplayInfo] = useState<CompDisplayInfo | null>(null);

  useEffect(() => {
    if (displayInfo) return;

    sendGetRequest(RoutePath.Get.ActiveCompInfo).then((res) => {
      if (res.aborted) return;
      if (res.isError) return redirectToError(res.data);
      setDisplayInfo(res.data);
    });
  }, []);

  return (
    <ActiveCompContext.Provider
      value={{
        displayInfo,
      }}
    >
      {children}
    </ActiveCompContext.Provider>
  );
}

export function useActiveComp() {
  const context = useContext(ActiveCompContext);
  if (!context)
    throw new Error("useActiveComp must be used within an ActiveCompProvider");
  return context;
}
