import React, { ReactNode, useEffect } from "react";
import { useUserInfo } from "../context/UserContext";
import { RoutePath } from "@shared/constants/route-path";
import { useLoading } from "../context/LoadingContext";
import { useNavigate } from "react-router-dom";

// Require user authentication to render children
function RequireAuth({ children }: { children: ReactNode }) {
  const userInfo = useUserInfo();
  const { addLoading, removeLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    addLoading();
    userInfo.onLoadCached(() => {
      removeLoading();
      if (!userInfo.user) navigate(RoutePath.Page.Login);
    });
  }, []);

  return <>{children}</>;
}

// export function useRequireAuth() {}

export default RequireAuth;
