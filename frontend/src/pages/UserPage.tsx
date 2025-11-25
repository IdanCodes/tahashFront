import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { redirectToError } from "../utils/errorUtils";
import { RoutePath } from "@shared/constants/route-path";
import { sendGetRequest } from "../utils/API/apiUtils";
import { errorObject } from "@shared/interfaces/error-object";
import { isWcaIdFormat } from "@shared/interfaces/user-info";
import { CompetitorData } from "@shared/types/competitor-data";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  eventRecordToGeneralRecords,
  GeneralRecord,
} from "@shared/types/event-records";
import { getEventDisplayInfo, getEventFormat } from "@shared/types/comp-event";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { EventBoxIcon } from "../components/EventBoxes";
import { CubingIconsSheet } from "../components/CubingIconsSheet";
import {
  DNF_STRING,
  formatCentis,
  formatPackedResult,
  getPureCentis,
} from "@shared/utils/time-utils";

function UserPage() {
  const params = useParams();
  const navigate = useNavigate();
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

function CompetitorDataPanel({
  competitorData,
}: {
  competitorData: CompetitorData;
}) {
  const records = useMemo<[EventDisplayInfo, GeneralRecord][]>(() => {
    const result: [EventDisplayInfo, GeneralRecord][] = [];

    const entries = Object.entries(competitorData.records);

    for (const [eventId, evRecords] of entries) {
      result.push([
        getEventDisplayInfo(eventId),
        eventRecordToGeneralRecords(getEventFormat(eventId), evRecords),
      ]);
    }

    return result;
  }, [competitorData.records]);

  return (
    <>
      <RecordsPanel records={records} />
    </>
  );
}

function RecordsPanel({
  records,
}: {
  records: [EventDisplayInfo, GeneralRecord][];
}) {
  return (
    <div className="w-full place-items-center">
      <p className="text-4xl font-semibold">Records</p>
      <table className="mx-auto my-2 w-7/10 rounded-t-2xl bg-blue-700/55 text-2xl">
        <thead className="rounded-t-2xl bg-transparent text-[1.655rem] text-white/90">
          <tr>
            <td className="py-2 text-center">Event</td>
            <td className="py-2 text-center">Single</td>
            <td className="text-center">Average</td>
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
                <td className="size-fit py-2">
                  <div className="flex items-baseline justify-center gap-2">
                    {formatPackedResult(record.single)}
                    <p className="text-sm text-gray-400">
                      {record.singleComp == 0 ? "WCA" : record.singleComp}
                    </p>
                  </div>
                </td>
                <td className="flex items-baseline justify-center gap-2">
                  {record.average ? formatCentis(record.average) : DNF_STRING}
                  <p className="text-sm text-gray-400">
                    {record.singleComp == 0 ? "WCA" : record.singleComp}
                  </p>
                </td>
              </tr>
            ))
          ) : (
            <LoadingSpinner />
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserPage;
