import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import React from 'react';

interface GoldButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'solid' | 'outline' | 'light';
}

export const GoldButton = ({ children, className, variant = 'solid', ...props }: GoldButtonProps) => {
  const isSolid = variant === 'solid';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "relative overflow-hidden font-label-md text-sm px-6 py-3 rounded-full transition-all duration-300 shadow-lg",
        isSolid 
          ? "luxury-button-gradient text-on-primary font-medium hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
          : variant === 'light'
            ? "light-btn"
            : "bg-transparent border border-primary text-primary hover:bg-primary/10",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
