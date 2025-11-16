import { PackedResult } from "@shared/interfaces/packed-result";
import { EventId } from "@shared/types/comp-event";

export type PastCompResults = Map<
  EventId,
  {
    place: number;
    times: PackedResult[];
  }
>;
