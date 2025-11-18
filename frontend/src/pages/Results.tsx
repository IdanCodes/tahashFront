/**
 * GET.EventResultsDisplay/:compNumber/:eventId [
 *   {
 *     place: number,
 *     name: string,
 *     best: string,
 *     average: string,
 *     solves: string[]
 *   }
 * ]
 */

import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  EMPTY_DISPLAY_INFO,
  EventDisplayInfo,
} from "@shared/interfaces/event-display-info";
import { EventResultDisplay } from "@shared/types/comp-event-pair";
import { useActiveComp } from "../context/ActiveCompContext";
import {
  EventBox,
  EventBoxIcon,
  EventBoxTitle,
} from "../components/EventBoxes";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { redirectToError } from "../utils/errorUtils";
import { CubingIconsSheet } from "../components/CubingIconsSheet";

function Results() {
  const [currEventIndex, setCurrEventIndex] = useState<number>(0);
  const [eventResults, setEventResults] = useState<EventResultDisplay[] | null>(
    null,
  );
  const activeComp = useActiveComp();
  const currEvent = useMemo<EventDisplayInfo>(
    () =>
      activeComp.displayInfo
        ? activeComp.displayInfo.events[currEventIndex]
        : EMPTY_DISPLAY_INFO,
    [currEventIndex],
  );

  // useEffect(() => {
  //   if (!compDisplay || compDisplay.data.length == 0) {
  //     setCurrEvent(null);
  //     return;
  //   }
  //
  //   const evId = params.eventId;
  //   const eventIndex = compDisplay.data.findIndex(
  //     (pair) => pair.eventDisplay.eventId === evId,
  //   );
  //
  //   if (eventIndex < 0) {
  //     setTimeout(() => (window.location.pathname = "results/333"), 1000);
  //     return;
  //   }
  //
  //   setCurrEvent({
  //     event: compDisplay.data[eventIndex].eventDisplay,
  //     submissions: compDisplay.data[eventIndex].result.submissions,
  //   });
  // }, [compDisplay]);

  // TODO: Add option to abort if the user switches the event mid-fetch
  useEffect(() => {
    if (!activeComp.displayInfo) return;

    setEventResults(null);

    const eventId = activeComp.displayInfo.events[currEventIndex].eventId;
    sendGetRequest(
      `${RoutePath.Get.EventResultDisplays}/${activeComp.displayInfo.compNumber - 1}/${eventId}`,
    ).then((res) => {
      if (res.aborted) return;
      if (res.isError) return redirectToError(res.data);
      setEventResults(res.data);
    });
  }, [currEventIndex, activeComp.displayInfo]);

  if (!activeComp.displayInfo)
    return (
      <>
        <LoadingSpinner />
      </>
    );

  return (
    <div>
      <p className="p-4 text-center text-5xl font-bold">
        Results of Competition #{activeComp.displayInfo.compNumber - 1}
      </p>
      <EventSelection
        events={activeComp.displayInfo.events}
        selectedEventId={currEvent.eventId}
        handleClickEvent={(eventId) => {
          if (eventResults && currEvent.eventId !== eventId)
            setCurrEventIndex(
              activeComp.displayInfo!.events.findIndex(
                (e) => e.eventId === eventId,
              ),
            );
        }}
      />
      {eventResults ? (
        <>
          {eventResults.length > 0 ? (
            <table className="mx-auto my-2 w-8/10 text-2xl">
              <thead>
                <tr className="font-semibold">
                  <td>#</td>
                  <td>Name</td>
                  <td>Best</td>
                  <td>Average</td>
                  <td>Solves</td>
                </tr>
              </thead>
              <tbody>
                {eventResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.place}</td>
                    <td>{result.name}</td>
                    <td>{result.best}</td>
                    <td>{result.average}</td>
                    <td className="flex flex-row justify-between">
                      {result.solves.map((t, i) => (
                        <span key={i}>{t}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-2 text-center text-3xl">
              There were no submissions for this event
            </p>
          )}
        </>
      ) : (
        <>
          <LoadingSpinner />
        </>
      )}
    </div>
  );
}

function EventSelection({
  events,
  selectedEventId,
  handleClickEvent,
}: {
  events: EventDisplayInfo[];
  selectedEventId: string;
  handleClickEvent: (eventIndex: string) => void;
}) {
  return (
    <>
      <CubingIconsSheet />
      <div className="mx-auto flex w-95/100 flex-row flex-wrap place-content-center items-center gap-x-3 gap-y-7 py-4">
        {events.map((info, index) => (
          <EventBox
            key={index}
            handleClickEvent={handleClickEvent}
            das={info}
            boxOptions={{
              size: 2.7,
              fontSize: 1,
              hasBorder: selectedEventId === info.eventId,
              animateHover: false,
            }}
          />
          // <div className="box-border grid place-content-center items-center rounded-2xl">
          //   <EventBoxIcon iconName={info.iconName} size="4rem" />
          //   <EventBoxTitle eventTitle={info.eventTitle} hovered={true} />
          // </div>
        ))}
      </div>
    </>
  );
}

export default Results;
