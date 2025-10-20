import { ExtraArgs } from "@shared/types/extra-args";
import { Penalties } from "@shared/constants/penalties";
import { BaseResult } from "@shared/interfaces/base-result";
import { CompEvent, createEmptyArgs } from "@shared/types/comp-event";

/**
 * Packed result - smaller size.
 */
export interface PackedResult<ArgsType = any> extends BaseResult<ArgsType> {
  /**
   * The time of the solve represented in centiseconds.
   */
  centis: number;
}

/**
 * Get an empty instance of a {@link PackedResult}[] for an event.
 * @param compEvent The event.
 */
export function getEmptyPackedResults<T extends ExtraArgs | undefined>(
  compEvent: CompEvent,
): PackedResult<T>[] {
  const numScrs = compEvent.getNumScrambles();
  const results: PackedResult<T>[] = [];

  for (let i = 0; i < numScrs; i++) {
    results.push({
      centis: -1,
      penalty: Penalties.None,
      extraArgs: createEmptyArgs(compEvent.eventId) as T,
    });
  }

  return results;
}
