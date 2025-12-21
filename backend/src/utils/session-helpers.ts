import { Request, Response } from "express";
import { WcaOAuthTokenResponse } from "@shared/interfaces/wca-api/wcaOAuth";
import { UserInfo } from "@shared/interfaces/user-info";
import { isLoggedIn } from "../middleware/auth/require-auth";
import { COOKIE_CONFIG } from "../config/env";
import { CookieNames } from "@shared/constants/cookie-names";
import { SID_COOKIE_NAME } from "../middleware/db-session";
import { refreshAdminCookie } from "./admin-helpers";

/**
 * Updates the session with new token and user data.
 */
export function updateAndSaveSession(
  req: Request,
  res: Response,
  tokenRes: WcaOAuthTokenResponse,
  userInfo: UserInfo,
): void {
  const expirationTime = new Date().getTime() + tokenRes.expires_in * 1000;

  req.session.userSession = {
    access_token: tokenRes.access_token,
    refresh_token: tokenRes.refresh_token,
    expiration: expirationTime,
    userInfo: userInfo,
  };

  refreshLoginCookie(req, res);
  refreshAdminCookie(req, res);
}

/**
 * Refresh the isLoggedIn cookie.
 */
export function refreshLoginCookie(req: Request, res: Response) {
  res.cookie(CookieNames.isLoggedIn, JSON.stringify(isLoggedIn(req)), {
    httpOnly: false,
    domain: COOKIE_CONFIG.DOMAIN,
    expires: req.session.cookie.expires ?? undefined,
    secure: COOKIE_CONFIG.SECURE,
    sameSite: COOKIE_CONFIG.SAMESITE,
  });
}

export function logoutUser(
  req: Request,
  res: Response,
  cb: (error?: any) => void,
) {
  req.session.destroy((err) => {
    if (err) return cb(err);

    res.clearCookie(SID_COOKIE_NAME);
    res.clearCookie(CookieNames.isLoggedIn);
    res.clearCookie(CookieNames.isAdmin);
    return cb();
  });
}
