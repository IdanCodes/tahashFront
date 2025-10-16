import { z } from "zod";
import {
  RequestValidationSchemas,
  ValidatedRequest,
} from "../types/validated-request";
import { HttpHeaders } from "@shared/constants/http-headers";

// components
const userIdSchema = z.coerce.number().nonnegative().int();
const eventIdSchema = z.string();

// region Get.UserEventData
// headers
const userEventDataHeadersSchema = z.object({
  [HttpHeaders.USER_ID]: userIdSchema,
  [HttpHeaders.EVENT_ID]: eventIdSchema,
});
export type UserEventDataHeadersInput = z.infer<
  typeof userEventDataHeadersSchema
>;

// full request
export const userEventDataSchemas: RequestValidationSchemas = {
  headers: userEventDataHeadersSchema,
};
export type UserEventDataRequest = ValidatedRequest<
  typeof userEventDataSchemas
>;

// endregion
