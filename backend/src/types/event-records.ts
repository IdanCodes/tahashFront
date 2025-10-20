import { TimeFormat } from "@shared/constants/time-formats";
import { ResultFormatMap } from "./result-format";

export type EventRecords<T extends TimeFormat> = ResultFormatMap[T];
