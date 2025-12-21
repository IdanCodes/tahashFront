import { SubmissionData } from "@shared/interfaces/submission-data";
import { SubmissionDataDisplay } from "@shared/interfaces/submission-data-display";
import { UserManager } from "../database/users/user-manager";

export async function getSubmissionDisplay(
  submission: SubmissionData,
): Promise<SubmissionDataDisplay | undefined> {
  const userInfo = await UserManager.getInstance().getUserInfoById(
    submission.userId,
  );

  return userInfo
    ? ({
        submissionState: submission.submissionState,
        times: submission.times,
        single: submission.single,
        average: submission.average,
        submitterData: userInfo,
        place: submission.place ?? undefined,
      } as SubmissionDataDisplay)
    : undefined;
}

export async function getSubmissionDisplays(
  eventSubmissions: SubmissionData[],
) {
  const displays: SubmissionDataDisplay[] = [];
  for (const submission of eventSubmissions) {
    const newDisplay = await getSubmissionDisplay(submission);
    if (newDisplay) displays.push(newDisplay);
    else
      console.warn(
        `Could not find user ${submission.userId} when constructing SubmissionDataDisplay for getSubmissionDisplays; skipping`,
      );
  }

  return displays;
}
