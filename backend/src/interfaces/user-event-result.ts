import { PackedResult } from "./packed-result";

export type UserEventResult = {
  finished: boolean;
  times: PackedResult[];
};
