import {EventDisplayInfo} from "./event-display-info";

export interface CompDisplayInfo {
    compNumber: number;
    startDate: Date;
    endDate: Date;
    events: EventDisplayInfo[];
}