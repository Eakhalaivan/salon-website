import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { useToast } from '../components/ui/use-toast';
import { RazorpayWalletTopup } from '../components/payments/RazorpayWalletTopup';
import { PremiumWalletCard } from '../components/ui/PremiumWalletCard';
import { Landmark, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface WalletDto {
  id: number;
  customerId: number;
  balance: number;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function Wallet() {
  const [topupAmount, setTopupAmount] = useState('');
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

  const initiatePayment = () => {
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

  const isAmountValid = topupAmount === '' || Number(topupAmount) > 0;

  return (
    <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative overflow-hidden py-12 animate-fade-in">
      <div className="mb-stack-lg relative z-10 max-w-container-max-width mx-auto">
        <nav className="flex items-center gap-2 text-label-sm text-secondary mb-4">
          <span>Customer</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-bold">Wallet</span>
        </nav>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">My Wallet</h2>
      </div>

      {/* Bento Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start mb-stack-lg max-w-container-max-width mx-auto relative z-10">
        
        {/* Wallet Card */}
        <div className="lg:col-span-7 xl:col-span-8 h-full flex flex-col justify-center">
          <PremiumWalletCard 
            balance={currentBalance} 
            isLoading={isLoading} 
            walletId={wallet?.id.toString() || '0000'} 
          />
        </div>

        {/* Add Funds Section */}
        <div className="lg:col-span-5 xl:col-span-4 bg-surface-container-low rounded-3xl p-8 shadow-[0_4px_24px_rgba(33,29,23,0.04)] border border-outline-variant/20 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">add_card</span>
            </div>
            <h3 className="font-headline-md text-headline-md">Add Funds</h3>
          </div>
          
          <div className="mb-6 flex-1">
            <p className="font-label-md text-secondary mb-4">Quick Select</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(amt.toString())}
                  className={clsx(
                    "py-2.5 px-4 rounded-xl font-label-md transition-all duration-200 border",
                    topupAmount === amt.toString()
                      ? "border-primary bg-primary-container/10 text-primary font-bold"
                      : "border-outline-variant/30 text-on-surface hover:border-primary hover:text-primary"
                  )}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="mb-8 relative">
              <label className="font-label-md text-secondary block mb-2" htmlFor="custom_amount">Custom Amount (₹)</label>
              <input 
                id="custom_amount"
                type="number"
                min="1"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface transition-all font-body-md"
                placeholder="Enter amount to add"
              />
              {!isAmountValid && topupAmount !== '' && (
                <div className="flex items-center gap-1.5 text-error text-xs mt-2 absolute -bottom-6">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Enter a valid amount.</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={initiatePayment}
            disabled={!isAmountValid || !topupAmount}
            className="w-full bg-primary-container py-4 rounded-xl text-on-primary-container font-bold font-label-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
          >
            Proceed To Pay
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <section className="bg-surface-container-low rounded-3xl p-8 shadow-[0_4px_24px_rgba(33,29,23,0.04)] border border-outline-variant/20 max-w-container-max-width mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-headline-md text-headline-md flex items-center gap-3">
            Recent Transactions
          </h3>
          <button className="text-primary font-label-md flex items-center gap-1 hover:underline">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="py-4 font-label-md text-secondary uppercase tracking-widest text-xs">Description</th>
                <th className="py-4 font-label-md text-secondary uppercase tracking-widest text-xs">Reference ID</th>
                <th className="py-4 font-label-md text-secondary uppercase tracking-widest text-xs">Date</th>
                <th className="py-4 font-label-md text-secondary uppercase tracking-widest text-xs text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined">arrow_downward</span>
                    </div>
                    <div>
                      <p className="font-body-md font-semibold text-on-surface">Added Funds</p>
                      <p className="text-xs text-secondary">Wallet Recharge</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 text-sm text-secondary font-mono">TXN-49210-992</td>
                <td className="py-5 text-sm text-on-surface-variant">Today, 11:45 AM</td>
                <td className="py-5 text-right font-bold text-green-600">+ ₹1,000.00</td>
              </tr>
              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <span className="material-symbols-outlined">spa</span>
                    </div>
                    <div>
                      <p className="font-body-md font-semibold text-on-surface">Payment for Facial</p>
                      <p className="text-xs text-secondary">Lumina Glow Ritual</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 text-sm text-secondary font-mono">TXN-48901-884</td>
                <td className="py-5 text-sm text-on-surface-variant">2 May 2024</td>
                <td className="py-5 text-right font-bold text-on-surface">- ₹145.00</td>
              </tr>
              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined">arrow_downward</span>
                    </div>
                    <div>
                      <p className="font-body-md font-semibold text-on-surface">Added Funds</p>
                      <p className="text-xs text-secondary">Promotional Bonus</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 text-sm text-secondary font-mono">TXN-48822-105</td>
                <td className="py-5 text-sm text-on-surface-variant">28 Apr 2024</td>
                <td className="py-5 text-right font-bold text-green-600">+ ₹500.00</td>
              </tr>
              <tr className="hover:bg-surface-container-lowest transition-colors group">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                    <div>
                      <p className="font-body-md font-semibold text-on-surface">Product Purchase</p>
                      <p className="text-xs text-secondary">Botanical Body Oil</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 text-sm text-secondary font-mono">TXN-48765-219</td>
                <td className="py-5 text-sm text-on-surface-variant">24 Apr 2024</td>
                <td className="py-5 text-right font-bold text-on-surface">- ₹55.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Stripe Payment Modal Overlay */}
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
              className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-ink-200/50 bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-primary" />
                  <span className="font-headline-md text-xl text-on-surface">Top Up Wallet</span>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-secondary hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-surface-container-lowest">
                <RazorpayWalletTopup 
                  amount={Number(topupAmount)} 
                  onSuccess={handlePaymentSuccess} 
                  onError={handlePaymentError} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
