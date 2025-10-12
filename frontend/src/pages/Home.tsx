import React, { JSX } from "react";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";
import { RoutePath } from "@shared/constants/route-path";

function Home(): JSX.Element {
  const navigate = useNavigate();
  const { addLoading, removeLoading } = useLoading();

  return (
    <>
      <div className="text-center text-5xl font-bold">Home</div>
      <div className="mx-auto flex w-4/5 flex-col">
        <div className="mt-10 flex place-items-center justify-center">
          <PrimaryButton
            text="Log In"
            buttonSize={ButtonSize.Medium}
            onClick={() => navigate(RoutePath.Page.Login)}
          />
        </div>
        <br />
        <PrimaryButton
          text="Loading screen for 3 seconds"
          onClick={() => {
            addLoading();
            setTimeout(() => {
              removeLoading();
            }, 3000);
          }}
        />

        <div>
          <p>Loaded content!</p>
        </div>
      </div>
    </>
  );
}

export default Home;
