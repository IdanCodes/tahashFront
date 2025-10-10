import React, { JSX, ReactNode } from "react";
import { useLoading } from "../context/LoadingContext";

function LoadingWrapper({ children }: { children: ReactNode }): JSX.Element {
  const { isLoading } = useLoading();

  if (isLoading)
    return (
      <div className="flex h-full place-content-center justify-center bg-gray-300/90">
        <p className="text-5xl">Loading...</p>
      </div>
    );

  return <>{children}</>;
}

export default LoadingWrapper;
