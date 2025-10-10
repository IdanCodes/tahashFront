import React, { useEffect, useRef } from "react";
import { ErrorObject, isErrorObject } from "@shared/interfaces/error-object";
import { redirectToError } from "../utils/errorUtils";
import { sendPostRequest } from "../utils/API/apiUtils";
import { ResponseCode } from "@shared/types/response-code";
import { WcaOAuthTokenResponse } from "@shared/interfaces/wca-api/wcaOAuth";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../context/UserContext";

function WcaAuthCallback() {
  const calledRef = useRef(false);
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  useEffect(() => {
    if (calledRef.current) return; // already initialized
    calledRef.current = true;

    if (userInfo.user) {
      navigate("/profile");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");
    if (!authCode) {
      navigate("/login");
      return;
    }

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/wca-auth-callback`,
    );
    sendPostRequest(`/wca-code-exchange?redirect=${redirectUri}`, {
      code: authCode,
    }).then(async (res) => {
      if (res.code != ResponseCode.Success) return redirectToError(res.data);

      const tokenRes = res.data as ErrorObject | WcaOAuthTokenResponse;
      if (isErrorObject(tokenRes)) return redirectToError(tokenRes);

      await userInfo.refresh();
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
