import {
  createCompSrc,
  ITahashComp,
  TahashCompData,
  TahashCompDoc,
} from "../models/tahash-comp.model";
import { TahashCompInstance } from "./tahash-comp-instance";

/**
 * A singleton to manage the "comps" collection of the database.
 */
export class CompManager {
  /**
   * The singleton instance of {@link CompManager}.
   */
  private static instance: CompManager | undefined = undefined;
  private activeComp: TahashCompInstance; // TODO: change activeComp on validate new comp

  /**
   * Construct a {@link CompManager}.
   */
  private constructor() {
    if (CompManager.instance !== undefined)
      throw new Error(
        "Attempted to instantiate a new singleton instance of CompManager where an instance already exists.",
      );

    this.activeComp = TahashCompInstance.fromDoc(
      new TahashCompData(createCompSrc(-1)),
    );
  }

  /**
   * Create the instance of the {@link CompManager} singleton.
   * @return The new {@link CompManager} instance.
   * @throws Error If a {@link CompManager} instance already exists.
   */
  public static async init(): Promise<CompManager> {
    if (this.instance !== undefined)
      throw new Error(
        "CompManager instance already exists. Use CompManager.getInstance() instead.",
      );

    this.instance = new this();

    // initialize comps collection if it's empty
    const count = await TahashCompData.countDocuments({}, { limit: 1 }).exec();
    if (count == 0) {
      console.log("Comps database is empty. Initializing empty comp...");

      // save an empty comp with compNumber 0
      const EARLIEST_DATE = new Date(1);
      const dummyComp = new TahashCompData(
        createCompSrc(0, [], EARLIEST_DATE, EARLIEST_DATE),
      );
      await dummyComp.save();

      console.log("Created & saved empty comp!");

      // MongoDB needs more time to register saving the new comp
      await TahashCompData.findOne().exec();
    }

    // init active comp
    this.instance.activeComp = TahashCompInstance.fromDoc(
      await this.instance.fetchActiveComp(),
    );
    return this.instance;
  }

  /**
   * Get the singleton instance of the {@link CompManager}.
   */
  public static getInstance(): CompManager {
    if (!this.instance)
      throw new Error("CompManager not initialized. Call init() first.");
    return this.instance;
  }

  /**
   * Fetch the active {@link TahashCompData} from the database.
   * @return A {@link TahashCompData} object of the comp with the highest `compNumber`.
   * @throws Error If the comps database does not contain comps.
   */
  private async fetchActiveComp(): Promise<TahashCompDoc> {
    const compDoc: TahashCompDoc = (
      await TahashCompData.find().sort({ compNumber: -1 }).limit(1).exec()
    )[0];
    if (!compDoc) throw new Error("No comps found.");

    return new TahashCompData(compDoc);
  }

  /**
   * Get the `compNumber` of the current active {@link TahashCompData}.
   */
  public getActiveCompNum(): number {
    return this.activeComp.compNumber;
  }

  /**
   * Get a direct reference to the active {@link TahashCompData}.
   */
  public getActiveComp(): TahashCompInstance {
    return this.activeComp;
  }

  /**
   * Get a {@link TahashCompData} object from the database by its comp number.
   * @param compNumber The comp number.
   * @return
   * - If the desired comp was found, returns the respective {@link TahashCompData}.
   * - Otherwise, returns `null`.
   */
  public async getTahashComp(
    compNumber: number,
  ): Promise<TahashCompDoc | null> {
    if (!this.compExists(compNumber)) return null;
    return await TahashCompData.findOne({ compNumber: compNumber }).exec();
  }

  /**
   * Check if a comp with a comp number exists.
   * @param compNumber The comp number to check.
   */
  compExists(compNumber: number) {
    return compNumber > 0 && compNumber <= this.getActiveCompNum();
  }

  // /**
  //  * Save a {@link TahashComp} to the database by its comp number (if it already exists, just update its values).
  //  * @param tahashComp
  //  * @return Whether the update has been acknowledged (usually true).
  //  */
  // public async saveComp(tahashComp: ITahashComp): Promise<boolean> {
  //   return (
  //     await TahashComp.updateOne(
  //       { compNumber: tahashComp.compNumber },
  //       {
  //         $set: {
  //           compNumber: tahashComp.compNumber,
  //           startDate: tahashComp.startDate,
  //           endDate: tahashComp.endDate,
  //           data: tahashComp.data,
  //         },
  //       },
  //       { upsert: true },
  //     ).exec()
  //   ).acknowledged;
  // }

  /**
   * Validate the active comp - if it has ended, create a new comp.
   * @param newSrc A source for the new competition, if it was created.
   * @param force Whether to force creating a new comp.
   * @return The current active comp.
   */
  public async validateActiveComp(
    newSrc: ITahashComp,
    force: boolean = false,
  ): Promise<TahashCompInstance> {
    // check if the current comp is still active
    if (!force && this.activeComp.isActive()) return this.activeComp;

    // create a new comp and save it to the database
    const newComp = new TahashCompInstance(new TahashCompData(newSrc));
    newComp.fillScrambles();
    await newComp.save();
    return (this.activeComp = newComp);
  }

  // TODO: remove if unnecessary
  // update the submission state for a user's submission
  // returns whether updating was successful
  // async updateSubmissionState(compNumber, eventId, userId, newSubmissionState) {
  //     if (!this.compExists(compNumber))
  //         return false;
  //
  //     const res = await CompManager.collection.updateOne({
  //         compNumber: compNumber,
  //         "data.eventId": eventId,
  //         "data.results.userId": userId
  //     },
  //     {
  //         $set: { "data.$[event].results.$[result].submissionState": newSubmissionState }
  //     },
  //     {
  //         arrayFilters: [
  //             { "event.eventId": eventId },
  //             { "result.userId": userId }
  //         ],
  //         upsert: false // don't update it if it doesn't exist
  //     });
  //
  //     // const successful = res.matchedCount > 0;
  //     //
  //     // if (successful) { // update local copy
  //     //     this.activeComp.
  //     // }
  //
  //     return res.matchedCount > 0;
  // }
}
