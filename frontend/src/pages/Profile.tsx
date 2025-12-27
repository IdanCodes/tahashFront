import React, { JSX, ReactNode, useState } from "react";
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
    <div className="my-1 flex flex-row place-items-center justify-between gap-2 text-[clamp(1.1rem,1.4vw,1.4rem)]">
      <p className="font-semibold">{name}</p>
      <p className="">{value}</p>
    </div>
  );
}

function ProfilePanel({ userInfo }: { userInfo: UserInfo }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="mx-auto flex w-35/100 flex-col gap-4">
        <ProfileAttribute name="Name:" value={userInfo.name} />
        <ProfileAttribute name="WCA ID:" value={userInfo.wcaId} />
        <ProfileAttribute name="Country:" value={userInfo.country} />
        <div className="flex justify-center">
          <PrimaryButton
            content={"Stats"}
            onClick={() => navigate(`/user/${userInfo.wcaId}`)}
          />
        </div>
        <div className="flex justify-center">
          <a
            target="_blank"
            href={`https://www.worldcubeassociation.org/persons/${userInfo.wcaId ?? ""}`}
          >
            <PrimaryButton
              content={"WCA Profile"}
              colors="bg-orange-500 hover:bg-orange-600/80 active:bg-orange-600"
            />
          </a>
        </div>
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
    console.log("logged out");
    navigate(RoutePath.Page.Home);
  }

  return (
    <div className="m-3 flex place-content-center justify-center">
      <PrimaryButton
        buttonSize={ButtonSize.Large}
        content="Logout"
        disabled={disableLogout}
        onClick={onClickLogout}
        colors="bg-red-500 hover:bg-red-600 active:bg-red-600/90"
      />
    </div>
  );
}

function Profile() {
  const userInfo = useUserInfo();

  return (
    <>
      <h1 className="m-3 text-center text-5xl font-bold">Profile</h1>

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
