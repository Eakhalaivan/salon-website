import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  isHighlighted?: boolean;
  onSelect: () => void;
  buttonText?: string;
  isActive?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period = '/ month',
  features,
  isHighlighted = false,
  onSelect,
  buttonText = 'Choose Plan',
  isActive = false,
}) => {
  const isElite = title.toLowerCase().includes('elite');

  if (isHighlighted) {
    return (
      <div className="bg-surface-container-lowest spa-card-shadow rounded-2xl p-[32px] border-2 border-primary-container relative md:scale-105 z-10 transition-transform hover:scale-[1.07] duration-300 h-full flex flex-col mt-4 md:mt-0">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container px-6 py-1.5 rounded-full shadow-lg">
          <span className="text-white text-[10px] font-bold tracking-widest uppercase">{isActive ? 'ACTIVE PLAN' : 'MOST POPULAR'}</span>
        </div>
        <div className="text-center mb-8 mt-4">
          <span className="material-symbols-outlined text-primary-container text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-widest mb-2">{title}</h3>
          <div className="flex items-center justify-center gap-1">
            <span className="text-on-surface font-bold text-3xl">{price}</span>
            <span className="text-outline font-label-md">{period}</span>
          </div>
        </div>
        <div className="space-y-4 mb-10 flex-1">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">check</span>
              <span className="text-on-surface font-label-md">{feature}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={onSelect}
          className="w-full py-4 rounded-full bg-primary-container text-white font-label-md shadow-md hover:brightness-110 active:scale-95 transition-all mt-auto"
        >
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest spa-card-shadow rounded-2xl p-[32px] border border-outline-variant/20 transition-transform hover:scale-[1.02] duration-300 h-full flex flex-col">
      {isActive && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container/20 px-6 py-1.5 rounded-full border border-primary-container/30 shadow-sm">
          <span className="text-primary-container text-[10px] font-bold tracking-widest uppercase">ACTIVE PLAN</span>
        </div>
      )}
      <div className="text-center mb-8">
        {isElite ? (
          <span className="material-symbols-outlined text-primary-fixed-dim text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
        ) : (
          <span className="material-symbols-outlined text-outline text-4xl mb-4">spa</span>
        )}
        <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-widest mb-2">{title}</h3>
        <div className="flex items-center justify-center gap-1">
          <span className="text-on-surface font-bold text-2xl">{price}</span>
          <span className="text-outline font-label-md">{period}</span>
        </div>
      </div>
      <div className="space-y-4 mb-10 flex-1">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">check</span>
            <span className="text-secondary font-label-md">{feature}</span>
          </div>
        ))}
      </div>
      <button 
        onClick={onSelect}
        className="w-full py-4 rounded-full border border-primary-container text-primary-container font-label-md hover:bg-primary-container/5 transition-colors mt-auto"
      >
        {buttonText}
      </button>
    </div>
  );
};
