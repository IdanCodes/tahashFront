import { NextFunction, Request, Response, Router } from "express";
import { ResponseCode } from "@shared/types/response-code";
import { ApiResponse } from "@shared/types/api-response";
import {
  exchangeAuthCode,
  getUserDataByToken,
  renewAuthentication,
  WCA_AUTH_URL,
} from "./utils/wcaApiUtils";
import { errorObject, isErrorObject } from "@shared/interfaces/error-object";
import { TahashUserSession } from "./interfaces/tahash-user-session";
import { createMongoSession } from "./config/db-config";
import { QueryParams } from "@shared/constants/query-params";
import { RoutePath } from "@shared/constants/routePath";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userSession: TahashUserSession;
  }
}
const SID_COOKIE_NAME = "connect.sid";

/**
 * Check if a client is logged in
 * @param req A request made by the client to check
 */
function isLoggedIn(req: Request): boolean {
  return req.session.userSession !== undefined;
}

router.use(createMongoSession());

// Middleware to block users who aren't logged in
// TODO ^^

// Middleware to refresh an expired WCA session
router.use(async (req: Request, res: Response, next: NextFunction) => {
  const userSession = req.session.userSession;
  if (!userSession || userSession.expiration < new Date().getTime())
    return next();

  // get new access token
  const tokenRes = await renewAuthentication(userSession.refresh_token);
  if (isErrorObject(tokenRes))
    return res.json(new ApiResponse(ResponseCode.Error, tokenRes));

  // fetch WCA user data
  const userInfo = await getUserDataByToken(tokenRes.access_token);
  if (isErrorObject(userInfo))
    return res.json(new ApiResponse(ResponseCode.Error, userInfo));

  req.session.userSession = {
    access_token: tokenRes.access_token,
    refresh_token: tokenRes.refresh_token,
    expiration: new Date().getTime() + tokenRes.expires_in * 100,
    userInfo: userInfo,
  };

  next();
});

// Testing
router.get("/", (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(ResponseCode.Success, "Api Response"));
});

/**
 * Get the WCA authentication url based on a redirect url
 * @param redirect Redirect url for the callback
 */
router.get(RoutePath.Get.AuthWcaUrl, (req: Request, res: Response) => {
  const redirectUri = req.query[QueryParams.Redirect];
  if (typeof redirectUri !== "string")
    return res
      .status(400)
      .json(new ApiResponse(ResponseCode.Error, "Missing redirect param"));
  res
    .status(200)
    .json(new ApiResponse(ResponseCode.Success, WCA_AUTH_URL(redirectUri)));
});

/**
 * Exchange WCA code
 * @param redirect "redirect" for the callback url
 * @param body.code body.code containing the exchange code
 */
router.post(
  RoutePath.Post.WcaCodeExchange,
  async (req: Request, res: Response) => {
    const redirectUri = req.query[QueryParams.Redirect];
    const authCode = req.body.code;

    // validate request parameters
    if (typeof authCode !== "string")
      return res.json(
        new ApiResponse(ResponseCode.Error, "Missing code field"),
      );

    if (typeof redirectUri !== "string")
      return res.json(
        new ApiResponse(ResponseCode.Error, "Missing redirect param"),
      );

    if (isLoggedIn(req))
      return res.json(new ApiResponse(ResponseCode.Error, "Already logged in"));

    // Exchange authentication code
    const tokenRes = await exchangeAuthCode(authCode, redirectUri);
    if (isErrorObject(tokenRes))
      return res.json(new ApiResponse(ResponseCode.Error, tokenRes));

    // Fetch WCA user data
    const userInfo = await getUserDataByToken(tokenRes.access_token);
    if (isErrorObject(userInfo))
      return res.json(new ApiResponse(ResponseCode.Error, userInfo));

    // Save user's data in session
    req.session.userSession = {
      access_token: tokenRes.access_token,
      refresh_token: tokenRes.refresh_token,
      expiration: new Date().getTime() + tokenRes.expires_in * 100,
      userInfo: userInfo,
    };

    req.session.save((err) => {
      res.json(
        err
          ? new ApiResponse(
              ResponseCode.Error,
              errorObject("Error saving session", err),
            )
          : new ApiResponse(ResponseCode.Success, "Logged in successfully!"),
      );
    });
  },
);

// get the user info of a user who's logged in
// returns: If there was an error, undefined.
// Otherwise, the user's UserInfo.
router.get(RoutePath.Get.UserInfo, (req: Request, res: Response) => {
  req.query;
  res
    .status(200)
    .json(
      new ApiResponse(
        ResponseCode.Success,
        isLoggedIn(req) ? req.session.userSession!.userInfo : null,
      ),
    );
});

// Remove the user's session from the database and destroy the cookie
router.get(RoutePath.Get.Logout, (req: Request, res: Response) => {
  if (!isLoggedIn(req))
    return res.json(new ApiResponse(ResponseCode.Error, "Not logged in"));

  req.session.destroy((err) => {
    if (err)
      return res.json(new ApiResponse(ResponseCode.Error, "Could not log out"));

    res.clearCookie(SID_COOKIE_NAME);
    res.status(200).json(new ApiResponse(ResponseCode.Success));
  });
});

export default router;
