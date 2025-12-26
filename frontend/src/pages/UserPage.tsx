import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { redirectToError } from "../utils/errorUtils";
import { RoutePath } from "@shared/constants/route-path";
import { sendGetRequest } from "../utils/API/apiUtils";
import { errorObject } from "@shared/interfaces/error-object";
import { isWcaIdFormat } from "@shared/interfaces/user-info";
import { CompetitorData } from "@shared/types/competitor-data";
import LoadingSpinner from "../components/LoadingSpinner";
import wcaLogo from "@assets/WCALogo.png";
import {
  eventRecordToGeneralRecords,
  GeneralRecord,
} from "@shared/types/event-records";
import {
  CompEvent,
  getEventById,
  getEventDisplayInfo,
  getEventFormat,
} from "@shared/types/comp-event";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { EventBoxIcon } from "../components/EventBoxes";
import { CubingIconsSheet } from "../components/CubingIconsSheet";
import { formatCentis, getPureCentis } from "@shared/utils/time-utils";
import { PackedResult } from "@shared/interfaces/packed-result";
import { isInteger, isNumber } from "@shared/utils/global-utils";
import {
  formatAttempts,
  getAverageStr,
  getBestResultStr,
} from "@shared/utils/event-results-utils";
import EventSelection from "../components/EventSelection";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { motion } from "motion/react";

function UserPage() {
  const params = useParams();
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(
    null,
  );

  useEffect(() => {
    const wcaId = params.wcaId?.toUpperCase();
    if (!wcaId || !isWcaIdFormat(wcaId)) {
      redirectToError(
        errorObject(
          "Invalid user id",
          wcaId ? `"${wcaId}" is not a valid user id` : undefined,
        ),
      );
      return;
    }

    sendGetRequest(`${RoutePath.Get.CompetitorData}/${wcaId}`).then((res) => {
      if (res.aborted) return;
      if (res.isError)
        return redirectToError(
          errorObject("Error fetching competitor data", res.data),
        );
      setCompetitorData(res.data);
    });
  }, [params]);

  return (
    <>
      <CubingIconsSheet />
      {competitorData ? (
        <CompetitorDataPanel competitorData={competitorData} />
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

// <compNumber, {place, times}>
type PastEventResults = Map<number, { place: number; times: PackedResult[] }>;

function CompetitorDataPanel({
  competitorData,
}: {
  competitorData: CompetitorData;
}) {
  // Map<EventId, EventRecords> => [EventDisplayInfo, GeneralRecord][]
  const records = useMemo<[EventDisplayInfo, GeneralRecord][]>(() => {
    return competitorData.records.map(([eventId, evRecords]) => [
      getEventDisplayInfo(eventId),
      eventRecordToGeneralRecords(getEventFormat(eventId), evRecords),
    ]);
  }, [competitorData.records]);

  // Map<compNumber, PastCompResults> => [CompEvent, Map<compNumber, {place: number, times: PackedResult[] }>][]
  const pastResults = useMemo<[CompEvent, PastEventResults][]>(() => {
    const result: [CompEvent, PastEventResults][] = [];

    for (let i = competitorData.pastResults.length - 1; i >= 0; i--) {
      const [compNumberStr, results] = competitorData.pastResults[i];
      const compNumber = Number(compNumberStr);
      if (!isNumber(compNumberStr) || !isInteger(compNumber) || compNumber < 0)
        continue;

      for (const [eventId, resultData] of Object.entries(results)) {
        const eventIndex = result.findIndex(
          ([di, _]) => di.eventId === eventId,
        );
        if (eventIndex >= 0) result[eventIndex][1].set(compNumber, resultData);
        else {
          const compEvent = getEventById(eventId);
          if (!compEvent) continue;

          result.push([
            compEvent,
            new Map([[compNumber, resultData]]) as PastEventResults,
          ]);
        }
      }
    }

    return result;
  }, [competitorData.pastResults]);

  return (
    <>
      {/* Name and WCA link */}
      <div className="my-2 mb-3 flex flex-col justify-center">
        <span className="p-2 text-center text-4xl font-[450]">
          {competitorData.userInfo.name}
        </span>

        <div className="m-auto">
          <a
            href={`https://www.worldcubeassociation.org/persons/${competitorData.userInfo.wcaId}`}
          >
            <PrimaryButton
              content={
                <div className="flex flex-row gap-2">
                  <p
                    className="my-auto"
                    style={{ fontSize: "1.35rem", fontWeight: "475" }}
                  >
                    {competitorData.userInfo.wcaId}
                  </p>
                  <img
                    src={wcaLogo}
                    alt="World Cube Association Logo"
                    width={28}
                  />
                </div>
              }
              buttonSize={ButtonSize.Small}
            />
          </a>
        </div>
      </div>

      {/* Records panel */}
      <div className="py-2">
        <p className="text-center text-4xl font-semibold">Records</p>
        <RecordsPanel records={records} />
      </div>

      {/* Results History */}
      <div className="py-2">
        <p className="pt-2 pb-1 text-center text-4xl font-semibold">
          Results History
        </p>
        <PastResultsPanel pastResults={pastResults} />
      </div>

      <UserPageEE wcaId={competitorData.userInfo.wcaId} />
    </>
  );
}

function RecordsPanel({
  records,
}: {
  records: [EventDisplayInfo, GeneralRecord][];
}) {
  return records.length > 0 ? (
    <div className="w-full place-items-center">
      <table className="mx-auto my-2 w-7/10 rounded-t-2xl bg-blue-700/55 text-2xl">
        <thead className="rounded-t-2xl bg-transparent text-[1.655rem] text-white/90">
          <tr>
            <th className="py-2 text-center">Event</th>
            <th className="py-2 text-center">Single</th>
            <th className="py-2 text-center">Average</th>
          </tr>
        </thead>
        <tbody>
          {records ? (
            records.map(([displayInfo, record], index) => (
              <tr
                key={index}
                className="font-mono odd:!bg-slate-50 even:!bg-slate-200"
              >
                <td className="flex justify-center gap-1.5 py-2">
                  <EventBoxIcon
                    iconName={displayInfo.iconName}
                    size={"1.5rem"}
                  />
                  <p className="text-center">{displayInfo.eventTitle}</p>
                </td>
                <td className="size-fit py-2 text-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <RecordLabel
                      timeCentis={getPureCentis(record.single)}
                      compNum={record.singleComp}
                    />
                  </div>
                </td>
                <td className="flex items-baseline justify-center gap-2">
                  <RecordLabel
                    timeCentis={record.average}
                    compNum={record.averageComp}
                  />
                </td>
              </tr>
            ))
          ) : (
            <LoadingSpinner />
          )}
        </tbody>
      </table>
    </div>
  ) : (
    <>
      <p></p>
    </>
  );

  function RecordLabel({
    timeCentis,
    compNum,
  }: {
    timeCentis: number;
    compNum: number;
  }) {
    return (
      <>
        {formatCentis(timeCentis)}
        <p className="text-sm text-gray-400">
          {!compNum || compNum === 0 ? "WCA" : compNum}
        </p>
      </>
    );
  }
}

function PastResultsPanel({
  pastResults,
}: {
  pastResults: [CompEvent, PastEventResults][];
}) {
  if (pastResults.length == 0)
    return <p className="text-center text-2xl">No past results</p>;

  const [selectedEventId, setSelectedEventId] = useState<string>(
    () => pastResults[0][0].eventId,
  );

  const events: EventDisplayInfo[] = useMemo<EventDisplayInfo[]>(
    () => pastResults.map(([ce, _]) => ce.displayInfo),
    [pastResults],
  );
  const currEventIndex = useMemo<number>(
    () => events.findIndex((ce) => ce.eventId === selectedEventId),
    [events, selectedEventId],
  );
  const resultEntries = useMemo<
    [number, { place: number; times: PackedResult[] }][]
  >(() => [...pastResults[currEventIndex][1].entries()], [currEventIndex]);

  const eventData = useMemo<CompEvent>(
    () => pastResults[currEventIndex][0],
    [pastResults, currEventIndex],
  );

  return (
    <>
      <div className="w-full place-items-center py-2">
        <EventSelection
          events={events}
          selectedEventId={selectedEventId}
          handleClickEvent={(eventId) => {
            setSelectedEventId(eventId);
          }}
        />
        <div className="min-h-[40vh] w-full">
          <table className="mx-auto my-2 w-8/10 rounded-t-2xl bg-blue-700/55 text-2xl">
            <thead className="rounded-t-2xl bg-transparent text-[1.655rem] text-white/90">
              <tr>
                <th className="pl-4 text-center">Comp</th>
                <th className="py-2 text-center">Place</th>
                <th className="py-2 text-center">Single</th>
                <th className="py-2 text-center">Average</th>
                <th className="py-2 text-center">Solves</th>
              </tr>
            </thead>
            <tbody>
              {resultEntries ? (
                resultEntries.map(([compNumber, result], index) => (
                  <tr
                    key={index}
                    className="text-center font-mono odd:!bg-slate-50 even:!bg-slate-200"
                  >
                    <TableData>{compNumber}</TableData>
                    <TableData>#{result.place.toString()}</TableData>
                    <TableData>
                      {getBestResultStr(eventData, result.times)}
                    </TableData>
                    <TableData>
                      {getAverageStr(eventData, result.times)}
                    </TableData>
                    <TableData>
                      <div className="flex w-[90%] justify-evenly py-2 text-center">
                        {formatAttempts(eventData.timeFormat, result.times).map(
                          (str, index) => (
                            <span key={index}>{str}</span>
                          ),
                        )}
                      </div>
                    </TableData>
                  </tr>
                ))
              ) : (
                // pastResults.map(([displayInfo, results], index) => (
                //   <tr
                //     key={index}
                //     className="font-mono odd:!bg-slate-50 even:!bg-slate-200"
                //   >
                //     <td className="flex justify-center gap-1.5 py-2">
                //       <EventBoxIcon
                //         iconName={displayInfo.iconName}
                //         size={"1.5rem"}
                //       />
                //       <p className="text-center">{displayInfo.eventTitle}</p>
                //     </td>
                //     <td className="size-fit py-2">
                //       <div className="flex items-baseline justify-center gap-2">
                //         <RecordLabel
                //           timeCentis={getPureCentis(record.single)}
                //           compNum={record.singleComp}
                //         />
                //       </div>
                //     </td>
                //     <td className="flex items-baseline justify-center gap-2">
                //       <RecordLabel
                //         timeCentis={record.average}
                //         compNum={record.averageComp}
                //       />
                //     </td>
                //   </tr>
                // ))
                <LoadingSpinner />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  function TableData({ children }: { children: ReactNode }) {
    return (
      <td>
        <div className="justify-center gap-2">{children}</div>
      </td>
    );
  }
}

function UserPageEE({ wcaId }: { wcaId: string }) {
  const [isDisabled, setIsDisabled] = useState(false);
  const showEE = useMemo<boolean>(
    () =>
      ["2022HOTE01", "2019SAHA01", "2019TARA03", "2022ATSM01"].includes(wcaId),
    [wcaId],
  );

  return !isDisabled && showEE ? (
    <motion.img
      src={new URL(`../assets/ee/${wcaId}.jpg`, import.meta.url).href}
      width={150}
      alt="EE-Image"
      animate={{
        rotate: [0, 30, -10, 10, -30, 0, 30, -40, -30, -10, 20, 0],
        x: [150, 350, 400, 600, 400, 300, 250, 400, 300, 200, 120, 150],
        y: [-100, -250, -50, -175, -75, -100, -130, -170, -130, -90, -120, -90],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      onClick={() => {
        setIsDisabled(true);
      }}
    />
  ) : (
    <></>
  );
}

export default UserPage;
