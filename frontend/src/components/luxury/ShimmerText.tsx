import { motion } from 'framer-motion';

interface ShimmerTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const ShimmerText = ({ text, className = "", delay = 0 }: ShimmerTextProps) => {
  return (
    <motion.span
      initial={{ backgroundPosition: '200% center' }}
      animate={{ backgroundPosition: '-200% center' }}
      transition={{ 
        repeat: Infinity, 
        duration: 3, 
        ease: "linear",
        delay 
      }}
      className={`inline-block text-transparent bg-clip-text bg-[length:200%_auto] text-gold-gradient ${className}`}
    >
      {text}
    </motion.span>
  );
};
