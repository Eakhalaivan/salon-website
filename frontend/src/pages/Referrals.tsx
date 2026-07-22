import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Card } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/PrimaryButton';
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
      const response = await axiosClient.get('/referrals/me/code');
      return response.data;
    },
  });

  const { data: referrals, isLoading: isReferralsLoading } = useQuery({
    queryKey: ['myReferrals'],
    queryFn: async () => {
      const response = await axiosClient.get('/referrals/me');
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

      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 relative z-10 pt-4">
        <h2 className="font-serif text-[40px] leading-[48px] mb-2 text-ink-900">
          Refer a Friend
        </h2>
        <p className="font-sans text-ink-400 text-[15px] mb-8">
          Share the LuxeSuite experience and earn exclusive rewards.
        </p>
      </header>
      
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
        <AnimatedItem>
          <Card className="h-full relative overflow-hidden flex flex-col justify-between p-10 border-none shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent z-0 pointer-events-none" />
            <div className="relative z-10 pb-6 border-b border-ink-200/50 mb-8">
              <h3 className="flex items-center gap-3 text-gold-500 font-serif text-3xl">
                <Share2 className="w-8 h-8" />
                Your Referral Code
              </h3>
              <p className="font-sans text-sm text-ink-400 mt-4 tracking-wide leading-relaxed">
                Share this code with your friends. When they complete their first visit, you both earn exclusive rewards!
              </p>
            </div>
            <div className="relative z-10 mt-auto">
              {isCodeLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="w-full bg-surface p-6 rounded-2xl border border-ink-200/50 text-center font-mono text-4xl font-bold tracking-[0.4em] text-gold-500 shadow-inner">
                    {codeData?.code || 'N/A'}
                  </div>
                  <PrimaryButton 
                    onClick={handleCopy} 
                    className="w-full h-14 text-base font-semibold"
                  >
                    Copy Code
                  </PrimaryButton>
                </div>
              )}
            </div>
          </Card>
        </AnimatedItem>
        
        <AnimatedItem>
          <Card className="h-full p-10 flex flex-col border-none shadow-sm">
            <div className="pb-6 border-b border-ink-200/50 mb-6">
              <h3 className="flex items-center gap-3 text-gold-500 font-serif text-3xl">
                <Users className="w-8 h-8" />
                Your Referrals
              </h3>
            </div>
            <div className="flex-grow">
              {isReferralsLoading ? (
                <div className="flex justify-center items-center h-full min-h-[200px]">
                  <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                </div>
              ) : referrals?.length === 0 ? (
                <div className="text-center py-12 text-ink-400 bg-page rounded-2xl border border-ink-200/50 flex flex-col items-center h-full justify-center">
                  <span className="material-symbols-outlined text-[48px] text-gold-500/30 mb-4">group_add</span>
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
                        className="bg-surface border border-ink-200/50 p-6 rounded-2xl flex justify-between items-center hover:border-gold-500/50 transition-colors shadow-sm"
                      >
                        <div>
                          <p className="font-serif font-semibold text-ink-900 text-xl mb-1">User #{ref.referredCustomerId}</p>
                          <p className="font-sans text-[10px] text-ink-400 uppercase tracking-widest font-semibold">
                            Joined: {new Date(ref.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          {ref.rewardIssued ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-green-50 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
                              Rewarded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-yellow-50 text-yellow-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-700" />
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
          </Card>
        </AnimatedItem>
      </AnimatedSection>
    </div>
  );
}
