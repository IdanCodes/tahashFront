import React, { JSX } from "react";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { useNavigate } from "react-router-dom";
import LoadingWrapper from "../components/LoadingWrapper";
import { useLoading } from "../context/LoadingContext";

function Home(): JSX.Element {
  const navigate = useNavigate();
  const { addLoading, removeLoading } = useLoading();

  return (
    <>
      <div className="mx-auto flex w-4/5 flex-row">
        <div className="text-center text-4xl">Home</div>
        <div className="mt-10 flex place-items-center justify-center">
          <PrimaryButton
            text="Log In"
            buttonSize={ButtonSize.Medium}
            onClick={() => navigate("/login")}
          />
        </div>
        <PrimaryButton
          text="Loading screen"
          onClick={() => {
            addLoading();
            setTimeout(() => {
              removeLoading();
            }, 3000);
          }}
        />

        <LoadingWrapper>
          <div>
            <p>Loaded content!</p>
          </div>
        </LoadingWrapper>
      </div>
    </>
  );
}

export default Home;
