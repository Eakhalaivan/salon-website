import React from 'react';
import { motion, useSpring } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { useMagnetic } from '../../hooks/useMagnetic';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  magnetic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  magnetic = false,
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-label-md tracking-wide transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-400 text-on-primary shadow-md hover:shadow-xl hover:glow-hover border border-primary-300/30 ripple',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90',
    outline: 'border border-outline text-on-surface hover:bg-surface-variant',
    danger: 'bg-error text-on-error hover:bg-error/90',
    ghost: 'text-on-surface hover:bg-surface-variant/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-label-sm',
    md: 'px-6 py-2.5 text-label-md',
    lg: 'px-10 py-4 text-label-lg',
  };

  const { x, y, handleMouseMove, handleMouseLeave, isEligible } = useMagnetic();
  
  // Apply a smooth spring for the return animation
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const mergedStyle = magnetic && isEligible 
    ? { x: smoothX, y: smoothY, ...props.style } 
    : props.style;

  return (
    <motion.button 
      style={mergedStyle}
      onMouseMove={magnetic ? handleMouseMove : undefined}
      onMouseLeave={magnetic ? handleMouseLeave : undefined}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="material-symbols-outlined animate-spin text-[1.2em] mr-2">progress_activity</span>
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};
