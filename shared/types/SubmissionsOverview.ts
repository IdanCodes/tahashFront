import {SubmissionState} from "../constants/submission-state";
import {SubmissionData} from "../interfaces/submission-data";

/**
 * Describes how many submissions of each SubmissionState an event has
 */
export type SubmissionsOverview = {
    overview: number[]
}

export function getSubmissionsOverview(submissions: SubmissionData[]) : SubmissionsOverview {
    const overviewMap: number[] = [0, 0, 0];

    for (let i = 0; i < submissions.length; i++)
        overviewMap[submissions[i].submissionState] += 1;

    return {
        overview: overviewMap
    } as SubmissionsOverview;
}
