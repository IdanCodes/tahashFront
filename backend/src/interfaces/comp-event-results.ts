import { SubmissionData } from "@shared/interfaces/submission-data";

/**
 * Scrambles and submissions of an event in a Tahash comp.
 */
export interface CompEventResults<ArgsType = any> {
  scrambles: string[];
  submissions: SubmissionData<ArgsType>[];
}
