import { CompEvent } from "@shared/types/comp-event";
import { SubmissionData } from "@shared/interfaces/submission-data";
import { EventResultDisplay } from "@shared/types/event-result-display";
import {
  formatAttempts,
  getAverageStr,
  getBestResultStr,
} from "@shared/utils/event-results-utils";
import { TahashUser } from "../database/models/tahash-user.model";
import { UserManager } from "../database/users/user-manager";

export async function submissionsToResultDisplays(
  eventData: CompEvent,
  eventSubmissions: SubmissionData[],
): Promise<EventResultDisplay[]> {
  await UserManager.getInstance().hydrateWithUsers(
    eventSubmissions,
    (submission, userData) => {
      return {
        place: submission.place,
        name: userData.userInfo.name,
        wcaId: userData.userInfo.wcaId,
        best: getBestResultStr(eventData, submission.times),
        average: getAverageStr(eventData, submission.times),
        solves: formatAttempts(eventData.timeFormat, submission.times),
      } as EventResultDisplay;
    },
  );

  // Stage 1: fetch users by their ids
  const userIds = eventSubmissions.map((s) => s.userId);
  const usersInfo: {
    id: number;
    wcaId: string;
    name: string;
  }[] = await TahashUser.aggregateMatchUsersById(userIds, [
    {
      $project: {
        _id: 0,
        id: "$userInfo.id",
        wcaId: "$userInfo.wcaId",
        name: "$userInfo.name",
      },
    },
  ]);

  // lookup map for O(1) lookups
  const userLookup = new Map(usersInfo.map((user) => [user.id, user]));

  // Stage 2: iterate over submissions and map to users
  const result: EventResultDisplay[] = [];
  for (const submission of eventSubmissions) {
    const userData = userLookup.get(submission.userId);

    if (userData)
      result.push({
        place: submission.place,
        name: userData.name,
        wcaId: userData.wcaId,
        best: getBestResultStr(eventData, submission.times),
        average: getAverageStr(eventData, submission.times),
        solves: formatAttempts(eventData.timeFormat, submission.times),
      } as EventResultDisplay);
  }

  return result;
}
