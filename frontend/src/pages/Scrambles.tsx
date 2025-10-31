import React, { useEffect, useState } from "react";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { ResponseCode } from "@shared/types/response-code";
import { redirectToError } from "../utils/errorUtils";
import { useLoading } from "../context/LoadingContext";
import EventBoxes from "../components/EventBoxes";

function Scrambles() {
  const [events, setEvents] = useState<EventDisplayAndStatus[] | null>(null);
  const { addLoading, removeLoading } = useLoading("Scrambles");

  useEffect(() => {
    if (events) return;
    addLoading();
    sendGetRequest(RoutePath.Get.EventsDisplayAndStatus).then((res) => {
      removeLoading();
      if (res.aborted) return;
      if (res.code != ResponseCode.Success) return redirectToError(res.data);
      setEvents(res.data as EventDisplayAndStatus[]);
    });
  }, []);

  return (
    <>
      <p className="text-center text-5xl font-bold p-4">Scrambles</p>
      {events ? (
        <div>
          <EventBoxes events={events} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default Scrambles;
