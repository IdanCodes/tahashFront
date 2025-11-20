import {EventId} from "./comp-event";
import {CompEventResults} from "../interfaces/comp-event-results";

export type CompEventPair = {
    eventId: EventId;
    result: CompEventResults;
};
