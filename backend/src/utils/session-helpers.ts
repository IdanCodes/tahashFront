import { Request } from "express";
import { WcaOAuthTokenResponse } from "@shared/interfaces/wca-api/wcaOAuth";
import { UserInfo } from "@shared/interfaces/user-info";
import { TahashUserSession } from "../interfaces/tahash-user-session";

/**
 * Updates the session with new token and user data.
 */
export function updateAndSaveSession(
  req: Request,
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
}
