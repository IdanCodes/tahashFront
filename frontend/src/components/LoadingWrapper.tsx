import React, { JSX, ReactNode } from "react";
import { useLoading } from "../context/LoadingContext";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "./PageTransition";

function LoadingWrapper({ children }: { children: ReactNode }): JSX.Element {
  const { isLoading } = useLoading();

  function LoadingPage() {
    return (
      <div className="flex h-full place-content-center justify-center">
        <p className="text-5xl">Loading...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <PageTransition key="loading">
          <LoadingPage />
        </PageTransition>
      ) : (
        <PageTransition key="content">{children}</PageTransition>
      )}
    </AnimatePresence>
  );
}

export default LoadingWrapper;
