import { EventId } from "../../backend/src/database/comp-event";

/**
 * A {@link CompEvent}'s information for UI.
 */
export interface EventDisplayInfo {
  eventId: EventId;
  eventTitle: string;
  iconName: string;
}
