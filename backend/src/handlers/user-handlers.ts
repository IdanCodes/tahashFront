import { Request, Response } from "express";
import { ApiResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import { isLoggedIn } from "../middleware/auth/require-auth";

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

export const userHandlers = { userInfo };
