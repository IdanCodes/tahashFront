import { NextFunction, Request, Response, Router } from "express";
import { ResponseCode } from "@shared/types/response-code";
import { ApiResponse } from "@shared/types/api-response";
import {
  exchangeAuthCode,
  getUserDataByToken,
  WCA_AUTH_URL,
} from "./utils/wcaApiUtils";
import { getEnv, IS_PRODUCTION } from "./utils/env";
import { errorObject, isErrorObject } from "@shared/interfaces/error-object";
import session from "express-session";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import { TahashUserSession } from "./interfaces/tahash-user-session";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userSession: TahashUserSession;
  }
}

// TODO: Cleaner mongo connection
const mongoHost = IS_PRODUCTION ? getEnv("MONGO_SERVICE") : "localhost";
const mongoConnection = `mongodb://${getEnv("MONGO_INITDB_ROOT_USERNAME")}:${getEnv("MONGO_INITDB_ROOT_PASSWORD")}@${mongoHost}:27017/tahash?authSource=admin`;
console.log(`Connecting to sessions database... ${mongoConnection}`);
const mongoSession = session({
  secret: getEnv("MONGO_SESSION_SECRET"),
  resave: false, // don't force save if unmodified
  saveUninitialized: false, // don't save empty sessions
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax",
  },
  store: MongoStore.create({
    clientPromise: MongoClient.connect(mongoConnection, {
      serverSelectionTimeoutMS: 1500, // initial connection timeout
      connectTimeoutMS: 1500, // ongoing connection timeout
    }),
    collectionName: "sessions",
    ttl: 7 * 24 * 60 * 60, // 1 week (in seconds)
  }),
});
const SID_COOKIE_NAME = "connect.sid";

router.use(mongoSession);

// router.use(async (req: Request, res: Response, next: NextFunction) => {
//   const userSession = req.session.userSession;
//   console.log("USERSESSION:", userSession);
//   if (!userSession || userSession.expiration < new Date().getTime())
//     return next();
//
//   // get new access token
//   const tokenRes = await renewAuthentication(userSession.refresh_token);
//   if (isErrorObject(tokenRes))
//     return res.json(new ApiResponse(ResponseCode.Error, tokenRes));
//
//   // fetch WCA user data
//   const userInfo = await getUserDataByToken(tokenRes.access_token);
//   if (isErrorObject(userInfo))
//     return res.json(new ApiResponse(ResponseCode.Error, userInfo));
//
//   req.session.userSession = {
//     access_token: tokenRes.access_token,
//     refresh_token: tokenRes.refresh_token,
//     expiration: new Date().getTime() + tokenRes.expires_in * 100,
//     userInfo: userInfo,
//   };
//
//   next();
// });

router.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Session id: ", req.sessionID);
  next();
});

router.get("/", (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(ResponseCode.Success, "Api Response"));
});

// get the wca authentication url based on a redirect url
// url param "redirect" for the callback url
router.get("/auth-wca-url", (req: Request, res: Response) => {
  const redirectUri = req.query.redirect;
  if (typeof redirectUri !== "string")
    return res
      .status(400)
      .json(new ApiResponse(ResponseCode.Error, "Missing redirect param"));
  res
    .status(200)
    .json(new ApiResponse(ResponseCode.Success, WCA_AUTH_URL(redirectUri)));
});

// exchange wca code
// url param "redirect" for the callback url
// body contains "code" parameter
router.post("/wca-code-exchange", async (req: Request, res: Response) => {
  const redirectUri = req.query.redirect;
  const authCode = req.body.code;

  // validate request parameters
  if (typeof authCode !== "string")
    return res.json(new ApiResponse(ResponseCode.Error, "Missing code field"));

  if (typeof redirectUri !== "string")
    return res.json(
      new ApiResponse(ResponseCode.Error, "Missing redirect param"),
    );

  if (req.session.userSession)
    // already logged in
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
    // if (err)
    //   return res.json(
    //     new ApiResponse(
    //       ResponseCode.Error,
    //       errorObject("Error saving session", err),
    //     ),
    //   );

    console.log("Saved! Error:", err);
    res.json(
      err
        ? new ApiResponse(
            ResponseCode.Error,
            errorObject("Error saving session", err),
          )
        : new ApiResponse(ResponseCode.Success, userInfo),
    );
  });

  // return res.json(
  //   new ApiResponse(ResponseCode.Success, "Logged in successfully!"),
  // );
});

// get the user info of a user who's logged in
// returns: either undefined in Error, or the user's UserInfo when no error.
router.get("/user-info", (req: Request, res: Response) => {
  if (!req.session.userSession) {
    // Not logged in
    console.log("No session data.");
    return res.json(new ApiResponse(ResponseCode.Error, "Not logged in"));
  }

  console.log("Found session data");
  res
    .status(200)
    .json(
      new ApiResponse(ResponseCode.Success, req.session.userSession.userInfo),
    );
});

router.get("/logout", (req: Request, res: Response) => {
  if (!req.session.userSession) {
    // Not logged in
    return res.json(new ApiResponse(ResponseCode.Error, "Not logged in"));
  }

  req.session.destroy((err) => {
    if (err)
      return res.json(new ApiResponse(ResponseCode.Error, "Could not log out"));

    res.clearCookie(SID_COOKIE_NAME);
    res.status(200).json(new ApiResponse(ResponseCode.Success));
  });
});

export default router;
