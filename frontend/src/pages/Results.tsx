import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { motion, AnimatePresence } from "motion/react";
import { CompDisplayInfo } from "@shared/interfaces/comp-display-info";
import { useParams } from "react-router-dom";
import { ResponseCode } from "@shared/types/response-code";
import { errorObject } from "@shared/interfaces/error-object";

export function ResultsOfComp() {}

export function Results() {
  const activeComp = useActiveComp();
  const [compDisplayInfo, setCompDisplayInfo] =
    useState<CompDisplayInfo | null>(null);
  const { compIdParam } = useParams();
  const [currCompId, setCurrCompId] = useState(-1);
  const earliestComp = useRef<number>(0);
  const latestComp = useRef<number>(0);

  useEffect(() => {
    sendGetRequest(RoutePath.Get.FirstAccessibleCompNumber).then((res) => {
      if (res.code != ResponseCode.Success) return redirectToError(res.data);
      earliestComp.current = res.data;
    });
  }, []);

  useEffect(() => {
    if (!activeComp.displayInfo) return;
    latestComp.current = activeComp.displayInfo.compNumber - 1;

    const parsedParam = compIdParam ? parseInt(compIdParam) : NaN;
    if (Number.isNaN(parsedParam) || parsedParam <= 0)
      setCurrCompId(activeComp.displayInfo.compNumber - 1);
    else setCurrCompId(parsedParam);
  }, [activeComp, activeComp.displayInfo]);

  useEffect(() => {
    if (!activeComp.displayInfo || currCompId < 0) return;
    if (currCompId < earliestComp.current) {
      redirectToError(
        errorObject(
          `Invalid comp number "${currCompId}". Earliest accessible comp is ${earliestComp.current}.`,
        ),
      );
      return;
    }
    if (currCompId > latestComp.current) {
      redirectToError(
        errorObject(
          `Invalid comp number "${currCompId}". Latest accessible comp is ${latestComp.current}.`,
        ),
      );
      return;
    }

    sendGetRequest(`${RoutePath.Get.CompDisplayInfo}/${currCompId}`).then(
      (res) => {
        if (res.aborted) return;
        if (res.code != ResponseCode.Success) return redirectToError(res.data);
        setCompDisplayInfo(res.data);
      },
    );
  }, [currCompId, activeComp, activeComp.displayInfo]);

  if (currCompId < 0 || !compDisplayInfo) return <LoadingSpinner />;
  return <ShowResults compDisplayInfo={compDisplayInfo} />;
}

function ShowResults({
  compDisplayInfo,
}: {
  compDisplayInfo: CompDisplayInfo;
}) {
  const userInfo = useUserInfo();
  const [currEventIndex, setCurrEventIndex] = useState<number>(0);
  const [eventResults, setEventResults] = useState<EventResultDisplay[] | null>(
    null,
  );
  const currEvent = useMemo<EventDisplayInfo>(
    () =>
      compDisplayInfo
        ? compDisplayInfo.events[currEventIndex]
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
    if (!compDisplayInfo) return;

    const eventId = compDisplayInfo.events[currEventIndex].eventId;
    sendGetRequest(
      `${RoutePath.Get.EventResultDisplays}/${compDisplayInfo.compNumber}/${eventId}`,
    ).then((res) => {
      if (res.aborted) return;
      if (res.isError) return redirectToError(res.data);
      setEventResults(res.data);
    });
  }, [currEventIndex, compDisplayInfo]);

  if (!compDisplayInfo)
    return (
      <>
        <LoadingSpinner />
      </>
    );

  return (
    <div>
      <h1 className="mt-5 mb-2 text-center text-4xl font-bold">
        Results of Competition #{compDisplayInfo.compNumber}
      </h1>
      <EventSelection
        events={compDisplayInfo.events}
        selectedEventId={currEvent.eventId}
        handleClickEvent={(eventId) => {
          if (eventResults && currEvent.eventId == eventId) return;
          setEventResults(null);
          setCurrEventIndex(
            compDisplayInfo!.events.findIndex((e) => e.eventId === eventId),
          );
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currEvent.eventId}`}
          transition={{ duration: 0.1 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <p className="text-center text-4xl font-semibold">
            {currEvent.eventTitle}
          </p>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currEvent.eventId}
          transition={{ duration: 0.1, delay: 0.04 }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
        >
          {eventResults ? (
            <ResultsTable
              eventResults={eventResults}
              rowWithUser={rowWithUser}
            />
          ) : (
            <>
              <LoadingSpinner />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ResultsTable({
  eventResults,
  rowWithUser,
}: {
  eventResults: EventResultDisplay[];
  rowWithUser: number;
}) {
  return (
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
  );
}

export default Results;
