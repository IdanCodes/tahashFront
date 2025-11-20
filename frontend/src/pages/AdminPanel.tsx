import React, { useEffect, useRef, useState } from "react";
import { sendGetRequest, sendPostRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { redirectToError } from "../utils/errorUtils";
import EventBoxes from "../components/EventBoxes";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";
import { useUserInfo } from "../context/UserContext";
import { HttpHeaders } from "@shared/constants/http-headers";
import { SubmissionDataDisplay } from "@shared/interfaces/submission-data-display";
import {
  SubmissionState,
  submissionStateStr,
} from "@shared/constants/submission-state";
import { formatPackedResults } from "@shared/utils/time-utils";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { SubmissionsOverview } from "@shared/types/SubmissionsOverview";
import { useActiveComp } from "../context/ActiveCompContext";

function AdminPanel() {
  const params = useParams();
  const userInfo = useUserInfo();
  const [mode, setMode] = useState<"chooseEvent" | "eventPanel" | null>(null);
  const eventId = useRef<string>("");

  useEffect(() => {
    eventId.current = params.eventId ?? "";
    if (!eventId.current || !userInfo.user) {
      setMode("chooseEvent");
      return;
    }
    setMode("eventPanel");
  }, [params]);

  return (
    <>
      {mode == "chooseEvent" ? (
        <ChooseEventPage />
      ) : mode == "eventPanel" ? (
        <EventPanel eventId={eventId.current} />
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

function ChooseEventPage() {
  const [eventDisplays, setEventDisplays] = useState<EventDisplayInfo[] | null>(
    null,
  );
  const [submissionOverviews, setSubmissionOverviews] = useState<
    SubmissionsOverview[] | null
  >(null);
  const navigate = useNavigate();
  const activeComp = useActiveComp();

  useEffect(() => {
    if (eventDisplays || !activeComp.displayInfo) return;

    sendGetRequest(
      `${RoutePath.Get.EventsAndSubmissionOverviews}/${activeComp.displayInfo.compNumber}`,
    ).then((res) => {
      if (res.aborted) return;
      if (res.isError) return redirectToError(res.data);

      console.log("res.data", res.data);
      const data: (EventDisplayInfo & SubmissionsOverview)[] = res.data;
      setEventDisplays(
        data.map(
          (di): EventDisplayInfo => ({
            eventId: di.eventId,
            eventTitle: di.eventTitle,
            iconName: di.iconName,
          }),
        ),
      );

      setSubmissionOverviews(
        data.map(
          (so): SubmissionsOverview => ({
            overview: so.overview,
          }),
        ),
      );
    });
  }, [activeComp.displayInfo]);

  return (
    <>
      <p className="p-4 text-center text-5xl font-bold">Event Submissions</p>
      {eventDisplays ? (
        <EventBoxes
          events={eventDisplays}
          handleClickEvent={(eventId) => {
            navigate(`/admin-panel/${eventId}`);
          }}
        />
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

function EventPanel({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<
    SubmissionDataDisplay[] | undefined
  >(undefined);
  const [displayInfo, setDisplayInfo] = useState<EventDisplayInfo | undefined>(
    undefined,
  );

  async function initEventPanel() {
    // display info
    const displayInfoRes = await sendGetRequest(
      RoutePath.Get.EventDisplayInfo,
      {
        [HttpHeaders.EVENT_ID]: eventId,
      },
    );
    if (displayInfoRes.aborted) return;
    if (displayInfoRes.isError) redirectToError(displayInfoRes.data);

    setDisplayInfo(displayInfoRes.data);

    // submissions
    sendGetRequest(RoutePath.Get.EventSubmissions, {
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((res) => {
      if (res.aborted) return;
      if (res.isError) return redirectToError(res.data);
      setSubmissions(res.data);
    });
  }

  useEffect(() => {
    if (!eventId) {
      navigate(RoutePath.Page.AdminPanel);
      return;
    }

    initEventPanel().then();
  }, [eventId]);

  return (
    <>
      {displayInfo ? (
        <>
          <p className="p-4 text-center text-5xl font-bold">
            {displayInfo.eventTitle}
          </p>
          {submissions ? (
            <EventSubmissionsPanel
              submissions={submissions}
              eventId={displayInfo.eventId}
            />
          ) : (
            <LoadingSpinner />
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
}

function EventSubmissionsPanel({
  submissions,
  eventId,
}: {
  submissions: SubmissionDataDisplay[];
  eventId: string;
}) {
  const [disableButtons, setDisableButtons] = useState<boolean>(false);
  const submissionStateColor = (state: SubmissionState): string => {
    return state === SubmissionState.Pending
      ? "rgb(255,255,0)"
      : state === SubmissionState.Approved
        ? "rgb(0, 255, 0)"
        : "rgb(255, 0, 0)";
  };

  async function updateSubmissionState(
    userId: number,
    submissionState: SubmissionState,
  ) {
    setDisableButtons(true);
    await sendPostRequest(RoutePath.Post.UpdateSubmissionState, {
      eventId,
      userId,
      submissionState,
    });
    window.location.reload();
  }

  function acceptResult(userId: number) {}

  function rejectResult(userId: number) {}

  return (
    <>
      {submissions.length == 0 ? (
        <p className="text-center text-3xl">
          No submissions for this event yet
        </p>
      ) : (
        <div className="mx-auto mt-2 mb-2 flex w-8/10 flex-wrap place-content-center gap-x-9.5 gap-y-11 pt-10 pb-4">
          {submissions.map((submission, _) => (
            <div
              key={submission.submitterData.id}
              className="flex h-fit w-fit flex-col rounded-xl border-3 bg-gray-400 p-4 text-2xl"
            >
              <span className="">{submission.submitterData.name}</span>
              <span className="">{submission.submitterData.wcaId}</span>
              <span className="">
                State:{" "}
                <span
                  className="font-semibold"
                  style={{
                    color: submissionStateColor(submission.submissionState),
                  }}
                >
                  {submissionStateStr[submission.submissionState]}
                </span>
              </span>
              <span>Times:</span>
              <div className="flex gap-3">
                {formatPackedResults(submission.times).map((t, i) => (
                  <span key={i}>
                    {t}
                    {i < submission.times.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
              <span>Result: {submission.resultStr}</span>
              {submission.submissionState === SubmissionState.Pending && (
                <div className="flex flex-row justify-between px-2">
                  <PrimaryButton
                    text="Accept"
                    colors="bg-[rgb(46,217,46)] hover:bg-[rgb(10,230,10)] active:bg-[rgb(10,210,10)]"
                    onClick={() =>
                      updateSubmissionState(
                        submission.submitterData.id,
                        SubmissionState.Approved,
                      )
                    }
                    disabled={disableButtons}
                  />
                  <PrimaryButton
                    text="Reject"
                    colors="bg-[rgb(217,9,9)] hover:bg-[rgb(230,30,30)] active:bg-[rgb(210,30,30)]"
                    onClick={() =>
                      updateSubmissionState(
                        submission.submitterData.id,
                        SubmissionState.Rejected,
                      )
                    }
                    disabled={disableButtons}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default AdminPanel;
