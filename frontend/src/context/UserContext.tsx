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
import { useLocalStorage } from "../hooks/useLocalStorage";

interface UserInfoContextType {
  user: UserInfo | null;
  refreshSync: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  onLoadCached: (cb: () => void) => void;
}

const UserContext = createContext<UserInfoContextType | undefined>(undefined);

const userInfoStorage = "user-info";
export function UserInfoProvider({ children }: { children: ReactNode }) {
  /**
   * user:
   * - undefined -> uninitialized
   * - null -> not logged in
   * - otherwise -> UserInfo
   */
  const [user, setUser] = useLocalStorage<UserInfo | null | undefined>(
    userInfoStorage,
    undefined,
  );
  const [refreshFlag, setRefreshFlag] = useState(false);
  const onLoadCachedCbs = useRef<(() => void)[]>([]);

  function refreshSync() {
    setRefreshFlag(true);
  }

  async function refresh() {
    const res = await sendGetRequest("/user-info");
    if (res.code == ResponseCode.Success) return setUser(res.data);

    console.error(
      "UserInfoProvider.refreshSync: Error refreshing user info!",
      res,
    );
  }

  async function logout() {
    await sendGetRequest("/logout");
    setUser(null);
  }

  // whether the user info storage is initialized
  function storageInitialized(): boolean {
    return user !== undefined;
  }

  // initialize user
  useEffect(() => {
    if (!storageInitialized()) {
      refresh().then();
      return;
    }

    for (const cb of onLoadCachedCbs.current) cb();
    onLoadCachedCbs.current = [];
  }, [user]);

  // for refreshSync
  useEffect(() => {
    if (!storageInitialized() || !refreshFlag) return;

    setRefreshFlag(false);
    refresh().then();
  }, [refreshFlag]);

  return (
    <UserContext.Provider
      value={{
        user: user ?? null,
        refreshSync: refreshSync,
        refresh: refresh,
        logout: logout,
        onLoadCached: (cb) => {
          if (storageInitialized()) cb();
          else onLoadCachedCbs.current.push(cb);
        },
      }}
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
