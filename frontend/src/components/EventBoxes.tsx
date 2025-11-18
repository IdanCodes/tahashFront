import React, { useState } from "react";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import clsx from "clsx";
import { motion } from "motion/react";
import { CubingIconsSheet } from "./CubingIconsSheet";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";
import { EventDisplayInfo } from "@shared/interfaces/event-display-info";

export function EventBoxIcon({
  iconName,
  size = "6rem",
}: {
  iconName: string;
  size?: string;
}) {
  return (
    <motion.span
      className={`cubing-icon ${iconName} col-1 row-1 flex justify-center text-6xl`}
      style={{
        fontSize: size,
        lineHeight: 1,
      }}
      variants={{
        hover: {
          opacity: 0.8,
        },
      }}
      transition={{
        opacity: {
          duration: 0.1,
          ease: "easeOut",
        },
      }}
    />
  );
}

export function EventBoxTitle({
  eventTitle,
  hovered,
  height = 20,
  fontSize = 2,
}: {
  eventTitle: string;
  hovered: boolean;
  height?: number;
  fontSize?: number;
}) {
  return (
    <motion.p
      className={clsx(
        "col-1 row-1",
        "pointer-events-none relative pb-2 text-center font-semibold text-nowrap select-none",
      )}
      style={{
        bottom: `${height}px`,
        fontSize: `${fontSize}rem`,
      }}
      initial={{
        opacity: 0,
      }}
      variants={{
        hover: {
          opacity: 1,
        },
      }}
      transition={{
        opacity: {
          duration: hovered ? 0.1 : 0.15,
          ease: hovered ? "easeOut" : "easeIn",
        },
      }}
    >
      {eventTitle}
    </motion.p>
  );
}

function getBoxColors(status: EventSubmissionStatus): {
  default: string;
  hover: string;
  click: string;
} {
  switch (status) {
    case EventSubmissionStatus.NotStarted:
      return {
        default: "rgba(0, 0, 0, 0)",
        hover: "rgba(110, 110, 110, 0.2)",
        click: "rgb(100, 100, 100, 0.4)",
      };

    case EventSubmissionStatus.InProgress:
      return {
        default: "rgba(214, 236, 116, 0.4)",
        hover: "hsla(68, 52%, 65%, 0.4)",
        click: "hsla(65, 81%, 30%, 0.5)",
      };

    default:
      return {
        default: "rgba(45, 226, 70, 0.2)",
        hover: "hsla(128, 76%, 53%, 0.2)",
        click: "hsla(130, 85%, 27%, 0.4)",
      };
  }
}

export function EventBox({
  das,
  handleClickEvent,
  boxOptions = {
    size: 6,
    fontSize: 1.3,
    hasBorder: true,
    animateHover: true,
  },
}: {
  das: EventDisplayInfo | EventDisplayAndStatus;
  handleClickEvent: (eventId: string) => void;
  boxOptions?: {
    size: number;
    fontSize: number;
    hasBorder: boolean;
    animateHover: boolean;
  };
}) {
  const [hovered, setHovered] = useState<boolean>(false);
  const status =
    "status" in das ? das.status : EventSubmissionStatus.NotStarted;
  let boxColors = getBoxColors(status);

  return (
    <>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className={clsx(
          `box-content grid cursor-pointer place-content-center items-center rounded-2xl`,
          boxOptions.hasBorder && "border-black outline-[2.5px]",
        )}
        style={{
          backgroundColor: boxColors.default,
          padding: `${boxOptions.size / 1.2}px`,
        }}
        variants={{
          hover: {
            rotate: boxOptions.animateHover ? 3 : 0,
            scale: 1.07,
            backgroundColor: boxColors.hover,
          },
          click: {
            backgroundColor: boxColors.click,
          },
        }}
        transition={{
          ease: hovered ? "linear" : "easeOut",
          rotate: {
            duration: hovered ? 0.1 : 0.12,
          },
          scale: {
            duration: hovered ? 0.2 : 0.07,
          },
          backgroundColor: {
            duration: hovered ? 0.05 : 0.1,
          },
        }}
        whileHover="hover"
        whileTap="click"
        onClick={() => handleClickEvent(das.eventId)}
      >
        <EventBoxIcon iconName={das.iconName} size={`${boxOptions.size}rem`} />
        <EventBoxTitle
          eventTitle={das.eventTitle}
          hovered={hovered}
          height={boxOptions.size * (10 + (7 - boxOptions.size) / 5)}
          fontSize={boxOptions.fontSize}
        />
      </motion.div>
    </>
  );
}

function EventBoxes({
  events,
  handleClickEvent = undefined,
}: {
  events: EventDisplayAndStatus[];
  handleClickEvent: ((eventId: string) => void) | undefined;
}) {
  return (
    <>
      <CubingIconsSheet />
      <div className="mx-auto mt-2 mb-2 flex w-8/10 flex-wrap place-content-center gap-x-9.5 gap-y-11 pt-6 pb-4">
        {events.map((das, index) => (
          <EventBox
            key={index}
            das={das}
            handleClickEvent={handleClickEvent ?? ((_) => {})}
          />
        ))}
      </div>
    </>
  );
}

export default EventBoxes;
