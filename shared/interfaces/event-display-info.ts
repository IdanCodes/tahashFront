import { EventId } from "../../backend/src/types/comp-event";

/**
 * A {@link CompEvent}'s information for UI.
 */
export interface EventDisplayInfo {
  eventId: EventId;
  eventTitle: string;
  iconName: string;
}

export const EMPTY_DISPLAY_INFO = {
    eventId: "-",
    eventTitle: "-",
    iconName: "-",
};
