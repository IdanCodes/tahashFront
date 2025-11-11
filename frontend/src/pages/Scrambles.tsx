import React, { useEffect, useState } from "react";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { ResponseCode } from "@shared/types/response-code";
import { redirectToError } from "../utils/errorUtils";
import { useLoading } from "../context/LoadingContext";
import EventBoxes from "../components/EventBoxes";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

function Scrambles() {
  const [events, setEvents] = useState<EventDisplayAndStatus[] | null>(null);
  const { addLoading, removeLoading } = useLoading("Scrambles");
  const navigate = useNavigate();

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
      <p className="p-4 text-center text-5xl font-bold">Scrambles</p>
      {events ? (
        <EventBoxes
          events={events}
          handleClickEvent={(eventId) => navigate(`/compete/${eventId}`)}
        />
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

export default Scrambles;
