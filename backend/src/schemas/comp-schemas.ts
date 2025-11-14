import { z } from "zod";
import {
  RequestValidationSchemas,
  ValidatedRequest,
} from "../types/validated-request";
import { HttpHeaders } from "@shared/constants/http-headers";
import { Penalties } from "@shared/constants/penalties";
import { SubmissionState } from "@shared/constants/submission-state";

// components
const userIdSchema = z.coerce.number().nonnegative().int();
const eventIdSchema = z.string();
const packedResultSchema = z.object({
  penalty: z.enum(Penalties),
  extraArgs: z.object().optional(),
  centis: z.int().min(-1),
});
const submissionStateSchema = z.enum(SubmissionState);

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

// region Get.EventSubmissions
// headers
const eventSubmissionsHeadersSchema = z.object({
  [HttpHeaders.EVENT_ID]: eventIdSchema,
});
export type EventSubmissionsHeadersInput = z.infer<
  typeof eventSubmissionsHeadersSchema
>;

// full request
export const eventSubmissionsSchemas: RequestValidationSchemas = {
  headers: eventSubmissionsHeadersSchema,
};
export type EventSubmissionsRequest = ValidatedRequest<
  typeof eventSubmissionsSchemas
>;

// endregion

// region Get.EventDisplayInfo
// headers
const eventDisplayInfoHeadersSchema = z.object({
  [HttpHeaders.EVENT_ID]: eventIdSchema,
});
export type EventDisplayInfoHeadersInput = z.infer<
  typeof eventDisplayInfoHeadersSchema
>;

// full request
export const eventDisplayInfoSchemas: RequestValidationSchemas = {
  headers: eventDisplayInfoHeadersSchema,
};
export type EventDisplayInfoRequest = ValidatedRequest<
  typeof eventSubmissionsSchemas
>;

// endregion

// region Post.UpdateSubmissionState

const updateSubmissionStateBodySchema = z.object({
  eventId: eventIdSchema,
  userId: userIdSchema,
  submissionState: submissionStateSchema,
});

export type UpdateSubmissionStateBodyInput = z.infer<
  typeof updateSubmissionStateBodySchema
>;

export const updateSubmissionStateSchemas: RequestValidationSchemas = {
  body: updateSubmissionStateBodySchema,
};

export type UpdateSubmissionStateRequest = ValidatedRequest<
  typeof updateSubmissionStateSchemas
>;

// endregion
