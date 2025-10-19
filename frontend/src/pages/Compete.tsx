import React, { useEffect, useState } from "react";
import { redirect, useParams, useSearchParams } from "react-router-dom";
import { redirectToError } from "../utils/errorUtils";
import { errorObject } from "@shared/interfaces/error-object";
import { sendGetRequest } from "../utils/API/apiUtils";
import { useLoading } from "../context/LoadingContext";
import { HttpHeaders } from "@shared/constants/http-headers";
import { useUserInfo } from "../context/UserContext";
import { ResponseCode } from "@shared/types/response-code";
import { RoutePath } from "@shared/constants/route-path";
import { UserCompeteData } from "@shared/interfaces/user-compete-data";
import { CubingIconsSheet } from "../components/CubingIconsSheet";
import { useCSTimer } from "../hooks/useCsTimer";
import clsx from "clsx";
import PrimaryButton from "../components/buttons/PrimaryButton";

function Compete() {
  const params = useParams();
  const [competeData, setCompeteData] = useState<UserCompeteData>();
  const [activeScramble, setActiveScramble] = useState<number>(0);
  const [scrambleImages, setScrambleImages] = useState<string[]>([]);
  const csTimer = useCSTimer();

  const { addLoading, removeLoading } = useLoading();
  const userInfo = useUserInfo();
  let numScrambles = -1;

  useEffect(() => {
    addLoading();

    const eventId = params.eventId;
    if (!eventId) {
      removeLoading();
      redirectToError(errorObject(`Invalid Event Id`));
      return;
    }

    if (!userInfo.user) {
      removeLoading();
      redirect(RoutePath.Page.HomeRedirect);
      return;
    }

    sendGetRequest(RoutePath.Get.UserEventData, {
      [HttpHeaders.USER_ID]: userInfo.user.id.toString(),
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((res) => {
      if (res.code == ResponseCode.Error) {
        removeLoading();
        redirectToError(res.data);
        return;
      }

      const competeData = res.data as UserCompeteData;
      setCompeteData(res.data);
      numScrambles = competeData.scrambles.length;
      Promise.all(
        competeData.scrambles.map((scramble) =>
          csTimer.getImage(scramble, competeData.eventData.scrType),
        ),
      ).then((scrImages) => {
        removeLoading();
        setScrambleImages(scrImages);
      });
    });
  }, []);

  if (!competeData) return <>no compete data</>;

  return (
    <>
      <CubingIconsSheet />
      <div>
        {/*Scamble number buttons*/}
        <div></div>

        {/*Main Panel*/}
        <div className="mx-auto w-8/10 rounded-2xl border-5 border-black bg-gray-400">
          {competeData.scrambles.map((scramble, i) => (
            <div key={i} className={clsx(activeScramble != i && "hidden")}>
              {/*Scramble & Image*/}
              <div className="p-1 px-5">
                <p className="text-center text-xl">Scramble #{i + 1}</p>
                {/* Scramble */}
                <div className="text-center text-3xl font-semibold">
                  {scramble}
                </div>

                {/*Image*/}
                <div
                  className="mx-auto flex place-content-center py-4"
                  dangerouslySetInnerHTML={{
                    __html: scrambleImages[i],
                  }}
                ></div>
              </div>

              <div className="w-full border-2 border-black"></div>

              {/*Submit Section*/}
              <div className="p-2"></div>

              {/*Scramble navigation (temporary)*/}
              <div className="mx-auto my-4 flex w-4/10 justify-between">
                <PrimaryButton
                  disabled={activeScramble == 0}
                  text="Previous"
                  onClick={() => setActiveScramble((s) => s - 1)}
                />
                <PrimaryButton
                  disabled={activeScramble >= competeData.scrambles.length - 1}
                  text="Next"
                  onClick={() => setActiveScramble((s) => s + 1)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Compete;
