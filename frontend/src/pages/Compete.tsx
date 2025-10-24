import React, { useEffect, useRef, useState } from "react";
import { redirect, useParams } from "react-router-dom";
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

const hideImageEvents = Object.freeze(["3bld", "4bld", "5bld", "mbld"]);
function Compete() {
  const params = useParams();
  const csTimer = useCSTimer();
  const [competeData, setCompeteData] = useState<UserCompeteData>();
  const [activeScramble, setActiveScramble] = useState<number>(0);
  const [scrambleImages, setScrambleImages] = useState<string[]>([]);
  const hideImage = useRef<boolean>(false);

  const { addLoading, removeLoading } = useLoading();
  const userInfo = useUserInfo();

  /**
   * Initialize an SVG element using its image string
   */
  function initSvgFromString(imgStr: string) {
    const parent = document.createElement("div");
    parent.innerHTML = imgStr;
    const el = parent.querySelector("svg")!;
    const prevWidth = el.getAttribute("width") ?? "100";
    const prevHeight = el.getAttribute("height") ?? "100";
    el.setAttribute("width", "100%");
    el.setAttribute("height", "100%");
    el.setAttribute("viewBox", `0 0 ${prevWidth} ${prevHeight}`);
    el.setAttribute("preserveAspectRatio", "xMidYMid meet");

    return parent.innerHTML;
  }

  async function initCompeteData(competeData: UserCompeteData) {
    hideImage.current = hideImageEvents.includes(competeData.eventData.eventId);
    setCompeteData(competeData);

    if (hideImage.current) return;

    // generate image svgs
    Promise.all(competeData.scrambles.map(scrToSvg)).then(setScrambleImages);

    /**
     * Generate an SVG element from a given scramble
     */
    async function scrToSvg(scramble: string) {
      const imgStr = (await csTimer.getImage(
        scramble,
        competeData.eventData.scrType,
      )) as string;

      return initSvgFromString(imgStr);
    }
  }

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
      if (res.code != ResponseCode.Error)
        return initCompeteData(res.data).then(removeLoading);

      removeLoading();
      redirectToError(res.data);
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
        {/*Scamble number menu*/}
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
              <p className="absolute pl-[1%] text-center font-bold">{i + 1}.</p>
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
              <div className="flex flex-row justify-between gap-2 px-5 py-2">
                {/* Scramble */}
                <div className="w-full text-center text-3xl font-semibold">
                  {scramble}
                </div>

                {/*Image*/}
                {!hideImage.current && (
                  <div
                    className="w-6/10"
                    dangerouslySetInnerHTML={{
                      __html: scrambleImages[i],
                    }}
                  ></div>
                )}
              </div>

              {/*scamble-submit divider*/}
              <div className="w-full border-2 border-black"></div>

              {/*Submit Section*/}
              <div className="flex flex-row justify-center gap-[10%] p-2">
                {/*Time Input & Penalty*/}
                <div className="flex w-full flex-col">
                  {/*Time Input*/}
                  <div className="mx-auto w-6/10">
                    <input
                      type="text"
                      className="rounded-xl bg-white px-1 py-2.5 text-4xl"
                    />
                  </div>

                  {/*Choose Penalty*/}
                  <div></div>
                </div>

                {/*Preview & Submit Button*/}
                <div className="w-full">
                  <p className="text-center text-2xl">Preview</p>
                </div>
              </div>

              {/*Scramble navigation (temporary)*/}
              <div className="mx-auto mt-4 flex hidden justify-center gap-[20%]">
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
