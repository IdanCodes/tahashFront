import {PackedResult} from "../interfaces/packed-result";
import {Penalties} from "../constants/penalties";
import {
    comparePackedResults,
    DNF_STRING,
    formatCentis,
    getPureCentis,
    getPureCentisArr,
    NULL_TIME_CENTIS,
} from "./time-utils";
import {NumScrambles, TimeFormat} from "../constants/time-formats";
import {calcMultiBldTotalPoints, ExtraArgsMbld,} from "../interfaces/event-extra-args/extra-args-mbld";
import {ExtraArgsFmc} from "../interfaces/event-extra-args/extra-args-fmc";
import {CompEvent} from "../types/comp-event";
import {SubmissionData} from "../interfaces/submission-data";
import {EventRecords} from "../../backend/src/types/event-records";
import {
    AO5BestResults,
    BO3BestResults,
    FMCBestResults,
    MbldBestResults,
    MO3BestResults
} from "../../backend/src/types/result-format";

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
  let best = results[0].centis;

  for (let i = 1; i < NumScrambles[TimeFormat.bo3]; i++)
    best = Math.min(best, results[i].centis);

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
    return -1;
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
  if (compEvent.eventId === "333fm") return calculateFMCResult(results);

  switch (compEvent.timeFormat) {
    case TimeFormat.ao5:
      return calculateAO5(results);

    case TimeFormat.mo3:
      return calculateMO3(results);

    case TimeFormat.bo3:
      return calculateBO3(results);

    case TimeFormat.multi:
      return calculateMultiResult(results[0]);
  }
}

/**
 * Generate a result string from mbld extra args
 */
function getMbldResultStr(results: PackedResult[]): string {
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
export function generateResultStr(
  compEvent: CompEvent,
  results: PackedResult[],
): string {
  switch (compEvent.eventId) {
    case "333mbf":
      return getMbldResultStr(results);

      case "333fm":
          return `${calcEventResult(compEvent, results)}`;

    default:
        const centis = calcEventResult(compEvent, results);
        return formatCentis(centis);

  }
}

export function getMinResult(results: PackedResult[]): PackedResult {
    if (results.length == 0) return { centis: -1, penalty: Penalties.DNF };
    return results.reduce((min, curr) => {
        return getPureCentis(curr) < getPureCentis(min) ? curr : min;
    });
}

export function getShortestFMCSol(results: PackedResult<ExtraArgsFmc>[]): number {
    let shortest: number = Infinity;
    for (let i = 0; i < results.length; i++) {
        if (results[i].extraArgs !== undefined && results[i].extraArgs!.fmcSolution.length < shortest)
            shortest = results[i].extraArgs!.fmcSolution.length;
    }

    return shortest; // can also be infinity
}


export function submissionDataToRecord(compEvent: CompEvent, compNumber: number, sd: SubmissionData): EventRecords<TimeFormat> {
    const INVALID_SD = {average: -1, averageComp: -1, single: { centis: -1, penalty: Penalties.DNF }, singleComp: -1} as EventRecords<TimeFormat.ao5>;

    if (compEvent.eventId === "333fm") {
        const shortest = getShortestFMCSol(sd.times);
        if (!isFinite(shortest)) return INVALID_SD;

        return ({
            single: shortest,
            singleComp: compNumber,
            mean: sd.finalResult,
            meanComp: compNumber
        }) as FMCBestResults;
    }
    else if (compEvent.timeFormat === TimeFormat.ao5) {
        return {
            single: getMinResult(sd.times),
            singleComp: compNumber,
            average: sd.finalResult,
            averageComp: compNumber
        } as AO5BestResults;
    }
    else if (compEvent.timeFormat === TimeFormat.mo3 || compEvent.timeFormat === TimeFormat.bo3) {
        return {
            single: getMinResult(sd.times),
            singleComp: compNumber,
            mean: sd.finalResult,
            meanComp: compNumber
        } as MO3BestResults;
    }
    else { // multi
        if (sd.times.length == 0) return INVALID_SD;

        return {
            timeOfBestAttempt: getPureCentis(sd.times[0]),
            bestPoints: calcMultiBldTotalPoints(sd.times[0].extraArgs as ExtraArgsMbld),
            bestComp: compNumber
        } as MbldBestResults
    }
}

/**
 * Should auto approve submission?
 * @param eventData The event of the attempt
 * @param currRec The user's current record
 * @param sd The new submission's SubmissionData
 */
export function shouldAutoApprove(eventData: CompEvent, currRec: EventRecords<TimeFormat>, sd: SubmissionData): boolean {
    if (eventData.eventId === "333fm") {
        currRec = currRec as FMCBestResults;
        const newSingle = getShortestFMCSol(
            sd.times as PackedResult<ExtraArgsFmc>[],
        );
        const newMean = sd.finalResult;

        return newSingle > currRec.single && newMean > currRec.mean;
    } else if (eventData.timeFormat === TimeFormat.ao5) {
        currRec = currRec as AO5BestResults;
        const newSingle = getMinResult(sd.times);
        const newAvg = sd.finalResult;

         return comparePackedResults(newSingle, currRec.single) === -1 &&
            newAvg > currRec.average;
    } else if (
        eventData.timeFormat === TimeFormat.mo3 ||
        eventData.timeFormat === TimeFormat.bo3
    ) {
        currRec = currRec as MO3BestResults;
        const newSingle = getMinResult(sd.times);
        const newMean = sd.finalResult;

        return comparePackedResults(newSingle, currRec.single) === -1 &&
            newMean > currRec.mean;
    } else if (eventData.timeFormat === TimeFormat.multi && sd.times.length > 0) {
        currRec = currRec as MbldBestResults;
        const newTime = getPureCentis(sd.times[0]);
        const newPoints = calcMultiBldTotalPoints(
            sd.times[0].extraArgs as ExtraArgsMbld,
        );

        return newPoints > currRec.bestPoints ||
            (newPoints == currRec.bestPoints && newTime > currRec.timeOfBestAttempt);
    }

    return false;
}
