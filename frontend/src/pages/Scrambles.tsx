import React, { useEffect } from "react";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";
import { EventId } from "@shared/types/comp-event";

function Scrambles() {
  const [events, setEvents] =
    useSessionStorage<
      Record<EventId, { info: EventDisplayInfo; status: EventSubmissionStatus }>
    >("events");

  useEffect(() => {});

  return (
    <div>
      <p className="text-center text-5xl font-bold">Scrambles Page</p>
    </div>
  );
}

export default Scrambles;
