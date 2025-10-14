import React, { useEffect } from "react";
import { EventDisplayAndStatus } from "@shared/types/event-display-and-status";
import clsx from "clsx";

const EXTERNAL_ICONS_URL = "https://cdn.cubing.net/v0/css/@cubing/icons/css";

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
    <div className="mx-auto mt-2 mb-2 flex w-8/10 flex-wrap place-content-center gap-x-10 gap-y-12 border-3 border-black pt-10 pb-4">
      {events.map((eds, index) => (
        <div
          key={index}
          className="box-content grid size-27 place-content-center items-center rounded-2xl border-3 border-black"
        >
          {/*on hover child (the className="" div is the child) tell parent to rotate and show title*/}
          <span
            className={`cubing-icon ${eds.info.iconName} col-1 row-1 m-auto scale-575`}
          ></span>
          <p
            className={clsx(
              "col-1 row-1",
              "relative bottom-16 pb-3 text-center text-xl font-semibold transition-all duration-50 group-hover:opacity-100",
            )}
          >
            {eds.info.eventTitle}
          </p>
        </div>
      ))}
    </div>
  );
}

export default EventBoxes;
