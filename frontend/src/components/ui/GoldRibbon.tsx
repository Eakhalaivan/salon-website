import React from 'react';
import clsx from 'clsx';

interface GoldRibbonProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  className?: string;
}

export const GoldRibbon: React.FC<GoldRibbonProps> = ({ position = 'top-right', className }) => {
  const positionClasses = {
    'top-right': 'top-0 right-0 origin-top-right',
    'bottom-right': 'bottom-0 right-0 origin-bottom-right',
    'top-left': 'top-0 left-0 origin-top-left',
    'bottom-left': 'bottom-0 left-0 origin-bottom-left',
  };

  return (
    <div className={clsx('absolute pointer-events-none z-0 opacity-30 mix-blend-screen', positionClasses[position], className)}>
      <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M400 0C400 0 350 50 300 150C250 250 200 300 100 350C0 400 0 400 0 400L50 400C50 400 150 350 250 250C350 150 400 50 400 0Z" fill="url(#paint0_linear)"/>
        <path d="M400 50C400 50 360 90 320 180C280 270 220 320 120 370C20 420 20 420 20 420L80 420C80 420 180 370 280 270C380 170 420 70 420 20L400 50Z" fill="url(#paint1_linear)"/>
        <defs>
          <linearGradient id="paint0_linear" x1="400" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-primary)"/>
            <stop offset="0.5" stopColor="var(--color-primary-soft)"/>
            <stop offset="1" stopColor="var(--color-primary-muted)" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="paint1_linear" x1="400" y1="50" x2="20" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-primary-container)"/>
            <stop offset="0.5" stopColor="var(--color-primary)"/>
            <stop offset="1" stopColor="var(--color-background)" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
