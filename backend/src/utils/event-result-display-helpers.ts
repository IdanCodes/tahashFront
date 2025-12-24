// null if userId is invalid
import { CompEvent } from "@shared/types/comp-event";
import { SubmissionData } from "@shared/interfaces/submission-data";
import { EventResultDisplay } from "@shared/types/event-result-display";
import { UserManager } from "../database/users/user-manager";
import {
  formatAttempts,
  getAverageStr,
  getBestResultStr,
} from "@shared/utils/event-results-utils";

export async function submissionToResultDisplay(
  eventData: CompEvent,
  submission: SubmissionData,
): Promise<EventResultDisplay | null> {
  const userInfo = await UserManager.getInstance().getUserInfoById(
    submission.userId,
  );
  if (!userInfo) return null;

  return {
    place: submission.place,
    name: userInfo.name,
    wcaId: userInfo.wcaId,
    best: getBestResultStr(eventData, submission.times),
    average: getAverageStr(eventData, submission.times),
    solves: formatAttempts(eventData.timeFormat, submission.times),
  } as EventResultDisplay;
}

export async function submissionsToResultDisplays(
  eventData: CompEvent,
  eventSubmissions: SubmissionData[],
): Promise<EventResultDisplay[]> {
  const result: EventResultDisplay[] = [];

  for (let i = 0; i < eventSubmissions.length; i++) {
    const resultDisplay = await submissionToResultDisplay(
      eventData,
      eventSubmissions[i],
    );
    if (resultDisplay) result.push(resultDisplay);
  }

  return result;
}
