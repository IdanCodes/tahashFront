import {
  ITahashComp,
  TahashCompDoc,
  TahashCompMethods,
} from "../models/tahash-comp.model";
import {
  EventId,
  generateScrambles,
  getEventDisplayInfo,
} from "@shared/types/comp-event";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { CompEventResults } from "../../interfaces/comp-event-results";
import { SubmissionData } from "../../interfaces/submission-data";

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
    this.eventDisplayInfos = this.eventIds.map((evId) =>
      getEventDisplayInfo(evId),
    );
  }

  get compNumber(): number {
    return this.srcDoc.compNumber;
  }

  get data(): Map<EventId, CompEventResults> {
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

  getEventSubmissions(eventId: EventId): SubmissionData[] | undefined {
    return this.srcDoc.getEventSubmissions(eventId);
  }

  isActive(): boolean {
    return this.srcDoc.isActive();
  }

  /**
   * Generate (and set) scrambles for all events that don't have scrambles.
   */
  fillScrambles(): void {
    for (const eventId of this.eventIds) {
      console.log(eventId);
      console.log(typeof this.data);
      console.log(this.data);
      if (this.data.get(eventId)!.scrambles.length > 0) continue;
      this.data.get(eventId)!.scrambles = generateScrambles(eventId);
    }
  }

  submitResults(
    eventId: EventId,
    userId: number,
    results: SubmissionData,
  ): boolean {
    return this.srcDoc.submitResults(eventId, userId, results);
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
