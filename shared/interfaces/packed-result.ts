import {BaseResult} from "./base-result";
import {ExtraArgsFmc} from "./event-extra-args/extra-args-fmc";
import {ExtraArgsMbld} from "./event-extra-args/extra-args-mbld";

/**
 * Packed result - smaller size.
 */
export interface PackedResult<ArgsType = object | ExtraArgsFmc | ExtraArgsMbld> extends BaseResult<ArgsType> {
  /**
   * The time of the solve represented in centiseconds.
   */
  centis: number;
}
