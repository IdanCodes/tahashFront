import { JSX, ReactNode } from "react";
import { motion, MotionProps } from "motion/react";
import { easeInOut } from "motion";

export const PageTransitionProps: MotionProps = {
  transition: {
    duration: 0.14,
    ease: easeInOut,
  },
  variants: {
    active: { opacity: 1,
      scale: 1
    },
    inactive: { opacity: 0,
      scale: 0.99

    },
  },
};

export function PageTransition({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <motion.div
    key={location.pathname}
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


/**
 * mongodump --uri="mongodb://localhost:27017/your_database_name" --out="./backup_directory"

docker exec -it mongodb mongosh -u 7qH6Tx4iAN7k.n-DzvEmtbMhGTZtEj -p qtYW74JUvn8w-qUVw!.uCVvficFUCC
 */
