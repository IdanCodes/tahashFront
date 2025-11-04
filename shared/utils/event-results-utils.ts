import { PackedResult } from "../interfaces/packed-result";
import { Penalties } from "../constants/penalties";
import {
  DNF_STRING,
  formatCentis,
  getPureCentisArr,
  NULL_TIME_CENTIS,
} from "./time-utils";
import { NumScrambles, TimeFormat } from "../constants/time-formats";
import {
  calcMultiBldTotalPoints,
  ExtraArgsMbld,
} from "../interfaces/event-extra-args/extra-args-mbld";
import { ExtraArgsFmc } from "../interfaces/event-extra-args/extra-args-fmc";
import { CompEvent } from "../types/comp-event";

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
