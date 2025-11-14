import { Request, Response } from "express";
import { CookieNames } from "@shared/constants/cookie-names";
import { COOKIE_CONFIG } from "../config/env";

export const ADMINS_LIST = ["2019SAHA01", "2019KEHI01", "2022STON03"];

export function isAdmin(wcaId: string) {
  return ADMINS_LIST.includes(wcaId);
}

export function refreshAdminCookie(req: Request, res: Response) {
  const userInfo = req.session.userSession?.userInfo;
  if (!userInfo || !isAdmin(userInfo.wcaId))
    res.clearCookie(CookieNames.isAdmin);
  else
    res.cookie(CookieNames.isAdmin, JSON.stringify(isAdmin(userInfo.wcaId)), {
      httpOnly: false,
      expires: req.session.cookie.expires ?? undefined,
      secure: COOKIE_CONFIG.SECURE,
      sameSite: COOKIE_CONFIG.SAMESITE,
    });
}
