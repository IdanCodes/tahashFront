import {EventDisplayInfo} from "./event-display-info";
import {UserEventResult} from "../../backend/src/types/user-event-result";

export interface UserCompeteData {
    scrambles: string[];
    displayInfo: EventDisplayInfo;
    results: UserEventResult;
}