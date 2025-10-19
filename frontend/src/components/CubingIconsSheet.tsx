import React, { useEffect } from "react";

const EXTERNAL_ICONS_URL = "https://cdn.cubing.net/v0/css/@cubing/icons/css";

export function CubingIconsSheet() {
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

  return <></>;
}
