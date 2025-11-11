import React, { useEffect, useRef, useState } from "react";
import { sendGetRequest } from "../utils/API/apiUtils";
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
  const [eventDisplays, setEventDisplays] = useState<
    EventDisplayAndStatus[] | null
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (eventDisplays) return;

    sendGetRequest(RoutePath.Get.CompEventsDisplays).then((res) => {
      if (res.aborted) return;
      if (res.isError) {
        redirectToError(res.data);
        return;
      }

      const eventDIs: EventDisplayInfo[] = res.data as EventDisplayInfo[];
      setEventDisplays(
        eventDIs.map(
          (di): EventDisplayAndStatus => ({
            info: di,
            status: EventSubmissionStatus.NotStarted,
          }),
        ),
      );
    });
  }, []);

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
        <p className="p-4 text-center text-5xl font-bold">
          {displayInfo.eventTitle}
        </p>
      ) : (
        <></>
      )}
      {submissions ? (
        <EventSubmissionsPanel submissions={submissions} />
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

function EventSubmissionsPanel({
  submissions,
}: {
  submissions: SubmissionDataDisplay[];
}) {
  return (
    <>
      {submissions.length == 0 ? (
        <p className="text-center text-3xl">
          No submissions for this event yet
        </p>
      ) : (
        <div>
          {submissions.map((submission, _) => (
            <div key={submission.submitterData.id}></div>
          ))}
        </div>
      )}
    </>
  );
}

export default AdminPanel;
