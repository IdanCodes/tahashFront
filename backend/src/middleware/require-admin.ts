import { Request, Response, NextFunction } from "express";
import { isAdmin } from "../utils/admin-helpers";
import { errorResponse } from "@shared/types/api-response";

// Require user to be an admin
// -requireAuth
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userInfo = req.session.userSession?.userInfo;
  if (userInfo && isAdmin(userInfo.wcaId)) return next();

  return res
    .status(401)
    .json(errorResponse("You must be an admin for this request."));
}
