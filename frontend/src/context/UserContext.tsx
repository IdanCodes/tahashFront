import { UserInfo } from "@shared/interfaces/user-info";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { sendGetRequest } from "../utils/API/apiUtils";
import { ResponseCode } from "@shared/types/response-code";

interface UserInfoContextType {
  user: UserInfo | null;
  refreshSync: () => void;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserInfoContextType | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const load = useRef(false);

  function refreshSync() {
    setRefreshFlag(true);
    load.current = false;
  }

  const userInfoStorage = "user-info";
  function storeUserInfo(userInfo: UserInfo | null) {
    setUser(userInfo);
    sessionStorage.setItem(
      userInfoStorage,
      userInfo ? JSON.stringify(userInfo) : "",
    );
  }

  function loadUserInfo(): void {
    const value = sessionStorage.getItem(userInfoStorage);
    if (!value) return refreshSync(); // first refresh

    const userInfo: UserInfo | null =
      value == "" ? null : (JSON.parse(value) as UserInfo);
    setUser(userInfo);
  }

  async function refresh() {
    const res = await sendGetRequest("/user-info");
    if (res.code == ResponseCode.Success)
      return storeUserInfo(res.data as UserInfo);

    console.error(
      "UserInfoProvider.refreshSync: Error refreshing user info!",
      res,
    );
    storeUserInfo(null);
  }

  useEffect(() => {
    if (load.current) return;
    load.current = true;

    loadUserInfo();
    if (refreshFlag) refresh().then();
  }, [refreshFlag]);

  return (
    <UserContext.Provider
      value={{ user: user, refreshSync: refreshSync, refresh: refresh }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserInfo() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserInfo must be used within a UserInfoProvider!");
  return context;
}
