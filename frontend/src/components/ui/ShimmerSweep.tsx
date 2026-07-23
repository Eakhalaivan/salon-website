import { motion } from 'framer-motion';

interface ShimmerSweepProps {
  className?: string;
  angle?: number;
}

export const ShimmerSweep = ({ className = '', angle = 0 }: ShimmerSweepProps) => {
  return (
    <motion.span
      className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent ${className}`}
      style={{ rotate: angle }}
      variants={{
        initial: { x: '-150%' },
        hover: { x: '150%' }
      }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    />
  );
};
