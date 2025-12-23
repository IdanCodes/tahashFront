import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { CubingIconsSheet } from "./CubingIconsSheet";
import { EventBox } from "./EventBoxes";
import React from "react";

export default function EventSelection({
  events,
  selectedEventId,
  handleClickEvent,
}: {
  events: EventDisplayInfo[];
  selectedEventId: string;
  handleClickEvent: (eventId: string) => void;
}) {
  return (
    <>
      <CubingIconsSheet />
      <div className="mx-auto flex w-95/100 flex-row flex-wrap place-content-center items-center gap-x-2.5 gap-y-7 py-4 pt-5">
        {events.map((info, index) => (
          <EventBox
            key={index}
            handleClickEvent={handleClickEvent}
            das={info}
            boxOptions={{
              size: 3.15,
              fontSize: 1,
              hasBorder: selectedEventId === info.eventId,
              animateHover: false,
            }}
          />
        ))}
      </div>
    </>
  );
}
