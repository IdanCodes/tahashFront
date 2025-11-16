import {CompEventPair, CompEventPairDisplay} from "../types/comp-event-pair";


export interface CompDisplayData {
    compNumber: number;
    startDate: Date;
    endDate: Date;
    data: CompEventPairDisplay[];
}