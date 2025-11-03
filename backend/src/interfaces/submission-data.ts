import { SubmissionState } from "../database/comps/submission-state";
import { PackedResult } from "@shared/interfaces/packed-result";
import {
  calcEventResult,
  generateResultStr,
} from "@shared/utils/event-results-utils";
import { CompEvent } from "@shared/types/comp-event";

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

/**
 * Initialize submission data
 * @param userId The submitter's id
 * @param eventData The event to submit
 * @param times The results for the event
 */
export function initSubmissionData(
  userId: number,
  eventData: CompEvent,
  times: PackedResult[],
) {
  const eventResult = calcEventResult(eventData, times);
  const resultStr = generateResultStr(eventData, times);
  const submissionData: SubmissionData = {
    userId: userId,
    submissionState: SubmissionState.Pending,
    times: times,
    finalResult: eventResult,
    resultStr: resultStr,
  };

  return submissionData;
}
