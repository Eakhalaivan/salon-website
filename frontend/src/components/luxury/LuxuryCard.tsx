import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import React from 'react';

interface LuxuryCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const LuxuryCard = ({ children, className, hoverEffect = true, ...props }: LuxuryCardProps) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={clsx(
        "glass-luxury-card rounded-2xl p-6 border border-outline-variant/20 overflow-hidden relative group",
        hoverEffect && "gold-glow-hover",
        className
      )}
      {...props}
    >
      {/* Subtle shine effect on hover */}
      {hoverEffect && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
