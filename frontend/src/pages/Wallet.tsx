import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { LuxuryCard } from '../components/luxury/LuxuryCard';
import { ShimmerText } from '../components/luxury/ShimmerText';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/use-toast';
import { Loader2, PlusCircle, AlertCircle, Landmark, X, ShieldCheck } from 'lucide-react';
import { StripeWalletTopup } from '../components/payments/StripeWalletTopup';
import { GoldRibbon } from '../components/ui/GoldRibbon';

interface WalletDto {
  id: number;
  customerId: number;
  balance: number;
}

function AnimatedBalance({ value, onComplete }: { value: number, onComplete?: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const spring = useSpring(value, { bounce: 0, duration: shouldReduceMotion ? 0 : 800 });
  const [display, setDisplay] = useState('₹ 0.00');

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplay(
        Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        }).format(latest).replace('₹', '₹ ') // Add space after symbol for card aesthetic
      );
      if (latest === value && onComplete) {
        onComplete();
      }
    });
  }, [spring, value, onComplete]);

  return <span>{display}</span>;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];


export default function Wallet() {
  const [topupAmount, setTopupAmount] = useState('');
  
  // Razorpay Mock state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Animation states
  const [pulse, setPulse] = useState(false);
  const [sweepKey, setSweepKey] = useState(0); 
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['myWallet'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/v1/wallet/me');
      return response.data as WalletDto;
    },
  });

  const currentBalance = wallet?.balance || 0;

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

  const initiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupAmount || Number(topupAmount) <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast({ title: 'Payment Successful', description: `Successfully topped up ₹${topupAmount}` });
    setTopupAmount('');
    
    if (!shouldReduceMotion) {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }
    
    queryClient.invalidateQueries({ queryKey: ['myWallet'] });
  };

  const handlePaymentError = (error: any) => {
    const backendMessage = error.response?.data?.message || error.message || 'Payment failed';
    toast({ title: 'Payment failed', description: backendMessage, variant: 'destructive' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  } satisfies Variants;

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.6 } },
  } satisfies Variants;

  const isAmountValid = topupAmount === '' || Number(topupAmount) > 0;

  return (
    <div className="container mx-auto p-6 space-y-8 relative pb-12">
      <GoldRibbon position="top-right" />
      
      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10 pt-8">
        <h2 className="font-serif text-6xl mb-4 tracking-wide text-[var(--color-on-surface)]">
          <ShimmerText text="My Wallet" />
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg tracking-wide">
          Manage your elite premier balance and reload funds seamlessly.
        </p>
      </header>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      >
        {/* Elite Premium 3D Card */}
        <motion.div variants={itemVariants} style={{ perspective: 1200 }} className="flex justify-center lg:justify-start">
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
              rotateX: shouldReduceMotion ? 0 : rotateX, 
              rotateY: shouldReduceMotion ? 0 : rotateY,
              transformStyle: 'preserve-3d',
            }}
            animate={pulse ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
            className="relative group w-full max-w-[460px] aspect-[1.586/1] rounded-[22px] p-[3px] bg-gradient-to-br from-primary via-primary-container to-primary shadow-[0_20px_40px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_60px_rgba(var(--color-primary-rgb),0.25),0_15px_30px_rgba(0,0,0,0.3)] transition-shadow duration-500 cursor-default"
          >
            {/* Outer Glow on Topup */}
            <AnimatePresence>
              {pulse && !shouldReduceMotion && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-2 rounded-[24px] bg-primary blur-2xl opacity-40 pointer-events-none"
                />
              )}
            </AnimatePresence>
            
            <div 
              className="relative w-full h-full rounded-[19px] overflow-hidden bg-surface-container-highest"
              style={{
                backgroundImage: 'linear-gradient(110deg, #1f1f1f 0%, #0a0a0a 100%)',
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

              {/* Debossed Repeating L Pattern on Left */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-[45%] opacity-10 pointer-events-none overflow-hidden"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L25 10 L25 45 L50 45 L50 60 L10 60 Z' fill='none' stroke='%23ffffff' stroke-width='2'/%3E%3C/svg%3E")`,
                  backgroundSize: '80px 80px',
                  boxShadow: 'inset -20px 0 40px #151515' // fade out pattern towards center
                }}
              />

              {/* Dynamic Specular Sheen (Reacts to pointer) */}
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

              {/* Shine Sweep Animation */}
              {!shouldReduceMotion && (
                <motion.div 
                  key={sweepKey}
                  initial={{ left: '-150%' }}
                  animate={{ left: '200%' }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-[25deg] pointer-events-none mix-blend-screen"
                />
              )}
              
              {/* Card Content Layout */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between" style={{ transform: 'translateZ(30px)' }}>
                
                {/* Top Row: Logo & Brand */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-4">
                    {/* Glowing Shield + Smart Chip */}
                    <div className="flex items-center gap-3 pt-4 pl-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 blur-md opacity-60" />
                        <ShieldCheck className="w-5 h-5 text-blue-100 relative z-10" />
                      </div>
                      
                      {/* CSS Smart Chip */}
                      <div className="w-12 h-9 rounded-md bg-gradient-to-br from-[#e8c095] to-[#c18652] p-[1px] shadow-sm">
                        <div className="w-full h-full rounded-[5px] border border-[#7a482b]/40 grid grid-cols-3 grid-rows-3 gap-[1px]">
                          <div className="border-r border-b border-[#7a482b]/30 rounded-tl-[4px]"></div>
                          <div className="border-b border-[#7a482b]/30"></div>
                          <div className="border-l border-b border-[#7a482b]/30 rounded-tr-[4px]"></div>
                          <div className="border-r border-b border-[#7a482b]/30"></div>
                          <div className="border-b border-[#7a482b]/30"></div>
                          <div className="border-l border-b border-[#7a482b]/30"></div>
                          <div className="border-r border-[#7a482b]/30 rounded-bl-[4px]"></div>
                          <div></div>
                          <div className="border-l border-[#7a482b]/30 rounded-br-[4px]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Brand Text */}
                  <div className="text-right pt-2 pr-2">
                    <div className="font-serif font-bold text-lg tracking-[0.2em] bg-gradient-to-r from-[#eac59b] via-[#dca376] to-[#b1724a] bg-clip-text text-transparent">
                      LUMINA
                    </div>
                    <div className="text-[0.65rem] tracking-[0.3em] text-[#dfa581] opacity-80 mt-0.5">
                      SPA & WELLNESS
                    </div>
                  </div>
                </div>

                {/* Center / Bottom: Balance & Details */}
                <div className="flex flex-col gap-4 mt-auto">
                  {/* Balance (Acting as Card Number) */}
                  <div className="w-full text-right pr-2">
                    {isLoading ? (
                      <div className="h-10 flex items-center justify-end">
                        <Loader2 className="w-6 h-6 animate-spin text-[#dfa581]" />
                      </div>
                    ) : (
                      <div className="text-3xl sm:text-4xl font-mono tracking-widest font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#fedebb] via-[#e5ae85] to-[#b1724a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <AnimatedBalance 
                          value={currentBalance} 
                          onComplete={() => {
                            if (!shouldReduceMotion) setSweepKey(k => k + 1);
                          }} 
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="flex justify-between items-end pb-1 pl-2 pr-2">
                    <div className="space-y-1">
                      <div className="text-[0.55rem] tracking-[0.2em] text-[#dfa581]/70 font-semibold">
                        ELITE PREMIER MEMBER<br/>
                        SINCE 2024
                      </div>
                      <div className="text-sm sm:text-base tracking-[0.15em] font-serif text-[#e5ae85] mt-1">
                        CURRENT BALANCE
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 text-[0.5rem] tracking-widest text-[#dfa581]/70 font-semibold uppercase">
                        <span className="leading-tight text-right">Valid<br/>Thru</span>
                        <span className="text-sm font-mono text-[#e5ae85]">12/99</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Add Funds Card */}
        <motion.div variants={itemVariants} className="h-full">
          <LuxuryCard className="h-full p-8 flex flex-col justify-center glass-card bg-[var(--color-surface)]">
            <div className="pb-6 border-b border-[var(--color-border)] mb-8">
              <h3 className="flex items-center gap-3 text-[var(--color-primary)] font-serif text-3xl">
                <PlusCircle className="w-8 h-8" />
                Add Funds
              </h3>
            </div>
            <div className="space-y-10">
              
              <div className="space-y-4">
                <label className="text-xs font-sans font-semibold tracking-widest uppercase text-[var(--color-on-surface-variant)]">Quick Select Amount</label>
                <div className="flex flex-wrap gap-3">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt.toString())}
                      className={`px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wider transition-all duration-300 border
                        ${topupAmount === amt.toString() 
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                          : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-on-surface)]'
                        }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={initiatePayment} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-sans font-semibold tracking-widest uppercase text-[var(--color-on-surface-variant)]">Custom Amount (₹)</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={topupAmount} 
                    onChange={e => setTopupAmount(e.target.value)}
                    placeholder="Enter amount to add" 
                    className="h-14 text-lg bg-[var(--color-surface)]/30 border-[var(--color-border)] text-[var(--color-on-surface)] focus-visible:border-[var(--color-primary)]/50"
                  />
                  <AnimatePresence>
                    {!isAmountValid && topupAmount !== '' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-[var(--color-error)] text-sm mt-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Please enter a valid amount greater than 0.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!isAmountValid || !topupAmount} 
                  className="w-full h-14 gradient-btn rounded-full font-sans text-sm font-semibold tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Pay
                </button>
              </form>
            </div>
          </LuxuryCard>
        </motion.div>
      </motion.div>

      {/* Mock Razorpay Payment Modal Overlay */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPaymentModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-primary-600" />
                  <span className="font-semibold text-gray-800">Top Up Wallet</span>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <StripeWalletTopup 
                  amount={Number(topupAmount)} 
                  onSuccess={handlePaymentSuccess} 
                  onError={handlePaymentError} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
