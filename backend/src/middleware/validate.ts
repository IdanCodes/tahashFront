import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import {
  RequestKeys,
  RequestValidationSchemas,
} from "../types/validated-request";
import { ApiResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import { errorObject } from "@shared/interfaces/error-object";

/**
 * Generate a middleware validating an incoming request
 * @param schemas The validation schemas to use
 * @return The validation middleware
 */
export const validate = (schemas: RequestValidationSchemas): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const key of RequestKeys) {
        const schema = schemas[key];
        if (schema) Object.assign(req[key], schema.parse(req[key]));
      }

      return next();
    } catch (error) {
      return error instanceof ZodError
        ? res.status(400).json(
            new ApiResponse(
              ResponseCode.Error,
              errorObject("Validation Error", {
                status: "error",
                message: error.message,
              }),
            ),
          )
        : next(error); // not a ZodError; let express handle it
    }
  };
};
