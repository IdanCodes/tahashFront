import {SubmissionData} from "./submission-data";
import {UserManager} from "../../backend/src/database/users/user-manager";
import {UserInfo} from "./user-info";

export interface SubmissionDataDisplay extends Omit<SubmissionData, "userId"> {
    submitterData: Omit<UserInfo, "photoUrl" | "country">;
}

export async function getSubmissionDisplay(submission: SubmissionData): Promise<SubmissionDataDisplay | undefined> {
    const userInfo = await UserManager.getInstance().getUserInfoById(
        submission.userId,
    );

    return userInfo ? {
        submissionState: submission.submissionState,
        times: submission.times,
        finalResult: submission.finalResult,
        resultStr: submission.resultStr,
        submitterData: userInfo,
        place: submission.place ?? undefined,
    } as SubmissionDataDisplay : undefined;
}

export async function getSubmissionDisplays(eventSubmissions: SubmissionData[]) {
    const displays: SubmissionDataDisplay[] = [];
    for (const submission of eventSubmissions) {
        const newDisplay = await getSubmissionDisplay(submission);
        if (newDisplay) displays.push(newDisplay);
        else console.warn(
            `Could not find user ${submission.userId} when constructing SubmissionDataDisplay for getSubmissionDisplays; skipping`,
        );
    }

    return displays;
}