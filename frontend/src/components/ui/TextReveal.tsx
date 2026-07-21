import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className = '', delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  
  // Split text into words for stagger effect
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 30,
        stiffness: 200,
        ease: 'easeOut' as any
      },
    },
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 40,
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block overflow-hidden pb-1 pr-[0.3em]" // added padding to prevent cutting off text descenders
        >
          {/* using inline-block inside to mask translation */}
          <span className="inline-block">
            {word}
          </span>
        </motion.span>
      ))}
    </motion.div>
  );
};
