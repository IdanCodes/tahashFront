import React, { useEffect, useRef, useState } from "react";
import { redirect, useParams } from "react-router-dom";
import { redirectToError } from "../utils/errorUtils";
import { errorObject } from "@shared/interfaces/error-object";
import { sendGetRequest, sendPostRequest } from "../utils/API/apiUtils";
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
import {
  formatPackedResult,
  formatSolveResult,
  formatTimeParts,
  isFullPackedTimesArr,
  tryAnalyzeTimes,
  unpackResult,
} from "@shared/utils/time-utils";
import { PackedResult } from "@shared/interfaces/packed-result";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { packResult, SolveResult } from "@shared/interfaces/solve-result";
import { Penalties, Penalty } from "@shared/constants/penalties";

const hideImageEvents = Object.freeze(["3bld", "4bld", "5bld", "mbld"]);
const penaltyBtnEnabledColors = {
  normal: "bg-purple-500",
  hover: "bg-purple-500/90",
  click: "bg-purple-600/90",
};

function Compete() {
  const [competeData, setCompeteData] = useState<UserCompeteData>();
  const [scrambleImages, setScrambleImages] = useState<string[]>([]);
  const [activeScramble, setActiveScramble] = useState<number>(0);
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [allTimes, setAllTimes] = useState<PackedResult[]>([]);
  const csTimer = useCSTimer();
  const [lastOpenScramble, setLastOpenScramble] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<SolveResult>({
    penalty: Penalties.None,
    extraArgs: {},
    time: null,
  });

  const hideImage = useRef<boolean>(false);
  const numScrambles = useRef<number>(0);
  const finishedEvent = useRef<boolean>(false);

  const params = useParams();
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
    numScrambles.current = competeData.scrambles.length;
    finishedEvent.current = competeData.results.finished;

    const times = competeData.results.times;
    setAllTimes(times);
    setInputValues(
      times.map((pr) => (pr.centis >= 0 ? formatPackedResult(pr) : "")),
    );

    let lastOpened = 0;
    for (
      ;
      lastOpened < numScrambles.current - 1 && times[lastOpened].centis > 0;
      lastOpened++
    );
    setLastOpenScramble(lastOpened);
    setActiveScramble(lastOpened);
    setCurrentResult(unpackResult(times[lastOpened]));

    setCompeteData(competeData);

    if (!hideImage.current)
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
      redirectToError(errorObject(`Invalid Event Id "${eventId}"`));
      return;
    }

    if (!userInfo.user) {
      removeLoading();
      redirect(RoutePath.Page.HomeRedirect);
      return;
    }

    sendGetRequest(RoutePath.Get.UserEventData, {
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((res) => {
      if (res.code != ResponseCode.Error) {
        initCompeteData(res.data).then(removeLoading);
        return;
      }

      removeLoading();
      redirectToError(res.data);
    });
  }, []);

  const isLastScramble: boolean = activeScramble == numScrambles.current - 1;
  const currPenalty: Penalty = currentResult.penalty ?? Penalties.None;

  if (!competeData) return <>no compete data</>;

  function loadScramble(scrIndex: number) {
    scrIndex = Math.min(Math.max(0, scrIndex), numScrambles.current - 1);
    setActiveScramble(scrIndex);
    setCurrPenalty(allTimes[scrIndex].penalty);
    setCurrentResult(unpackResult(allTimes[scrIndex]));
    if (scrIndex > lastOpenScramble) setLastOpenScramble(scrIndex);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTimeStr: string = e.target.value;
    setInputValues((iv) => {
      const newValues = [...iv];
      newValues[activeScramble] = newTimeStr;
      return newValues;
    });

    const newTimeParts = tryAnalyzeTimes(newTimeStr);
    setCurrentResult((result) => ({
      penalty: result.penalty,
      extraArgs: result.extraArgs,
      time: newTimeParts,
    }));
  }

  // returns whether updating was successful
  async function updateAllTimes(newAllTimes: PackedResult[]): Promise<boolean> {
    const res = await sendPostRequest(RoutePath.Post.UpdateTimes, {
      eventId: competeData!.eventData.eventId,
      times: newAllTimes,
    });

    if (res.code == ResponseCode.Error) {
      redirectToError(
        errorObject(
          "An error occurred when trying to upload results",
          res.data,
        ),
      );
      return false;
    }

    setAllTimes(newAllTimes);
    if (isFullPackedTimesArr(newAllTimes)) finishedEvent.current = true;
    return true;
  }

  function onSubmitTime() {
    if (!currentResult.time)
      return console.error(
        "Error: The time to submit is invalid. Try refreshing the page.",
      );

    if (isLastScramble) {
      const confirmed = confirm(
        "Are you sue you want to submit? You will not be able to edit the results.",
      );
      if (!confirmed) return;
    }

    addLoading();

    const newAllTimes = [...allTimes];
    newAllTimes[activeScramble] = packResult(currentResult);
    updateAllTimes(newAllTimes).then((successful) => {
      removeLoading();
      if (successful) {
        if (isLastScramble)
          setCurrentResult(unpackResult(newAllTimes[activeScramble]));
        else loadScramble(activeScramble + 1);
      }
    });
  }

  function setCurrPenalty(p: Penalty) {
    setCurrentResult({ ...currentResult, penalty: p });
  }

  function togglePlusTwo() {
    if (currPenalty == Penalties.DNF) return;
    setCurrPenalty(
      currPenalty == Penalties.Plus2 ? Penalties.None : Penalties.Plus2,
    );
  }

  function toggleDNF() {
    setCurrPenalty(
      currPenalty == Penalties.DNF ? Penalties.None : Penalties.DNF,
    );
  }

  const isScrambleAccessible = (scrIndex: number) =>
    scrIndex <= lastOpenScramble;

  return (
    <>
      <CubingIconsSheet />
      <div>
        {/*Event Title*/}
        <p className="text-center text-4xl font-bold text-blue-950">
          {competeData.eventData.eventTitle}
        </p>

        {/*Scamble number menu*/}
        <div className="mx-auto my-4 box-border flex w-80/100 justify-between gap-6">
          {competeData.scrambles.map((_, i) => (
            <button
              key={i}
              className={clsx(
                `my-auto flex w-full rounded-xl p-2 text-2xl transition-all duration-200 ease-in`,
                isScrambleAccessible(i) && `cursor-pointer`,
                !isScrambleAccessible(i) && "opacity-60",
                activeScramble !== i && "bg-gray-400 hover:bg-gray-500/80",
                activeScramble == i && "bg-gray-500",
              )}
              onClick={() => loadScramble(i)}
              disabled={!isScrambleAccessible(i)}
            >
              <p className="absolute pl-[1%] text-center font-bold">{i + 1}.</p>
              <p className="ml-2 w-full text-center">
                {formatPackedResult(allTimes[i])}
              </p>
            </button>
          ))}
        </div>

        {/*Main Panel*/}
        <div className="mx-auto w-8/10 rounded-2xl border-5 border-black bg-gray-400">
          {competeData.scrambles.map((scramble, i) => (
            <div key={i} className={clsx(activeScramble != i && "hidden")}>
              {/*Scramble & Image*/}
              <div className="flex flex-row justify-between gap-2 px-5 py-2">
                {/* Scramble */}
                <div className="w-full text-center text-3xl font-semibold whitespace-pre-wrap">
                  {scramble.replaceAll(" ", "  ")}
                </div>

                {/*Image*/}
                {!hideImage.current && (
                  <div
                    className="w-6/10"
                    dangerouslySetInnerHTML={{
                      __html: scrambleImages[i],
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          {/*scamble-submit divider*/}
          <div className="w-full border-2 border-black"></div>

          {/*Submit Section*/}
          <div className="mx-auto flex w-6/10 flex-row justify-between gap-[15%] p-2">
            {/*Time Input & Penalty*/}
            {!finishedEvent.current && (
              <div className="flex w-full flex-col">
                {/*Time Input*/}
                <div className="place-items-center content-center justify-center">
                  <input
                    type="text"
                    className="rounded-xl bg-white py-2 text-center text-2xl"
                    maxLength={12}
                    onChange={onInputChange}
                    value={inputValues[activeScramble]}
                  />
                </div>

                {/*Choose Penalty*/}
                <div className="m-auto my-2 flex place-items-center gap-[10%]">
                  <PrimaryButton
                    text="+2"
                    buttonSize={ButtonSize.Small}
                    onClick={togglePlusTwo}
                    colors={
                      currPenalty == Penalties.Plus2
                        ? penaltyBtnEnabledColors
                        : undefined
                    }
                    disabled={currPenalty == Penalties.DNF}
                  />
                  <PrimaryButton
                    text="DNF"
                    buttonSize={ButtonSize.Small}
                    colors={
                      currPenalty == Penalties.DNF
                        ? penaltyBtnEnabledColors
                        : undefined
                    }
                    onClick={toggleDNF}
                  />
                </div>
              </div>
            )}

            {/*Preview & Submit Button*/}
            <div className="flex w-full flex-col">
              <p className="text-center text-3xl">
                {formatSolveResult(currentResult)}
              </p>
              {!finishedEvent.current && (
                <div className="m-auto w-fit">
                  <PrimaryButton
                    disabled={!currentResult.time}
                    text={isLastScramble ? "Submit" : "Next"}
                    buttonSize={ButtonSize.Small}
                    onClick={onSubmitTime}
                  />
                </div>
              )}
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
      </div>
    </>
  );
}

export default Compete;
