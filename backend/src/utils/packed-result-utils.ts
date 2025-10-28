import { CompEvent, createEmptyArgs } from "@shared/types/comp-event";
import { PackedResult } from "@shared/interfaces/packed-result";
import { ExtraArgs } from "@shared/types/extra-args";
import { Penalties } from "@shared/constants/penalties";

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
      extraArgs: createEmptyArgs<T>(compEvent.eventId),
    });
  }

  return results;
}
