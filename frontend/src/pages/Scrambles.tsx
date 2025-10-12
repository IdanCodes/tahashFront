import React, { useEffect, useRef, useState } from "react";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { ResponseCode } from "@shared/types/response-code";
import { redirectToError } from "../utils/errorUtils";
import { useLoading } from "../context/LoadingContext";
import { useSessionStorage } from "../hooks/useSessionStorage";

function Scrambles() {
  const [events, setEvents] = useSessionStorage<EventDisplayAndStatus[] | null>(
    "events",
  );
  const { addLoading, removeLoading } = useLoading();

  useEffect(() => {
    addLoading();
    if (events) {
      removeLoading();
      return;
    }

    sendGetRequest(RoutePath.Get.EventsDisplayAndStatus).then((res) => {
      removeLoading();
      if (res.code != ResponseCode.Success) return redirectToError(res.data);
      console.log("data:", res.data);
      setEvents(res.data as EventDisplayAndStatus[]);
    });
  }, []);

  return (
    <>
      {events ? (
        <div>
          <p className="text-center text-5xl font-bold">Scrambles</p>

          <div className="mx-auto my-5 flex w-8/10 flex-wrap place-content-center gap-5 gap-x-15">
            {events.map((eds, index) => (
              <div
                key={index}
                className="flex size-25 place-content-center items-center rounded-2xl border-2 border-black"
              >
                <p className="text-center text-xl">Id: {eds.info.eventId}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default Scrambles;
