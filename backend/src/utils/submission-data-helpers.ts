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
import { EventResultDisplay } from "@shared/types/event-result-display";

export async function getSubmissionDisplays(
  eventData: CompEvent,
  eventSubmissions: SubmissionData[],
) {
  return await UserManager.getInstance().hydrateWithUsers(
    eventSubmissions,
    (submission, userData) => {
      return {
        submitterData: {
          userId: userData.userInfo.id,
          name: userData.userInfo.name,
          wcaId: userData.userInfo.wcaId,
        },
        best: getBestResultStr(eventData, submission.times),
        average: getAverageStr(eventData, submission.times),
        solves: formatAttempts(eventData.timeFormat, submission.times),
        submissionState: submission.submissionState,
      } as SubmissionDataDisplay;
    },
  );
}
