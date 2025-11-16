import {
  ITahashComp,
  TahashCompDoc,
  TahashCompMethods,
} from "../models/tahash-comp.model";
import {
  CompEvent,
  EventId,
  generateScrambles,
  getEventById,
  getEventDisplayInfo,
} from "@shared/types/comp-event";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { CompEventResults } from "@shared/interfaces/comp-event-results";
import { SubmissionData } from "@shared/interfaces/submission-data";
import { SubmissionState } from "@shared/constants/submission-state";
import { PackedResult } from "@shared/interfaces/packed-result";
import { CompDisplayData } from "@shared/interfaces/comp-display-data";
import {
  CompEventPair,
  CompEventPairDisplay,
  getCompEventPairDisplay,
} from "@shared/types/comp-event-pair";

/*
TODO:
  Does this really have a use? Maybe only cache the active comp's event ids and event infos and delete this.
*/
/**
 * An instance of a {@link TahashCompDoc}. Includes cached fields for faster fetching and calculation.
 */
export class TahashCompInstance implements ITahashComp, TahashCompMethods {
  private readonly srcDoc: TahashCompDoc;

  /**
   * The ids of all the events in this competition.
   */
  public readonly eventIds: readonly EventId[];

  /**
   * Cached display infos for faster fetching
   */
  public readonly eventDisplayInfos: readonly EventDisplayInfo[];

  constructor(srcDoc: TahashCompDoc) {
    this.srcDoc = srcDoc;
    this.eventIds = srcDoc.eventIds;

    // initialize eventDisplayInfos array
    this.eventDisplayInfos = this.eventIds.map((evId) => {
      return getEventDisplayInfo(evId);
    });
  }

  get compNumber(): number {
    return this.srcDoc.compNumber;
  }

  get data(): CompEventPair[] {
    return this.srcDoc.data;
  }

  get startDate(): Date {
    return this.srcDoc.startDate;
  }

  get endDate(): Date {
    return this.srcDoc.endDate;
  }

  getDataClone(): Map<EventId, CompEventResults> {
    return this.srcDoc.getDataClone();
  }

  getEventResults(eventId: EventId): CompEventResults | undefined {
    return this.srcDoc.getEventResults(eventId);
  }

  getEventScrambles(eventId: EventId): string[] | undefined {
    return this.srcDoc.getEventScrambles(eventId);
  }

  getEventSubmissions(eventId: EventId): SubmissionData[] | undefined {
    return this.srcDoc.getEventSubmissions(eventId);
  }

  isActive(): boolean {
    return this.srcDoc.isActive();
  }

  /**
   * User's pastResults: {
   * compNumber:
   *   {
   *    eventId: {
   *       place: number,
   *       times: PackedResult[]
   *     }
   *   }
   * }
   */

  async setSubmissionState(
    eventId: EventId,
    userId: number,
    newSubmissionState: SubmissionState,
  ): Promise<boolean> {
    return this.srcDoc.setSubmissionState(eventId, userId, newSubmissionState);
  }

  /**
   * Generate (and set) scrambles for all events that don't have scrambles.
   */
  fillScrambles(): void {
    const cloneData = this.data;
    for (const { eventId, result } of cloneData) {
      if (result.scrambles.length > 0) continue;
      result.scrambles = generateScrambles(eventId);
    }

    this.srcDoc.data = cloneData;
  }

  filterAndSortSubmissions(): void {
    return this.srcDoc.filterAndSortSubmissions();
  }

  submitResults(
    eventData: CompEvent,
    userId: number,
    results: PackedResult[],
  ): boolean {
    return this.srcDoc.submitResults(eventData, userId, results);
  }

  async closeComp(): Promise<void> {
    return await this.srcDoc.closeComp();
  }

  async getDisplayData(): Promise<CompDisplayData> {
    return await this.srcDoc.getDisplayData();
  }

  /**
   * Save this tahash comp to the database
   */
  async save() {
    return await this.srcDoc.save();
  }

  /**
   * Short for calling constructor
   * @param srcDoc The source {@link TahashCompDoc} to use
   */
  public static fromDoc(srcDoc: TahashCompDoc): TahashCompInstance {
    return new TahashCompInstance(srcDoc);
  }
}
