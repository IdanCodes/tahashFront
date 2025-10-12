import { z, ZodObject } from "zod";
import { Request } from "express";

/**
 * Keys of a Request object
 */
export const RequestKeys: Array<keyof RequestValidationSchemas> = [
  "body",
  "query",
  "headers",
  "params",
];

/**
 * Structure of a full request schema
 */
export type RequestValidationSchemas = {
  body?: ZodObject;
  query?: ZodObject;
  headers?: ZodObject;
  params?: ZodObject;
};

/**
 * A helper to infer the full validated request data type
 */
export type ValidatedRequest<T extends RequestValidationSchemas> = Request<
  T["params"] extends ZodObject ? z.infer<T["params"]> : {},
  any,
  T["body"] extends ZodObject ? z.infer<T["body"]> : {},
  T["query"] extends ZodObject ? z.infer<T["query"]> : {}
>;
