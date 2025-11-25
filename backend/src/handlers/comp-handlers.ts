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
import { errorObject } from "@shared/interfaces/error-object";
import { getSubmissionDisplays } from "@shared/interfaces/submission-data-display";
import { SubmissionState } from "@shared/constants/submission-state";
import { shouldAutoApprove } from "@shared/utils/event-results-utils";
import { TahashCompDoc } from "../database/models/tahash-comp.model";
import { isAlphanumeric, isInteger } from "@shared/utils/global-utils";
import {
  EventResultDisplay,
  submissionsToResultDisplays,
} from "@shared/types/event-result-display";
import { eventRecordToGeneralRecords } from "@shared/types/event-records";
import { isWcaIdFormat } from "@shared/interfaces/user-info";

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

  const activeComp = CompManager.getInstance().getActiveComp();
  activeComp.submitResults(eventData, userId, times);

  const record = userDoc.getEventRecord(eventId);
  if (
    record &&
    shouldAutoApprove(
      eventData,
      eventRecordToGeneralRecords(eventData.timeFormat, record),
      times,
    )
  )
    await activeComp.setSubmissionState(
      eventId,
      userId,
      SubmissionState.Approved,
    );

  await activeComp.save();
}

export async function eventsAndSubmissionOverviews(
  req: Request,
  res: Response,
) {
  const compNumberStr = req.params.compNumber;
  if (!compNumberStr)
    return res.json(errorResponse("Path parameter compNumber is required"));

  const compNumber = Number(compNumberStr);
  if (!isInteger(compNumber))
    return res.json(errorResponse(`Invalid comp number ${compNumberStr}`));

  if (compNumber === CompManager.getInstance().getActiveCompNum()) {
    const overviews = CompManager.getInstance()
      .getActiveComp()
      .eventsAndSubmissionOverviews();
    return res.json(new ApiResponse(ResponseCode.Success, overviews));
  }

  let comp: TahashCompDoc | null =
    await CompManager.getInstance().getTahashComp(compNumber);
  if (!comp)
    return res.json(errorResponse(`Invalid comp number ${compNumberStr}`));

  return new ApiResponse(
    ResponseCode.Success,
    comp.eventsAndSubmissionOverviews(),
  );
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

  res.json(
    new ApiResponse(
      ResponseCode.Success,
      await getSubmissionDisplays(eventSubmissions),
    ),
  );
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
  const { eventId, userId, submissionState } =
    req.body as UpdateSubmissionStateBodyInput;

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
  await activeComp.setSubmissionState(eventId, userId, submissionState);
  await activeComp.save();
  res.json(new ApiResponse(ResponseCode.Success, "Updated successfully"));
}

export async function activeCompInfo(_: Request, res: Response) {
  return res.json(
    new ApiResponse(
      ResponseCode.Success,
      CompManager.getInstance().getActiveComp().getDisplayInfo(),
    ),
  );
}

export async function compDisplayInfo(req: Request, res: Response) {
  const compNumberStr = req.params.compNumber;
  if (!compNumberStr)
    return res.json(errorResponse("Path parameter compNumber is required"));

  const compNumber = Number(compNumberStr);
  if (!isInteger(compNumber))
    return res.json(errorResponse(`Invalid comp number ${compNumberStr}`));

  if (compNumber === CompManager.getInstance().getActiveCompNum())
    return activeCompInfo(req, res);

  let comp: TahashCompDoc | null =
    await CompManager.getInstance().getTahashComp(compNumber);
  if (!comp)
    return res.json(errorResponse(`Invalid comp number ${compNumberStr}`));
  res.json(new ApiResponse(ResponseCode.Success, comp.getDisplayInfo()));
}

// /:compNumber/:eventId
// response contains EventResultDisplay[]
export async function eventResultDisplays(req: Request, res: Response) {
  const compNumberStr = req.params.compNumber;
  const eventId = req.params.eventId;
  if (!compNumberStr || !eventId)
    return res.json(
      errorResponse("Path parameters compNumber and eventId are required"),
    );

  const eventData = getEventById(eventId);
  if (!eventData)
    return res.json(errorResponse(`Invalid event id "${eventId}"`));

  const compNumber = Number(compNumberStr);
  let comp: TahashCompDoc | null = null;
  if (compNumber === 0)
    return res.json(
      new ApiResponse(ResponseCode.Success, [] as EventResultDisplay[]),
    );

  if (
    !isInteger(compNumber) ||
    !(comp = await CompManager.getInstance().getTahashComp(compNumber))
  )
    return res.json(errorResponse(`Invalid comp number ${compNumberStr}`));

  const eventResults = comp.getEventResults(eventId);
  if (!eventResults)
    return res.json(
      errorResponse(`Event "${eventId}" does not exist in this competition`),
    );

  const eventResultDisplays = await submissionsToResultDisplays(
    eventData,
    eventResults.submissions,
  );
  res.json(new ApiResponse(ResponseCode.Success, eventResultDisplays));
}

export async function competitorData(req: Request, res: Response) {
  const wcaId = req.params.wcaId.toUpperCase();
  if (!isWcaIdFormat(wcaId))
    return res.json(errorResponse(`Invalid WCA ID "${wcaId}"`));

  const userDoc = await UserManager.getInstance().getUserDocByWcaId(wcaId);
  if (!userDoc)
    return res.json(errorResponse(`The user "${wcaId}" is not registered`));

  res.json(new ApiResponse(ResponseCode.Success, userDoc.getCompetitorData()));
}

export const compHandlers = {
  eventsDisplayAndStatus,
  userEventData,
  updateTimes,
  compEventsDisplays,
  eventsAndSubmissionOverviews,
  eventSubmissions,
  eventDisplayInfo,
  updateSubmissionState,
  activeCompInfo,
  compDisplayInfo,
  eventResultDisplays,
  competitorData,
};
