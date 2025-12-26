import { RequestHandler } from "express";
import session from "express-session";
import { COOKIE_OPTIONS, getEnv } from "../config/env";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import { getConnectionString } from "../config/db-config";
import { CookieNames } from "@shared/constants/cookie-names";

export const SID_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  httpOnly: true,
};
console.log(`SID COOKIE OPTIONS: ${JSON.stringify(SID_COOKIE_OPTIONS)}`);

export function createMongoSession(): RequestHandler {
  return session({
    secret: getEnv("MONGO_SESSION_SECRET"),
    resave: false, // don't force save if unmodified
    saveUninitialized: false, // don't save empty sessions
    rolling: true, // update expiry of the cookie even when not changed
    name: CookieNames.SID_COOKIE,
    cookie: SID_COOKIE_OPTIONS,
    store: MongoStore.create({
      clientPromise: MongoClient.connect(getConnectionString(), {
        serverSelectionTimeoutMS: 1500, // initial connection timeout
        connectTimeoutMS: 1500, // ongoing connection timeout
      }),
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 1 week (in seconds)
    }),
  });
}
