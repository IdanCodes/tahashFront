import { Request, Response } from "express";
import { CompManager } from "../database/comps/comp-manager";
import { UserManager } from "../database/users/user-manager";
import { ApiResponse, errorResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import { getEventsDisplayAndStatus } from "@shared/types/event-display-and-status";
import {
  UserEventDataHeadersInput,
  UserEventDataRequest,
} from "../schemas/comp-schemas";
import { HttpHeaders } from "@shared/constants/http-headers";
import { getEventById, isEventId } from "@shared/types/comp-event";
import { UserCompeteData } from "@shared/interfaces/user-compete-data";
import { getEmptyPackedResults } from "../utils/packed-result-utils";

/**
 * Get all event displays and statuses
 * - requireLogin
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

/**
 * headers:
 * userId: number
 * eventId: string
 * response:
 *
 */
async function userEventData(req: UserEventDataRequest, res: Response) {
  const { [HttpHeaders.USER_ID]: userId, [HttpHeaders.EVENT_ID]: eventId } =
    req.headers as unknown as UserEventDataHeadersInput;

  const eventData = getEventById(eventId);
  if (!eventData) return res.json(errorResponse(`Invalid event id ${eventId}`));

  const activeComp = CompManager.getInstance().getActiveComp();
  const eventScrambles = activeComp.getEventScrambles(eventId);
  if (!eventScrambles)
    return res.json(
      errorResponse(`Event \"${eventId}\" does not exist in the active comp`),
    );

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

export const compHandlers = {
  eventsDisplayAndStatus,
  userEventData,
};
