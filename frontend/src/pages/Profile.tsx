import React, { JSX, ReactNode, useEffect, useState } from "react";
import { useUserInfo } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { sendGetRequest } from "../utils/API/apiUtils";
import { ButtonSize } from "../components/buttons/ButtonSize";

function ProfileAttribute({
  name,
  value,
}: {
  name: string;
  value: ReactNode;
}): JSX.Element {
  return (
    <div className="my-1 flex flex-row place-items-center justify-between text-2xl">
      <p className="font-semibold">{name}</p>
      <p className="">{value}</p>
    </div>
  );
}

function Profile() {
  const [disableLogout, setDisableLogout] = useState(false);
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo.user) navigate("/login");
  });

  return (
    <>
      <p className="m-3 text-center text-4xl font-bold">Profile</p>

      {userInfo.user ? (
        <>
          <div className="mx-auto flex w-2/5 flex-col">
            <ProfileAttribute name="Name:" value={userInfo.user.name} />
            <ProfileAttribute name="WCA ID:" value={userInfo.user.wcaId} />
            <ProfileAttribute name="Country:" value={userInfo.user.country} />
            <ProfileAttribute
              name="Photo:"
              value={
                <a
                  target="_blank"
                  href={`https://www.worldcubeassociation.org/persons/${userInfo.user!.wcaId ?? ""}`}
                >
                  <img
                    src={userInfo.user.photoUrl}
                    alt="User's WCA photo"
                    className="h-auto w-35 cursor-pointer rounded-2xl border-4 border-black transition-all duration-75 hover:scale-103"
                  />
                </a>
              }
            />
          </div>
          <div className="m-3 flex place-content-center justify-center">
            <PrimaryButton
              colors={{
                normal: "bg-red-500",
                hover: "bg-red-400/90",
                click: "bg-purple-500",
              }}
              buttonSize={ButtonSize.Large}
              text="Logout"
              disabled={disableLogout}
              onClick={async (e) => {
                e.preventDefault();
                setDisableLogout(true);
                await sendGetRequest("/logout");
                await userInfo.refresh();
                navigate("/login");
                setDisableLogout(false);
              }}
            />
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}

export default Profile;
