import React, { useEffect, useState } from "react";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import clsx from "clsx";
import { motion } from "motion/react";

const EXTERNAL_ICONS_URL = "https://cdn.cubing.net/v0/css/@cubing/icons/css";

function EventBoxIcon({ iconName }: { iconName: string }) {
  return (
    <motion.span
      className={`cubing-icon ${iconName} col-1 row-1 m-auto scale-600`}
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

function EventBox({ das }: { das: EventDisplayAndStatus }) {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="box-content grid size-29 cursor-pointer place-content-center items-center rounded-2xl border-3 border-black"
        variants={{
          hover: {
            rotate: 3,
            scale: 1.07,
            backgroundColor: "rgba(110, 110, 110, 0.2)",
          },
          click: {
            backgroundColor: "rgb(100, 100, 100, 0.4)",
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
      >
        <EventBoxIcon iconName={das.info.iconName} />
        <EventBoxTitle eventTitle={das.info.eventTitle} hovered={hovered} />
      </motion.div>
    </>
  );
}

function EventBoxes({ events }: { events: EventDisplayAndStatus[] }) {
  function addIconsStylesheet() {
    const link = document.createElement("link");
    link.href = EXTERNAL_ICONS_URL;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.id = "cubing-icons-stylesheet";
    document.head.appendChild(link);
  }

  function removeIconsStylesheet() {
    document.getElementById("cubing-icons-style")?.remove();
  }

  useEffect(() => {
    addIconsStylesheet();
    return removeIconsStylesheet;
  }, []);

  return (
    <div className="mx-auto mt-2 mb-2 flex w-8/10 flex-wrap place-content-center gap-x-9.5 gap-y-11 border-3 border-black pt-10 pb-4">
      {events.map((das, index) => (
        <EventBox key={index} das={das} />
      ))}
    </div>
  );
}

export default EventBoxes;
