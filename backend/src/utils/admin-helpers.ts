import { Request, Response } from "express";
import { CookieNames } from "@shared/constants/cookie-names";
import { COOKIE_OPTIONS } from "../config/env";

export const ADMINS_LIST = [
  "2019SAHA01",
  "2019KEHI01",
  "2022STON03",
  "2025TRIV01",
];

export function isAdmin(wcaId: string) {
  return ADMINS_LIST.includes(wcaId);
}

export function refreshAdminCookie(req: Request, res: Response) {
  const userInfo = req.session.userSession?.userInfo;
  if (!userInfo || !isAdmin(userInfo.wcaId))
    res.clearCookie(CookieNames.isAdmin);
  else
    res.cookie(CookieNames.isAdmin, JSON.stringify(isAdmin(userInfo.wcaId)), {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      expires: req.session.cookie.expires ?? undefined,
    });
}
