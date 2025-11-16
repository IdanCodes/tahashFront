import {EventId, getEventById} from "./comp-event";
import {CompEventResults} from "../interfaces/comp-event-results";
import {EventDisplayInfo} from "../interfaces/event-display-info";
import {
    getSubmissionDisplays,
    SubmissionDataDisplay
} from "../interfaces/submission-data-display";

export type CompEventPair = {
    eventId: EventId;
    result: CompEventResults;
};

type SubmissionDisplayNoState = Omit<SubmissionDataDisplay, "submissionState">;
export type CompEventPairDisplay = {
    eventDisplay: EventDisplayInfo,
    result: {
        scrambles: string[],
        submissions: SubmissionDisplayNoState[]
    }
}


export async function getCompEventPairDisplay(pair: CompEventPair){
    const eventData = getEventById(pair.eventId);
    if (!eventData)
        return undefined;

    const display: SubmissionDataDisplay[] = await getSubmissionDisplays(pair.result.submissions);
    const submissionsDisplayNoState: SubmissionDisplayNoState[] = display.map((d): SubmissionDisplayNoState => ({
        times: d.times,
        finalResult: d.finalResult,
        resultStr: d.resultStr,
        submitterData: d.submitterData,
        place: d.place
    }));

    return {
        eventDisplay: eventData,
        result: {
            scrambles: pair.result.scrambles,
            submissions: submissionsDisplayNoState
        }
    } as CompEventPairDisplay;
}
