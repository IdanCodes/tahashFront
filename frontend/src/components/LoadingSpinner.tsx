import React from "react";
// import CubeLoader from "../assets/cube_loader.gif";
import CubeLoader from "../assets/cube_loader.gif";

function LoadingSpinner() {
  /**
   * To use the cube loader gif, use this img instead of the div:
   * <img
      src={CubeLoader}
      alt="Loading..."
      className="mx-auto my-4 h-40 w-auto object-contain"
      style={{ imageRendering: "crisp-edges" }} //
      role="status"
    />
   * 
   */
  return (
     <div
      className="mx-auto my-4 size-20 animate-spin rounded-full border-7 border-blue-500 border-t-transparent"
      role="status"
    />
  );
}

export default LoadingSpinner;
