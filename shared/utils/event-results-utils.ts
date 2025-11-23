import {PackedResult} from "../interfaces/packed-result";
import {Penalties} from "../constants/penalties";
import {
    comparePackedResults,
    DNF_STRING,
    formatCentis, formatPackedResult,
    formatPackedResults,
    getPureCentis,
    getPureCentisArr,
    isNullCentis,
    NULL_TIME_CENTIS,
} from "./time-utils";
import {NumScrambles, TimeFormat} from "../constants/time-formats";
import {
    calcMultiBldTotalPoints,
    compareMultiResults,
    ExtraArgsMbld,
} from "../interfaces/event-extra-args/extra-args-mbld";
import {ExtraArgsFmc} from "../interfaces/event-extra-args/extra-args-fmc";
import {CompEvent} from "../types/comp-event";
import {SubmissionData} from "../interfaces/submission-data";
import {GeneralRecord} from "../../backend/src/types/event-records";

/**
 * Calculate an average of 5 given the full attempt.
 * @return The result, in centiseconds.
 */
function calculateAO5(results: PackedResult[]): number {
  const maxDNF: number = 2;
  const pureCentis: number[] = getPureCentisArr(results);

  let dnfCount: number = 0;
  let sum: number = 0;
  let lowest: number = pureCentis[0];
  let highest: number = pureCentis[0];

  for (let i = 0; i < NumScrambles[TimeFormat.ao5]; i++) {
    if (results[i].penalty === Penalties.DNF) {
      dnfCount++;
      continue;
    }

    if (dnfCount >= maxDNF) return NULL_TIME_CENTIS;

    sum += pureCentis[i];

    lowest = Math.min(lowest, pureCentis[i]);
    highest = Math.max(highest, pureCentis[i]);
  }

  if (dnfCount == 0)
    // don't count highest if there's no DNF
    sum -= highest;
  sum -= lowest;

  return Math.floor(sum / 3);
}

/**
 * Calculate a mean of 3 given the full attempt.
 * @return The result, in centiseconds.
 */
function calculateMO3(results: PackedResult[]): number {
  let sum = 0;
  const pureCentis: number[] = getPureCentisArr(results);

  for (let i = 0; i < NumScrambles[TimeFormat.mo3]; i++) {
    if (results[i].penalty == Penalties.DNF) return NULL_TIME_CENTIS; // max 1 dnf

    sum += pureCentis[i];
  }

  return Math.floor(sum / NumScrambles[TimeFormat.mo3]); // get the mean;
}

/**
 * Calculate the best of 3 result given the full attempt.
 * @return The result, in centiseconds.
 */
function calculateBO3(results: PackedResult[]): number {
  let best = NULL_TIME_CENTIS;

  for (let i = 0; i < NumScrambles[TimeFormat.bo3]; i++) {
      if (results[i].penalty !== Penalties.DNF)
        best = Math.min(best, getPureCentis(results[i]));
  }

  return best;
}

/**
 * Calculate the result of a MultiBLD attempt.
 * @return If the extra args are valid, same as {@link calcMultiBldTotalPoints}.
 * Otherwise, `-1`.
 */
function calculateMultiResult(result: PackedResult<ExtraArgsMbld>): number {
  let extraArgs: ExtraArgsMbld | undefined = result.extraArgs;
  if (!extraArgs) {
    console.error("Invalid MBLD extraArgs!");
    return NULL_TIME_CENTIS;
  }

  return calcMultiBldTotalPoints(extraArgs);
}

/**
 * Calculate the result of an FMC attempt.
 * @return The average number of moves of all attempts in the mean.
 */
function calculateFMCResult(results: PackedResult<ExtraArgsFmc>[]): number {
  let sum = 0;

  for (let i = 0; i < NumScrambles[TimeFormat.mo3]; i++) {
    if (results[i].penalty == Penalties.DNF) return NULL_TIME_CENTIS; // max 1 dnf

    if (!results[i].extraArgs!.fmcSolution) {
      console.error(
        "ERROR: No FMC solution. Returning NULL_TIME_CENTIS (event-results-utils.ts . calculateFMCResult)",
      );
      return NULL_TIME_CENTIS;
    }

    sum += results[i].extraArgs!.fmcSolution.length;
  }

  return Math.floor(sum / NumScrambles[TimeFormat.mo3]); // calculate and return the mean
}
// almost the same but in a cool one-liner:
// return results.reduce((sum, r) => sum + r.extraArgs.fmcSolution.length, 0) / NumScrambles[TimeFormat.mo3];

/**
 * Get the final result of the event (as a string), given the times (e.g. an ao5, mo3, ...).
 * @param compEvent The event to calculate the results of.
 * @param results The attempts.
 * @return
 * - If the event id was not found, returns -1.
 * - Otherwise, returns the result (in centiseconds for timed events).
 */
export function calcEventResult(
  compEvent: CompEvent,
  results: PackedResult[],
): number {
  if (compEvent.eventId === "333fm") return calculateFMCResult(results as PackedResult<ExtraArgsFmc>[]);

  switch (compEvent.timeFormat) {
    case TimeFormat.ao5:
      return calculateAO5(results);

    case TimeFormat.mo3:
      return calculateMO3(results);

    case TimeFormat.bo3:
      return calculateBO3(results);

    case TimeFormat.multi:
      return results.length == 0 ? -1 : calculateMultiResult(results[0] as PackedResult<ExtraArgsMbld>);
  }
}

/**
 * Get the result of a MultiBLD attempt
 */
function getMbldResultStr(results: PackedResult<ExtraArgsMbld>[]): string {
    if (results.length == 0)
        return "-INVALID MBLD-";
  const extraArgs = results[0]?.extraArgs;
  const centis = results[0]?.centis;
  if (!extraArgs || !centis) return "-INVALID MBLD ARGS-";
  if (calcMultiBldTotalPoints(extraArgs) < 0) return DNF_STRING;

  const timeStr = formatCentis(centis);
  return `${extraArgs.numSuccess}/${extraArgs.numAttempt} ${timeStr}`;
}

/**
 * Generate a string for an event's result
 * @param compEvent The event to calculate the results of.
 * @param results The attempts.
 * @return A string representation of the result of the attempt.
 */
export function getResultStr(
  compEvent: CompEvent,
  results: PackedResult[],
): string {
    if (compEvent.timeFormat === TimeFormat.multi)
        return getMbldResultStr(results as PackedResult<ExtraArgsMbld>[]);

    const numericResult = calcEventResult(compEvent, results);
    if (compEvent.eventId === "333fm")
        return `${numericResult}`;

    const centis = calcEventResult(compEvent, results);
    return !isFinite(centis) ? DNF_STRING : formatCentis(centis);
}

/**
 * Get the best result of an array of results
 * @param eventData The event of the results
 * @param results The results to search
 */
export function getBestResult(eventData: CompEvent, results: PackedResult[]): PackedResult {
    const INVALID: PackedResult = { centis: NULL_TIME_CENTIS, penalty: Penalties.DNF };
    if (results.length == 0) return INVALID;

    if (eventData.timeFormat === TimeFormat.multi)
        return results[0];
    else if (eventData.eventId === "333fm") {
        const index = getShortestFMCSolIndex(results as PackedResult<ExtraArgsFmc>[]);
        return index < 0 ? INVALID : results[index]
    }

    return results.reduce((min, curr) => {
        return curr.penalty !== Penalties.DNF && getPureCentis(curr) < getPureCentis(min) ? curr : min;
    }, INVALID);
}

/**
 * Get a string representation of the best result from an array of results
 */
export function getBestResultStr(eventData: CompEvent, results: PackedResult[]): string {
    const bestResult = getBestResult(eventData, results);

    if (eventData.timeFormat === TimeFormat.multi)
        return getMbldResultStr([bestResult as PackedResult<ExtraArgsMbld>]);
    else if (eventData.eventId === "333fm") {
        const len = getShortestFMCSol(results as PackedResult<ExtraArgsFmc>[]);
        return len ? len.toString() : "-INVALID_FMC-";
    }

    return formatPackedResult(bestResult);
}

// return the index of the shortest fmc solution in the array
// returns -1 if extraArgs is null for all results
export function getShortestFMCSolIndex(results: PackedResult<ExtraArgsFmc>[]): number {
    let shortestI = results.findIndex(r => r.extraArgs !== undefined);
    if (shortestI < 0) return -1;

    const getLength = (index: number)=> {
        return results[index].extraArgs!.fmcSolution.length
    }

    for (let i = 1; i < results.length; i++) {
        if (results[i].extraArgs !== undefined && getLength(i) < getLength(shortestI))
            shortestI = i;
    }

    return shortestI;

}

// null if all extraArgs are null
export function getShortestFMCSol(results: PackedResult<ExtraArgsFmc>[]): number | null {
    const index = getShortestFMCSolIndex(results);
    return index < 0 ? null : results[index].extraArgs!.fmcSolution.length; // can also be infinity
}


export function submissionDataToRecord(compNumber: number, sd: SubmissionData): GeneralRecord {
    // const INVALID_SD = {average: -1, averageComp: -1, single: { centis: -1, penalty: Penalties.DNF }, singleComp: -1} as EventRecords<TimeFormat.ao5>;

    return {
        single: sd.single,
        singleComp: compNumber,
        average: sd.average,
        averageComp: compNumber,
    }
    // if (compEvent.eventId === "333fm") {
    //     const shortestResult = getShortestFMCSol(sd.times);
    //     if (!shortestResult) return INVALID_SD;
    //
    //     return ({
    //         single: shortestResult,
    //         singleComp: compNumber,
    //         mean: sd.average,
    //         meanComp: compNumber
    //     }) as FMCBestResults;
    // }
    // else if (compEvent.timeFormat === TimeFormat.ao5) {
    //     return {
    //         single: getBestResult(compEvent, sd.times),
    //         singleComp: compNumber,
    //         average: sd.average,
    //         averageComp: compNumber
    //     } as AO5BestResults;
    // }
    // else if (compEvent.timeFormat === TimeFormat.mo3 || compEvent.timeFormat === TimeFormat.bo3) {
    //     return {
    //         single: getBestResult(compEvent, sd.times),
    //         singleComp: compNumber,
    //         mean: sd.average,
    //         meanComp: compNumber
    //     } as MO3BestResults;
    // }
    // else { // multi
    //     if (sd.times.length == 0) return INVALID_SD;
    //
    //     return {
    //         timeOfBestAttempt: getPureCentis(sd.times[0]),
    //         bestPoints: calcMultiBldTotalPoints(sd.times[0].extraArgs as ExtraArgsMbld),
    //         bestComp: compNumber
    //     } as MbldBestResults
    // }
}

/**
 * Should auto approve submission?
 * @param eventData The event of the attempt
 * @param currRec The user's current record
 * @param times The submission's solves
 * @return True IFF the new times don't beat the current record
 */
export function shouldAutoApprove(eventData: CompEvent, currRec: GeneralRecord, times: PackedResult[]): boolean {
    const single = getBestResult(eventData, times);
    const average = getAverageCentis(eventData, times);

    if (eventData.timeFormat === TimeFormat.multi)
        return times.length != 0 && compareMultiResults(single as PackedResult<ExtraArgsMbld>, times[0] as PackedResult<ExtraArgsMbld>) >= 0;
    return comparePackedResults(single, currRec.single) >= 0 && (!average || average >= currRec.average);

    // if (eventData.eventId === "333fm") {
    //     currRec = currRec as FMCBestResults;
    //     const newSingle = getShortestFMCSol(
    //         times as PackedResult<ExtraArgsFmc>[],
    //     );
    //     const newMean = calculateFMCResult(times);
    //     if (!newSingle) return false;
    //
    //     return newSingle > currRec.single && newMean > currRec.mean;
    // } else if (eventData.timeFormat === TimeFormat.ao5) {
    //     currRec = currRec as AO5BestResults;
    //     const newSingle = getBestResult(eventData, times);
    //     const newAvg = calculateAO5(times);
    //
    //      return comparePackedResults(newSingle, currRec.single) === 1 &&
    //         newAvg > currRec.average;
    // } else if (
    //     eventData.timeFormat === TimeFormat.mo3 ||
    //     eventData.timeFormat === TimeFormat.bo3
    // ) {
    //     currRec = currRec as MO3BestResults;
    //     const newSingle = getBestResult(eventData, times);
    //     const newMean = calculateMO3(times);
    //
    //     return comparePackedResults(newSingle, currRec.single) === 1 &&
    //         newMean > currRec.mean;
    // } else if (eventData.timeFormat === TimeFormat.multi && times.length > 0) {
    //     currRec = currRec as MbldBestResults;
    //     const newTime = getPureCentis(times[0]);
    //     const newPoints = calcMultiBldTotalPoints(
    //         times[0].extraArgs as ExtraArgsMbld,
    //     );
    //
    //     return newPoints > currRec.bestPoints ||
    //         (newPoints == currRec.bestPoints && newTime > currRec.timeOfBestAttempt);
    // }
    //
    // return false;
}

/**
 * Format an array of PackedResult into a representing string array.
 * Adds () for AO5
 * @param timeFormat The event's time format
 * @param results The attempts
 */
export function formatAttempts(timeFormat: TimeFormat, results: PackedResult[]): string[] {
    if (results.length == 0) return ["-INVALID-"];

    if (timeFormat === TimeFormat.multi)
        return [getMbldResultStr(results as PackedResult<ExtraArgsMbld>[])];
    else if (timeFormat !== TimeFormat.ao5)
        return formatPackedResults(results);

    const pureResults = getPureCentisArr(results);
    let minIndex = 0, maxIndex = 1;
    for (let i = 0; i < pureResults.length; i++) {
        if (pureResults[i] < pureResults[minIndex])
            minIndex = i;
        else if (pureResults[i] > pureResults[maxIndex])
            maxIndex = i;
    }

    const resultArr = formatPackedResults(results);
    resultArr[minIndex] = `(${resultArr[minIndex]})`;
    resultArr[maxIndex] = `(${resultArr[maxIndex]})`;

    return resultArr;
}

// null => no average (like in mbld)
export function getAverageCentis(eventData: CompEvent, results: PackedResult[]): number | null {
    if (eventData.eventId === "333fm")
        return calculateFMCResult(results as PackedResult<ExtraArgsFmc>[]);
    if (eventData.timeFormat === TimeFormat.mo3 || eventData.timeFormat === TimeFormat.bo3)
        return calculateMO3(results);
    if (eventData.timeFormat === TimeFormat.ao5)
        return calculateAO5(results);

    return NULL_TIME_CENTIS;
}

// Empty string if there's no average
export function getAverageStr(eventData: CompEvent, results: PackedResult[]): string {
    const centis = getAverageCentis(eventData, results);
    return centis ? formatCentis(centis) : "";
}


