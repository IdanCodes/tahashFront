import {CompEvent, EventId, getEventById} from "./comp-event";
import {CompEventResults} from "../interfaces/comp-event-results";
import {SubmissionData} from "../interfaces/submission-data";
import {UserManager} from "../../backend/src/database/users/user-manager";
import {
    getBestResult,
    getBestResultStr,
    getAverageCentis,
    getAverageStr,
    formatAttempts
} from "../utils/event-results-utils";
import {PackedResult} from "../interfaces/packed-result";

export type CompEventPair = {
    eventId: EventId;
    result: CompEventResults;
};

/**
 * Display information for a submissions of an event
 */
export type EventResultDisplay = {
    place: number,
    name: string,
    best: string,
    average: string,
    solves: string[]
};
// export type SubmissionDisplayNoState = Omit<SubmissionDataDisplay, "submissionState">;
// export type CompEventPairDisplay = {
//     eventDisplay: EventDisplayInfo,
//     result: {
//         scrambles: string[],
//         submissions: SubmissionDisplayNoState[]
//     }
// }

// null if userId is invalid
export async function submissionToResultDisplay(eventData: CompEvent, submission: SubmissionData): Promise<EventResultDisplay | null> {
    const userInfo = await UserManager.getInstance().getUserInfoById(submission.userId);
    if (!userInfo) return null;

    return {
        place: submission.place,
        name: userInfo.name,
        best: getBestResultStr(eventData, submission.times),
        average: getAverageStr(eventData, submission.times),
        solves: formatAttempts(eventData.timeFormat, submission.times)
    } as EventResultDisplay;
}

export async function submissionsToResultDisplays(eventData: CompEvent, eventSubmissions: SubmissionData[]): Promise<EventResultDisplay[]> {
    const result: EventResultDisplay[] = [];

    for (let i = 0; i < eventSubmissions.length; i++) {
        const resultDisplay = await submissionToResultDisplay(eventData, eventSubmissions[i]);
        if (resultDisplay)
            result.push(resultDisplay);
    }

    return result;
}

// export async function getCompEventPairDisplay(pair: CompEventPair){
//     const eventData = getEventById(pair.eventId);
//     if (!eventData)
//         return undefined;
//
//     const display: SubmissionDataDisplay[] = await getSubmissionDisplays(pair.result.submissions);
//     const submissionsDisplayNoState: SubmissionDisplayNoState[] = display.map((d): SubmissionDisplayNoState => ({
//         times: d.times,
//         finalResult: d.finalResult,
//         resultStr: d.resultStr,
//         submitterData: d.submitterData,
//         place: d.place
//     }));
//
//     return {
//         eventDisplay: eventData,
//         result: {
//             scrambles: pair.result.scrambles,
//             submissions: submissionsDisplayNoState
//         }
//     } as CompEventPairDisplay;
// }
