import { SubmissionState } from "../database/comps/submission-state";
import { PackedResult } from "@shared/interfaces/packed-result";

/**
 * Submission data of an attempt in a Tahash Comp.
 */
export interface SubmissionData<ArgType = any> {
  /**
   * The submitter's user id.
   */
  userId: number;

  /**
   * The submission's state.
   */
  submissionState: SubmissionState;

  /**
   * The full attempt.
   */
  times: PackedResult<ArgType>[];

  /**
   * The attempt's numeric result, in centiseconds.
   */
  finalResult: number;

  /**
   * A display string of the attempt's result.
   */
  resultStr: string;
}
