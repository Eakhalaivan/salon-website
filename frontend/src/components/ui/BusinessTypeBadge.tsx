import React from 'react';

interface BusinessTypeBadgeProps {
  businessType: 'SPA' | 'SALON' | 'BOTH' | string;
}

export const BusinessTypeBadge: React.FC<BusinessTypeBadgeProps> = ({ businessType }) => {
  const type = businessType?.toUpperCase() || 'BOTH';
  
  if (type === 'SPA') {
    return (
      <span className="inline-block px-2 py-1 rounded-full text-[10px] font-label-sm tracking-wider uppercase bg-teal-500/10 text-teal-600 border border-teal-500/20">
        Spa
      </span>
    );
  }
  
  if (type === 'SALON') {
    return (
      <span className="inline-block px-2 py-1 rounded-full text-[10px] font-label-sm tracking-wider uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20">
        Salon
      </span>
    );
  }
  
  return (
    <span className="inline-block px-2 py-1 rounded-full text-[10px] font-label-sm tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
      Both
    </span>
  );
};
