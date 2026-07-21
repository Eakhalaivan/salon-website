import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type AnimationVariant = 'slide-up' | 'slide-left' | 'slide-right' | 'scale-in' | 'fade';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: AnimationVariant;
  id?: string;
  stagger?: boolean;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  variant = 'slide-up',
  id,
  stagger = false
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getHiddenState = () => {
    if (shouldReduceMotion) return { opacity: 0 };
    switch (variant) {
      case 'slide-up': return { opacity: 0, y: 30 };
      case 'slide-left': return { opacity: 0, x: 40 };
      case 'slide-right': return { opacity: 0, x: -40 };
      case 'scale-in': return { opacity: 0, scale: 0.95 };
      case 'fade': return { opacity: 0 };
      default: return { opacity: 0, y: 30 };
    }
  };

  const getVisibleState = () => {
    return {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: stagger ? 0 : 0.8,
        ease: "easeOut" as any,
        delay,
        staggerChildren: stagger ? 0.1 : undefined,
      }
    };
  };

  const variants = {
    hidden: getHiddenState(),
    visible: getVisibleState()
  };

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={stagger ? { hidden: { opacity: 1 }, visible: getVisibleState() } as any : variants as any}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export const AnimatedItem: React.FC<{ children: React.ReactNode; className?: string; variant?: AnimationVariant }> = ({ children, className, variant = 'slide-up' }) => {
  const getHiddenState = () => {
    switch (variant) {
      case 'slide-up': return { opacity: 0, y: 30 };
      case 'slide-left': return { opacity: 0, x: 40 };
      case 'slide-right': return { opacity: 0, x: -40 };
      case 'scale-in': return { opacity: 0, scale: 0.95 };
      case 'fade': return { opacity: 0 };
      default: return { opacity: 0, y: 30 };
    }
  };

  const variants = {
    hidden: getHiddenState(),
    visible: { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  } as any;

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
};
