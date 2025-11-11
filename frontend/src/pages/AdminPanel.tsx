import React, { useEffect, useState } from "react";
import { SubmissionData } from "@shared/interfaces/submission-data";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { redirectToError } from "../utils/errorUtils";
import EventBoxes from "../components/EventBoxes";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminPanel() {
  const [eventDisplays, setEventDisplays] = useState<
    EventDisplayAndStatus[] | null
  >(null);

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
      <p className="p-4 text-center text-5xl font-bold">Admin Panel</p>
      {eventDisplays ? (
        <EventBoxes events={eventDisplays} handleClickEvent={() => {}} />
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

export default AdminPanel;
