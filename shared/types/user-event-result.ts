import { PackedResult } from "@shared/interfaces/packed-result";

export type UserEventResult = {
  finished: boolean;
  times: PackedResult[];
};
