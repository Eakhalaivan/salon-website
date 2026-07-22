import React from 'react';

interface StatTileProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  caption?: string;
  actionSlot?: React.ReactNode;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({ icon, label, value, caption, actionSlot, className = '' }) => {
  return (
    <div className={`bg-surface rounded-[20px] shadow-[0_4px_24px_rgba(33,29,23,0.04)] p-6 flex flex-col justify-between h-[180px] border border-[#E4DFD3]/40 text-center relative overflow-hidden ${className}`}>
      <div>
        <div className="text-[13px] font-sans font-medium text-ink-900 mb-4">{label}</div>
        <div className="font-serif text-[32px] text-ink-900 leading-tight mb-1">{value}</div>
        {caption && <div className="font-sans text-[12px] text-ink-400 leading-tight">{caption}</div>}
      </div>
      {(actionSlot || icon) && (
        <div className="mt-4 flex flex-col items-center justify-end flex-1">
           <div className="w-full flex justify-center">
             {actionSlot}
           </div>
           {icon && <div className="text-gold-500 mt-2">{icon}</div>}
        </div>
      )}
    </div>
  );
};
