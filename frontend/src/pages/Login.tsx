import React, { useEffect, useState } from "react";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { sendGetRequest } from "../utils/API/apiUtils";
import { ResponseCode } from "@shared/types/response-code";
import { redirectToError } from "../utils/errorUtils";
import { useUserInfo } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const [disableInteract, setDisableInteract] = useState(false);
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo.user) navigate("/profile");
  });

  async function startLogin() {
    setDisableInteract(true);

    console.log("Redirecting to auth...");
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/wca-auth-callback`,
    );
    const res = await sendGetRequest(`/auth-wca-url?redirect=${redirectUri}`);
    if (res.code == ResponseCode.Error) return redirectToError(res.data);

    // res.code = Success -> data is valid
    window.location.href = res.data as string;
  }

  return (
    <>
      <div className="text-center text-4xl">Login Page</div>
      <div>
        <div className="mt-10 flex place-items-center justify-center">
          <PrimaryButton
            disabled={disableInteract}
            text="Log In With WCA"
            buttonSize={ButtonSize.Medium}
            onClick={startLogin}
          />
        </div>
      </div>
    </>
  );
}

export default Login;
