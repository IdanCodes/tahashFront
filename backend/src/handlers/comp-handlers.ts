import { Request, Response } from "express";
import { CompManager } from "../database/comps/comp-manager";
import { UserManager } from "../database/users/user-manager";
import {
  EventDisplayAndStatus,
  getEventsDisplayAndStatus,
} from "@shared/types/event-display-and-status";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";

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

  return getEventsDisplayAndStatus(displayInfos, eventStatuses);
}

export const compHandlers = { eventsDisplayAndStatus };
