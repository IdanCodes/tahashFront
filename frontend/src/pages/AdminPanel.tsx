import React, { useEffect, useRef, useState } from "react";
import { sendGetRequest, sendPostRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { redirectToError } from "../utils/errorUtils";
import { EventBox } from "../components/EventBoxes";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";
import { useUserInfo } from "../context/UserContext";
import { HttpHeaders } from "@shared/constants/http-headers";
import { SubmissionDataDisplay } from "@shared/types/submission-data-display";
import {
  SubmissionState,
  submissionStateStr,
} from "@shared/constants/submission-state";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { SubmissionsOverview } from "@shared/types/SubmissionsOverview";
import { useActiveComp } from "../context/ActiveCompContext";
import { CubingIconsSheet } from "../components/CubingIconsSheet";
import { errorObject } from "@shared/interfaces/error-object";
import { ButtonSize } from "../components/buttons/ButtonSize";

function AdminPanel() {
  const params = useParams();
  const userInfo = useUserInfo();
  const [mode, setMode] = useState<"chooseEvent" | "eventPanel" | null>(null);
  const eventId = useRef<string>("");
  const navigate = useNavigate();

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
        <>
          <EventPanel
            eventId={eventId.current}
            onBack={() => navigate(RoutePath.Page.AdminPanel)}
          />
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

// TODO: forward a ref of the EventDisplayInfo to the AdminPanel, which will then be passed into the EventPanel so it won't have to re-fetch the display info
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
      <CubingIconsSheet />
      <p className="p-4 text-center text-5xl font-bold">Event Submissions</p>
      {eventDisplays && submissionOverviews ? (
        <div className="mx-auto mt-2 mb-2 flex w-8/10 flex-wrap place-content-center gap-x-9.5 gap-y-13 pt-6 pb-4">
          {eventDisplays.map((info, index) => (
            <div key={index}>
              <EventBox
                handleClickEvent={(eventId) => {
                  navigate(`/admin-panel/${eventId}`);
                }}
                das={info}
              />
              <OverviewTexts overview={submissionOverviews[index].overview} />
            </div>
          ))}
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

function OverviewTexts({ overview }: { overview: number[] }) {
  return (
    <div className="flex justify-between py-1 text-2xl font-bold text-shadow-sm">
      <span className="text-yellow-500">
        {overview[SubmissionState.Pending].toString()}
      </span>
      <span className="text-green-500">
        {overview[SubmissionState.Approved]}
      </span>
      <span className="text-red-600">{overview[SubmissionState.Rejected]}</span>
    </div>
  );
}

function EventPanel({
  eventId,
  onBack,
}: {
  eventId: string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<
    SubmissionDataDisplay[] | undefined
  >(undefined);
  const [eventDisplay, setEventDisplay] = useState<
    EventDisplayInfo | undefined
  >(undefined);

  async function initEventPanel() {
    // submissions
    sendGetRequest(RoutePath.Get.EventSubmissions, {
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((res) => {
      if (res.aborted) return;
      if (res.isError) return redirectToError(res.data);
      setSubmissions(
        (res.data as SubmissionDataDisplay[]).toSorted((a, b) =>
          a.submissionState === SubmissionState.Pending ? -1 : 1,
        ),
      );
    });

    // display info
    sendGetRequest(RoutePath.Get.EventDisplayInfo, {
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((displayInfoRes) => {
      if (displayInfoRes.aborted) return;
      if (displayInfoRes.isError) return redirectToError(displayInfoRes.data);
      setEventDisplay(displayInfoRes.data);
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
      <CubingIconsSheet />
      {eventDisplay ? (
        <>
          <div className="mx-auto mt-4 grid w-11/12 grid-cols-[auto_1fr] items-center gap-4">
            <PrimaryButton content="Back" onClick={onBack} />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-2 text-5xl text-blue-950">
                <p className="font-bold">{eventDisplay.eventTitle}</p>
                <span className={`cubing-icon ${eventDisplay.iconName}`} />
              </div>

              {submissions?.length === 0 && (
                <p className="mt-2 text-center text-3xl">
                  No submissions for this event yet
                </p>
              )}
            </div>
          </div>
          {submissions ? (
            <EventSubmissionsPanel
              setSubmissionState={(userId, state) => {
                setSubmissions((prev) =>
                  prev?.map((sub) =>
                    sub.submitterData.userId === userId
                      ? { ...sub, submissionState: state }
                      : sub,
                  ),
                );
              }}
              submissions={submissions}
              eventId={eventDisplay.eventId}
            />
          ) : (
            <LoadingSpinner />
          )}
        </>
      ) : (
        <>
          <LoadingSpinner />
        </>
      )}
    </>
  );
}

function EventSubmissionsPanel({
  submissions,
  setSubmissionState,
  eventId,
}: {
  submissions: SubmissionDataDisplay[];
  setSubmissionState: (userId: number, state: SubmissionState) => void;
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
    newState: SubmissionState,
  ) {
    setDisableButtons(true);
    const res = await sendPostRequest(RoutePath.Post.UpdateSubmissionState, {
      eventId,
      userId,
      submissionState: newState,
    });
    if (res.aborted) return;
    if (res.isError)
      return redirectToError(
        errorObject("Couldn't update submission's state.", res.data),
      );
    setSubmissionState(userId, newState);
    setDisableButtons(false);
  }

  function acceptResult(userId: number) {}

  function rejectResult(userId: number) {}

 return (
  <>
    <div className="mx-auto mt-2 mb-2 flex w-8/10 flex-wrap place-content-center gap-x-9.5 gap-y-11 pt-10 pb-4">
      {submissions.map((submission) => (
        <div
          key={submission.submitterData.userId}
          className="flex h-fit w-fit flex-col rounded-xl border-3 bg-gray-400 p-4 text-lg lg:text-2xl"
        >
          <a
            href={`/user/${submission.submitterData.wcaId}`}
            target="_blank"
            className="w-fit underline"
          >
            {submission.submitterData.name}
          </a>

          <span>
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
            {submission.solves.map((t, i) => (
              <span key={i}>
                {t}
                {i < submission.solves.length - 1 ? "," : ""}
              </span>
            ))}
          </div>

          <span>Single: {submission.best}</span>
          <span>Average: {submission.average}</span>

          {submission.submissionState === SubmissionState.Pending && (
            <div className="flex justify-between px-2">
              <PrimaryButton
                content="Accept"
                colors="bg-[rgb(46,217,46)] hover:bg-[rgb(10,230,10)] active:bg-[rgb(10,210,10)]"
                onClick={() =>
                  updateSubmissionState(
                    submission.submitterData.userId,
                    SubmissionState.Approved,
                  )
                }
                disabled={disableButtons}
                buttonSize={ButtonSize.Small}
              />
              <PrimaryButton
                content="Reject"
                colors="bg-[rgb(217,9,9)] hover:bg-[rgb(230,30,30)] active:bg-[rgb(210,30,30)]"
                onClick={() =>
                  updateSubmissionState(
                    submission.submitterData.userId,
                    SubmissionState.Rejected,
                  )
                }
                disabled={disableButtons}
                buttonSize={ButtonSize.Small}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);
}


export default AdminPanel;
