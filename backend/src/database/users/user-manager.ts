import {
  getUserDataByUserId,
  getWCARecordsOfUser,
} from "../../utils/wcaApiUtils";
import { EventRecords } from "../../types/event-records";
import { TimeFormat } from "../../constants/time-formats";
import { EventId } from "../../types/comp-event";
import { UserInfo } from "@shared/interfaces/user-info";
import { isErrorObject } from "@shared/interfaces/error-object";
import {
  ITahashUser,
  TahashUser,
  TahashUserDoc,
} from "../models/tahash-user.model";
import { UserEventResult } from "../../types/user-event-result";

/**
 * A singleton to manage the "users" collection of the database.
 */
export class UserManager {
  /**
   * The singleton instance of {@link UserManager}.
   * @private
   */
  private static instance: UserManager | undefined = undefined;

  /**
   * Construct a {@link UserManager}.
   */
  constructor() {
    if (UserManager.instance !== undefined)
      throw new Error(
        "Attempted to instantiate a new singleton instance of UserManager where an instance already exists.",
      );
  }

  /**
   * Create an instance of the {@link UserManager} singleton.
   * @return The new {@link UserManager} instance.
   * @throws Error If a {@link UserManager} instance already exists.
   */
  public static init(): UserManager {
    if (this.instance !== undefined)
      throw new Error(
        "UserManager instance already exists. Use UserManager.getInstance() instead.",
      );

    this.instance = new this();
    return this.instance;
  }

  /**
   * Get the singleton instance of the {@link UserManager}.
   */
  public static getInstance(): UserManager {
    if (!this.instance)
      throw new Error("UserManager not initialized. Call init() first.");

    return this.instance;
  }

  /**
   * Get a user's document from the database by their id.
   * @param userId The requested user's id.
   * @return
   * - If the user doesn't exist in the database, returns `null`.
   * - Otherwise, returns the document of the user.
   */
  private async getUserDocById(userId: number): Promise<TahashUserDoc | null> {
    return TahashUser.findUserById(userId);
  }

  /**
   * Get a user in the database by id.
   * If the user doesn't exist, returns a new ("default") TahashUser object of this manager with the given id.
   * @param userId
   * @param saveIfCreated if true and the user doesn't exist in the database, fetches the user's WCA data and results and saves the user in the database.
   */
  public async getUserById(
    userId: number,
    saveIfCreated: boolean = true,
  ): Promise<TahashUserDoc> {
    let userDoc = await this.getUserDocById(userId);

    let userInfo: UserInfo = {
      id: userId,
      name: "NOT FOUND",
      wcaId: "NOT FOUND",
      country: "-",
      photoUrl: "-",
    };
    let records: Map<EventId, EventRecords<TimeFormat>> = new Map<
      EventId,
      EventRecords<TimeFormat>
    >();
    let lastUpdatedWcaData: number = -1;

    userDoc ??= new TahashUser({
      userInfo: userInfo,
      lastUpdatedWcaData: lastUpdatedWcaData,
      lastComp: -1,
      records: records,
      eventResults: new Map<EventId, UserEventResult>(),
    });

    if (await userDoc.tryUpdateWcaData()) await userDoc.save();
    else if (saveIfCreated) await userDoc.save();

    return userDoc;
  }

  // /**
  //  * Save a {@link TahashUser} to the database by their user id (if the user already exists, updates their values)
  //  * @param tahashUser The user to save.
  //  * @return Whether the update has been acknowledges (usually true).
  //  */
  // public async saveUser(tahashUser: TahashUserDoc): Promise<boolean> {
  //   return (
  //     await this.collection.updateOne(
  //       { userId: tahashUser.userId },
  //       {
  //         $set: {
  //           userId: tahashUser.userId,
  //           userInfo: tahashUser.userInfo,
  //           lastUpdatedWcaData: tahashUser.lastUpdatedWcaData,
  //           lastComp: tahashUser.lastComp,
  //           records: tahashUser.records,
  //           eventResults: tahashUser.eventResults,
  //         },
  //       },
  //       { upsert: true },
  //     )
  //   ).acknowledged;
  // }

  /**
   * Get (a clone of) a user's {@link UserInfo}.
   * @param userId The user's id.
   * @return
   * - If the user wasn't found in the database, returns `null`.
   * - Otherwise, returns the requested {@link UserInfo}.
   */
  async getUserDataById(userId: number): Promise<UserInfo | null> {
    const userDoc: TahashUserDoc | null = await this.getUserDocById(userId);
    return userDoc ? userDoc.userInfo : null;
  }
}
