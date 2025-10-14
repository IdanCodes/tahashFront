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
    <div className="mx-auto my-5 flex w-8/10 flex-wrap place-content-center gap-5 gap-x-10">
      {events.map((eds, index) => (
        <div key={index}>
          {/*on hover child (the className="" div is the child) tell parent to rotate and show title*/}
          <div className="group grid">
            <div
              key={index}
              className="box-content grid size-25 place-content-center items-center rounded-2xl border-3 border-black"
            >
              <span
                className={`cubing-icon ${eds.info.iconName} scale-500`}
              ></span>
            </div>
            <p
              className={clsx(
                "pointer-events-none",
                "relative bottom-33 text-center text-xl font-semibold opacity-0 transition-all duration-50 group-hover:opacity-100",
              )}
            >
              {eds.info.eventTitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventBoxes;
