import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { LuxuryCard } from '../components/luxury/LuxuryCard';
import { ShimmerText } from '../components/luxury/ShimmerText';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Share2, Users } from 'lucide-react';
import { AnimatedSection, AnimatedItem } from '../components/ui/AnimatedSection';
import { GoldRibbon } from '../components/ui/GoldRibbon';
import { motion, AnimatePresence } from 'framer-motion';

interface Referral {
  id: number;
  referredCustomerId: number;
  code: string;
  status: string;
  rewardIssued: boolean;
  createdAt: string;
  completedAt: string;
}

export default function Referrals() {
  const { toast } = useToast();

  const { data: codeData, isLoading: isCodeLoading } = useQuery({
    queryKey: ['myReferralCode'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/v1/referrals/me/code');
      return response.data;
    },
  });

  const { data: referrals, isLoading: isReferralsLoading } = useQuery({
    queryKey: ['myReferrals'],
    queryFn: async () => {
      const response = await axiosClient.get('/api/v1/referrals/me');
      return response.data.content as Referral[];
    },
  });

  const handleCopy = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      toast({ title: 'Copied to clipboard!', description: 'Share this code with your friends.', variant: 'success' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />

      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10 pt-8">
        <h2 className="font-serif text-6xl mb-4 tracking-wide text-[var(--color-on-surface)]">
          <ShimmerText text="Refer a Friend" />
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg tracking-wide mb-8">
          Share the LuxeSuite experience and earn exclusive rewards.
        </p>
      </header>
      
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
        <AnimatedItem>
          <LuxuryCard className="h-full relative overflow-hidden flex flex-col justify-between glass-card bg-[var(--color-surface)] p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent z-0 pointer-events-none" />
            <div className="relative z-10 pb-6 border-b border-[var(--color-border)] mb-8">
              <h3 className="flex items-center gap-3 text-[var(--color-primary)] font-serif text-3xl">
                <Share2 className="w-8 h-8" />
                Your Referral Code
              </h3>
              <p className="font-sans text-sm text-[var(--color-on-surface-variant)] mt-4 tracking-wide leading-relaxed">
                Share this code with your friends. When they complete their first visit, you both earn exclusive rewards!
              </p>
            </div>
            <div className="relative z-10 mt-auto">
              {isCodeLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="w-full bg-[var(--color-surface)]/80 p-6 rounded-2xl border border-[var(--color-border)] text-center font-mono text-4xl font-bold tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-[#fedebb] via-[#e5ae85] to-[#b1724a] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    {codeData?.code || 'N/A'}
                  </div>
                  <button 
                    onClick={handleCopy} 
                    className="w-full h-14 gradient-btn rounded-full font-sans text-sm font-semibold tracking-wider transition-all"
                  >
                    Copy Code
                  </button>
                </div>
              )}
            </div>
          </LuxuryCard>
        </AnimatedItem>
        
        <AnimatedItem>
          <LuxuryCard className="h-full bg-[var(--color-surface)] glass-card p-10 flex flex-col">
            <div className="pb-6 border-b border-[var(--color-border)] mb-6">
              <h3 className="flex items-center gap-3 text-[var(--color-primary)] font-serif text-3xl">
                <Users className="w-8 h-8" />
                Your Referrals
              </h3>
            </div>
            <div className="flex-grow">
              {isReferralsLoading ? (
                <div className="flex justify-center items-center h-full min-h-[200px]">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : referrals?.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-on-surface-variant)] bg-[var(--color-surface)]/30 rounded-2xl border border-[var(--color-border)]/50 flex flex-col items-center h-full justify-center">
                  <span className="material-symbols-outlined text-[48px] text-[var(--color-primary)]/30 mb-4">group_add</span>
                  <p className="font-sans text-sm tracking-wide">You haven't referred anyone yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {referrals?.map(ref => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={ref.id} 
                        className="bg-[var(--color-surface)]/80 border border-[var(--color-border)] p-6 rounded-2xl flex justify-between items-center hover:border-[var(--color-primary)]/50 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                      >
                        <div>
                          <p className="font-serif font-semibold text-[var(--color-on-surface)] text-xl mb-1">User #{ref.referredCustomerId}</p>
                          <p className="font-sans text-[10px] text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold">
                            Joined: {new Date(ref.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          {ref.rewardIssued ? (
                            <span className="status-pill status-pill-success">
                              <span className="status-pill-dot" />
                              Rewarded
                            </span>
                          ) : (
                            <span className="status-pill status-pill-warning">
                              <span className="status-pill-dot" />
                              Pending
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </LuxuryCard>
        </AnimatedItem>
      </AnimatedSection>
    </div>
  );
}
