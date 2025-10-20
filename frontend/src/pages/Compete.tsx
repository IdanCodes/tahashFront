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
import { formatPackedResult } from "@shared/utils/time-utils";

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
        setScrambleImages(scrImages);

        removeLoading();
      });
    });
  }, []);

  if (!competeData) return <>no compete data</>;

  function onClickScrambleNum(scrIndex: number) {
    setActiveScramble(scrIndex);
  }

  return (
    <>
      <CubingIconsSheet />
      <div>
        {/*Scamble number buttons*/}
        <div className="mx-auto my-4 box-border flex w-80/100 justify-between gap-6">
          {competeData.scrambles.map((_, i) => (
            <div
              key={i}
              className={clsx(
                `my-auto flex w-full cursor-pointer rounded-xl p-2 text-2xl transition-all duration-200 ease-in`,
                activeScramble == i && "bg-gray-500",
                activeScramble != i && "bg-gray-400 hover:bg-gray-500/80",
              )}
              onClick={() => onClickScrambleNum(i)}
            >
              <p className="absolute px-4 text-center font-bold">{i + 1}.</p>
              <p className="ml-2 w-full text-center">
                {formatPackedResult(competeData.results.times[i])}
              </p>
            </div>
          ))}
        </div>

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
