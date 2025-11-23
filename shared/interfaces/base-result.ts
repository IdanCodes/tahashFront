import { Penalties, Penalty } from "../constants/penalties";
import {ExtraArgsFmc} from "./event-extra-args/extra-args-fmc";
import {ExtraArgsMbld} from "./event-extra-args/extra-args-mbld";

/**
 * Represents the result of a solve without the time.
 */
export interface BaseResult<ArgsType = object | ExtraArgsFmc | ExtraArgsMbld> {
  /**
   * The penalty of the solve.
   */
  penalty: Penalty;

  /**
   * Extra arguments of the solve (undefined if there aren't any).
   */
  extraArgs?: ArgsType;
}

/**
 * Check if an array of {@link BaseResult} have a DNF.
 * @param results The array to search.
 */
export const hasDNF = (results: BaseResult[]): boolean =>
  results.some((r) => r.penalty == Penalties.DNF);
