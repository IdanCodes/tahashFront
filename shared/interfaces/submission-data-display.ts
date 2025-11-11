import {SubmissionData} from "./submission-data";
import {UserInfo} from "./user-info";

export interface SubmissionDataDisplay extends Omit<SubmissionData, "userId"> {
    submitterData: UserInfo;
}