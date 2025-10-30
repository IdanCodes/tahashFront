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
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getCookie, removeCookie } from "react-use-cookie";
import { CookieNames } from "@shared/constants/cookie-names";

interface UserInfoContextType {
  user: UserInfo | null;
  refreshSync: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
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
    if (res.aborted) return;
    if (!res.isError) return setUser(res.data);

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

  function isLoggedIn() {
    return getCookie(CookieNames.isLoggedIn) === "true";
  }

  // initialize user
  useEffect(() => {
    if (!storageInitialized()) {
      refresh().then();
      return;
    }

    for (const cb of onLoadCachedCbs.current) cb();
    onLoadCachedCbs.current = [];

    if ((!isLoggedIn() && user) || (isLoggedIn() && !user)) {
      removeCookie(CookieNames.isLoggedIn);
      refresh().then();
      return;
    }
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
        user: isLoggedIn() ? (user ?? null) : null,
        refreshSync: refreshSync,
        refresh: refresh,
        logout: logout,
        isLoggedIn: isLoggedIn(),
        onLoadCached: (cb) => {
          if (storageInitialized() && isLoggedIn()) cb();
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
