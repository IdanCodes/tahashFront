import {UserEventResult} from "../../backend/src/types/user-event-result";
import {CompEvent} from "../types/comp-event";

export interface UserCompeteData {
    scrambles: string[];
    eventData: CompEvent;
    results: UserEventResult;
}