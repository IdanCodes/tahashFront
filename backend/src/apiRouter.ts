import express, { Request, Response, Router } from "express";
import { ResponseCode } from "../../shared/types/response-code";
import { ApiResponse } from "../../shared/types/api-response";
import {
  exchangeAuthCode,
  getUserDataByToken,
  WCA_AUTH_URL,
} from "./utils/wcaApiUtils";
import { getEnv, NODE_ENV } from "./utils/env";
import {
  errorObject,
  isErrorObject,
} from "../../shared/interfaces/error-object";
import session from "express-session";
import MongoStore from "connect-mongo";
import { UserInfo } from "./interfaces/user-info";
import cors from "cors";

const router = Router();

declare module "express-session" {
  interface SessionData {
    access_token: string;
    refresh_token: string;
    expiration: number; // token expiration date in milliseconds since epoch
    userInfo: UserInfo;
  }
}

console.log("Connecting to sessions database...");
// TODO: Cleaner mongo connection
const mongoConnection = `mongodb://${getEnv("MONGO_INITDB_ROOT_USERNAME")}:${getEnv("MONGO_INITDB_ROOT_PASSWORD")}@localhost:27017/tahash?authSource=admin`;
const mongoSession = session({
  secret: getEnv("MONGO_SESSION_SECRET"),
  resave: false, // don't force save if unmodified
  saveUninitialized: false, // don't save empty sessions
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: NODE_ENV == "production",
    sameSite: NODE_ENV == "production" ? "none" : "lax",
  },
  store: MongoStore.create({
    mongoUrl: mongoConnection,
    collectionName: "sessions",
    ttl: 7 * 24 * 60 * 60, // 1 week (in seconds)
  }),
});
router.use(mongoSession);
console.log("Connected to MongoDB!");

router.get("/", (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(ResponseCode.Success, "Api Response"));
});

router.get("/auth-wca", (req: Request, res: Response) => {
  const redirectUri = req.query.redirect;
  if (typeof redirectUri !== "string")
    return res.status(400).json(errorObject("Missing redirect param"));
  res.redirect(WCA_AUTH_URL(redirectUri));
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

  // Exchange authentication code
  const tokenRes = await exchangeAuthCode(authCode, redirectUri);
  if (isErrorObject(tokenRes))
    return res.json(new ApiResponse(ResponseCode.Error, tokenRes.error));

  // Fetch WCA user data
  const userInfo = await getUserDataByToken(tokenRes.access_token);
  if (isErrorObject(userInfo))
    return res.json(new ApiResponse(ResponseCode.Error, userInfo.error));

  // Save user's information in session
  req.session.expiration = new Date().getTime() + tokenRes.expires_in * 100;
  req.session.access_token = tokenRes.access_token;
  req.session.refresh_token = tokenRes.refresh_token;
  req.session.userInfo = userInfo;
  req.session.save((err) => {
    if (err) {
      console.log(`Error saving session: ${err}`);
      return res.json(
        new ApiResponse(ResponseCode.Error, `Session save failed: ${err}`),
      );
    }

    return res.json(
      new ApiResponse(ResponseCode.Success, "Logged in successfully!"),
    );
  });
});

router.get("/me", async (req: Request, res: Response) => {
  res.json(req.session.userInfo);
});

export default router;
