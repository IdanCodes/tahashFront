import React from "react";
import CubeLoader from "./assets/cube loader.gif";

function LoadingSpinner() {
  return (
    <img
      src={CubeLoader}
      alt="Loading..."
      className="mx-auto my-4 h-40 w-auto object-contain"
      style={{ imageRendering: "crisp-edges" }} //
      role="status"
    />
  );
}

export default LoadingSpinner;
