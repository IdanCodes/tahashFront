import { TimeFormat } from "@shared/constants/time-formats";
import { ResultFormatMap } from "./result-format";
import { getPureCentis } from "@shared/utils/time-utils";

export type EventRecords<T extends TimeFormat> = ResultFormatMap[T];

// get the numeric value of the record (its
export function getNumericResultOfRecord(
  timeFormat: TimeFormat,
  record: EventRecords<TimeFormat>,
): number {
  switch (timeFormat) {
    case TimeFormat.ao5:
      return (record as EventRecords<TimeFormat.ao5>).average;
    case TimeFormat.mo3:
      return (record as EventRecords<TimeFormat.mo3>).mean;
    case TimeFormat.bo3:
      const time = (record as EventRecords<TimeFormat.bo3>).single;
      if (typeof time === "number") return time;
      return getPureCentis(time);
    case TimeFormat.multi:
      return (record as EventRecords<TimeFormat.multi>).bestPoints;
    default:
      return -1;
  }
}
