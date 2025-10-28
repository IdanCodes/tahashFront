import { z } from "zod";
import {
  RequestValidationSchemas,
  ValidatedRequest,
} from "../types/validated-request";
import { HttpHeaders } from "@shared/constants/http-headers";
import { Penalties } from "@shared/constants/penalties";

// components
const userIdSchema = z.coerce.number().nonnegative().int();
const eventIdSchema = z.string();
const packedResultSchema = z.object({
  penalty: z.enum(Penalties),
  extraArgs: z.object().nullable(),
  centis: z.int().min(-1),
});

// region Get.UserEventData
// headers
const userEventDataHeadersSchema = z.object({
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

// region Post.UpdateTimes
// body
const updateTimesBodySchema = z.object({
  eventId: eventIdSchema,
  times: z.array(packedResultSchema),
});
export type UpdateTimesBodyInput = z.infer<typeof updateTimesBodySchema>;

// full request
export const updateTimesSchemas: RequestValidationSchemas = {
  body: updateTimesBodySchema,
};
export type UpdateTimesRequest = ValidatedRequest<typeof updateTimesSchemas>;

// endregion
