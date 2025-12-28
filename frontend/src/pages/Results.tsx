import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  EMPTY_DISPLAY_INFO,
  EventDisplayInfo,
} from "@shared/interfaces/event-display-info";
import { useActiveComp } from "../context/ActiveCompContext";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { redirectToError } from "../utils/errorUtils";
import { EventResultDisplay } from "@shared/types/event-result-display";
import EventSelection from "../components/EventSelection";
import { useUserInfo } from "../context/UserContext";
import clsx from "clsx";

function Results() {
  const userInfo = useUserInfo();
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
    [currEventIndex, eventResults],
  );
  const rowWithUser = useMemo<number>(
    () =>
      eventResults && userInfo.user
        ? eventResults.findIndex((er) => er.wcaId === userInfo.user!.wcaId)
        : -1,
    [eventResults, currEvent, userInfo],
  );

  // TODO: Add option to abort if the user switches the event mid-fetch
  useEffect(() => {
    if (!activeComp.displayInfo) return;

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
      <h1 className="mt-5 mb-2 text-center text-4xl font-bold">
        Results of Competition #{activeComp.displayInfo.compNumber - 1}
      </h1>
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
      <p className="text-center text-4xl font-semibold">
        {currEvent.eventTitle}
      </p>
      {eventResults ? (
        <>
          {eventResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="mx-auto my-2 w-85/100 table-auto rounded-t-2xl bg-blue-700/55 text-xl">
                <thead className="rounded-t-2xl bg-transparent text-[clamp(1.1rem,2vw,1.6rem)] text-white/90">
                  <tr className="font-semibold">
                    <th className="pl-4">#</th>
                    <th className="py-2">Name</th>
                    <th className="px-2 py-2">Best</th>
                    <th className="py-2">Average</th>
                    <th className="text-center">Solves</th>
                  </tr>
                </thead>
                <tbody>
                  {eventResults.map((result, index) => (
                    <tr
                      key={index}
                      className={clsx(
                        "font-mono text-[clamp(1rem,1.8vw,1.5rem)]",
                        index === rowWithUser && "bg-blue-300/90",
                        index !== rowWithUser &&
                          "odd:!bg-slate-50 even:!bg-slate-200",
                      )}
                    >
                      <td className="pr-1 pl-2 text-center text-[clamp(1.1rem,1.8vw,1.5rem)]">
                        {result.place}
                      </td>
                      <td className="py-2 text-center">
                        <a href={`/user/${result.wcaId}`} className="underline">
                          {result.name}
                        </a>
                      </td>
                      <td className="py-2 text-center">{result.best}</td>
                      <td className="py-2 text-center">{result.average}</td>
                      <td>
                        <div className="flex flex-row justify-center gap-3 p-1 xl:gap-8">
                          {result.solves.map((t, i) => (
                            <span key={i} className="">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-2 text-center text-[clamp(1.5rem,2vw,1.875rem)]">
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

export default Results;
