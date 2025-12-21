import { TimeFormat } from "@shared/constants/time-formats";
import {
  AO5BestResults,
  MbldBestResults,
  MO3BestResults,
  ResultFormatMap,
} from "./result-format";
import { getPureCentis, NULL_TIME_CENTIS } from "@shared/utils/time-utils";
import { PackedResult } from "@shared/interfaces/packed-result";

export type EventRecords<T extends TimeFormat> = ResultFormatMap[T];

export type GeneralRecord<ArgsType = any> = {
  single: PackedResult<ArgsType>;
  singleComp: number;
  average: number;
  averageComp: number;
};

export function generalRecordsToEventRecord<T extends TimeFormat>(
  format: T,
  gr: GeneralRecord,
): EventRecords<T> {
  if (format === TimeFormat.mo3 || format === TimeFormat.bo3)
    return {
      single: JSON.parse(JSON.stringify(gr.single ?? null)),
      singleComp: gr.singleComp,
      mean: gr.average,
      meanComp: gr.averageComp,
    } as MO3BestResults as EventRecords<T>;
  else if (format === TimeFormat.multi)
    return {
      bestSingle: JSON.parse(JSON.stringify(gr.single ?? null)),
      bestComp: gr.singleComp,
      timeOfBestAttempt: getPureCentis(gr.single),
    } as MbldBestResults as EventRecords<T>;

  return {
    single: {
      centis: gr.single.centis,
      penalty: gr.single.penalty,
    },
    singleComp: gr.singleComp,
    average: gr.average,
    averageComp: gr.averageComp,
  } as AO5BestResults as EventRecords<T>;
}

export function eventRecordToGeneralRecords<T extends TimeFormat>(
  format: T,
  er: EventRecords<T>,
): GeneralRecord {
  if (format === TimeFormat.mo3 || format === TimeFormat.bo3) {
    const mo3Results = er as
      | ResultFormatMap[TimeFormat.mo3]
      | ResultFormatMap[TimeFormat.bo3];
    return {
      single: JSON.parse(JSON.stringify(mo3Results.single)),
      singleComp: mo3Results.singleComp,
      average: mo3Results.mean,
      averageComp: mo3Results.meanComp,
    } as GeneralRecord;
  } else if (format === TimeFormat.multi) {
    const mbldResults = er as MbldBestResults;
    return {
      single: JSON.parse(
        JSON.stringify(mbldResults.bestSingle),
      ) as PackedResult<TimeFormat.multi>,
      singleComp: mbldResults.bestComp,
      average: NULL_TIME_CENTIS,
      averageComp: -1,
    } as GeneralRecord;
  }

  const ao5Results = er as AO5BestResults;
  return {
    single: ao5Results.single,
    singleComp: ao5Results.singleComp,
    average: ao5Results.average,
    averageComp: ao5Results.averageComp,
  } as GeneralRecord;
}

// get the numeric value of the record (its
// export function getNumericFinalResultOfRecord<T extends TimeFormat>(
//   timeFormat: T,
//   record: EventRecords<T>,
// ): number {
//   switch (timeFormat) {
//     case TimeFormat.ao5:
//       return (record as EventRecords<TimeFormat.ao5>).average;
//     case TimeFormat.mo3:
//       return (record as EventRecords<TimeFormat.mo3>).mean;
//     case TimeFormat.bo3:
//       return getPureCentis((record as BO3BestResults).single);
//     case TimeFormat.multi:
//       return getPureCentis(
//         (record as EventRecords<TimeFormat.multi>).bestSingle,
//       );
//     default:
//       return -1;
//   }
// }
