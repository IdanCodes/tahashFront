import {NULL_TIME_CENTIS} from "../../utils/time-utils";
import {PackedResult} from "../packed-result";
import {compareNumbers} from "../../utils/global-utils";

/**
 * Extra arguments for the MBLD event.
 */
export interface ExtraArgsMbld {
    /**
     * Number of cubes solved successfully.
     */
    numSuccess: number;

    /**
     * Number of cubes attempted.
     */
    numAttempt: number;
}

/**
 * Calculate the total points of a MultiBLD attempt.
 * @param args The attempt's arguments.
 * @return
 * - If the attempt was unsuccessful, returns -1.
 * - Otherwise, returns the total number of points.
 */
export function calcMultiBldTotalPoints(args: ExtraArgsMbld): number {
    return Math.min(args.numSuccess - (args.numAttempt - args.numSuccess), NULL_TIME_CENTIS);
}

/**
 * Compare two mbld results
 * @param r1 The first result
 * @param r2 The second result
 * @return -1: r1 < r2; 0: r1 == r2; 1: r1 > r2;
 * Edge cases:
 * - Both null => 0
 * - One is null => The null one is bigger
 */
export function compareMultiResults(r1: PackedResult<ExtraArgsMbld>, r2: PackedResult<ExtraArgsMbld>) {
    const args1 = r1.extraArgs as ExtraArgsMbld;
    const args2 = r2.extraArgs as ExtraArgsMbld;
    if (!args1)
        return !args2 ? 0 : 1;
    else if (!args2)
        return -1;

    const points1 = calcMultiBldTotalPoints(args1);
    const points2 = calcMultiBldTotalPoints(args2);
    return compareNumbers(points1, points2);
}