import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { redirectToError } from "../utils/errorUtils";
import { errorObject } from "@shared/interfaces/error-object";
import { sendGetRequest, sendPostRequest } from "../utils/API/apiUtils";
import { useLoading, useLoadingEraser } from "../context/LoadingContext";
import { HttpHeaders } from "@shared/constants/http-headers";
import { useUserInfo } from "../context/UserContext";
import { RoutePath } from "@shared/constants/route-path";
import { UserCompeteData } from "@shared/interfaces/user-compete-data";
import { CubingIconsSheet } from "../components/CubingIconsSheet";
import { useCSTimer } from "../hooks/useCsTimer";
import clsx from "clsx";
import PrimaryButton from "../components/buttons/PrimaryButton";
import {
  formatPackedResult,
  formatSolveResult,
  isFullPackedTimesArr,
  packTime,
  tryAnalyzeTimes,
  unpackResult,
} from "@shared/utils/time-utils";
import { PackedResult } from "@shared/interfaces/packed-result";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { packResult, SolveResult } from "@shared/interfaces/solve-result";
import { Penalties, Penalty } from "@shared/constants/penalties";
import LoadingSpinner from "../components/LoadingSpinner";
import { generateResultStr } from "@shared/utils/event-results-utils";
import { getTimeFormatName, TimeFormat } from "@shared/constants/time-formats";
import { motion } from "motion/react";
import { PageTransitionProps } from "../components/PageTransition";

const hideImageEvents = Object.freeze(["333bf", "444bf", "555bf", "333mbf"]);

function ScrambleMenuButton({
  isAccessible,
  isActiveScramble,
  loadScramble,
  resultStr,
  scrNumber,
}: {
  isAccessible: boolean;
  isActiveScramble: boolean;
  loadScramble: () => void;
  resultStr: string;
  scrNumber: number;
}) {
  return (
    <button
      className={clsx(
        `my-auto flex w-full rounded-xl p-2 text-2xl transition-all duration-200 ease-in`,
        isAccessible && `cursor-pointer`,
        !isAccessible && "opacity-60",
        isActiveScramble && "bg-gray-500",
        !isActiveScramble && "bg-gray-400 hover:bg-gray-500/80",
      )}
      onClick={() => loadScramble()}
      disabled={!isAccessible}
    >
      <p className="absolute pl-[1%] text-center font-bold">{scrNumber}.</p>
      <p className="ml-2 w-full text-center">{resultStr}</p>
    </button>
  );
}

function ScramblesMenu({
  scrambles,
  activeScramble,
  allTimes,
  loadScramble,
  isScrambleAccessible,
}: {
  scrambles: string[];
  activeScramble: number;
  allTimes: PackedResult[];
  loadScramble: (scrIndex: number) => void;
  isScrambleAccessible: (scrIndex: number) => boolean;
}) {
  return (
    <div className="mx-auto my-4 box-border flex w-80/100 justify-between gap-6">
      {scrambles.map((_, i) => (
        <ScrambleMenuButton
          key={i}
          isAccessible={isScrambleAccessible(i)}
          isActiveScramble={activeScramble == i}
          loadScramble={() => loadScramble(i)}
          resultStr={formatPackedResult(allTimes[i])}
          scrNumber={i + 1}
        />
      ))}
    </div>
  );
}

function ScrambleAndImage({
  scrText,
  scrImg,
  setLoading,
}: {
  scrText: string;
  scrImg: string | undefined;
  setLoading: (isLoading: boolean) => void;
}) {
  const fontSizeLow = 10;
  const fontSizeHigh = 40;
  const imgParentRef = useRef<HTMLDivElement | null>(null);
  const textElRef = useRef<HTMLParagraphElement | null>(null);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const [fontProps, setFontProps] = useState<{
    size: number;
    l: number;
    h: number;
    k: number;
  }>({ size: 30, l: fontSizeLow, h: fontSizeHigh, k: 0 });

  const imageHeight = useMemo<number>(() => {
    return imgParentRef.current ? imgParentRef.current.clientHeight : 0;
  }, [imgParentRef.current, fontProps]);
  const textHeight = useMemo<number>(() => {
    return textElRef.current ? textElRef.current.clientHeight : 0;
  }, [textElRef.current, fontProps]);

  const resetFontBounds = () => {
    setTimeout(
      () =>
        setFontProps((fs) => ({
          size: fs.size,
          l: fontSizeLow,
          h: fontSizeHigh,
          k: 0,
        })),
      50,
    );
  };

  useEffect(() => {
    if (imageHeight == 0 || textHeight == 0) return;

    const diff = Math.abs(imageHeight - textHeight);
    const heightMinDiff = 10;
    const isBalanced = diff < heightMinDiff;

    setLoading(!isBalanced);
    if (!isBalanced) optimizeFontSize(imageHeight, textHeight).then();
  }, [imageHeight, textHeight, fontProps, scrImg]);

  useEffect(() => {
    function resetOnFinishResize() {
      const currSize = { w: window.innerWidth, h: window.innerHeight };
      setTimeout(() => {
        if (
          currSize.w == window.innerWidth &&
          currSize.h == window.innerHeight
        ) {
          setLoading(true);
          resetFontBounds();
        }
      }, 150);
    }

    window.addEventListener("resize", resetOnFinishResize);

    return () => {
      window.removeEventListener("resize", resetOnFinishResize);
    };
  }, []);

  useEffect(() => {
    if (!scrImg || isInitialCheckDone) return;
    let frameId: number;

    const waitForInitial = () => {
      if (
        imgParentRef.current &&
        textElRef.current &&
        imgParentRef.current.clientHeight > 0 &&
        textElRef.current.clientHeight > 0
      ) {
        setIsInitialCheckDone(true);
        resetFontBounds();
      } else frameId = requestAnimationFrame(waitForInitial);
    };

    frameId = requestAnimationFrame(waitForInitial);
    return () => cancelAnimationFrame(frameId);
  }, [scrImg, isInitialCheckDone]);

  async function optimizeFontSize(imageHeight: number, textHeight: number) {
    if (!textElRef.current || !imgParentRef.current) return;

    /**
     * // 1. Find font bounds
     *     const minBoundsDiff = 10;
     *     const boundsDelta = 4;
     *     console.log(fontProps);
     *     if (fontProps.h - fontProps.l >= minBoundsDiff) {
     *       await new Promise((res) => setTimeout(res, 500));
     *       await new Promise((res) => requestAnimationFrame(res));
     *       setFontProps((fs) => {
     *         if (textHeight < imageHeight) {
     *           return {
     *             size: Math.min(fs.size + boundsDelta, fontSizeHigh),
     *             l: fs.size,
     *             h: fs.h,
     *             k: 0,
     *           };
     *         } else {
     *           return {
     *             size: Math.max(fs.size - boundsDelta, fontSizeLow),
     *             l: fs.size - boundsDelta,
     *             h: fs.size + boundsDelta,
     *             k: 0,
     *           };
     *         }
     *       });
     *       return;
     *     }
     */

    // 2. Optimize font size
    const boundsMinDiff = 0.2;
    const maxIter = 20;
    if (fontProps.h - fontProps.l < boundsMinDiff || fontProps.k >= maxIter) {
      setLoading(false);
      return;
    }

    await new Promise((res) => requestAnimationFrame(res));
    setFontProps((fs) => {
      const mid = (fs.l + fs.h) / 2;
      if (imageHeight > textHeight) {
        return {
          size: (fs.size + fs.h) / 2,
          l: (fs.l + mid) / 2,
          h: fs.h,
          k: fs.k + 1,
        };
      } else {
        return {
          size: (fs.l + fs.size) / 2,
          l: fs.l,
          h: (mid + fs.h) / 2,
          k: fs.k + 1,
        };
      }
    });
  }

  return (
    <div className="flex flex-row justify-between gap-[5%] px-5 py-4">
      {/* Scramble */}
      <div
        className={clsx("my-auto h-fit w-full text-center whitespace-pre-wrap")}
        ref={textElRef}
      >
        <span
          style={{
            fontSize: `${fontProps.size}px`,
            fontFamily: "monospace",
            fontWeight: "550",
            transition: "font-size",
          }}
          className="box-border w-full"
        >
          {scrText}
        </span>
      </div>

      {/*Image*/}
      {scrImg && (
        <div className="w-6/10 place-content-center">
          <div
            ref={imgParentRef}
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: scrImg,
            }}
          />
        </div>
      )}
    </div>
  );
}

function TimeInputField({
  onInputChange,
  currentInput,
  onSubmitTime,
  activeScramble,
}: {
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  currentInput: string;
  onSubmitTime: () => void;
  activeScramble: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") onSubmitTime();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeScramble]);

  return (
    <div className="place-items-center content-center justify-center">
      <input
        ref={inputRef}
        type="text"
        className="rounded-xl bg-white py-2 text-center text-2xl focus:outline-2 focus:outline-black"
        maxLength={12}
        onChange={onInputChange}
        value={currentInput}
        autoFocus
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

function PenaltySelector({
  penalties,
  timeIsValid,
}: {
  penalties: {
    togglePlusTwo: () => void;
    toggleDNF: () => void;
    currPenalty: Penalty;
  };
  timeIsValid: boolean;
}) {
  const penaltyBtnEnabledColors = {
    normal: "bg-purple-500",
    hover: "bg-purple-500/90",
    click: "bg-purple-600/90",
  };

  return (
    <div className="m-auto my-2 flex place-items-center gap-[10%]">
      <PrimaryButton
        text="+2"
        buttonSize={ButtonSize.Small}
        onClick={penalties.togglePlusTwo}
        colors={
          penalties.currPenalty == Penalties.Plus2
            ? penaltyBtnEnabledColors
            : undefined
        }
        disabled={penalties.currPenalty == Penalties.DNF || !timeIsValid}
      />
      <PrimaryButton
        text="DNF"
        buttonSize={ButtonSize.Small}
        colors={
          penalties.currPenalty == Penalties.DNF
            ? penaltyBtnEnabledColors
            : undefined
        }
        onClick={penalties.toggleDNF}
        disabled={!timeIsValid}
      />
    </div>
  );
}

function PreviewAndSubmitBtn({
  finishedEvent,
  isLastScramble,
  onSubmitTime,
  timeIsValid,
  previewStr,
}: {
  finishedEvent: boolean;
  isLastScramble: boolean;
  onSubmitTime: () => void;
  timeIsValid: boolean;
  previewStr: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <p className="text-center text-3xl">{previewStr}</p>
      {!finishedEvent && (
        <div className="m-auto w-fit">
          <PrimaryButton
            disabled={!timeIsValid}
            text={isLastScramble ? "Submit" : "Next"}
            buttonSize={ButtonSize.Small}
            onClick={onSubmitTime}
          />
        </div>
      )}
    </div>
  );
}

function SubmitSection({
  finishedEvent,
  onInputChange,
  currentInput,
  penalties,
  isLastScramble,
  onSubmitTime,
  currentResult,
  activeScramble,
}: {
  finishedEvent: boolean;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  currentInput: string;
  penalties: {
    togglePlusTwo: () => void;
    toggleDNF: () => void;
    currPenalty: Penalty;
  };
  isLastScramble: boolean;
  onSubmitTime: () => void;
  currentResult: SolveResult;
  activeScramble: number;
}) {
  const timeIsValid: boolean = currentResult.time !== null;

  return (
    <div className="mx-auto flex w-6/10 flex-row justify-between gap-[15%] p-2">
      {/*Time Input & Penalty*/}
      {!finishedEvent && (
        <div className="flex w-full flex-col">
          {/*Time Input*/}
          <TimeInputField
            onInputChange={onInputChange}
            currentInput={currentInput}
            onSubmitTime={onSubmitTime}
            activeScramble={activeScramble}
          />

          {/*Choose Penalty*/}
          <PenaltySelector penalties={penalties} timeIsValid={timeIsValid} />
        </div>
      )}

      {/*Preview & Submit Button*/}
      <PreviewAndSubmitBtn
        finishedEvent={finishedEvent}
        isLastScramble={isLastScramble}
        onSubmitTime={onSubmitTime}
        timeIsValid={timeIsValid}
        previewStr={formatSolveResult(currentResult)}
      />
    </div>
  );
}

function AttemptResultLabel({
  timeFormat,
  resultStr,
}: {
  timeFormat: TimeFormat;
  resultStr: string;
}) {
  return (
    <div>
      <p className="text-center text-3xl">
        {getTimeFormatName(timeFormat)}: {resultStr}
      </p>
    </div>
  );
}

function Compete() {
  const [competeData, setCompeteData] = useState<UserCompeteData>();
  const [scrambleImages, setScrambleImages] = useState<string[]>([]);
  const [activeScramble, setActiveScramble] = useState<number>(0);
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [allTimes, setAllTimes] = useState<PackedResult[]>([]);
  const csTimer = useCSTimer();
  const [lastOpenScramble, setLastOpenScramble] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<SolveResult>({
    penalty: Penalties.None,
    extraArgs: {},
    time: null,
  });

  const hideImage = useRef<boolean>(false);
  const numScrambles = useRef<number>(0);
  const finishedEvent = useRef<boolean>(false);
  const attemptResultStr = useRef<string | undefined>(undefined);
  const [loadingScrTxt, setLoadingScrTxt] = useState<boolean>(true);

  const params = useParams();
  const { addLoading, removeLoading } = useLoading("Compete");
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  async function initCompeteData(competeData: UserCompeteData) {
    hideImage.current = hideImageEvents.includes(competeData.eventData.eventId);
    numScrambles.current = competeData.scrambles.length;
    finishedEvent.current = competeData.results.finished;

    if (finishedEvent.current) {
      attemptResultStr.current = generateResultStr(
        competeData.eventData,
        competeData.results.times,
      );
    }

    console.log(competeData.eventData);
    setCompeteData(competeData);

    const times = competeData.results.times;
    setAllTimes(times);
    setInputValues(
      times.map((pr) => (pr.centis >= 0 ? formatPackedResult(pr) : "")),
    );

    let lastOpened = 0;
    while (
      lastOpened < numScrambles.current - 1 &&
      times[lastOpened].centis > 0
    )
      lastOpened++;
    setLastOpenScramble(lastOpened);
    setActiveScramble(lastOpened);
    setCurrentResult(unpackResult(times[lastOpened]));

    if (!hideImage.current) {
      const scrImages = await Promise.all(competeData.scrambles.map(scrToSvg));
      setScrambleImages(scrImages);
    } else setLoadingScrTxt(false);

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
  }

  useEffect(() => {
    addLoading();

    const eventId = params.eventId;
    if (!eventId || !userInfo.user) {
      removeLoading();
      navigate(RoutePath.Page.Scrambles);
      return;
    }

    sendGetRequest(RoutePath.Get.UserEventData, {
      [HttpHeaders.EVENT_ID]: eventId,
    }).then((res) => {
      if (res.aborted) return;
      else if (res.isError) return redirectToError(res.data);
      initCompeteData(res.data).then(removeLoading);
    });
  }, []);

  if (!competeData) return <LoadingSpinner />;

  const scrambles = competeData.scrambles;
  const isLastScramble: boolean = activeScramble == numScrambles.current - 1;
  const currPenalty: Penalty = currentResult.penalty ?? Penalties.None;

  function loadScramble(scrIndex: number, upload: boolean = true) {
    if (isUploading || scrIndex == activeScramble) return;

    scrIndex = Math.min(Math.max(0, scrIndex), numScrambles.current - 1);
    if (finishedEvent.current) {
      loadDisplayData();
      return;
    }

    const penaltyChanged =
      allTimes[activeScramble].penalty != currentResult.penalty;
    const timeChanged =
      allTimes[activeScramble].centis != packTime(currentResult.time);

    if (isLastScramble && scrIndex != activeScramble) {
      setInputValues((values) => {
        const newValues = [...values];
        newValues[activeScramble] = "";
        return newValues;
      });
    } else if (upload && (penaltyChanged || timeChanged)) {
      uploadCurrentResult().then(() => {
        if (activeScramble == numScrambles.current - 1)
          return window.location.reload();

        loadDisplayData();

        if (activeScramble != lastOpenScramble) return;
        setLastOpenScramble(activeScramble + 1);
        loadScramble(activeScramble);
      });
      return;
    }

    loadDisplayData();

    function loadDisplayData() {
      setActiveScramble(scrIndex);
      setCurrPenalty(allTimes[scrIndex].penalty);
      setCurrentResult(unpackResult(allTimes[scrIndex]));
      if (scrIndex > lastOpenScramble) setLastOpenScramble(scrIndex);
    }
  }

  // returns whether updating was successful
  async function updateAllTimes(newAllTimes: PackedResult[]): Promise<boolean> {
    const res = await sendPostRequest(RoutePath.Post.UpdateTimes, {
      eventId: competeData!.eventData.eventId,
      times: newAllTimes,
    });

    if (res.aborted) return false;
    if (res.isError) {
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

  /**
   * Update the current result into allTimes and upload it to the server
   */
  async function uploadCurrentResult(): Promise<void> {
    setIsUploading(true);

    const newAllTimes = [...allTimes];
    newAllTimes[activeScramble] = packResult(currentResult);
    const successful = await updateAllTimes(newAllTimes);
    setIsUploading(false);
    if (!successful) console.error("Update all times error");
    else if (isLastScramble)
      setCurrentResult(unpackResult(newAllTimes[activeScramble]));
  }

  function setCurrPenalty(p: Penalty) {
    setCurrentResult({ ...currentResult, penalty: p });
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
      penalty: Penalties.None,
      extraArgs: result.extraArgs,
      time: newTimeParts,
    }));
  }

  function nextScramble() {
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

    loadScramble(activeScramble + 1);
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
      {/*Event Title*/}
      <div className="flex justify-center gap-2 text-center text-4xl text-blue-950">
        <p className="font-bold">{competeData.eventData.eventTitle} </p>
        <span className={`cubing-icon ${competeData.eventData.iconName}`} />
      </div>
      <div
        className={clsx(
          "transition-opacity",
          loadingScrTxt ? "opacity-0" : "opacity-100",
        )}
      >
        {/* Result String */}
        {attemptResultStr.current && (
          <AttemptResultLabel
            timeFormat={competeData.eventData.timeFormat}
            resultStr={attemptResultStr.current}
          />
        )}

        {/*Scamble number menu*/}
        <ScramblesMenu
          scrambles={competeData.scrambles}
          activeScramble={activeScramble}
          allTimes={allTimes}
          loadScramble={loadScramble}
          isScrambleAccessible={isScrambleAccessible}
        />

        <div className="mx-auto w-8/10 rounded-2xl border-5 border-black bg-gray-400">
          {/*Scramble & Image*/}
          <ScrambleAndImage
            scrText={scrambles[activeScramble]}
            scrImg={
              hideImage.current ? undefined : scrambleImages[activeScramble]
            }
            setLoading={hideImage.current ? (_) => {} : setLoadingScrTxt}
          />

          {/*scamble-submit divider*/}
          <div className="my-2 w-full border-2 border-black" />

          {/*Submit Section*/}
          {isUploading ? (
            <LoadingSpinner />
          ) : (
            <SubmitSection
              finishedEvent={finishedEvent.current}
              onInputChange={onInputChange}
              currentInput={inputValues[activeScramble]}
              penalties={{ togglePlusTwo, toggleDNF, currPenalty }}
              isLastScramble={isLastScramble}
              onSubmitTime={nextScramble}
              currentResult={currentResult}
              activeScramble={activeScramble}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Compete;
