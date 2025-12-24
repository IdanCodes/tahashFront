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
import { errorObject } from "@shared/interfaces/error-object";

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
    fetchCompData().then();
  }, []);

  async function fetchCompData() {
    const res = await sendGetRequest(RoutePath.Get.ActiveCompInfo);
    if (res.aborted) return;
    if (res.isError)
      return setTimeout(
        () =>
          redirectToError(
            errorObject(
              "Error fetching comp data",
              `Is the API running? ${res.data}`,
            ),
          ),
        10000,
      );
    setDisplayInfo(res.data);
  }

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
