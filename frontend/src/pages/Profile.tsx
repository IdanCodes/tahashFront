import React, { JSX, ReactNode, useEffect, useState } from "react";
import { useUserInfo } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { useLoading } from "../context/LoadingContext";
import { UserInfo } from "@shared/interfaces/user-info";
import { RoutePath } from "@shared/constants/route-path";

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

function ProfilePanel({ userInfo }: { userInfo: UserInfo }) {
  return (
    <>
      <div className="mx-auto flex w-35/100 flex-col">
        <ProfileAttribute name="Name:" value={userInfo.name} />
        <ProfileAttribute name="WCA ID:" value={userInfo.wcaId} />
        <ProfileAttribute name="Country:" value={userInfo.country} />
        <ProfileAttribute
          name="Photo:"
          value={
            <a
              target="_blank"
              href={`https://www.worldcubeassociation.org/persons/${userInfo.wcaId ?? ""}`}
            >
              <img
                src={userInfo.photoUrl}
                alt="User's WCA photo"
                className="h-auto w-35 cursor-pointer rounded-2xl border-4 border-black transition-all duration-75 hover:scale-103"
              />
            </a>
          }
        />
      </div>
    </>
  );
}

function LogoutButton({ logout }: { logout: () => Promise<void> }) {
  const [disableLogout, setDisableLogout] = useState(false);
  const navigate = useNavigate();
  const { addLoading, removeLoading } = useLoading("Profile");

  async function onClickLogout(e: React.MouseEvent<Element, MouseEvent>) {
    e.preventDefault();
    setDisableLogout(true);
    addLoading();
    await logout();
    removeLoading();
    navigate(RoutePath.Page.Login);
  }

  return (
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
        onClick={onClickLogout}
      />
    </div>
  );
}

function Profile() {
  const userInfo = useUserInfo();

  return (
    <>
      <p className="m-3 text-center text-5xl font-bold">Profile</p>

      {userInfo.user && (
        <>
          <ProfilePanel userInfo={userInfo.user} />
          <LogoutButton logout={userInfo.logout} />
        </>
      )}
    </>
  );
}

export default Profile;
