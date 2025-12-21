import mongoose from "mongoose";
import { getEnv, IS_PRODUCTION, tryGetEnv } from "./env";
import { CompManager } from "../database/comps/comp-manager";
import { createCompSrc } from "../database/models/tahash-comp.model";
import { UserManager } from "../database/users/user-manager";

let _connString: string | undefined = undefined;
export const getConnectionString: () => string = () => {
  if (_connString) return _connString;

  const env_conn = tryGetEnv("CONNECT_STR");
  if (env_conn) {
    _connString = env_conn;
    return _connString;
  }
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
