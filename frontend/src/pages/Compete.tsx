import React, { useEffect, useState } from "react";
import { redirect, useParams, useSearchParams } from "react-router-dom";
import { redirectToError } from "../utils/errorUtils";
import { errorObject } from "@shared/interfaces/error-object";
import { sendGetRequest } from "../utils/API/apiUtils";
import { useLoading } from "../context/LoadingContext";
import { HttpHeaders } from "@shared/constants/http-headers";
import { useUserInfo } from "../context/UserContext";
import { ResponseCode } from "@shared/types/response-code";
import { RoutePath } from "@shared/constants/route-path";
import { UserCompeteData } from "@shared/interfaces/user-compete-data";

function Compete() {
  const params = useParams();
  const [competeData, setCompeteData] = useState<UserCompeteData>();
  /**
   * - array of scrambles
   * - event display information
   * - packedTimes of user in event
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
      redirect(RoutePath.Page.HomeRedirect);
      return;
    }

    sendGetRequest(RoutePath.Get.UserEventData, {
      [HttpHeaders.USER_ID]: userInfo.user.id.toString(),
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((res) => {
      removeLoading();
      if (res.code == ResponseCode.Error) {
        redirectToError(res.data);
        return;
      }

      setCompeteData(res.data);
    });
  }, [params]);

  return <h1>{JSON.stringify(competeData)}</h1>;
}

export default Compete;
