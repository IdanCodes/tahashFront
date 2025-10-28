import {centisPerUnit, maxTimeParts, TimeUnit} from "../constants/time-unit";
import { PackedResult } from "../interfaces/packed-result";
import { SolveResult } from "../interfaces/solve-result";
import { TimeParts } from "../interfaces/time-parts";
import {Penalties, Penalty} from "../constants/penalties";
import {isInteger, isNumber, pad} from "./global-utils";

/**
 * "Value" of a null {@link TimeParts} as centiseconds.
 */
export const NULL_TIME_CENTIS: number = -1;

/**
 * String that represents an invalid time.
 */
export const INVALID_TIME_STR: string = "-";

/**
 * String that represents a time with a DNF {@link Penalty}.
 */
export const DNF_STRING: string = "DNF";

/**
 * Suffix for a time with a plus 2 {@link Penalty}.
 */
export const PLUS_2_SUFFIX = "+";

/**
 * Convert centiseconds to a {@link TimeParts} object.
 * @param centis The number of centiseconds to convert.
 * @return
 * - If centis is non-negative, returns its respective {@link TimeParts}.
 * - Otherwise, returns `null`.
 */
export function unpackCentis(centis: number): TimeParts | null {
  if (centis < 0) return null;

  const hours = Math.floor(centis / centisPerUnit[TimeUnit.Hours]);
  centis %= centisPerUnit[TimeUnit.Hours];
  const minutes = Math.floor(centis / centisPerUnit[TimeUnit.Minutes]);
  centis %= centisPerUnit[TimeUnit.Minutes];
  const seconds = Math.floor(centis / centisPerUnit[TimeUnit.Seconds]);
  centis %= centisPerUnit[TimeUnit.Seconds];

  return { centis, seconds, minutes, hours };
}

export const unpackResult = (packedResult: PackedResult): SolveResult => ({
    penalty: packedResult.penalty, extraArgs: packedResult.extraArgs, time: unpackCentis(packedResult.centis)
});

/**
 * Convert each element in an array of {@link PackedResult} to its respective {@link SolveResult}.
 * @param packResults The given {@link PackedResult} array.
 */
export const unpackResults = (packResults: PackedResult[]): SolveResult[] =>
  packResults.map(unpackResult);

/**
 * Check if a {@link TimeParts} object normalized and does not exceed limits.
 * @param time The {@link TimeParts} object to check.
 */
function isValidTime(time: TimeParts): boolean {
    const { centis, seconds, minutes, hours } = time;
    return (
        0 <= hours &&
        hours < maxTimeParts[TimeUnit.Hours] &&
        0 <= minutes &&
        minutes < maxTimeParts[TimeUnit.Minutes] &&
        0 <= seconds &&
        seconds < maxTimeParts[TimeUnit.Seconds] &&
        0 <= centis &&
        centis < maxTimeParts[TimeUnit.Centis]
    );
}

/**
 * Checks whether a {@link TimeParts} object is valid and normalized.
 * A valid time must satisfy all the following:
 * - All fields (`hours`, `minutes`, `seconds`, `centis`) are integers
 * - All values are non-negative
 * - `centis`, `seconds`, `minutes` and `hours` don't exceed limits
 * @param time The {@link TimeParts} object to check.
 * @returns `true` if the time is valid and normalized, otherwise `false`.
 */
export function isLegalTime(time: TimeParts | null): boolean {
    if (!time) return false;
    const { hours, minutes, seconds, centis } = time;

    return (
        Number.isInteger(hours) &&
        Number.isInteger(minutes) &&
        Number.isInteger(seconds) &&
        Number.isInteger(centis) &&
        isValidTime(time)
    );
}

/**
 * Normalize a {@link TimeParts} object by carrying overflows and checking for limits.
 * @param time The time to normalize (mutated).
 * @returns The normalized time, or null if time exceeds limits.
 */
export function normalizeTimeParts(time: TimeParts): TimeParts {
    time.seconds += Math.floor(time.centis / maxTimeParts[TimeUnit.Centis]);
    time.centis %= maxTimeParts[TimeUnit.Centis];

    time.minutes += Math.floor(time.seconds / maxTimeParts[TimeUnit.Seconds]);
    time.seconds %= maxTimeParts[TimeUnit.Seconds];

    time.hours += Math.floor(time.minutes / maxTimeParts[TimeUnit.Minutes]);
    time.minutes %= maxTimeParts[TimeUnit.Minutes];

    return time;
}

/**
 * Try to analyze a string containing a time into its {@link TimeParts}.
 * @param {string} timeStr The input string to analyze.
 * @returns
 * - If the given time string is a valid time, {@link TimeParts} object representing the string.
 * - Otherwise, returns `null`.
 */
export function tryAnalyzeTimes(timeStr: string): TimeParts | null {
    const maxNumbers: number = 7; // max number of number characters
    if (timeStr.length == 0) return null;

    timeStr = timeStr.trim();

    // check if the characters are valid
    const noColons: string = timeStr.replaceAll(":", "");
    if (noColons == "" || !isNumber(noColons)) return null;

    const colonParts = timeStr.split(":");
    if (colonParts.length > 3) return null;

    // Part 1 - Fetch the strings
    let hoursStr = "0";
    let minutesStr = "0";
    let secondsStr = "0";
    let centisStr = "0";

    if (colonParts.length == 3) {
        // hours:minutes:seconds.centis | hours:minutes:seconds
        hoursStr = colonParts[0];
        minutesStr = colonParts[1] == "" ? "0" : colonParts[1];
        splitSecondsAndCentis(colonParts[2]);
    } else if (colonParts.length == 2) {
        // minutes:seconds.centis | minutes:seconds
        minutesStr = colonParts[0] == "" ? "0" : colonParts[0];
        splitSecondsAndCentis(colonParts[1]);
    } else {
        // seconds.centis OR centis
        const dotSplit: string[] = timeStr.split(".");
        if (dotSplit.length > 2)
            // invalid
            return null;
        else if (dotSplit.length == 2)
            // seconds.centis
            splitSecondsAndCentis(timeStr);
        else {
            // [hours][minutes][seconds][centis] (HMMSSCC)
            if (timeStr.length > maxNumbers) return null;

            const paddedStr = timeStr.padStart(maxNumbers, "0");

            hoursStr = paddedStr[0];
            minutesStr = paddedStr[1] + paddedStr[2];
            secondsStr = paddedStr[3] + paddedStr[4];
            centisStr = paddedStr[5] + paddedStr[6];
        }
    }

    // Step 2: Check if the strings represent numbers
    if (
        !isNumber(centisStr) ||
        !isNumber(secondsStr) ||
        !isNumber(minutesStr) ||
        !isNumber(hoursStr)
    )
        return null;

    // Step 3: Parse
    /*TODO:
    let numCentis = 0;
      let numSeconds = 0;
      let numMinutes = 0;
      let numHours = 0;

      numCentis = parseFloat(centisStr);
      if (numCentis % 1 != 0) return null;

      numSeconds = parseFloat(secondsStr) +
              Math.floor(numCentis >= maxTimeParts[TimeUnit.Centis] ? numCentis / maxTimeParts[TimeUnit.Centis] : 0);
      if (numSeconds % 1 != 0) return null;

      numCentis %= maxMillis;
      numMinutes = parseFloat(minutesStr) + Math.floor(numSeconds >= maxSeconds ? numSeconds / maxSeconds : 0);
      if (numMinutes % 1 != 0) return null;

      numSeconds %= maxSeconds;
      numHours = parseFloat(hoursStr) + Math.floor(numMinutes >= maxMinutes ? numMinutes / maxMinutes : 0);
      if (numHours % 1 != 0) return null;

      numMinutes %= 60;

      if (numHours >= maxHours
          || (numHours == 0 && numMinutes == 0 && numSeconds == 0 && numCentis == 0)
          || numHours < 0 || numMinutes < 0 || numSeconds < 0 || numCentis < 0) {
          return null;
      }

      const results: TimeParts = {
          numHours,
          numMinutes,
          numSeconds,
          numCentis
      };*/

    const centis: number = parseFloat(centisStr);
    const seconds: number = parseFloat(secondsStr);
    const minutes: number = parseFloat(minutesStr);
    const hours: number = parseFloat(hoursStr);

    if (
        !isInteger(centis) ||
        !isInteger(seconds) ||
        !isInteger(minutes) ||
        !isInteger(hours)
    )
        return null;

    const result: TimeParts = { centis, seconds, minutes, hours };
    normalizeTimeParts(result);

    return isValidTime(result) ? result : null;

    /**
     * Split minutes and centiseconds from a string into the {@link centisStr} and {@link secondsStr} variables.
     * Valid formats:
     * 1. [seconds].[centis]
     * 2. [seconds]
     * @param str The given string to split.
     */
    function splitSecondsAndCentis(str: string): void {
        const dotParts = str.split(".");
        if (dotParts.length > 2) return;

        if (dotParts.length == 2)
            centisStr = dotParts[1].substring(0, 2).padEnd(2, "0");
        secondsStr = dotParts[0] == "" ? "0" : dotParts[0];
    }
}

/**
 * Apply a penalty on a {@link TimeParts} object.
 * @param time The {@link TimeParts} object to apply to.
 * @param penalty The {@link Penalty} to apply.
 * @return A copy of {@link TimeParts} that yields after applying the penalty (normalized).
 */
function applyPenalty(
    time: TimeParts,
    penalty: Penalty = Penalties.None,
): TimeParts {
    return penalty == Penalties.Plus2
        ? normalizeTimeParts({ ...time, seconds: time.seconds + 2 })
        : { ...time };
}

/**
 * Convert a {@link TimeParts} object to a string form.
 * @param time The {@link TimeParts} object.
 * @return
 * - If the given value represents a legal time, returns its representing string.
 * - Otherwise, returns {@link INVALID_TIME_STR}
 */
export function formatTimeParts(time: TimeParts | null): string {
    if (!time) return INVALID_TIME_STR;

    const { hours, minutes, seconds, centis } = time;
    const c: string = pad(centis);

    if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}.${c}`;
    else if (minutes > 0) return `${minutes}:${pad(seconds)}.${c}`;
    else return `${seconds}.${c}`;
}

/**
 * Convert a {@link TimeParts} object with a penalty to string form.
 * @param time The {@link TimeParts} object to convert. If this is null, returns {@link INVALID_TIME_STR}.
 * @param penalty The {@link Penalty} of the attempt.
 * @returns
 * - If the final time (including the penalty) is valid, returns its representing string.
 * - Otherwise, returns `null` (only happens when +2 exceeds limit).
 */
export function formatTimeWithPenalty(
    time: TimeParts | null,
    penalty: Penalty,
): string {
    if (!time) return INVALID_TIME_STR;
    if (penalty == Penalties.DNF) return DNF_STRING;

    const dispTime: TimeParts = applyPenalty(time, penalty);
    const formatted: string = formatTimeParts(dispTime);
    return formatted
        ? `${formatted}${penalty == Penalties.Plus2 ? "+" : ""}`
        : INVALID_TIME_STR;
}

/**
 * Convert a {@link TimeParts} object into centiseconds.
 * @param time The {@link TimeParts} object to convert.
 * @return
 * - If the given {@link TimeParts} object is valid, returns its value in centiseconds.
 * - Otherwise, returns {@link NULL_TIME_CENTIS}.
 */
export function packTime(time: TimeParts | null): number {
    return time === null
        ? NULL_TIME_CENTIS
        : time.centis +
        time.seconds * centisPerUnit[TimeUnit.Seconds] +
        time.minutes * centisPerUnit[TimeUnit.Minutes] +
        time.hours * centisPerUnit[TimeUnit.Hours];
}

/**
 * Check if two {@link TimeParts} objects are equal.
 * @param t1 The first {@link TimeParts} object.
 * @param t2 The second {@link TimeParts} object.
 */
export function equalTimes(
    t1: TimeParts | null,
    t2: TimeParts | null,
): boolean {
    return (
        (t1 === null && t2 === null) ||
        (t1 !== null &&
            t2 !== null &&
            t1.centis === t2.centis &&
            t1.seconds === t2.seconds &&
            t1.minutes === t2.minutes &&
            t1.hours === t2.hours)
    );
}

// -- Packed Result utils
/**
 * Apply a penalty on a centiseconds value.
 * @param centis The amount of centiseconds.
 * @param penalty The {@link Penalty} to apply.
 * @return The number of centiseconds that yields after applying the penalty.
 */
export function applyPenaltyCentis(
    centis: number,
    penalty: Penalty = Penalties.None,
): number {
    return penalty == Penalties.Plus2
        ? centis + 2 * maxTimeParts[TimeUnit.Centis]
        : centis;
}

/**
 * Formats an array of {@link PackedResult} times into readable strings.
 * @param packedResults The array of {@link PackedResult} to format.
 */
export const formatPackedResults = (packedResults: PackedResult[]): string[] =>
    packedResults.map((pr) => formatCentisWithPenalty(pr.centis, pr.penalty));

/**
 * Check if a {@link PackedResult} array is full of valid times.
 * @param packedResults
 */
export const isFullPackedTimesArr = (packedResults: PackedResult[]) =>
    // if the last result was submitted the event is finished
    packedResults[packedResults.length - 1].centis > 0;

/**
 * Convert a centiseconds value to its representing string format.
 * @param centis The amount of centiseconds.
 */
export const formatCentis = (centis: number): string =>
    formatTimeParts(unpackCentis(centis));

/**
 * Convert a centiseconds value to its representing string format.
 * @param centis The amount of centiseconds.
 * @param penalty The {@link Penalty} of the attempt.
 */
export const formatCentisWithPenalty = (
    centis: number,
    penalty: Penalty,
): string => formatTimeWithPenalty(unpackCentis(centis), penalty);

/**
 * Convert a packed result to its representing string format.
 * @param pr The packed result data.
 */
export const formatPackedResult = (pr: PackedResult): string =>
    formatCentisWithPenalty(pr.centis, pr.penalty);

/**
 * Convert a {@link PackedResult} into a centiseconds value, including penalty.
 * @param packedResult
 */
export function getPureCentis(packedResult: PackedResult): number {
    return applyPenaltyCentis(packedResult.centis, packedResult.penalty);
}

/**
 * Convert each element in a {@link PackedResult}[] to pure centiseconds.
 * @return The respective array of centiseconds.
 */
export function getPureCentisArr(results: PackedResult[]): number[] {
    return results.map((r) => getPureCentis(r));
}

// TODO: do something about the previewStr stuff
// format a packed times array to an allTimes array
// returns the result
// export function unpackTimes(packed: PackedResult[]) : SolveResult[] {
//     const result: TimeParts[] = [];
//
//     for (let i = 0; i < packed.length; i++) {
//         const time: TimeParts = centisToTime(packed[i].centis);
//
//         let penalty = packed[i].penalty;
//         let displayTime: string | null = formatTimeWithPenalty(time, penalty);
//
//         if (!displayTime) {
//             // invalid time including penalty - count as DNF.
//             penalty = Penalties.DNF;
//             displayTime = DNF_STRING;
//         }
//
//         const newTime = { previewStr: displayTime,
//                         timeStr: displayTime,
//                         times: time,
//                         penalty: penalty };
//
//         if (packed[i].extraArgs != null)
//             newTime.extraArgs = packed[i].extraArgs;
//         results.push(newTime);
//     }
//
//     // return allTimes;
//     return packed.map((pr) => ({  }));
// }

// TODO: re-write with more context
// convert a packed times array to a pure centiseconds array;
// for +2 - adds to seconds
// for DNF - sets time to -1
// /**
//  * Convert a packed times array to a pure centiseconds array.
//  * @param packedTimes
//  */
// export function getPureCentisArr(packedResults: PackedResult[]): number[] {
//     return packedTimes.map((pr) => );
//
//     const result = [];
//     for (let i = 0; i < packedTimes.length; i++) {
//         result.push(packedTimes[i].penalty == Penalties.DNF ? -1
//                 : packedTimes[i].penalty == Penalties.Plus2 ? (packedTimes[i].centis + 200)
//                 : packedTimes[i].centis);
//     }
//
//     return result;
// }

// returns an empty packed times object
