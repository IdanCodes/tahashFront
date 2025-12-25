import { SubmissionData } from "@shared/interfaces/submission-data";
import { SubmissionDataDisplay } from "@shared/types/submission-data-display";
import { UserManager } from "../database/users/user-manager";
import { TahashUser } from "../database/models/tahash-user.model";
import {
  formatAttempts,
  getAverageStr,
  getBestResultStr,
} from "@shared/utils/event-results-utils";
import { CompEvent } from "@shared/types/comp-event";

export async function getSubmissionDisplays(
  eventData: CompEvent,
  eventSubmissions: SubmissionData[],
) {
  // Stage 1: fetch users by their ids
  const userIds = eventSubmissions.map((s) => s.userId);
  const usersInfo: {
    id: number;
    wcaId: string;
    name: string;
  }[] = await TahashUser.findUsersByIds(userIds, [
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
  const result: SubmissionDataDisplay[] = [];
  for (const submission of eventSubmissions) {
    const userData = userLookup.get(submission.userId);

    if (userData)
      result.push({
        submitterData: {
          userId: userData.id,
          name: userData.name,
          wcaId: userData.wcaId,
        },
        best: getBestResultStr(eventData, submission.times),
        average: getAverageStr(eventData, submission.times),
        solves: formatAttempts(eventData.timeFormat, submission.times),
        submissionState: submission.submissionState,
      } as SubmissionDataDisplay);
  }

  return result;
}
