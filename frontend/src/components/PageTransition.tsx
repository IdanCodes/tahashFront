import { JSX, ReactNode } from "react";
import { motion, MotionProps } from "motion/react";
import { easeInOut } from "motion";

export const PageTransitionProps: MotionProps = {
  transition: {
    duration: 0.12,
    ease: easeInOut,
  },
  variants: {
    active: { opacity: 1 },
    inactive: { opacity: 0 },
  },
};

export function PageTransition({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <motion.div
      {...PageTransitionProps}
      initial="inactive"
      animate="active"
      exit="inactive"
      style={{ margin: "auto" }}
    >
      {children}
    </motion.div>
  );
}
