import React, { useEffect, useState } from "react";
import { redirect, useParams, useSearchParams } from "react-router-dom";
import { redirectToError } from "../utils/errorUtils";
import { errorObject } from "@shared/interfaces/error-object";
import { sendGetRequest } from "../utils/API/apiUtils";
import { useLoading } from "../context/LoadingContext";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";
import { HttpHeaders } from "@shared/constants/http-headers";
import { useUserInfo } from "../context/UserContext";
import { SolveResult } from "@shared/interfaces/solve-result";
import { ResponseCode } from "@shared/types/response-code";

function Compete() {
  const params = useParams();
  const [competeData, setCompeteData] = useState<{
    scrambles: string[];
    displayInfo: EventDisplayInfo;
    results: SolveResult[];
  }>();
  /**
   * array of scrambles
   * event display information
   * packedTimes of user in event
   */
  const { addLoading, removeLoading } = useLoading();
  const userInfo = useUserInfo();
  const [eventId, setEventId] = useState("NOT FOUND");

  useEffect(() => {
    addLoading();

    const eventId = params.eventId;
    if (!eventId) {
      removeLoading();
      redirectToError(errorObject(`Invalid Event Id`));
      return;
    }

    if (!userInfo.user) {
      removeLoading();
      redirect("/");
      return;
    }

    sendGetRequest("/user-event-data", {
      [HttpHeaders.USER_ID]: userInfo.user.id.toString(),
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((res) => {
      removeLoading();
      if (res.code == ResponseCode.Error) {
        redirectToError(res.data);
        return;
      }

      console.log(res);
      setEventId(eventId);
    });
  }, [params]);

  return <h1>Event Id: {eventId ?? "NOT FOUND"}</h1>;
}

export default Compete;
