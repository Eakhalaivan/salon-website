import React from 'react';


export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`shimmer bg-surface-container-high rounded-md ${className}`}></div>
  );
};
