import {BaseResult} from "./base-result";

/**
 * Packed result - smaller size.
 */
export interface PackedResult<ArgsType = any> extends BaseResult<ArgsType> {
  /**
   * The time of the solve represented in centiseconds.
   */
  centis: number;
}
