import React, { useEffect, useState } from "react";
import { CompDisplayData } from "@shared/interfaces/comp-display-data";
import { useLoading } from "../context/LoadingContext";
import { sendGetRequest } from "../utils/API/apiUtils";
import { RoutePath } from "@shared/constants/route-path";
import { redirectToError } from "../utils/errorUtils";
import LoadingSpinner from "../components/LoadingSpinner";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { SubmissionDisplayNoState } from "@shared/types/comp-event-pair";
import { useParams } from "react-router-dom";
import {
  formatAttempts,
  getMinResult,
} from "@shared/utils/event-results-utils";
import { formatPackedResult, getPureCentis } from "@shared/utils/time-utils";
import { getEventById } from "@shared/types/comp-event";
import { TimeFormat } from "@shared/constants/time-formats";

function Results() {
  const [compDisplay, setCompDisplay] = useState<CompDisplayData | null>(null);
  const [currEvent, setCurrEvent] = useState<{
    event: EventDisplayInfo;
    submissions: SubmissionDisplayNoState[];
  } | null>(null);
  const { addLoading, removeLoading } = useLoading("results");
  const params = useParams();

  useEffect(() => {
    if (compDisplay) return;

    addLoading();
    sendGetRequest(RoutePath.Get.LastCompDisplayData).then((res) => {
      removeLoading();
      if (res.aborted) return;
      if (res.isError) return redirectToError(res.data);
      setCompDisplay(res.data);
    });
  }, []);

  useEffect(() => {
    if (!compDisplay || compDisplay.data.length == 0) {
      setCurrEvent(null);
      return;
    }

    const evId = params.eventId;
    const eventIndex = compDisplay.data.findIndex(
      (pair) => pair.eventDisplay.eventId === evId,
    );
    if (eventIndex < 0) {
      setCurrEvent(null);
      return;
    }

    setCurrEvent({
      event: compDisplay.data[eventIndex].eventDisplay,
      submissions: compDisplay.data[eventIndex].result.submissions,
    });
  }, [compDisplay]);

  return (
    <div>
      <p className="p-4 text-center text-5xl font-bold">
        Results of Last Competition
        {compDisplay ? ` (Comp #${compDisplay.compNumber})` : ""}
      </p>
      {compDisplay && currEvent ? (
        <>
          <p className="p-4 text-center text-3xl font-bold">
            Viewing Event {currEvent.event.eventTitle}
          </p>
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
              {currEvent.submissions.map((submission, index) => (
                <tr key={index}>
                  <td>{submission.place}</td>
                  <td>{submission.submitterData.name}</td>
                  <td>{formatPackedResult(getMinResult(submission.times))}</td>
                  <td>{submission.resultStr}</td>
                  <td className="flex flex-row justify-between">
                    {formatAttempts(TimeFormat.ao5, submission.times).map(
                      (t, i) => (
                        <span key={i}>{t}</span>
                      ),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
}

export default Results;
