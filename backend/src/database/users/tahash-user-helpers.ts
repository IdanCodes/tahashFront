import { EventId } from "@shared/types/comp-event";
import { UserEventResult } from "@shared/types/user-event-result";
import { LeanTahashUser } from "../models/tahash-user.model";
import { CompetitorData } from "@shared/types/competitor-data";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";

/**
 * Get the user's results in an event in the user's last competition.
 * @param user The user to operate on
 * @param eventId The event to get the results of.
 */
export function getUserEventResult(
  user: LeanTahashUser,
  eventId: EventId,
): UserEventResult | undefined {
  return user.eventResults[eventId];
}

export function getCompetitorData(user: LeanTahashUser): CompetitorData {
  return {
    userInfo: user.userInfo,
    records: Object.entries(user.records),
    pastResults: Object.entries(user.pastResults),
  } as CompetitorData;
}

export function userEventStatuses(
  user: LeanTahashUser,
): Map<EventId, EventSubmissionStatus> {
  const statuses: Map<EventId, EventSubmissionStatus> = new Map();

  for (const [eventId, results] of Object.entries(user.eventResults))
    statuses.set(
      eventId,
      results.finished
        ? EventSubmissionStatus.Completed
        : EventSubmissionStatus.InProgress,
    );

  return statuses;
}
