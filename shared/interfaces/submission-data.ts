import {SubmissionState} from "../constants/submission-state";
import {PackedResult} from "./packed-result";
import {getAverageCentis, getBestResult,} from "../utils/event-results-utils";
import {CompEvent} from "../types/comp-event";
import {comparePackedResults, NULL_TIME_CENTIS} from "../utils/time-utils";
import {isAverageFormat, TimeFormat} from "../constants/time-formats";
import {compareMultiResults, ExtraArgsMbld} from "./event-extra-args/extra-args-mbld";
import {compareNumbers} from "../utils/global-utils";

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
     * The best single solve of the attempt.
     */
  single: PackedResult<ArgType>;

    /**
     * The attempt's average (calculated with the event's average method)
     */
  average: number;

    /**
     * The submission's place in the event
     */
    place?: number;
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
    const single: PackedResult = getBestResult(eventData, times);
    const average: number = (getAverageCentis(eventData ,times)) ?? NULL_TIME_CENTIS ;

  return {
      userId: userId,
      submissionState: SubmissionState.Pending,
      times: times,
      single,
      average,
  } as SubmissionData;
}

/**
 * Get the comparison function of a TimeFormat for two SubmissionDatas
 * @param format The submissions' time format
 */
export const getSubmissionCompareFunc = (format: TimeFormat): ((r1: SubmissionData, r2: SubmissionData) => 0 | 1 | -1) => {
    if (format === TimeFormat.multi)
        return (r1: SubmissionData, r2: SubmissionData) => compareMultiResults(r1.single as PackedResult<ExtraArgsMbld>, r2.single as PackedResult<ExtraArgsMbld>);

    if (isAverageFormat(format))
        return (r1: SubmissionData, r2: SubmissionData) => compareNumbers(r1.average, r2.average);

    return (r1: SubmissionData, r2: SubmissionData) => comparePackedResults(r1.single, r2.single);
}

/**
 * Compare the final results of 2 submissions
 * @param format The submissions' time format
 * @param r1 The first submission
 * @param r2 The second submission
 * @return -1: r1 < r2; 0: r1 == r2; 1: r1 > r2;
 * Edge cases:
 * - Both null => 0
 * - One is null => The null one is bigger
 */
export function compareSubmissions<T extends TimeFormat>(format: T, r1: SubmissionData, r2: SubmissionData): 0 | 1 | -1 {
    return getSubmissionCompareFunc(format)(r1, r2);
}
