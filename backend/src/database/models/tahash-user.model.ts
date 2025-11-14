import mongoose, { Model, Schema } from "mongoose";
import { UserInfo } from "@shared/interfaces/user-info";
import { EventId, getEventById } from "@shared/types/comp-event";
import { UserEventResult } from "../../types/user-event-result";
import { EventRecords } from "../../types/event-records";
import { TimeFormat } from "@shared/constants/time-formats";
import { packedResultSchema } from "./packed-result.schema";
import { PackedResult } from "@shared/interfaces/packed-result";
import { datediffEpoch } from "@shared/utils/global-utils";
import {
  getUserDataByUserId,
  getWCARecordsOfUser,
} from "../../utils/wcaApiUtils";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";
import { isErrorObject } from "@shared/interfaces/error-object";
import {
  comparePackedResults,
  isFullPackedTimesArr,
} from "@shared/utils/time-utils";
import {
  AO5BestResults,
  BO3BestResults,
  FMCBestResults,
  MbldBestResults,
  MO3BestResults,
} from "../../types/result-format";
import { CompManager } from "../comps/comp-manager";

const userInfoSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    wcaId: String,
    country: String,
    photoUrl: String,
  },
  { _id: false },
);

const userEventResultsSchema = new Schema(
  {
    finished: Boolean,
    times: [packedResultSchema],
  },
  {
    _id: false,
  },
);

/**
 * Fields for the tahash user model
 */
export interface ITahashUser {
  /**
   * The user's wca data as {@link UserInfo}.
   */
  userInfo: Readonly<UserInfo>;

  /**
   * Epoch number of date of last wca data update
   */
  lastUpdatedWcaData: number;

  /**
   * Comp number of the last comp the user competed in.
   */
  lastComp: number;

  /* array of the user's records */
  readonly records: Map<EventId, EventRecords<TimeFormat>> /*
        user records structure:
        records: [
            {
                eventId: str,
                // bestResults contains the best results for the event, and for each type of result
                //      it also saves the comp number (as an integer)
                //      the comp number's values:
                //          * >0 -> a tahash comp
                //          * =0 -> a wca comp
                //          * -1 -> never competed
                bestResults:
                    --- different for each event type:
                    --  AO5:
                        { single, singleComp
                            average, averageComp }
                    --  MO3/BO3:
                        { single, singleComp
                            mean, meanComp }
                    --  BO3:
                        { single, singleComp,
                            mean, meanComp }
                    --  Multi:
                        { best total points / -1,
                        time of attempt with best score / -1,
                        bestComp }
                times: packedTimes (-- the full attempt)
            }
        ]
    */;

  /* user's results of the last comp the user competed in */
  readonly eventResults: Map<EventId, UserEventResult>;
}

export interface TahashUserMethods {
  /**
   * Update a user's result of an event.
   * @param eventId The event's id.
   * @param times The times of the event.
   * @param overwrite Whether to overwrite the event if the user already finished it.
   */
  setEventTimes(
    eventId: EventId,
    times: PackedResult[],
    overwrite?: boolean,
  ): boolean;

  /**
   * Get the user's results in an event in the user's last competition.
   * @param eventId The event to get the results of.
   */
  getEventResult(eventId: EventId): UserEventResult | undefined;

  /**
   * Check if the user finished an event (submitted a full result) in the current competition.
   * @param eventId The event's id.
   */
  finishedEvent(eventId: EventId): boolean;

  /**
   * Try to update the user's user info ({@link UserInfo}).
   * @param force Whether to force updating.
   * @return Whether the data was updated (data will not update unless enough time has passed or forced=true).
   */
  tryUpdateWcaData(force?: boolean): Promise<boolean>;

  /**
   * Update the improved records from the newRecords map in this user
   * @param newRecords The new records to use
   */
  updateRecords(newRecords: Map<EventId, EventRecords<TimeFormat>>): void;

  /**
   * If the user hasn't submitted in the current comp, update their lastComp value and clear their saved results.
   */
  validateCompResults(): void;
}

export interface TahashUserVirtuals {
  /**
   * The user's event statuses for the active Tahash comp.
   * For each event the user started to submit (and not finished), its value will be {@link EventSubmissionStatus.InProgress}.
   * For events the user fully submitted, returns {@link EventSubmissionStatus.Completed}.
   * All other events in the competition are not included in the Record.
   */
  eventStatuses: Map<EventId, EventSubmissionStatus>;
}

export interface TahashUserStatics {
  /**
   * Find a user by their id.
   */
  findUserById(userId: number): Promise<TahashUserDoc | null>;
}

const updateWCADataInterval: Readonly<number> = 7; /* number of days to wait between updating wca data */
const tahashUserSchema = new Schema<
  ITahashUser,
  Model<ITahashUser, {}, TahashUserMethods, TahashUserVirtuals>,
  TahashUserMethods,
  {},
  TahashUserVirtuals,
  TahashUserStatics
>(
  {
    userInfo: {
      type: userInfoSchema,
      readonly: true,
      required: true,
    },
    lastUpdatedWcaData: {
      type: Number,
      required: true,
    },
    lastComp: {
      type: Number,
      required: true,
    },
    records: {
      type: Map,
      of: Object, // structure of records for each even is different
      required: true,
    },
    eventResults: {
      type: Map,
      of: userEventResultsSchema,
      required: true,
    },
  },
  {
    methods: {
      setEventTimes(
        eventId: EventId,
        times: PackedResult[],
        overwrite = false,
      ): boolean {
        if (!overwrite && this.finishedEvent(eventId)) return false;

        const finished = isFullPackedTimesArr(times);

        // update the user's submission for the event
        this.eventResults.set(eventId, {
          finished: finished,
          times: times,
        });

        return true;
      },

      getEventResult: function (eventId: EventId): UserEventResult | undefined {
        return this.eventResults.get(eventId);
      },

      finishedEvent(eventId: EventId): boolean {
        const eventResult = this.eventResults.get(eventId);
        return eventResult !== undefined && eventResult.finished;
      },

      async tryUpdateWcaData(force = false): Promise<boolean> {
        // automatically force if there are no records
        force ||= this.records.size == 0;
        if (
          !force &&
          datediffEpoch(this.lastUpdatedWcaData, Date.now()) <
            updateWCADataInterval
        )
          return false;

        const infoResponse = await getUserDataByUserId(this.userInfo.id);
        if (isErrorObject(infoResponse)) {
          console.error(
            `User ${this.userInfo.wcaId} encountered an error (get user data) in TahashUserDoc.tryUpdateWcaData().\nError:${infoResponse.error} - ${infoResponse.context}`,
          );
          return false;
        }
        this.userInfo = infoResponse;

        const recordsResponse = await getWCARecordsOfUser(this.userInfo.wcaId);
        if (isErrorObject(recordsResponse)) {
          console.error(
            `User ${this.userInfo.wcaId} encountered an error (get user records) in TahashUserDoc.tryUpdateWcaData().\nError:${recordsResponse.error} - ${recordsResponse.context}`,
          );
          return false;
        }
        this.updateRecords(recordsResponse);

        this.lastUpdatedWcaData = Date.now();
        return true;
      },

      updateRecords(newRecords: Map<EventId, EventRecords<TimeFormat>>) {
        for (const [eventId, eventRecords] of newRecords) {
          const existingRecords = this.records.get(eventId);
          this.records.set(
            eventId,
            existingRecords
              ? getBestRecords(eventId, eventRecords, existingRecords)
              : eventRecords,
          );
        }

        // get the best records for each record type of the two records ("combine" them)
        function getBestRecords(
          eventId: EventId,
          newRecords: EventRecords<TimeFormat>,
          oldRecords: EventRecords<TimeFormat>,
        ): EventRecords<TimeFormat> {
          const compEvent = getEventById(eventId);
          if (!compEvent) return oldRecords;

          let result: EventRecords<TimeFormat> = { ...oldRecords };
          if (eventId === "333fm") {
            result = result as FMCBestResults;
            newRecords = newRecords as FMCBestResults;
            oldRecords = oldRecords as FMCBestResults;
            if (
              newRecords.single > 0 &&
              (newRecords.single < oldRecords.single || oldRecords.single < 0)
            ) {
              result.single = newRecords.single;
              result.singleComp = newRecords.singleComp;
            }
            if (
              newRecords.mean > 0 &&
              (newRecords.mean < newRecords.meanComp || oldRecords.mean < 0)
            ) {
              result.mean = newRecords.mean;
              result.meanComp = newRecords.meanComp;
            }
          } else if (compEvent.timeFormat === TimeFormat.multi) {
            result = result as MbldBestResults;
            newRecords = newRecords as MbldBestResults;
            oldRecords = oldRecords as MbldBestResults;
            if (
              newRecords.bestPoints > 0 &&
              newRecords.bestPoints > oldRecords.bestPoints
            ) {
              result.bestPoints = newRecords.bestPoints;
              result.bestComp = newRecords.bestComp;
              result.timeOfBestAttempt = newRecords.timeOfBestAttempt;
            }
          } else if (compEvent.timeFormat === TimeFormat.ao5) {
            result = result as AO5BestResults;
            newRecords = newRecords as AO5BestResults;
            oldRecords = oldRecords as AO5BestResults;
            if (
              newRecords.single.centis > 0 &&
              (comparePackedResults(newRecords.single, oldRecords.single) ===
                -1 ||
                oldRecords.single.centis < 0)
            ) {
              result.single = {
                ...newRecords.single,
                extraArgs: { ...newRecords.single.extraArgs },
              };
              result.singleComp = newRecords.singleComp;
            }
            if (
              newRecords.average > 0 &&
              (newRecords.average < oldRecords.average ||
                oldRecords.average < 0)
            ) {
              result.average = newRecords.average;
              result.averageComp = newRecords.averageComp;
            }
          } else if (
            compEvent.timeFormat === TimeFormat.mo3 ||
            compEvent.timeFormat === TimeFormat.bo3
          ) {
            result = result as MO3BestResults;
            newRecords = newRecords as MO3BestResults;
            oldRecords = oldRecords as MO3BestResults;
            if (
              newRecords.single.centis > 0 &&
              (comparePackedResults(newRecords.single, oldRecords.single) ===
                -1 ||
                oldRecords.single.centis < 0)
            ) {
              result.single = {
                ...newRecords.single,
                extraArgs: { ...newRecords.single.extraArgs },
              };
              result.singleComp = newRecords.singleComp;
            }
            if (
              newRecords.mean > 0 &&
              (newRecords.mean < oldRecords.mean || oldRecords.mean < 0)
            ) {
              result.mean = newRecords.mean;
              result.meanComp = newRecords.meanComp;
            }
          }

          return result;
        }
      },

      validateCompResults(): void {
        const newCompNum = CompManager.getInstance().getActiveCompNum();
        if (this.lastComp === newCompNum) return;

        this.lastComp = newCompNum;
        this.eventResults.clear();
      },
    },
    statics: {
      async findUserById(userId: number): Promise<TahashUserDoc | null> {
        return await this.findOne({
          "userInfo.id": userId,
        }).exec();
      },
    },
  },
);

tahashUserSchema.virtual("eventStatuses").get(function () {
  const statuses: Map<EventId, EventSubmissionStatus> = new Map();

  for (const [eventId, results] of this.eventResults)
    statuses.set(
      eventId,
      results.finished
        ? EventSubmissionStatus.Completed
        : EventSubmissionStatus.InProgress,
    );

  return statuses;
});

export const TahashUser = mongoose.model("TahashUser", tahashUserSchema);
export type TahashUserDoc = mongoose.Document &
  ITahashUser &
  TahashUserMethods &
  TahashUserVirtuals;
