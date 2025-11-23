/**
 * Represents an event's timing format.
 */
export enum TimeFormat {
  ao5 = "ao5",
  mo3 = "mo3",
  bo3 = "bo3",
  multi = "multi",
}

/**
 * The number of scrambles for each {@link TimeFormat}.
 * -1 -> generate seed
 */
export const NumScrambles: Record<TimeFormat, number> = {
  [TimeFormat.ao5]: 5,
  [TimeFormat.mo3]: 3,
  [TimeFormat.bo3]: 3,
  [TimeFormat.multi]: -1,
};

/**
 * Get a time format's name
 */
export function getTimeFormatName(timeFormat: TimeFormat): "Average" | "Mean" | "Best" | "Result" {
    return timeFormat === TimeFormat.ao5 ? "Average" : (timeFormat === TimeFormat.mo3 ? "Mean" : (timeFormat === TimeFormat.bo3 ? "Best" : "Result"));
}

/**
 * @return true => The format's time comparison is based on average; false => The format's time comparison is based on single
 */
export const isAverageFormat = (format: TimeFormat): boolean =>
    format === TimeFormat.ao5 || format === TimeFormat.mo3;
