import { RequestHandler } from "express";
import session from "express-session";
import { getEnv, IS_PRODUCTION } from "../config/env";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import { getConnectionString } from "../config/db-config";

export function createMongoSession(): RequestHandler {
  return session({
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
      clientPromise: MongoClient.connect(getConnectionString(), {
        serverSelectionTimeoutMS: 1500, // initial connection timeout
        connectTimeoutMS: 1500, // ongoing connection timeout
      }),
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 1 week (in seconds)
    }),
  });
}
