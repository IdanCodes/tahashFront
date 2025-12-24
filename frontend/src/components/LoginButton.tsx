import React, { ReactNode, useEffect, useState } from "react";
import PrimaryButton from "./buttons/PrimaryButton";
import { ButtonSize } from "./buttons/ButtonSize";
import { sendGetRequest } from "../utils/API/apiUtils";
import { ResponseCode } from "@shared/types/response-code";
import { redirectToError } from "../utils/errorUtils";
import { useUserInfo } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "@shared/constants/route-path";
import { QueryParams } from "@shared/constants/query-params";

function LoginButton({ content }: { content: React.JSX.Element }) {
  const [disableInteract, setDisableInteract] = useState(false);
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  async function startLogin() {
    setDisableInteract(true);

    console.log("Redirecting to auth...");
    const redirectUri = encodeURIComponent(
      `${window.location.origin}${RoutePath.Page.WcaAuthCallback}`,
    );
    const res = await sendGetRequest(
      `${RoutePath.Get.AuthWcaUrl}?${QueryParams.Redirect}=${redirectUri}`,
    );
    if (res.aborted) return;
    if (res.code == ResponseCode.Error) return redirectToError(res.data);

    // res.code = Success -> data is valid
    window.location.href = res.data as string;
  }

  return (
    <>
      <PrimaryButton
        disabled={disableInteract}
        content={content}
        buttonSize={ButtonSize.Medium}
        onClick={startLogin}
      />
    </>
  );
}

export default LoginButton;
