import { EventRecords } from "@shared/types/event-records";
import { TimeFormat } from "@shared/constants/time-formats";
import { EventId } from "@shared/types/comp-event";
import { UserInfo } from "@shared/interfaces/user-info";
import {
  LeanTahashUser,
  TahashUser,
  TahashUserDoc,
} from "../models/tahash-user.model";
import { UserEventResult } from "@shared/types/user-event-result";
import { PastCompResults } from "@shared/types/past-comp-results";

/**
 * A singleton to manage the "users" collection of the database.
 */
export class UserManager {
  /**
   * The singleton instance of {@link UserManager}.
   * @private
   */
  private static instance: UserManager | undefined = undefined;

  private readonly MAX_CACHE_SIZE = 50;
  private userDataCache = new Map<number, LeanTahashUser>();

  // wcaid to userid cache
  private readonly MAX_WCAID_CACHE_SIZE = 125;
  private wcaIdCache = new Map<string, number>();

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

  private addUserToCache(id: number, data: LeanTahashUser) {
    // If the cache is full, delete the first (oldest) item
    if (this.userDataCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.userDataCache.keys().next().value;
      if (oldestKey) this.userDataCache.delete(oldestKey);
    }
    this.userDataCache.set(id, data);

    if (this.wcaIdCache.size >= this.MAX_WCAID_CACHE_SIZE) {
      const oldestKey = this.wcaIdCache.keys().next().value;
      if (oldestKey) this.wcaIdCache.delete(oldestKey);
    }
    this.wcaIdCache.set(data.userInfo.wcaId, id);
  }

  /**
   * Get a user in the database by id.
   * If the user doesn't exist, returns a new ("default") TahashUser object of this manager with the given id.
   * @param userId
   * @param saveIfCreated if true and the user doesn't exist in the database, fetches the user's WCA data and results and saves the user in the database.
   */
  public async getUserDocById(
    userId: number,
    saveIfCreated: boolean = true,
  ): Promise<TahashUserDoc> {
    let userDoc = await TahashUser.findUserById(userId);

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
      pastResults: new Map<EventId, PastCompResults>(),
    });

    userDoc.validateCompResults();

    if (await userDoc.tryUpdateWcaData()) await userDoc.save();
    else if (saveIfCreated) await userDoc.save();

    return userDoc;
  }

  /**
   * Resolve a user's lean data by their id
   * @param userId The user's id
   */
  public async resolveUserById(userId: number): Promise<LeanTahashUser | null> {
    const cachedData = this.userDataCache.get(userId);
    if (cachedData) {
      this.userDataCache.delete(userId);
      this.userDataCache.set(userId, cachedData);
      return cachedData;
    }

    // fetch user
    const userData = await TahashUser.findOne({
      "userInfo.id": userId,
    }).lean();
    if (!userData) return null;

    this.addUserToCache(userId, userData);
    return userData;
  }

  /**
   * Hydrate an array of items with userIds with the users' data. Returns the result.
   * - Maintains the order of the original array!
   * - Skips users if they don't exist in the database
   * @param items The array of items to hydrate
   * @param factory The factory used to calculate the data to return
   */
  async hydrateWithUsers<T extends { userId: number }, V>(
    items: T[],
    factory: (item: T, userData: LeanTahashUser) => V,
  ) {
    // Identify missing users
    const missingIds = new Set<number>();
    for (const item of items) {
      if (!this.userDataCache.has(item.userId)) missingIds.add(item.userId);
    }

    // Fetch missing from DB and add to cache
    if (missingIds.size > 0) {
      const dbUsers: LeanTahashUser[] = await TahashUser.find({
        "userInfo.id": { $in: Array.from(missingIds) },
      }).lean();

      for (const user of dbUsers) this.addUserToCache(user.userInfo.id, user);
    }

    const result: V[] = [];
    for (const item of items) {
      const userData = this.userDataCache.get(item.userId);
      if (!userData) continue;

      // Refresh LRU position on access
      this.userDataCache.delete(item.userId);
      this.userDataCache.set(item.userId, userData);

      result.push(factory(item, userData));
    }
    return result;
  }

  /**
   * Get users' data by their ids
   * @param userIds The users' ids
   */
  public async getUsersDataByIds(userIds: number[]): Promise<LeanTahashUser[]> {
    return this.hydrateWithUsers(
      userIds.map((id) => ({ userId: id })),
      (_, userData) => userData,
    );
  }

  /**
   * Resolve a user's lean data by their WCA id
   * @param wcaId The user's WCA id
   */
  async resolveUserByWcaId(wcaId: string): Promise<LeanTahashUser | null> {
    let userId = this.wcaIdCache.get(wcaId);
    if (userId) {
      this.wcaIdCache.delete(wcaId);
      this.wcaIdCache.set(wcaId, userId);
      return await this.resolveUserById(userId);
    }

    const user = await TahashUser.findOne({ "userInfo.wcaId": wcaId }).lean();
    if (!user) return null;

    this.addUserToCache(user.userInfo.id, user);
    return user;
  }

  // update a user's cached data
  updateUserDataCache(userData: LeanTahashUser) {
    const cachedData = this.userDataCache.get(userData.userInfo.id);
    if (cachedData) this.addUserToCache(userData.userInfo.id, userData);
  }
}
