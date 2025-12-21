import React, { JSX, ReactNode } from "react";
import { useLoading } from "../context/LoadingContext";
import { AnimatePresence, motion } from "motion/react";
import { PageTransition, PageTransitionProps } from "./PageTransition";
import LoadingSpinner from "./LoadingSpinner";

function LoadingWrapper({ children }: { children: ReactNode }): JSX.Element {
  const { isLoading } = useLoading("LoadingWrapper");

  function LoadingPage() {
    return (
      <>
        <p className="pt-10 text-center text-5xl">Loading...</p>
        <div className="flex h-full w-full flex-col items-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  const pageTransitionDuration =
    PageTransitionProps.transition?.duration || 0.3;
  const pageTransitionDelay = PageTransitionProps.transition?.delay || 0;
  const contentDelay = pageTransitionDuration + pageTransitionDelay;

  return (
    <>
      <AnimatePresence mode="popLayout">
        {isLoading && (
          <PageTransition key="loading">
            <LoadingPage />
          </PageTransition>
        )}
        <motion.div
          key="content"
          {...PageTransitionProps}
          initial="inactive"
          animate={isLoading ? "inactive" : "active"}
          exit="inactive"
          style={{
            pointerEvents: isLoading ? "none" : "auto",
            display: isLoading ? "none" : "block",
          }}
          transition={{
            ...PageTransitionProps.transition,
            // wait for the loading screen to finish
            delay: contentDelay,
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default LoadingWrapper;
