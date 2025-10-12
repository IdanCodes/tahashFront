import { z } from "zod";
import {
  RequestValidationSchemas,
  ValidatedRequest,
} from "../types/validated-request";

// components
const redirectUriSchema = z.url().nonempty();
const authCodeSchema = z.string().nonempty();

// region Get.authWcaUrl
// query
const authWcaUrlQuerySchema = z.object({
  redirect: redirectUriSchema,
});
export type AuthWcaUrlQueryInput = z.infer<typeof authWcaUrlQuerySchema>;

// full request
export const authWcaUrlSchemas: RequestValidationSchemas = {
  query: authWcaUrlQuerySchema,
};
export type AuthWcaUrlRequest = ValidatedRequest<typeof authWcaUrlSchemas>;
// endregion

// region Get.wcaCodeExchange
// query
const codeExchangeQuerySchema = z.object({
  redirect: redirectUriSchema,
});
export type CodeExchangeQueryInput = z.infer<typeof codeExchangeQuerySchema>;

// body
const codeExchangeBodySchema = z.object({
  code: authCodeSchema,
});
export type CodeExchangeBodyInput = z.infer<typeof codeExchangeBodySchema>;

// full request
export const codeExchangeSchemas: RequestValidationSchemas = {
  query: codeExchangeQuerySchema,
  body: codeExchangeBodySchema,
};
export type CodeExchangeRequest = ValidatedRequest<typeof codeExchangeSchemas>;
// endregion
