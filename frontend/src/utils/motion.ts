// src/utils/motion.ts

// Luxury easing curve for unhurried, premium feel
export const easeOutLuxe = [0.16, 1, 0.3, 1] as const;

// Standard durations
export const duration = {
  short: 0.2,
  base: 0.4,
  long: 0.8,
  slow: 1.2,
};

// Common stagger delays
export const stagger = {
  fast: 0.05,
  base: 0.1,
  slow: 0.2,
};

// Reusable transition configurations
export const transitionLuxe = {
  ease: easeOutLuxe,
  duration: duration.long,
};

export const transitionSpring = {
  type: "spring" as const,
  damping: 30,
  stiffness: 200,
  ease: easeOutLuxe,
};
