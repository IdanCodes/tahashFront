import React, { JSX, ReactNode } from "react";
import { useLoading } from "../context/LoadingContext";
import { AnimatePresence, motion } from "motion/react";
import { PageTransition, PageTransitionProps } from "./PageTransition";

function LoadingWrapper({ children }: { children: ReactNode }): JSX.Element {
  const { isLoading } = useLoading();

  function LoadingPage() {
    return (
      <div className="flex h-full place-content-center justify-center">
        <p className="text-5xl">Loading...</p>
      </div>
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
      </AnimatePresence>
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
    </>
  );
}

export default LoadingWrapper;
