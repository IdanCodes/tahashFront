import React, { useEffect } from "react";

const EXTERNAL_ICONS_URL = "https://cdn.cubing.net/v0/css/@cubing/icons/css";

export function CubingIconsSheet() {
  const elementId = "cubing-icons-stylesheet";

  function addIconsStylesheet() {
    if (document.getElementById(elementId)) return;

    const link = document.createElement("link");
    link.href = EXTERNAL_ICONS_URL;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.id = elementId;
    document.head.appendChild(link);
  }

  function removeIconsStylesheet() {
    document.getElementById(elementId)?.remove();
  }

  useEffect(() => {
    addIconsStylesheet();
    return removeIconsStylesheet;
  }, []);

  return <></>;
}
