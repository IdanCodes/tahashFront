import { config } from "dotenv";
import { CookieOptions } from "express-serve-static-core";
config();

/**
 * Get an environment variable using process.env (use for mandatory environment variables).
 * @throws Throws an `Error` if the environment variable is not set.
 * @param name The name of the environment variable.
 * @returns The environment variable's value.
 */
export function getEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined)
    throw new Error(`Mandatory environment variable ${name} is not set.`);

  return value;
}

/**
 * Get an environment variable using process.env (use for environment variables which are *NOT* mandatory).
 * @throws Throws an `Error` if the environment variable is not set.
 * @param name The name of the environment variable.
 * @returns The environment variable's value, or `undefined` if it wasn't found.
 */
export function tryGetEnv(name: string): string | undefined {
  return process.env[name];
}

export const NODE_ENV = getEnv("NODE_ENV");
export const IS_PRODUCTION = NODE_ENV == "production";
export const COOKIE_CONFIG = {
  SECURE: getEnv("COOKIE_SECURE") === "true",
  SAMESITE: (getEnv("COOKIE_SAMESITE") === "lax" ? "lax" : "none") as
    | "lax"
    | "none",
  DOMAIN: tryGetEnv("COOKIE_DOMAIN"),
};
export const COOKIE_OPTIONS: CookieOptions = {
  domain: COOKIE_CONFIG.DOMAIN,
  secure: COOKIE_CONFIG.SECURE,
  sameSite: COOKIE_CONFIG.SAMESITE,
  path: "/",
};
