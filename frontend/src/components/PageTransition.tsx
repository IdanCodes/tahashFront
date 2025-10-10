import { JSX, ReactNode } from "react";
import { motion } from "motion/react";

export function PageTransition({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: "easeIn" }}
    >
      {children}
    </motion.div>
  );
}
