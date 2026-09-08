import fs from "fs";
import util from "util";
import { WriteStream } from "node:fs";
import {
  SubmissionState,
  submissionStateStr,
} from "@shared/constants/submission-state";

const AUTO_SYSTEM_NAME = "Automatic System";

/**
 * Logger for API actions into a file
 */
export class ApiLogger {
  /**
   * The singleton instance of {@link ApiLogger}.
   */
  private static instance: ApiLogger | undefined = undefined;
  private readonly logFile: WriteStream;

  /**
   * Construct a {@link ApiLogger}.
   * @param pathToFile Path to the output file's location.
   */
  constructor(pathToFile: string) {
    if (ApiLogger.instance !== undefined)
      throw new Error(
        "Attempted to instantiate a new singleton instance of ApiLogger where an instance already exists",
      );
    this.logFile = fs.createWriteStream(pathToFile, {
      flags: "a",
    });
    this.logFile.write(
      `\n\n---------- [${new Date().toISOString()}] - STARTUP ----------\n`,
    );
  }

  /**
   * Create an instance of the {@link ApiLogger} singleton.
   * @param pathToFile Path to the output file's location.
   * @return The new {@link ApiLogger} instance.
   * @throws Error If a {@link ApiLogger} instance already exists.
   */
  public static init(pathToFile: string): ApiLogger {
    if (this.instance !== undefined)
      throw new Error(
        "ApiLogger instance already exists. Use ApiLogger.getInstance() instead.",
      );

    this.instance = new this(pathToFile);
    return this.instance;
  }

  /**
   * Get the singleton instance of the {@link ApiLogger}.
   */
  public static getInstance(): ApiLogger {
    if (!this.instance)
      throw new Error("ApiLogger not initialized. Call init() first.");

    return this.instance;
  }

  /**
   * Log a string to the API log
   * @param msg The message to log
   * @param includeTime Whether to include the time in the log
   */
  public write(msg: string, includeTime: boolean = true) {
    const timeStr = new Date().toISOString();
    const prefix = includeTime ? `[${timeStr}]: ` : "";
    const toWrite = `${prefix}${msg}\n`;
    this.logFile.write(toWrite);
  }

  /**
   * Log that a result has been submitted
   * @param submitter A string identifier for the submitter
   * @param eventId A string identifier for the event submitted
   * @param result The final result of the attempt
   */
  public logResultSubmission(
    submitter: string,
    eventId: string,
    result: string,
  ) {
    this.write(
      `Result Submission: ${eventId} by ${submitter} with result ${result}`,
    );
  }

  /**
   * Log that the submission state of a submission has changed
   * @param submitter A string identifier for the submitter
   * @param eventId A string identifier for the event of the submission
   * @param newState The new state of the submission
   * @param initiator A string identifier for the entity who initiated the change. If unspecified, {AUTO_SYSTEM_NAME} is used.
   */
  public logChangeSubmissionState(
    submitter: string,
    eventId: string,
    newState: SubmissionState,
    initiator: string = AUTO_SYSTEM_NAME,
  ) {
    `[admin] set submission by [user] for [eventid] to [newState]`;
    const toWrite = `Submission State: ${eventId} by ${submitter} -> ${submissionStateStr[newState]} (${initiator})`;
    // ("Submission for [eventId] by [user] set to [newstate] by [admin]"); X
    // Submission for 333 by 2019TARA03 set to Approved by 2019SAHA01 X
    // Submission State: 333 by 2019TARA03 -> Approved (2019SAHA01) <---
    this.write(toWrite);
  }

  /**
   * Log that the current competition has been closed.
   * @param initiator A string identifier for the entity who initiated the change. If unspecified, {AUTO_SYSTEM_NAME} is used.
   */
  public logCompClose(initiator: string = AUTO_SYSTEM_NAME) {
    const toWrite = `Close Competition: Initiated by ${initiator}`;
    this.write(toWrite);
  }

  /**
   * Log that a new competition has opened
   * @param initiator A string identifier for the entity who initiated the change. If unspecified, {AUTO_SYSTEM_NAME} is used.
   */
  public logCompOpen(initiator: string = AUTO_SYSTEM_NAME) {
    const toWrite = `Open Competition: Initiated by ${initiator}`;
    this.write(toWrite);
  }

  /**
   * Log that a user has registered
   * @param user A string identifier for the new user
   */
  public logRegisterUser(user: string) {
    this.write(`User Registration: ${user}`);
  }
}

// export const ApiLogger = {
//   LogStr,
// };
