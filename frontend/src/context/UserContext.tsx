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
import { useLoading } from "./LoadingContext";

interface UserInfoContextType {
  user: UserInfo | null;
  refreshSync: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserInfoContextType | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  /**
   * user:
   * - undefined -> uninitialized
   * - null -> not logged in
   * - otherwise -> UserInfo
   */
  const [user, setUser] = useState<UserInfo | null | undefined>(undefined);
  const [refreshFlag, setRefreshFlag] = useState(false);
  // const { addLoading, removeLoading } = useLoading();
  const loaded = useRef(false);

  function refreshSync() {
    setRefreshFlag(true);
    loaded.current = false;
  }

  const userInfoStorage = "user-info";
  function storeUserInfo(userInfo: UserInfo | null) {
    setUser(userInfo);
    if (userInfo)
      localStorage.setItem(userInfoStorage, JSON.stringify(userInfo));
    else localStorage.removeItem(userInfoStorage);
  }

  function loadCachedUserInfo(): void {
    const value = localStorage.getItem(userInfoStorage);
    const userInfo: UserInfo | null = value
      ? (JSON.parse(value) as UserInfo)
      : null;
    setUser(userInfo);
  }

  async function refresh() {
    console.log("refresh");
    const res = await sendGetRequest("/user-info");
    if (res.code == ResponseCode.Success) return storeUserInfo(res.data);

    console.error(
      "UserInfoProvider.refreshSync: Error refreshing user info!",
      res,
    );
    // removeLoading();
  }

  async function logout() {
    await sendGetRequest("/logout");
    storeUserInfo(null);
  }

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    if (user === undefined) {
      // first render
      loadCachedUserInfo();
      refreshSync();
      return;
    }

    // addLoading();

    loadCachedUserInfo();
    if (refreshFlag) {
      // addLoading();
      setRefreshFlag(false);
      refresh().then();
    }
    // removeLoading();
  }, [refreshFlag]);

  return (
    <UserContext.Provider
      value={{
        user: user ?? null,
        refreshSync: refreshSync,
        refresh: refresh,
        logout: logout,
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
