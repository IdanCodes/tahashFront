import { Request, Response } from "express";
import { CompManager } from "../database/comps/comp-manager";
import { UserManager } from "../database/users/user-manager";
import { ApiResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import { getEventsDisplayAndStatus } from "@shared/types/event-display-and-status";

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

export const compHandlers = { eventsDisplayAndStatus };
