import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useSpring, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/use-toast';
import { PlusCircle, AlertCircle, Landmark, X } from 'lucide-react';
import { StripeWalletTopup } from '../components/payments/StripeWalletTopup';
import { GoldRibbon } from '../components/ui/GoldRibbon';
import { PremiumWalletCard } from '../components/ui/PremiumWalletCard';
import { Card } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import clsx from 'clsx';

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
        }).format(latest).replace('₹', '₹ ')
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['myWallet'],
    queryFn: async () => {
      const response = await axiosClient.get('/wallet/me');
      return response.data as WalletDto;
    },
  });

  const currentBalance = wallet?.balance || 0;

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
      
      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 relative z-10 pt-4">
        <h2 className="font-serif text-[40px] leading-[48px] mb-2 text-ink-900">
          My Wallet
        </h2>
        <p className="font-sans text-ink-400 text-[15px] mb-8">
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
        <motion.div variants={itemVariants} className="flex justify-center lg:justify-start lg:mt-8">
          <PremiumWalletCard
            balance={<AnimatedBalance value={currentBalance} />}
            isLoading={isLoading}
          />
        </motion.div>
        
        {/* Add Funds Card */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full p-8 flex flex-col justify-center border-none shadow-sm">
            <div className="pb-6 border-b border-ink-200/50 mb-8">
              <h3 className="flex items-center gap-3 text-gold-500 font-serif text-3xl">
                <PlusCircle className="w-8 h-8" />
                Add Funds
              </h3>
            </div>
            <div className="space-y-10">
              
              <div className="space-y-4">
                <label className="text-[11px] font-sans font-semibold tracking-widest uppercase text-ink-400">Quick Select Amount</label>
                <div className="flex flex-wrap gap-3">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt.toString())}
                      className={clsx(
                        "px-6 py-2.5 rounded-full font-sans text-[13px] font-semibold transition-all duration-300 border",
                        topupAmount === amt.toString() 
                          ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-[0_4px_12px_rgba(212,175,55,0.3)]" 
                          : "bg-surface text-ink-900 border-ink-200/50 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      )}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={initiatePayment} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-sans font-semibold tracking-widest uppercase text-ink-400">Custom Amount (₹)</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={topupAmount} 
                    onChange={e => setTopupAmount(e.target.value)}
                    placeholder="Enter amount to add" 
                    className="h-14 text-lg bg-surface border-ink-200/50 text-ink-900 focus-visible:border-[#D4AF37] focus-visible:ring-[#D4AF37] rounded-xl"
                  />
                  <AnimatePresence>
                    {!isAmountValid && topupAmount !== '' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-danger-text text-sm mt-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Please enter a valid amount greater than 0.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <PrimaryButton 
                  type="submit" 
                  disabled={!isAmountValid || !topupAmount} 
                  className="w-full h-14 disabled:opacity-50 disabled:cursor-not-allowed text-[15px] font-semibold"
                >
                  Proceed to Pay
                </PrimaryButton>
              </form>
            </div>
          </Card>
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
              className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
              onClick={() => setShowPaymentModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-ink-200/50">
                <div className="flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-gold-500" />
                  <span className="font-serif text-xl text-ink-900">Top Up Wallet</span>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-ink-400 hover:text-ink-900 rounded-full hover:bg-page transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-page">
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
