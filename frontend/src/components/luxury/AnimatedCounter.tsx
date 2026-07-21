import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({ value, duration = 1.5, prefix = '', suffix = '', className = '' }: AnimatedCounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('en-IN'));

  useEffect(() => {
    const animation = animate(count, value, { duration, ease: "easeOut" });
    return animation.stop;
  }, [value, duration, count]);

  return (
    <motion.span className={className}>
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </motion.span>
  );
};
