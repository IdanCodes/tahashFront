import { JSX, ReactNode } from "react";
import { motion, MotionProps } from "motion/react";
import { easeOut } from "motion";

export const PageTransitionProps: MotionProps = {
  transition: {
    duration: 0.2,
    ease: easeOut,
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
    >
      {children}
    </motion.div>
  );
}
