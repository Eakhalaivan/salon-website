import React from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface PremiumWalletCardProps {
  balance: number | string | React.ReactNode;
  memberSince?: string;
  className?: string;
  isLoading?: boolean;
}

export const PremiumWalletCard: React.FC<PremiumWalletCardProps> = ({ 
  balance, 
  memberSince = '2024',
  className = '',
  isLoading = false 
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  // 3D Tilt setup
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);
  const sheenX = useTransform(mouseX, [0, 1], [-20, 120]);
  const sheenY = useTransform(mouseY, [0, 1], [-20, 120]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    if (shouldReduceMotion) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const formattedBalance = typeof balance === 'number' 
    ? Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(balance).replace('₹', '₹ ')
    : balance;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX: shouldReduceMotion ? 0 : rotateX, 
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1200
      }}
      className={`relative group w-full max-w-[460px] aspect-[1.586/1] rounded-[22px] p-[3px] bg-gold-gradient shadow-[0_20px_40px_rgba(33,27,20,0.4),0_10px_20px_rgba(33,27,20,0.2)] hover:shadow-[0_30px_60px_rgba(184,134,11,0.25),0_15px_30px_rgba(33,27,20,0.3)] transition-shadow duration-500 cursor-default ${className}`}
    >
      <div 
        className="relative w-full h-full rounded-[19px] overflow-hidden"
        style={{
          background: 'linear-gradient(110deg, var(--card-black-start) 0%, var(--card-black-end) 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.8)'
        }}
      >
        {/* Subtle Horizontal Brushed Metal Lines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ 
            background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)'
          }}
        />

        {/* Dynamic Specular Sheen */}
        {!shouldReduceMotion && (
          <motion.div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
              left: useTransform(sheenX, x => `${x}%`),
              top: useTransform(sheenY, y => `${y}%`),
              transform: 'translate(-50%, -50%)',
              width: '200%',
              height: '200%'
            }}
          />
        )}
        
        {/* Card Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between" style={{ transform: 'translateZ(30px)' }}>
          {/* Top Row: Logo & Brand */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 pt-4 pl-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 blur-md opacity-60" />
                <ShieldCheck className="w-5 h-5 text-blue-100 relative z-10" />
              </div>
              {/* Fake Smart Chip */}
              <div className="w-12 h-9 rounded-md bg-gold-gradient p-[1px] shadow-sm">
                <div className="w-full h-full rounded-[5px] border border-gold-700/40 grid grid-cols-3 grid-rows-3 gap-[1px]">
                  <div className="border-r border-b border-gold-700/30 rounded-tl-[4px]"></div>
                  <div className="border-b border-gold-700/30"></div>
                  <div className="border-l border-b border-gold-700/30 rounded-tr-[4px]"></div>
                  <div className="border-r border-b border-gold-700/30"></div>
                  <div className="border-b border-gold-700/30"></div>
                  <div className="border-l border-b border-gold-700/30"></div>
                  <div className="border-r border-gold-700/30 rounded-bl-[4px]"></div>
                  <div></div>
                  <div className="border-l border-gold-700/30 rounded-br-[4px]"></div>
                </div>
              </div>
            </div>
            
            <div className="text-right pt-2 pr-2">
              <div className="font-serif font-bold text-lg tracking-[0.2em] bg-gold-gradient bg-clip-text text-transparent">
                LUMINA
              </div>
              <div className="text-[0.65rem] tracking-[0.3em] text-gold-400 opacity-80 mt-0.5">
                SPA WALLET CARD
              </div>
            </div>
          </div>

          {/* Bottom section: Balance & Details */}
          <div className="flex flex-col gap-4 mt-auto">
            <div className="w-full text-right pr-2">
              {isLoading ? (
                <div className="h-10 w-32 bg-white/10 animate-pulse rounded ml-auto"></div>
              ) : (
                <div className="text-3xl sm:text-4xl font-mono tracking-widest font-semibold text-transparent bg-clip-text bg-gold-gradient drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {formattedBalance}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-end pb-1 pl-2 pr-2">
              <div className="space-y-1">
                <div className="text-[0.55rem] tracking-[0.2em] text-gold-200/80 font-semibold uppercase">
                  ELITE MEMBER<br/>
                  SINCE {memberSince}
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-[0.5rem] tracking-widest text-gold-200/80 font-semibold uppercase">
                <span className="leading-tight text-right">Valid<br/>Thru</span>
                <span className="text-sm font-mono text-gold-400">12/99</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
