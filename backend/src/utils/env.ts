import { config } from "dotenv";
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

export const NODE_ENV = getEnv("NODE_ENV");
