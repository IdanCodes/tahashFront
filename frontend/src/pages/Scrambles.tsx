import React, { useEffect } from "react";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";

function Scrambles() {
  const [events, setEvents] =
    useSessionStorage<EventDisplayAndStatus[]>("events");

  useEffect(() => {});

  return (
    <div>
      <p className="text-center text-5xl font-bold">Scrambles Page</p>
    </div>
  );
}

export default Scrambles;
