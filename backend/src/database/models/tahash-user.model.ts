import mongoose, { Model, Schema } from "mongoose";
import { UserInfo } from "@shared/interfaces/user-info";
import { EventId } from "../comp-event";
import { UserEventResult } from "../../interfaces/user-event-result";
import { EventRecords } from "../../interfaces/event-records";
import { TimeFormat } from "../../constants/time-formats";
import { packedResultSchema } from "./packed-result.schema";
import {
  isFullPackedTimesArr,
  PackedResult,
} from "../../interfaces/packed-result";
import { datediffEpoch } from "../../utils/global-utils";
import { getUserDataByUserId } from "../../utils/wcaApiUtils";
import { EventSubmissionStatus } from "../../constants/event-submission-status";
import { isErrorObject } from "@shared/interfaces/error-object";

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
    times: packedResultSchema,
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
  readonly lastComp: number;

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
   * Check if the user finished an event (submitted a full result) in the current competition.
   * @param eventId The event's id.
   */
  finishedEvent(eventId: EventId): boolean;

  /**
   * Get the user's event statuses for the current competition.
   * @return For each event the user started to submit (and not finished), its value will be {@link EventSubmissionStatus.InProgress}.
   * For events the user fully submitted, returns {@link EventSubmissionStatus.Completed}.
   * All other events in the competition are not included in the returned {@link Record}.
   */
  getEventStatuses(): Record<EventId, EventSubmissionStatus>;

  /**
   * Try to update the user's user info ({@link UserInfo}).
   * @param force Whether to force updating.
   * @return Whether the data was updated (data will not update unless enough time has passed or forced=true).
   */
  tryUpdateWcaData(force?: boolean): Promise<boolean>;
}

const updateWCADataInterval: Readonly<number> = 28; /* number of days to wait between updating wca data */
const tahashUserSchema = new Schema<
  ITahashUser,
  Model<ITahashUser>,
  TahashUserMethods
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
      readonly: true,
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

      getEventResult(eventId: EventId): UserEventResult | undefined {
        return this.eventResults[eventId];
      },

      finishedEvent(eventId: EventId): boolean {
        const eventResult = this.eventResults.get(eventId);
        return eventResult !== undefined && eventResult.finished;
      },

      getEventStatuses(): Record<EventId, EventSubmissionStatus> {
        const statuses: Record<EventId, EventSubmissionStatus> = {};

        for (const [eventId, results] of this.eventResults)
          statuses[eventId] = results.finished
            ? EventSubmissionStatus.Completed
            : EventSubmissionStatus.InProgress;

        return statuses;
      },

      async tryUpdateWcaData(force = false): Promise<boolean> {
        if (
          !force &&
          datediffEpoch(this.lastUpdatedWcaData, Date.now()) <
            updateWCADataInterval
        )
          return false;

        this.lastUpdatedWcaData = Date.now();
        const response = await getUserDataByUserId(this.userInfo.id);
        if (isErrorObject(response)) {
          console.error(
            `User ${this.userInfo.wcaId} encountered an error (get user data) in TahashUser.updateWCAData().\nError:${response.error} - ${response.context}`,
          );
          return false;
        }

        this.userInfo = response;
        return true;
      },
    },
  },
);

export const TahashUser = mongoose.model("TahashUser", tahashUserSchema);
export type TahashUserDoc = mongoose.Document & ITahashUser & TahashUserMethods;
