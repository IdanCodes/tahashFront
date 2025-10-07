import React, { useEffect, useRef, useState } from "react";
import { UserInfo } from "@shared/interfaces/user-info";
import { sendGetRequest } from "../utils/API/apiUtils";
import { ResponseCode } from "@shared/types/response-code";
import { redirectToError } from "../utils/utils";

function Profile() {
  const fetchRef = useRef(false);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

  useEffect(() => {
    if (userInfo || fetchRef.current) return;
    fetchRef.current = true;
    sendGetRequest("/user-info").then((res) => {
      if (res.code != ResponseCode.Success) return redirectToError(res);
      console.log(res);
      setUserInfo(res.data);
    });
  }, []);

  return (
    <>
      <p className="text-center text-3xl">Profile Page</p>

      {userInfo ? (
        <div>
          <p className="text-center text-2xl">Name: {userInfo.name}</p>
          <p className="text-center text-2xl">WCA ID: {userInfo.wcaId}</p>
          <p className="text-center text-2xl">Country: {userInfo.country}</p>
          <p className="text-center text-2xl">Photo:</p>
          <img src={userInfo.photoUrl} alt="User's WCA photo" />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}

export default Profile;
