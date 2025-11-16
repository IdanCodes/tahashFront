import {NULL_TIME_CENTIS} from "../../utils/time-utils";

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