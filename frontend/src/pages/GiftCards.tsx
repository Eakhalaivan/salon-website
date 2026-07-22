import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Gift, Sparkles, User, Mail, ChevronRight, Zap, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import clsx from 'clsx';

interface GiftCard {
  id: number;
  code: string;
  initialBalance: number;
  currentBalance: number;
  recipientEmail: string;
  recipientName: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  message?: string;
  sentByAdminName?: string;
  recipientCustomerId?: number;
  redeemedAt?: string;
  source?: string;
}

const AMOUNTS = [1000, 2500, 5000, 10000];

const GiftCardVisual = ({ card }: { card?: Partial<GiftCard> }) => {
  const code = card?.code ? card.code.match(/.{1,4}/g)?.join(' ') : '1234 5678 9012 3456';
  
  return (
    <div className="relative w-full max-w-[340px] aspect-[1.586/1] rounded-2xl p-[1px] bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#F5D06F] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] mx-auto overflow-hidden group">
      <div className="absolute inset-0 rounded-2xl bg-[#050505] overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37]/5 to-transparent"></div>
        
        {/* Fine gold lines / Mandala pattern */}
        <div className="absolute inset-0 opacity-30 pointer-events-none flex items-center justify-center mix-blend-screen">
          <svg viewBox="0 0 400 250" className="w-full h-full stroke-[#D4AF37] stroke-[0.5] fill-none">
            <circle cx="200" cy="125" r="100" />
            <circle cx="200" cy="125" r="140" />
            <path d="M 50 125 Q 200 -50 350 125" />
            <path d="M 50 125 Q 200 300 350 125" />
            <path d="M 200 0 L 200 250" />
            <path d="M 0 125 L 400 125" />
            <circle cx="200" cy="125" r="4" fill="#D4AF37" className="stroke-none" />
            <circle cx="100" cy="125" r="3" fill="#D4AF37" className="stroke-none" />
            <circle cx="300" cy="125" r="3" fill="#D4AF37" className="stroke-none" />
          </svg>
        </div>

        {/* 3D Golden Bow (Simulated via SVG) */}
        <div className="absolute -top-4 -right-4 w-28 h-28 opacity-90 drop-shadow-xl pointer-events-none z-10">
           <svg viewBox="0 0 100 100" fill="none">
             <path d="M50 40 C 20 10, 0 40, 45 45 C 40 45, 10 70, 40 80 C 45 60, 50 50, 50 50 C 50 50, 55 60, 60 80 C 90 70, 60 45, 55 45 C 100 40, 80 10, 50 40 Z" fill="url(#bowGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))" />
             <path d="M45 45 L 30 95 L 45 90 L 50 50 Z" fill="url(#bowRibbon)" />
             <path d="M55 45 L 70 95 L 55 90 L 50 50 Z" fill="url(#bowRibbon)" />
             <circle cx="50" cy="45" r="6" fill="url(#bowGrad)" />
             <defs>
               <linearGradient id="bowGrad" x1="0" y1="0" x2="100" y2="100">
                 <stop offset="0%" stopColor="#F5D06F" />
                 <stop offset="50%" stopColor="#D4AF37" />
                 <stop offset="100%" stopColor="#B8860B" />
               </linearGradient>
               <linearGradient id="bowRibbon" x1="0" y1="0" x2="100" y2="100">
                 <stop offset="0%" stopColor="#D4AF37" />
                 <stop offset="100%" stopColor="#8B6508" />
               </linearGradient>
             </defs>
           </svg>
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-[#D4AF37] font-serif text-3xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">L</div>
          <div className="text-[#D4AF37] font-serif text-sm tracking-[0.2em] mt-2 drop-shadow-md">LUMINA SPA</div>
          <div className="flex items-center gap-2 mt-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
            <div className="text-[#9CA3AF] text-[0.45rem] tracking-[0.3em] font-medium text-center uppercase drop-shadow">
              LUXURY EXPERIENCE<br/>TIMELESS CARE
            </div>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-r from-[#111827]/80 to-[#111827]/80 backdrop-blur-md flex items-center justify-between px-6 border-t border-[#D4AF37]/20">
          <span className="text-[#D4AF37] font-mono text-[0.8rem] font-bold tracking-[0.2em] drop-shadow-sm">{code}</span>
          <button className="w-7 h-7 rounded bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center transition-colors">
            <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>
        </div>
        
        {/* Status overlay if not active */}
        {card?.status && card.status !== 'ACTIVE' && (
          <div className="absolute inset-0 bg-[#050505]/80 flex items-center justify-center backdrop-blur-sm z-20">
             <span className="text-[#F9FAFB] font-bold tracking-[0.2em] text-sm uppercase border border-[#F9FAFB] px-4 py-2 rotate-12 bg-[#050505]/40">
               {card.status}
             </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GiftCards() {
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<'purchased' | 'received'>('purchased');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const customerId = useAuthStore((s) => s.user?.customerId);

  const { data: myGiftCards, isLoading: isLoadingPurchased } = useQuery({
    queryKey: ['myGiftCards'],
    queryFn: async () => {
      const response = await axiosClient.get('/gift-cards/me');
      return response.data.content as GiftCard[];
    },
    enabled: !!customerId,
  });
  
  const { data: receivedGiftCards, isLoading: isLoadingReceived } = useQuery({
    queryKey: ['receivedGiftCards'],
    queryFn: async () => {
      const response = await axiosClient.get('/gift-cards/me/received');
      return response.data.content as GiftCard[];
    },
    enabled: !!customerId,
  });

  if (!customerId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full text-[#F9FAFB]">
        <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Authentication Required</h2>
        <p className="text-[#9CA3AF]">Please log in to view and purchase gift cards.</p>
      </div>
    );
  }

  const handlePurchase = async () => {
    if (!purchaseAmount || isNaN(Number(purchaseAmount)) || Number(purchaseAmount) <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    
    setIsPurchasing(true);
    try {
      await axiosClient.post('/gift-cards/purchase', {
        amount: Number(purchaseAmount),
        recipientEmail,
        recipientName
      });
      
      toast({ title: 'Success', description: 'Gift card created successfully!' });
      setPurchaseAmount('');
      setRecipientEmail('');
      setRecipientName('');
      queryClient.invalidateQueries({ queryKey: ['myGiftCards'] });
    } catch (error: any) {
      toast({ title: 'Purchase failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const currentCards = activeTab === 'purchased' ? myGiftCards : receivedGiftCards;
  const isLoading = activeTab === 'purchased' ? isLoadingPurchased : isLoadingReceived;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif text-[#F9FAFB] flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#D4AF37] opacity-80" />
          Gift Cards
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-2 flex items-center gap-2">
          Share luxury. Share care. <Sparkles className="w-3 h-3 text-[#D4AF37]" />
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Purchase Form */}
        <div className="bg-[#111827] rounded-3xl border border-[#D4AF37]/10 p-6 sm:p-8 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {/* Decorative Gold Ribbon Overlay */}
          <div className="absolute -top-12 -right-12 w-48 h-48 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37] to-[#F5D06F] blur-2xl rounded-full transform rotate-45 scale-150"></div>
            <svg viewBox="0 0 100 100" className="absolute top-0 right-0 w-full h-full stroke-[#D4AF37] fill-none stroke-[0.5] opacity-50">
              <path d="M 0 100 Q 50 50 100 0" />
              <path d="M 20 100 Q 70 50 100 20" />
              <circle cx="80" cy="20" r="2" fill="#D4AF37" className="stroke-none" />
            </svg>
          </div>

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-8 h-8 rounded-lg border border-[#D4AF37]/30 flex items-center justify-center bg-[#D4AF37]/10">
              <Gift className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-serif text-[#F9FAFB]">Purchase a Gift Card</h2>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Amount Selection */}
            <div>
              <label className="text-xs text-[#9CA3AF] mb-3 flex items-center gap-2">
                Select Amount <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {AMOUNTS.map(amt => {
                  const isActive = Number(purchaseAmount) === amt;
                  return (
                    <button 
                      key={amt} 
                      onClick={() => setPurchaseAmount(amt.toString())}
                      className={clsx(
                        "py-3 rounded-xl border text-sm font-medium transition-all duration-300",
                        isActive 
                          ? "bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-[#D4AF37] text-[#D4AF37] shadow-[inset_0_0_15px_rgba(212,175,55,0.1)]" 
                          : "bg-[#0B0F18] border-[#111827] text-[#9CA3AF] hover:border-[#D4AF37]/30 hover:text-[#F9FAFB]"
                      )}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]/60" />
                </div>
                <input 
                  type="number" 
                  value={purchaseAmount} 
                  onChange={e => setPurchaseAmount(e.target.value)}
                  placeholder="Or enter custom amount"
                  className="w-full bg-[#0B0F18] border border-[#111827] rounded-xl py-3 pl-10 pr-12 text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#9CA3AF]">
                  ₹ 0
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Recipient Name (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-[#D4AF37]/60" />
                  </div>
                  <input 
                    type="text" 
                    value={recipientName} 
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="Leave blank for self"
                    className="w-full bg-[#0B0F18] border border-[#111827] rounded-xl py-3 pl-10 pr-4 text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-[#9CA3AF] mb-2 block">Recipient Email (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-[#D4AF37]/60" />
                  </div>
                  <input 
                    type="email" 
                    value={recipientEmail} 
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="Email to send to"
                    className="w-full bg-[#0B0F18] border border-[#111827] rounded-xl py-3 pl-10 pr-4 text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-[#D4AF37]/20 flex items-center justify-center bg-gradient-to-br from-[#D4AF37]/20 to-transparent">
                  <Gift className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#D4AF37]">The gift card will be delivered digitally</p>
                  <p className="text-xs text-[#9CA3AF]">You can schedule it for later</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
            </div>

            {/* Submit Button */}
            <button 
              onClick={handlePurchase} 
              disabled={isPurchasing || !purchaseAmount} 
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D06F] to-[#D4AF37] p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-[#D4AF37] to-[#F5D06F] text-[#050505] font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isPurchasing ? 'Processing...' : 'Buy Gift Card'}
                {!isPurchasing && <Sparkles className="w-4 h-4 opacity-50" />}
              </div>
            </button>

            {/* Footer Icons */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <Zap className="w-3.5 h-3.5 text-[#D4AF37]" /> Instant Delivery
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> Secure Payment
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" /> Luxury Experience
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: My Gift Cards */}
        <div className="bg-[#111827] rounded-3xl border border-[#D4AF37]/10 p-6 sm:p-8 flex flex-col relative shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-serif text-[#F9FAFB]">My Gift Cards</h2>
            <div className="flex bg-[#0B0F18] border border-[#111827] rounded-full p-1">
              <button 
                onClick={() => setActiveTab('purchased')}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeTab === 'purchased' ? "bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37] text-[#D4AF37]" : "text-[#9CA3AF] hover:text-[#F9FAFB] border border-transparent"
                )}
              >
                Purchased
              </button>
              <button 
                onClick={() => setActiveTab('received')}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeTab === 'received' ? "bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37] text-[#D4AF37]" : "text-[#9CA3AF] hover:text-[#F9FAFB] border border-transparent"
                )}
              >
                Received Gifts
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none"></div>

            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            ) : currentCards?.length === 0 ? (
              <div className="w-full flex flex-col items-center z-10">
                <GiftCardVisual />
                
                <div className="mt-12 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-[2px]"></div>
                    <Gift className="w-5 h-5 text-[#D4AF37] relative z-10" />
                  </div>
                  <h3 className="text-lg font-serif text-[#F9FAFB] mb-2">No {activeTab === 'purchased' ? 'Purchased' : 'Received'} Gift Cards</h3>
                  <p className="text-sm text-[#9CA3AF] max-w-xs mb-8 leading-relaxed">
                    {activeTab === 'purchased' 
                       ? 'Purchase your first luxury gift card for yourself or a loved one.'
                       : 'You haven\'t received any gift cards from Lumina Spa yet.'}
                  </p>
                  <button className="px-6 py-2.5 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Explore Gift Cards
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 gap-8 z-10 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                  {currentCards?.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      layout
                    >
                      <GiftCardVisual card={card} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
