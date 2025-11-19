import React, { useState } from "react";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import clsx from "clsx";
import { motion } from "motion/react";
import { CubingIconsSheet } from "./CubingIconsSheet";
import { EventSubmissionStatus } from "@shared/constants/event-submission-status";

function EventBoxIcon({ iconName }: { iconName: string }) {
  return (
    <motion.span
      className={`cubing-icon ${iconName} col-1 row-1 m-auto text-8xl`}
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

function EventBoxTitle({
  eventTitle,
  hovered,
}: {
  eventTitle: string;
  hovered: boolean;
}) {
  return (
    <motion.p
      className={clsx(
        "col-1 row-1",
        "pointer-events-none relative bottom-17 pb-2 text-center text-lg font-semibold text-nowrap select-none",
      )}
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

function EventBox({
  das,
  handleClickEvent,
}: {
  das: EventDisplayAndStatus;
  handleClickEvent: (eventId: string) => void;
}) {
  const [hovered, setHovered] = useState<boolean>(false);
  const status = das.status;
  let boxColors = getBoxColors(status);

  return (
    <>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="box-content grid size-29 cursor-pointer place-content-center items-center rounded-2xl border-3 border-black"
        style={{ backgroundColor: boxColors.default }}
        variants={{
          hover: {
            rotate: 3,
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
        onClick={() => handleClickEvent(das.info.eventId)}
      >
        <EventBoxIcon iconName={das.info.iconName} />
        <EventBoxTitle eventTitle={das.info.eventTitle} hovered={hovered} />
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
      <div className="mx-auto mt-2 mb-2 flex w-8/10 flex-wrap place-content-center gap-x-9.5 gap-y-11 border-3 border-black p-10 rounded-2xl ">
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
