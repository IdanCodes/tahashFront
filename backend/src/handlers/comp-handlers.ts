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
import { isEventId } from "../types/comp-event";

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
 */
function userEventData(req: UserEventDataRequest, res: Response) {
  const { [HttpHeaders.USER_ID]: userId, [HttpHeaders.EVENT_ID]: eventId } =
    req.headers as unknown as UserEventDataHeadersInput;

  if (!isEventId(eventId))
    return res.json(errorResponse(`Invalid event id ${eventId}`));

  return res
    .status(200)
    .json(
      new ApiResponse(
        ResponseCode.Success,
        `Received userId ${userId} and eventId ${eventId}!!`,
      ),
    );
}

export const compHandlers = {
  eventsDisplayAndStatus,
  userEventData,
};
