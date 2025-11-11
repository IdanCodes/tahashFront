import { Request, Response } from "express";
import { CompManager } from "../database/comps/comp-manager";
import { UserManager } from "../database/users/user-manager";
import { ApiResponse, errorResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import { getEventsDisplayAndStatus } from "@shared/types/event-display-and-status";
import {
  EventDisplayInfoRequest,
  EventSubmissionsHeadersInput,
  EventSubmissionsRequest,
  eventSubmissionsSchemas,
  UpdateSubmissionStateBodyInput,
  UpdateSubmissionStateRequest,
  UpdateTimesBodyInput,
  UpdateTimesRequest,
  UserEventDataHeadersInput,
  UserEventDataRequest,
} from "../schemas/comp-schemas";
import { HttpHeaders } from "@shared/constants/http-headers";
import { getEventById } from "@shared/types/comp-event";
import { UserCompeteData } from "@shared/interfaces/user-compete-data";
import { getEmptyPackedResults } from "../utils/packed-result-utils";
import { initSubmissionData } from "@shared/interfaces/submission-data";
import { errorObject } from "@shared/interfaces/error-object";
import { SubmissionDataDisplay } from "@shared/interfaces/submission-data-display";
import { userInfo } from "node:os";

/**
 * Get all event displays and statuses
 * requireLogin
 */
async function eventsDisplayAndStatus(req: Request, res: Response) {
  const displayInfos =
    CompManager.getInstance().getActiveComp().eventDisplayInfos;

  const userInfo = req.session.userSession!.userInfo;
  const tahashUser = await UserManager.getInstance().getUserById(userInfo.id);
  const eventStatuses = tahashUser.eventStatuses;

  res.json(
    new ApiResponse(
      ResponseCode.Success,
      getEventsDisplayAndStatus(displayInfos, eventStatuses),
    ),
  );
}

// response contains a CompEvent[] of all the events of the competition
export function compEventsDisplays(_: Request, res: Response) {
  const displayInfos =
    CompManager.getInstance().getActiveComp().eventDisplayInfos;
  res.json(new ApiResponse(ResponseCode.Success, displayInfos));
}

/**
 * headers:
 * - eventId: string
 * response:
 * - The requesting user's UserCompeteData
 *
 * requireLogin
 */
async function userEventData(req: UserEventDataRequest, res: Response) {
  const { [HttpHeaders.EVENT_ID]: eventId } =
    req.headers as UserEventDataHeadersInput;

  const eventData = getEventById(eventId);
  if (!eventData)
    return res.json(errorResponse(`Invalid event id "${eventId}"`));

  const activeComp = CompManager.getInstance().getActiveComp();
  const eventScrambles = activeComp.getEventScrambles(eventId);
  if (!eventScrambles)
    return res.json(
      errorResponse(`Event \"${eventId}\" does not exist in the active comp`),
    );

  const userId = req.session.userSession!.userInfo.id;
  const userDoc = await UserManager.getInstance().getUserById(userId);
  const results = userDoc.getEventResult(eventId) ?? {
    finished: false,
    times: getEmptyPackedResults(eventData),
  };

  const competeData: UserCompeteData = {
    scrambles: eventScrambles,
    eventData: eventData,
    results: results,
  };

  return res
    .status(200)
    .json(new ApiResponse(ResponseCode.Success, competeData));
}

/**
 * body:
 * - eventId: string
 * - times: PackedResult[]
 *
 * requireLogin
 */
export async function updateTimes(req: UpdateTimesRequest, res: Response) {
  const { eventId, times } = req.body as UpdateTimesBodyInput;

  const eventData = getEventById(eventId);
  if (!eventData)
    return res.json(errorResponse(`Invalid event id "${eventId}"`));

  if (times.length != eventData.getNumScrambles())
    return res.json(
      errorResponse(
        `Number of times (${times.length}) does not match event's number of scrambles (${eventData.getNumScrambles()})`,
      ),
    );

  const userId = req.session.userSession!.userInfo.id;
  const userDoc = await UserManager.getInstance().getUserById(userId);
  userDoc.setEventTimes(eventId, times);
  await userDoc.save();

  res.json(new ApiResponse(ResponseCode.Success, "Saved successfully!"));

  if (!userDoc.finishedEvent(eventId)) return;

  const currComp = CompManager.getInstance().getActiveComp();

  const submissionData = initSubmissionData(userId, eventData, times);
  console.log("Submission data:", submissionData);
  currComp.submitResults(eventId, userId, submissionData);

  await currComp.save();
}

// response is SubmissionDataDisplay[]
export async function eventSubmissions(
  req: EventSubmissionsRequest,
  res: Response,
) {
  const { [HttpHeaders.EVENT_ID]: eventId } =
    req.headers as EventSubmissionsHeadersInput;

  if (!getEventById(eventId))
    return res.json(errorResponse(`Invalid event id "${eventId}"`));

  const eventSubmissions = CompManager.getInstance()
    .getActiveComp()
    .getEventSubmissions(eventId);

  if (!eventSubmissions)
    return res.json(
      errorResponse(
        `This competition does not contain the requested event "${eventId}"`,
      ),
    );

  const displays: SubmissionDataDisplay[] = [];
  for (const submission of eventSubmissions) {
    const userInfo = await UserManager.getInstance().getUserInfoById(
      submission.userId,
    );

    if (!userInfo) {
      console.warn(
        `Could not find user ${submission.userId} when constructing SubmissionDataDisplay for Get.EventSubmissions`,
      );
      continue;
    }

    displays.push({
      submissionState: submission.submissionState,
      times: submission.times,
      finalResult: submission.finalResult,
      resultStr: submission.resultStr,
      submitterData: userInfo,
    });
  }

  res.json(new ApiResponse(ResponseCode.Success, displays));
}

// response contains DisplayInfo of the event
function eventDisplayInfo(req: EventDisplayInfoRequest, res: Response) {
  const { [HttpHeaders.EVENT_ID]: eventId } =
    req.headers as EventSubmissionsHeadersInput;

  const compEvent = getEventById(eventId);
  if (!compEvent)
    return res.json(errorResponse(`Invalid event id "${eventId}"`));
  res.json(new ApiResponse(ResponseCode.Success, compEvent.displayInfo));
}

// - requireAuth
// - requireAdmin
async function updateSubmissionState(
  req: UpdateSubmissionStateRequest,
  res: Response,
) {
  const { compNumber, eventId, userId, submissionState } =
    req.body as UpdateSubmissionStateBodyInput;

  if (!CompManager.getInstance().compExists(compNumber))
    return res.json(errorResponse(`Invalid comp number ${compNumber}`));

  if (!getEventById(eventId))
    return res.json(errorResponse(`Invalid event id "${eventId}"`));

  const userDoc = await UserManager.getInstance().getUserById(userId);
  if (!userDoc)
    return res.json(
      errorResponse(
        errorObject(
          "Invalid user id",
          `User with user id ${userId} does not exist in the database`,
        ),
      ),
    );

  const activeComp = CompManager.getInstance().getActiveComp();
  activeComp.setSubmissionState(eventId, userId, submissionState);
  res.json(new ApiResponse(ResponseCode.Success, "Updated successfully"));
}

export const compHandlers = {
  eventsDisplayAndStatus,
  userEventData,
  updateTimes,
  compEventsDisplays,
  eventSubmissions,
  eventDisplayInfo,
  updateSubmissionState,
};
