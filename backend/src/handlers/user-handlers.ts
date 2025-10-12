import { Request, Response } from "express";
import { ApiResponse, errorResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import { isLoggedIn } from "../middleware/auth/require-auth";
import { SID_COOKIE_NAME } from "../middleware/db-session";

// get the user info of a user who's logged in
// returns: If there was an error, `null`.
// Otherwise, the user's UserInfo.
async function userInfo(req: Request, res: Response) {
  res
    .status(200)
    .json(
      new ApiResponse(
        ResponseCode.Success,
        isLoggedIn(req) ? req.session.userSession!.userInfo : null,
      ),
    );
}

/**
 * Remove the user's session from the database and destroy the cookie
 * - requireAuth middleware is required
 */
async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) return res.json(errorResponse("Could not log out"));

    res.clearCookie(SID_COOKIE_NAME);
    res.status(200).json(new ApiResponse(ResponseCode.Success));
  });
}

export const userHandlers = { userInfo, logout };
