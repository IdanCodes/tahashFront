import mongoose, { Model, Schema } from "mongoose";
import {
  CompEvent,
  EventId,
  getEventById,
  WCAEvents,
} from "@shared/types/comp-event";
import { CompEventResults } from "@shared/interfaces/comp-event-results";
import {
  initSubmissionData,
  SubmissionData,
} from "@shared/interfaces/submission-data";
import { SubmissionState } from "@shared/constants/submission-state";
import { packedResultSchema } from "./packed-result.schema";
import {
  EventRecords,
  getNumericResultOfRecord,
} from "../../types/event-records";
import { UserManager } from "../users/user-manager";
import {
  compareFinalResults,
  submissionDataToRecord,
} from "@shared/utils/event-results-utils";
import { TimeFormat } from "@shared/constants/time-formats";
import { PackedResult } from "@shared/interfaces/packed-result";
import { PastCompResults } from "../../types/past-comp-results";
import { comparePackedResults } from "@shared/utils/time-utils";
import {
  CompEventPair,
  CompEventPairDisplay,
  getCompEventPairDisplay,
} from "@shared/types/comp-event-pair";
import { CompDisplayData } from "@shared/interfaces/comp-display-data";

const compEventResultsSchema = new Schema<CompEventResults>(
  {
    scrambles: {
      type: [String],
      required: true,
    },
    submissions: [
      {
        userId: {
          type: Number,
          required: true,
        },
        submissionState: {
          type: Number,
          required: true,
        },
        times: {
          type: [packedResultSchema],
          required: true,
        },
        finalResult: {
          type: Number,
          required: true,
        },
        resultStr: {
          type: String,
          required: true,
        },
        place: {
          type: Number,
          required: false,
        },
      },
    ],
  },
  {
    _id: false,
  },
);

const compEventPairSchema = new Schema<CompEventPair>({
  eventId: String,
  result: compEventResultsSchema,
});

/**
 * The regular length for a {@link TahashCompData} in number of days.
 */
export const normalCompLength: number = 7;

/**
 * Fields of a {@link TahashCompData}.
 */
export interface ITahashComp {
  /**
   * The number of this competition.
   */
  compNumber: number;

  /**
   * The starting date of this competition.
   */
  startDate: Date;

  /**
   * The ending date of this competition.
   */
  endDate: Date;

  data: CompEventPair[];
}

export interface TahashCompVirtuals {
  /**
   * Get this tahash comp's event ids
   */
  eventIds: EventId[];
}

export interface TahashCompMethods {
  /**
   * Get a deep clone of this {@link TahashCompData}'s data.
   */
  getDataClone(): Map<EventId, CompEventResults>;

  /**
   * Whether this comp is currently active.
   */
  isActive(): boolean;

  /**
   * Get the {@link CompEventResults} of an event (not a clone).
   * @param eventId The id of the event.
   * @return
   * - If the event exists in the competition, returns its {@link CompEventResults}.
   * - Otherwise, returns `undefined`.
   */
  getEventResults(eventId: EventId): CompEventResults | undefined;

  /**
   * Get the scrambles of an event in the competition.
   * @param eventId The id of the event.
   * @return
   * - If the event exists in the competition, returns its scrambles.
   * - Otherwise, returns `undefined`.
   */
  getEventScrambles(eventId: EventId): string[] | undefined;

  /**
   * Get a copy of the {@link SubmissionData}[] of an event.
   * @param eventId The id of the event.
   * @result
   * - If the event exists in the competition, returns its {@link SubmissionData}[].
   * - Otherwise, returns `undefined`.
   */
  getEventSubmissions(eventId: EventId): SubmissionData[] | undefined;

  /**
   * Submit results for a user. Automatically sets the SubmissionsState.Pending.
   * @param eventData The submission's event.
   * @param userId The submitter's user id.
   * @param results The results to submit.
   * @return Whether submitting was successful. True unless:
   * - The event doesn't exist in this comp.
   * - The user has already submitted results for this event.
   */
  submitResults(
    eventData: CompEvent,
    userId: number,
    results: PackedResult[],
  ): boolean;

  /**
   * Update the submission state for a user's submission. Updates user's records if the new state is approved
   * @param eventId The submission's event.
   * @param userId The submitter's user id.
   * @param newSubmissionState The new {@link SubmissionState} for the submission.
   * @return Whether submitting was successful (false if the eventId/userId were not found).
   */
  setSubmissionState(
    eventId: EventId,
    userId: number,
    newSubmissionState: SubmissionState,
  ): Promise<boolean>;

  /**
   * Close the competition.
   * - Sets the end date to today
   * - Sorts each event's submissions by place (and adds the "place" field) and filters out submissions that are not accepted.
   * - Adds this comp's results to all users who competed in it (into pastResults)
   */
  closeComp(): Promise<void>;

  /**
   * Filter out submissions that are not accepted or DNFs
   * Sort each event's submissions by final result
   */
  filterAndSortSubmissions(): void;

  /**
   * Get this competition's display data
   */
  getDisplayData(): Promise<CompDisplayData>;
}

export interface TahashCompStatics {
  fromSource(src: ITahashComp): TahashCompDoc;
}

// Instance of data
export type TahashCompDoc = mongoose.Document &
  ITahashComp &
  TahashCompVirtuals &
  TahashCompMethods;

export const TahashCompSchema = new Schema<
  ITahashComp,
  Model<ITahashComp>,
  TahashCompMethods,
  {},
  TahashCompVirtuals,
  TahashCompStatics
>(
  {
    compNumber: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    data: {
      type: [compEventPairSchema],
      required: true,
    },
  },
  {
    methods: {
      getDataClone(): Map<EventId, CompEventResults> {
        const clone: Map<EventId, CompEventResults> = new Map<
          EventId,
          CompEventResults
        >();

        for (const { eventId, result } of this.data) {
          clone.set(eventId, {
            scrambles: [...result.scrambles],
            submissions: result.submissions.map((s) => ({ ...s })),
          });
        }

        return clone as Map<EventId, CompEventResults>;
      },

      isActive(): boolean {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return this.startDate <= now && now <= this.endDate;
      },

      // returns the event's results (not a copy)
      getEventResults(eventId: EventId): CompEventResults | undefined {
        const evData = this.data.find((pair) => pair.eventId == eventId);
        return evData ? evData.result : undefined;
      },

      // get a clone of the scrambles
      getEventScrambles(eventId: EventId): string[] | undefined {
        const evData = this.data.find((pair) => pair.eventId == eventId);
        return evData ? [...evData.result.scrambles] : undefined;
      },

      getEventSubmissions(eventId: EventId): SubmissionData[] | undefined {
        const evResults = this.getEventResults(eventId);
        return evResults ? [...evResults.submissions] : undefined;
      },

      async setSubmissionState(
        eventId: EventId,
        userId: number,
        newSubmissionState: SubmissionState,
      ): Promise<boolean> {
        const compEventPair = this.data.find((x) => x.eventId === eventId);
        if (!compEventPair) return false; // event doesn't exist in comp

        const results = compEventPair.result;
        const submissionIndex = results.submissions.findIndex(
          (sub: SubmissionData) => sub.userId === userId,
        );
        if (submissionIndex < 0) return false; // user never submitted this event

        results.submissions[submissionIndex].submissionState =
          newSubmissionState;

        if (newSubmissionState === SubmissionState.Approved) {
          const eventData = getEventById(eventId);
          if (!eventData) return true;

          const userDoc = await UserManager.getInstance().getUserById(userId);
          const rec = submissionDataToRecord(
            eventData,
            this.compNumber,
            results.submissions[submissionIndex],
          );
          userDoc.updateRecords(
            new Map<string, EventRecords<TimeFormat>>([[eventId, rec]]),
          );
          await userDoc.save();
        }

        return true;
      },

      submitResults(
        eventData: CompEvent,
        userId: number,
        results: PackedResult[],
      ): boolean {
        const eventResults = this.getEventResults(eventData.eventId);
        if (!eventResults) return false; // event doesn't exist in comp

        const alreadySubmitted = eventResults.submissions.some(
          (sub) => sub.userId === userId,
        );
        if (alreadySubmitted) return false;

        eventResults.submissions.push(
          initSubmissionData(userId, eventData, results),
        );
        return true;
      },

      filterAndSortSubmissions(): void {
        for (let i = 0; i < this.data.length; i++) {
          this.data[i].result.submissions = this.data[i].result.submissions
            .filter((s) => s.submissionState === SubmissionState.Approved)
            .sort((a, b) => compareFinalResults(a.finalResult, b.finalResult));
        }
      },

      async closeComp(): Promise<void> {
        this.endDate = new Date();
        this.endDate.setHours(0, 0, 0, 0);

        // for each event
        this.filterAndSortSubmissions();

        const pastResultsMap = new Map<number, PastCompResults>();
        const addResult = (
          userId: number,
          eventId: EventId,
          place: number,
          times: PackedResult[],
        ) => {
          const newResults = pastResultsMap.get(userId) ?? new Map();
          newResults.set(eventId, { place, times });
          pastResultsMap.set(userId, newResults);
        };

        for (let i = 0; i < this.data.length; i++) {
          const submissions = this.data[i].result.submissions;
          if (submissions.length == 0) continue;

          const eventId = this.data[i].eventId;
          let place = 1;
          addResult(
            submissions[0].userId,
            eventId,
            (this.data[i].result.submissions[0].place = place),
            submissions[0].times,
          );

          for (let j = 1; j < submissions.length; j++) {
            if (submissions[j - 1].finalResult < submissions[j].finalResult)
              place += 1;
            console.log(
              `submissions[j-1]:${submissions[j - 1].finalResult}; submissions[j]:${submissions[j].finalResult}`,
            );
            addResult(
              submissions[j].userId,
              eventId,
              (this.data[i].result.submissions[j].place = place),
              submissions[0].times,
            );
          }
        }

        /* update users' past results in database */
        for (const [userId, pastResults] of pastResultsMap) {
          const userDoc = await UserManager.getInstance().getUserById(userId);
          userDoc.setCompResults(this.compNumber, pastResults);
          await userDoc.save();
        }

        /**
         * pastResultsMap = Map<userid, pastCompResults>
         * const addResult = (userId, eventId, place, times) => {
         *    const newResults = pastResultsMap.get(userId) ?? new Map();
         *    newResults.set(event.eventId, { place, times } )
         *    pastResultsMap.set(userId, newResults)
         * }
         *
         * for event of events:
         *  let place = 1;
         *  addResult(event.submissions[0].userId, event.eventId, event.submissions[0].place = place, event.submissions[0].times)
         *  for (let i = 1; i < event.submissions.length; i++)
         *    if (event.submissions[i - 1].finalResult < event.submissions[i].finalResult)
         *      place += 1;
         *    addResult(userId, event.eventId, event.submissions[i].place = place, event.submissions[i].times)
         *
         *  Step 4: update the new results for each user
         *  for ([userId, pastCompResults] of pastResultsMap
         *    const userDoc = await UserManager.getUserDoc(userId)
         *    userDoc.setCompResults(this.compNumber, pastCompResults)
         */
      },

      async getDisplayData(): Promise<CompDisplayData> {
        const eventPairDisplays: CompEventPairDisplay[] = [];

        for (let i = 0; i < this.data.length; i++) {
          const display = await getCompEventPairDisplay(this.data[i]);
          if (!display) {
            console.warn(
              `comp-event-pair.ts.getDisplayData: Could not get display data for event "${this.data[i].eventId}"; skipping.`,
            );
            continue;
          }

          eventPairDisplays.push(display);
        }

        return {
          compNumber: this.compNumber,
          startDate: this.startDate,
          endDate: this.endDate,
          data: eventPairDisplays,
        } as CompDisplayData;
      },
    },
    statics: {
      fromSource(src: ITahashComp): TahashCompDoc {
        const fields: ITahashComp = { ...src };

        fields.compNumber = src.compNumber;
        fields.startDate = src.startDate;
        fields.endDate = src.endDate;
        fields.data = src.data || {};

        // "normalize" Date to only the date, ignore time of day
        fields.startDate?.setHours(0, 0, 0, 0);
        fields.endDate?.setHours(0, 0, 0, 0);

        // make sure startDate is first
        if (fields.endDate < fields.startDate) {
          console.warn(
            "Attempted to create a TahashComp with endDate < startDate. Switching dates.",
          );
          const temp = fields.endDate;
          fields.endDate = fields.startDate;
          fields.startDate = temp;
        }

        return new TahashCompData(fields);
      },
    },
  },
);

// get event ids virtual
TahashCompSchema.virtual("eventIds").get(function (): EventId[] {
  return this.data.map((d) => d.eventId);
});

/**
 * Create a new source for a {@link TahashCompData}.
 * @param compNumber The comp's number.
 * @param extraEvents Extra events for the comp.
 * @param startDate The comp's start date. Defaults to today.
 * @param endDate The comp's end date. Defaults to {@link normalCompLength} days from now.
 */
export function createCompSrc(
  compNumber: number,
  extraEvents: EventId[] = [],
  startDate: Date | undefined = undefined,
  endDate: Date | undefined = undefined,
): ITahashComp {
  // add start date
  if (!startDate) startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  // add end date
  if (!endDate) {
    endDate = new Date();
    endDate.setDate(endDate.getDate() + normalCompLength);
  }
  endDate.setHours(0, 0, 0, 0);

  // filter out duplicates
  const extras: EventId[] = extraEvents.filter(
    (ev) => !WCAEvents.some((wcaEv) => wcaEv.eventId == ev),
  );
  const allEventIds: EventId[] = WCAEvents.map((wcaEv) => wcaEv.eventId).concat(
    extras,
  );

  // construct competition's data (each event is empty)
  const data: CompEventPair[] = [];
  allEventIds.forEach((evId) =>
    data.push({ eventId: evId, result: { scrambles: [], submissions: [] } }),
  );

  return {
    compNumber,
    startDate,
    endDate,
    data: data,
  };
}

export const TahashCompData = mongoose.model("TahashComp", TahashCompSchema);
