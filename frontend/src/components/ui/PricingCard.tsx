import React from 'react';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { Check, Crown } from 'lucide-react';
import { Badge } from './Badge';

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
  return (
    <div className="relative h-full flex mt-4">
      {/* "MOST POPULAR" Ribbon for highlighted tier */}
      {isHighlighted && (
        <div className="absolute -top-4 right-6 z-10">
          <Badge variant="dark" className="shadow-lg py-1.5 px-4 rounded-md">
            Most Popular
          </Badge>
        </div>
      )}
      
      <Card 
        className={`flex flex-col w-full p-8 transition-shadow duration-300 ${
          isHighlighted ? 'bg-ink-900 shadow-[0_8px_32px_rgba(33,29,23,0.12)] border-none' : 'bg-surface border border-ink-200/50 shadow-[0_4px_24px_rgba(33,29,23,0.04)] hover:shadow-[0_8px_32px_rgba(33,29,23,0.08)]'
        }`}
      >
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {isHighlighted && <Crown className="w-5 h-5 text-[#D4AF37]" />}
            <h3 className={`font-serif font-medium text-2xl ${isHighlighted ? 'text-white' : 'text-ink-900'}`}>
              {title}
            </h3>
            {isActive && (
              <Badge variant={isHighlighted ? 'dark' : 'gold'} className="ml-auto">Active</Badge>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-4">
            <span className={`font-sans text-[32px] font-bold ${isHighlighted ? 'text-[#D4AF37]' : 'text-ink-900'}`}>
              {price}
            </span>
            <span className={`font-sans text-sm ${isHighlighted ? 'text-ink-300' : 'text-ink-400'}`}>
              {period}
            </span>
          </div>
        </div>

        <div className="flex-grow mt-4">
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className={`w-5 h-5 shrink-0 stroke-[1.5] ${isHighlighted ? 'text-[#D4AF37]' : 'text-[#D4AF37]'}`} />
                <span className={`font-sans text-[15px] ${isHighlighted ? 'text-ink-200' : 'text-ink-700'}`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          {isHighlighted ? (
            <button 
              onClick={onSelect}
              className="w-full bg-[#D4AF37] text-white font-sans font-medium rounded-full px-6 py-3 transition-all duration-300 hover:bg-[#C9992E] hover:shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
            >
              {buttonText}
            </button>
          ) : (
            <PrimaryButton onClick={onSelect} className="w-full">
              {buttonText}
            </PrimaryButton>
          )}
        </div>
      </Card>
    </div>
  );
};
