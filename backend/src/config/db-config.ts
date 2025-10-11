import mongoose from "mongoose";
import { getEnv, IS_PRODUCTION, tryGetEnv } from "./env";
import { CompManager } from "../database/comps/comp-manager";
import { createCompSrc } from "../database/models/tahash-comp.model";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import session from "express-session";
import { RequestHandler } from "express";
import { UserManager } from "../database/users/user-manager";

let _connString: string | undefined = undefined;
export const getConnectionString: () => string = () => {
  if (_connString) return _connString;
  // retrieve mongodb host url
  const mongoUsername: string | undefined = tryGetEnv(
    "MONGO_INITDB_ROOT_USERNAME",
  );
  const mongoPassword: string | undefined = tryGetEnv(
    "MONGO_INITDB_ROOT_PASSWORD",
  );
  const host: string | undefined = IS_PRODUCTION
    ? tryGetEnv("MONGO_SERVICE")
    : "localhost";

  // use the credentials, if they exist
  const hasCredentials: boolean = !!(mongoUsername && mongoPassword);
  const mongoUrlPrefix = hasCredentials
    ? `${mongoUsername}:${mongoPassword}@`
    : "";
  const mongoUrlParams = hasCredentials ? "?authSource=admin" : "";

  // build mongo connection string
  _connString = `mongodb://${mongoUrlPrefix}${host}:27017/tahash${mongoUrlParams}`;
  return _connString;
};

export async function connectToDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    console.warn("Database is already initialized.");
    return;
  }

  // connect to Mongo and retrieve database
  console.log("Connecting");
  await mongoose.connect(getConnectionString(), {
    serverSelectionTimeoutMS: 5000,
  });

  // initialize user manager
  UserManager.init();

  // initialize comp manager
  await CompManager.init();

  // validate current comp
  await CompManager.getInstance().validateActiveComp(
    createCompSrc(CompManager.getInstance().getActiveCompNum() + 1, [
      /* TODO: extra events here */
    ]),
  );
}

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
