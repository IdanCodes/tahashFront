import mongoose, { Model, Schema } from "mongoose";
import { CompEvent, EventId, WCAEvents } from "../../types/comp-event";
import { CompEventResults } from "../../interfaces/comp-event-results";
import { SubmissionData } from "../../interfaces/submission-data";
import { SubmissionState } from "../comps/submission-state";
import { packedResultSchema } from "./packed-result.schema";

const compEventResultsSchema = new Schema<CompEventResults>(
  {
    scrambles: [String],
    submissions: [
      {
        userId: Number,
        submissionState: Number,
        times: [packedResultSchema],
        resultStr: String,
      },
    ],
  },
  {
    _id: false,
  },
);

export type CompEventPair = {
  eventId: EventId;
  result: CompEventResults;
};
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

  /*
    comp data structure IN DATABASE:
    data: [
        {
            eventId: str
            scrambles: str[]
            results: [
                {
                    userId: uint,
                    submissionState: SubmissionState,
                    times: packedTimes,
                    resultStr: str
                }
            ]
        }
    ]

    comp data structure IN CODE:
    data: [
        {
            event: CompEvent
            scrambles: str[]
            results: [
                {
                    userId: uint,
                    submissionState: SubmissionState,
                    times: packedTimes,
                    resultStr: str
                }
            ]
        }
    ]
    */
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
   * Submit results for a user.
   * @param eventId The submission's event.
   * @param userId The submitter's user id.
   * @param results The results to submit.
   * @return Whether submitting was successful. True unless:
   * - The event was not found.
   * - The user has already submitted results for this event.
   */
  submitResults(
    eventId: EventId,
    userId: number,
    results: SubmissionData,
  ): boolean;
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

      setSubmissionState(
        eventId: EventId,
        userId: number,
        newSubmissionState: SubmissionState,
      ): boolean {
        const results = this.data[eventId];
        if (!results) return false; // event doesn't exist in comp

        const submissionIndex = results.submissions.findIndex(
          (sub: SubmissionData) => sub.userId === userId,
        );
        if (submissionIndex < 0) return false; // user never submitted this event

        results.submissions[submissionIndex].submissionState =
          newSubmissionState;
        return true;
      },

      submitResults(
        eventId: EventId,
        userId: number,
        results: SubmissionData,
      ): boolean {
        const eventResults = this.getEventResults(eventId);
        if (!eventResults) return false; // event doesn't exist in comp

        const alreadySubmitted = eventResults.submissions.some(
          (sub) => sub.userId === userId,
        );
        if (alreadySubmitted) return false;

        eventResults.submissions.push(results);
        return true;
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
//
// // region Methods
// TahashCompSchema.methods.getDataClone = function (): Map<
//   EventId,
//   CompEventResults
// > {
//   const clone: Map<EventId, CompEventResults> = new Map<
//     EventId,
//     CompEventResults
//   >();
//
//   for (const [eventId, result] of Object.entries(this.data) as [
//     EventId,
//     CompEventResults,
//   ][]) {
//     clone.set(eventId, {
//       scrambles: [...result.scrambles],
//       submissions: result.submissions.map((s) => ({ ...s })),
//     });
//   }
//
//   return clone as Map<EventId, CompEventResults>;
// };
//
// TahashCompSchema.methods.isActive = function (): boolean {
//   const now = new Date();
//   now.setHours(0, 0, 0, 0);
//   return this.startDate <= now && now <= this.endDate;
// };
//
// TahashCompSchema.methods.getEventResults = function (
//   eventId: EventId,
// ): CompEventResults | undefined {
//   const evData: CompEventResults | undefined = this.data.get(eventId);
//   return evData ? Object.assign({}, evData) : undefined;
// };
//
// TahashCompSchema.methods.getEventSubmissions = function (
//   eventId: EventId,
// ): SubmissionData[] | undefined {
//   const evData: CompEventResults | undefined = this.data.get(eventId);
//   return evData ? [...evData.submissions] : undefined;
// };
//
// TahashCompSchema.methods.setSubmissionState = function (
//   eventId: EventId,
//   userId: number,
//   newSubmissionState: SubmissionState,
// ): boolean {
//   const results = this.data[eventId];
//   if (!results) return false; // event doesn't exist in comp
//
//   const submissionIndex = results.submissions.findIndex(
//     (sub: SubmissionData) => sub.userId === userId,
//   );
//   if (submissionIndex < 0) return false; // user never submitted this event
//
//   results.submissions[submissionIndex].submissionState = newSubmissionState;
//   return true;
// };
//
// TahashCompSchema.methods.submitResults = function (
//   eventId: EventId,
//   userId: number,
//   results: SubmissionData,
// ): boolean {
//   const eventResults = this.data.get(eventId);
//   if (!eventResults) return false; // event doesn't exist in comp
//
//   const alreadySubmitted = eventResults.submissions.some(
//     (sub) => sub.userId === userId,
//   );
//   if (alreadySubmitted) return false;
//
//   eventResults.submissions.push(results);
//   return true;
// };
// // endregion
//
// // region Statics
// TahashCompSchema.statics.fromSource = function (
//   src: ITahashComp,
// ): TahashCompDoc {
//   const fields: ITahashComp = { ...src };
//
//   fields.compNumber = src.compNumber;
//   fields.startDate = src.startDate;
//   fields.endDate = src.endDate;
//   fields.data = src.data || {};
//
//   // "normalize" Date to only the date, ignore time of day
//   fields.startDate?.setHours(0, 0, 0, 0);
//   fields.endDate?.setHours(0, 0, 0, 0);
//
//   // make sure startDate is first
//   if (fields.endDate < fields.startDate) {
//     console.warn(
//       "Attempted to create a TahashComp with endDate < startDate. Switching dates.",
//     );
//     const temp = fields.endDate;
//     fields.endDate = fields.startDate;
//     fields.startDate = temp;
//   }
//
//   return new TahashCompData(fields);
// };
// // endregion

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

  // const data: Record<EventId, CompEventResults> = Object.fromEntries(
  //   ,
  // );
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
