import {SubmissionState} from "../constants/submission-state";

export type SubmissionDataDisplay = {
    submitterData: {
        userId: number,
        name: string,
        wcaId: string,
    },
    best: string,
    average: string,
    solves: string[],
    submissionState: SubmissionState,
}
