import React from "react";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";

function Login() {
  async function startLogin() {
    console.log("Redirecting to auth...");
    const redirectUri = `${window.location.origin}/wca-auth-callback`;
    window.location.href = `/api/auth-wca?redirect=${encodeURIComponent(redirectUri)}`;
  }

  return (
    <>
      <div className="text-center text-4xl">Login Page</div>
      <div>
        <div className="mt-10 flex place-items-center justify-center">
          <PrimaryButton
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
