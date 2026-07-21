import React from 'react';

interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
}

export const TextShimmer: React.FC<TextShimmerProps> = ({ children, className = '' }) => {
  return (
    <span className={`text-shimmer ${className}`}>
      {children}
    </span>
  );
};
