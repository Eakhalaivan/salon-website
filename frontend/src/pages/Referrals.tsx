import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { useToast } from '../components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

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
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      toast({ title: 'Copied to clipboard!', description: 'Share this code with your friends.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rewardedCount = referrals?.filter(r => r.rewardIssued).length || 0;

  return (
    <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] py-12 animate-fade-in">
      <div className="max-w-container-max-width mx-auto">
        <div className="mb-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Refer a Friend</h2>
          <p className="font-body-lg text-secondary max-w-2xl">Share the LuxeSuite experience and earn exclusive rewards for every successful referral.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Referral Code Section */}
          <div className="lg:col-span-5 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <span className="material-symbols-outlined">handshake</span>
                <h3 className="font-label-md text-primary uppercase tracking-widest">Your Referral Code</h3>
              </div>
              <p className="font-body-md text-secondary mb-8">Share this code. When they complete their first visit, you both earn rewards!</p>
              
              <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between border border-outline-variant/20">
                {isCodeLoading ? (
                  <div className="flex items-center gap-2 text-secondary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <span className="font-headline-md tracking-[0.2em] font-bold text-on-surface">
                    {codeData?.code || 'N/A'}
                  </span>
                )}
                
                <button 
                  className={`px-6 py-2 rounded-full font-label-md transition-all active:scale-95 shadow-md shadow-primary/20 text-white ${copied ? 'bg-green-600' : 'bg-primary hover:bg-primary-container'}`}
                  onClick={handleCopy}
                  disabled={!codeData?.code}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <p className="text-[11px] text-secondary-fixed-dim uppercase tracking-wider">Share via</p>
                <div className="flex gap-4">
                  <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-primary transition-colors border border-outline-variant/10">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-primary transition-colors border border-outline-variant/10">
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-primary transition-colors border border-outline-variant/10">
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Marketing Card */}
            <div className="relative rounded-xl overflow-hidden h-48 flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
              <div className="absolute inset-0 z-0">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuBAquQj1p7YVvQwQYEUJf0CC0IuINv8vXAWJRGlq0HHc4JYun_0lZKp7A-wpDLC0kHHvI0V8IJtGI8fACBGjFfyYYs-7ITcA_F3lc_GBsLrt28yEbC44iKMoN6iDIS8nXO0PE0MEsAcFWNvUQihPhH88cFNkajtKKVHH7Soq6Pj2ucn1caGO0Jjm7JYmlzewUWXUt4j9uyGMglWOd-zP8B-4Z-4KWGpSNbsXnrpSdQ6gX3jNP3V2Kwdt58NLlmbsAn6Xc6-ZJc_nJ"
                  alt="Spa relaxation room"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
              </div>
              <div className="relative z-10 p-8">
                <h4 className="font-headline-md text-primary mb-2">Give ₹500, Get ₹500</h4>
                <p className="text-body-md text-secondary">Credits can be used for any service.</p>
              </div>
            </div>
          </div>

          {/* Progress Tracker Section */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 h-full flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-6 text-primary">
                <span className="material-symbols-outlined">trending_up</span>
                <h3 className="font-label-md text-primary uppercase tracking-widest">Referral Progress</h3>
              </div>
              <p className="font-body-md text-secondary mb-12">
                You've earned <span className="text-primary font-bold">{rewardedCount} of 5</span> rewards this year.
              </p>

              {/* Horizontal Progress Tracker */}
              <div className="relative flex-1 flex flex-col justify-center py-8">
                {/* Background line */}
                <div 
                  className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full"
                  style={{ background: `linear-gradient(to right, #c5a059 ${(rewardedCount/5)*100}%, #e2dfde ${(rewardedCount/5)*100}%)` }}
                ></div>
                
                {/* Milestone markers */}
                <div className="relative flex justify-between">
                  {/* 1 Referral */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${rewardedCount >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-high border-2 border-outline-variant text-secondary'}`}>
                      <span className="material-symbols-outlined text-sm" style={rewardedCount >= 1 ? {fontVariationSettings: "'FILL' 1"} : {}}>check</span>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-label-md text-on-surface">1 Referral</p>
                      <p className="text-[10px] text-secondary mt-1">₹500 Credit</p>
                    </div>
                  </div>
                  
                  {/* 3 Referrals */}
                  <div className={`flex flex-col items-center ${rewardedCount < 3 ? 'opacity-40' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${rewardedCount >= 3 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-high border-2 border-outline-variant text-secondary'}`}>
                      <span className="material-symbols-outlined text-sm" style={rewardedCount >= 3 ? {fontVariationSettings: "'FILL' 1"} : {}}>card_giftcard</span>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-label-md text-on-surface">3 Referrals</p>
                      <p className="text-[10px] text-secondary mt-1">₹1,000 Credit</p>
                    </div>
                  </div>
                  
                  {/* 5 Referrals */}
                  <div className={`flex flex-col items-center ${rewardedCount < 5 ? 'opacity-40' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${rewardedCount >= 5 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-high border-2 border-outline-variant text-secondary'}`}>
                      <span className="material-symbols-outlined text-sm" style={rewardedCount >= 5 ? {fontVariationSettings: "'FILL' 1"} : {}}>redeem</span>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-label-md text-on-surface">5 Referrals</p>
                      <p className="text-[10px] text-secondary mt-1">₹2,000 Credit</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-8 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <span className="text-label-sm text-secondary">Rewards expire in 12 months.</span>
                </div>
                <button className="text-primary font-label-md hover:underline decoration-primary/30 underline-offset-4">Terms & Conditions</button>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals List Table Section */}
        <section className="mt-stack-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-on-surface">Your Referrals</h3>
            <button className="text-primary font-label-md flex items-center gap-1 group">
              View All <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              {isReferralsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !referrals || referrals.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon="group_add"
                    title="No Referrals Yet"
                    description="Share your code to invite friends and earn rewards."
                  />
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/10">
                      <th className="px-8 py-4 font-label-md text-secondary tracking-wider uppercase text-xs">Name</th>
                      <th className="px-8 py-4 font-label-md text-secondary tracking-wider uppercase text-xs">Status</th>
                      <th className="px-8 py-4 font-label-md text-secondary tracking-wider uppercase text-xs">Date Joined</th>
                      <th className="px-8 py-4 font-label-md text-secondary tracking-wider uppercase text-xs text-right">Reward Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {referrals.map((ref, idx) => (
                      <tr key={ref.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                              ${idx % 3 === 0 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 
                                idx % 3 === 1 ? 'bg-primary-fixed-dim text-on-primary-fixed' : 
                                'bg-surface-container text-secondary'}`}
                            >
                              U{ref.referredCustomerId}
                            </div>
                            <span className="font-label-md text-on-surface">User #{ref.referredCustomerId}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {ref.rewardIssued ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-100 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-body-md text-secondary text-sm">
                          {new Date(ref.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-primary text-sm">
                          {ref.rewardIssued ? '₹500 Wallet Credit' : <span className="text-secondary-fixed-dim font-normal">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {referrals && referrals.length > 0 && (
              <div className="p-6 text-center bg-background/30 border-t border-outline-variant/10">
                <p className="text-label-sm text-secondary italic">Showing {referrals.length} referrals</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
