import React from 'react';

interface Milestone {
  id: string | number;
  label: string;
  isAchieved: boolean;
}

interface ProgressTrackerProps {
  milestones: Milestone[];
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ milestones, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-between w-full ${className}`}>
      {/* Background track line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-ink-200 -translate-y-1/2 z-0" />
      
      {milestones.map((milestone, index) => {
        // Calculate dynamic line fill from previous milestone to current
        const isPast = index > 0 && milestone.isAchieved;
        
        return (
          <div key={milestone.id} className="relative z-10 flex flex-col items-center">
            {/* Active connecting line before this node */}
            {index > 0 && (
              <div 
                className={`absolute right-1/2 top-1/2 h-[2px] -translate-y-1/2 w-full transition-all duration-500 origin-left ${isPast ? 'bg-gold-500 scale-x-100' : 'bg-transparent scale-x-0'}`} 
                style={{ width: 'calc(200% + 1rem)' }} 
              />
            )}

            {/* Node */}
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-surface z-10 ${
                milestone.isAchieved ? 'border-gold-500 shadow-[0_0_10px_rgba(201,153,46,0.3)]' : 'border-ink-200'
              }`}
            >
              {milestone.isAchieved && (
                <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
              )}
            </div>

            {/* Label */}
            <div className={`absolute top-8 text-center w-32 -ml-16 left-1/2 font-sans text-xs transition-colors duration-300 ${
              milestone.isAchieved ? 'text-ink-900 font-medium' : 'text-ink-400'
            }`}>
              {milestone.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
