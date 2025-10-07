import React, { useEffect, useRef } from "react";
import {
  ErrorObject,
  errorObject,
  isErrorObject,
} from "@shared/interfaces/error-object";
import { redirectToError } from "../utils/utils";
import { sendPostRequest } from "../utils/API/apiUtils";
import { ResponseCode } from "@shared/types/response-code";
import { WcaOAuthTokenResponse } from "@shared/interfaces/wca-api/wcaOAuth";
import { useNavigate } from "react-router-dom";

function WcaAuthCallback() {
  const calledRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (calledRef.current) return; // already initialized
    calledRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");
    if (!authCode)
      return redirectToError(errorObject("Missing authentication code"));

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/wca-auth-callback`,
    );
    sendPostRequest(`/wca-code-exchange?redirect=${redirectUri}`, {
      code: authCode,
    }).then((res) => {
      if (res.code != ResponseCode.Success) return redirectToError(res.data);

      const tokenRes = res.data as ErrorObject | WcaOAuthTokenResponse;
      if (isErrorObject(tokenRes)) return redirectToError(tokenRes);

      navigate("/profile");
    });
  }, []);

  return (
    <div>
      <p className="m-10 text-center text-4xl">Loading...</p>
    </div>
  );
}

export default WcaAuthCallback;
