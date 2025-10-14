import { NextFunction, Request, Response } from "express";
import {
  getUserDataByToken,
  renewAuthentication,
} from "../../utils/wcaApiUtils";
import { isErrorObject } from "@shared/interfaces/error-object";
import { errorResponse } from "@shared/types/api-response";
import { updateAndSaveSession } from "../../utils/session-helpers";

/**
 * Middleware to refresh an expired WCA session
 * @param req
 * @param res
 * @param next
 */
export const refreshWcaSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userSession = req.session.userSession;
  if (!userSession || userSession.expiration < new Date().getTime())
    return next();

  // get new access token
  const tokenRes = await renewAuthentication(userSession.refresh_token);
  if (isErrorObject(tokenRes)) {
    req.session.userSession = undefined;
    return res.json(errorResponse(tokenRes));
  }

  // fetch WCA user data
  const userInfo = await getUserDataByToken(tokenRes.access_token);
  if (isErrorObject(userInfo)) {
    req.session.userSession = undefined;
    return res.json(errorResponse(userInfo));
  }

  updateAndSaveSession(req, res, tokenRes, userInfo);
  next();
};
