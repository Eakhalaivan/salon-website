import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { use3DTilt } from '../../hooks/use3DTilt';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  tilt?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, tilt = false, hoverable = false }) => {
  const { rotateX, rotateY, sheenX, sheenY, handleMouseMove, handleMouseLeave } = use3DTilt();
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    if (!tilt) return;
    const checkEligibility = () => {
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsEligible(isFinePointer && !prefersReducedMotion);
    };
    checkEligibility();
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', checkEligibility);
    return () => motionQuery.removeEventListener('change', checkEligibility);
  }, [tilt]);

  if (tilt && isEligible) {
    return (
      <motion.div 
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        className={`bg-surface rounded-2xl shadow-[0_4px_24px_rgba(33,29,23,0.04)] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(33,29,23,0.08)] overflow-hidden relative ${className} ${onClick ? 'cursor-pointer' : ''}`}
      >
        {children}
        <motion.div 
          className="pointer-events-none absolute inset-0 z-50 mix-blend-overlay"
          style={{ 
            background: 'radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.15), transparent 60%)',
            '--x': sheenX,
            '--y': sheenY
          } as any}
        />
      </motion.div>
    );
  }

  const hoverClass = hoverable ? 'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(33,29,23,0.08)] transition-all duration-300' : '';

  return (
    <div 
      onClick={onClick}
      className={`bg-surface rounded-2xl shadow-[0_4px_24px_rgba(33,29,23,0.04)] border border-[#E4DFD3]/40 ${hoverClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-outline-variant/30 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
};

export const CardDescription: React.FC<CardProps> = ({ children, className = '' }) => {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
};

export const CardContent = CardBody;
