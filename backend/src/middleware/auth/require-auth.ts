import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";

/**
 * Check if a client is logged in
 * @param req A request made by the client to check
 */
export function isLoggedIn(req: Request): boolean {
  return req.session.userSession !== undefined;
}

/**
 * Require authentication middleware
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!isLoggedIn(req))
    return res.json(
      new ApiResponse(
        ResponseCode.Error,
        "Authentication is required for this request.",
      ),
    );
  next();
};
