import {EventDisplayInfo} from "../interfaces/event-display-info";
import {EventSubmissionStatus} from "../constants/event-submission-status";
import {EventId} from "./comp-event";

/**
 * An event's display information and submission status
 */
export type EventDisplayAndStatus = EventDisplayInfo & { status: EventSubmissionStatus };

/**
 * Combine an {@link EventDisplayInfo[]} and an {@link EventSubmissionStatus[]}.
 * @param displayInfos Display information of all the events
 * @param eventStatuses Submission status of the events.
 * Events that are not in this array will default to {@link EventSubmissionStatus.NotStarted}
 */
export function getEventsDisplayAndStatus(displayInfos: readonly EventDisplayInfo[], eventStatuses: Map<EventId, EventSubmissionStatus>): EventDisplayAndStatus[] {
    const displayAndStatuses: EventDisplayAndStatus[] = displayInfos.map(
        (di) => ({ ...di, status: EventSubmissionStatus.NotStarted }),
    );
    for (const [eventId, status] of eventStatuses) {
        if (status == EventSubmissionStatus.NotStarted) continue;
        const eventIndex = displayAndStatuses.findIndex(
            (ds) => ds.eventId == eventId,
        );
        if (eventIndex >= 0) displayAndStatuses[eventIndex].status = status;
    }

    return displayAndStatuses;
}