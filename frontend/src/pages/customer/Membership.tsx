import { useState } from 'react';
import { format } from 'date-fns';
import { useMySubscriptionsQuery, useSubscriptionPlansQuery, usePurchaseSubscription } from '../../hooks/api/useSubscriptions';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { EmptyState } from '../../components/ui/EmptyState';
import { LuxuryCard } from '../../components/luxury/LuxuryCard';
import { ShimmerText } from '../../components/luxury/ShimmerText';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { AnimatePresence } from 'framer-motion';

export const Membership = () => {
  const [subPage, setSubPage] = useState(0);
  const [planPage, setPlanPage] = useState(0);
  
  const purchaseMutation = usePurchaseSubscription();

  const { data: subPageData, isLoading: isLoadingSub, isError: isErrorSub } = useMySubscriptionsQuery(subPage, 10);
  const activeSubscriptions = subPageData?.content || [];
  
  const { data: planPageData, isLoading: isLoadingPlans, isError: isErrorPlans } = useSubscriptionPlansQuery(planPage, 10);
  const availablePlans = planPageData?.content || [];

  const loading = isLoadingSub || isLoadingPlans;
  const error = (isErrorSub || isErrorPlans) ? 'Failed to load membership data. Please try again later.' : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-error)]/10 text-[var(--color-error)] p-6 rounded-2xl border border-[var(--color-error)]/20 font-body-md text-center max-w-2xl mx-auto mt-12">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />

      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10 pt-8">
        <h2 className="font-serif text-6xl mb-4 tracking-wide text-[var(--color-on-surface)]">
          <ShimmerText text="My Memberships" />
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg mb-10 tracking-wide">
          Manage your exclusive salon memberships and subscriptions.
        </p>
      </header>

      {/* Active Subscriptions Section */}
      <AnimatedSection stagger className="relative z-10">
        {activeSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {activeSubscriptions.map((sub) => (
                <AnimatedItem key={sub.id}>
                  <LuxuryCard className="bg-[var(--color-surface)] glass-card p-8 relative overflow-hidden group hover:shadow-[0_8px_32px_0_rgba(212,175,55,0.15)] transition-all duration-500">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-[var(--color-primary)]/20 transition-colors duration-700"></div>
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <span className="inline-block px-4 py-1.5 bg-[var(--color-surface)]/40 backdrop-blur-md text-[var(--color-primary)] font-sans text-xs font-semibold rounded-full mb-4 uppercase tracking-widest border border-[var(--color-primary)]/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                          {sub.status}
                        </span>
                        <h3 className="font-serif text-3xl text-[var(--color-on-surface)] leading-tight">{sub.plan.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Valid Until</p>
                        <p className="font-serif text-xl text-[var(--color-on-surface)]">{format(new Date(sub.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--color-surface)]/60 backdrop-blur-md rounded-2xl p-6 mb-8 relative z-10 border border-[var(--color-border)] shadow-inner flex justify-between items-center">
                      {sub.plan.planType === 'WALLET' ? (
                        <div>
                          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">Remaining Balance</p>
                          <p className="font-serif text-4xl text-[var(--color-primary)]">₹{sub.remainingBalance.toFixed(2)}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2">Remaining Sessions</p>
                          <p className="font-serif text-4xl text-[var(--color-primary)]">{sub.remainingBalance}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-4 relative z-10">
                      <button 
                        className="flex-1 gradient-btn px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wider transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        onClick={() => purchaseMutation.mutate(sub.plan.id)}
                        disabled={purchaseMutation.isPending}
                      >
                        {purchaseMutation.isPending ? 'Processing...' : 'Renew Plan'}
                      </button>
                      <button className="flex-1 px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10">
                        View History
                      </button>
                    </div>
                  </LuxuryCard>
                </AnimatedItem>
              ))}
            </AnimatePresence>
            
            {subPageData && subPageData.totalPages > 1 && (
              <div className="xl:col-span-2 mt-8 p-4 border border-[var(--color-primary)]/20 bg-[var(--color-surface)]/30 backdrop-blur-md flex justify-between items-center rounded-2xl">
                <button 
                  className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                    subPage === 0 
                      ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                      : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                  }`}
                  disabled={subPage === 0} 
                  onClick={() => setSubPage(p => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <span className="text-[var(--color-on-surface-variant)] font-sans text-sm font-semibold tracking-wider uppercase">
                  Page {subPageData.pageNo + 1} of {subPageData.totalPages}
                </span>
                <button 
                  className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                    subPageData.last 
                      ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                      : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                  }`}
                  disabled={subPageData.last} 
                  onClick={() => setSubPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState 
            icon="workspace_premium" 
            title="No Active Membership" 
            description="Elevate your experience with our exclusive membership tiers."
            action={
              <button 
                className="gradient-btn px-8 py-3 mt-4 rounded-full font-sans text-sm font-semibold tracking-wider"
                onClick={() => document.getElementById('available-plans')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Plans Below
              </button>
            }
          />
        )}
      </AnimatedSection>

      {/* Available Plans Section */}
      <AnimatedSection id="available-plans" stagger delay={0.2} className="pt-16 mt-8 border-t border-[var(--color-border)]">
        <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10">
          <h3 className="font-serif text-4xl text-[var(--color-on-surface)] mb-4">Available Plans</h3>
          <p className="font-sans text-[var(--color-on-surface-variant)] text-lg tracking-wide">
            Select a curated membership designed to elevate your personal luxury.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {availablePlans.map((plan) => (
              <AnimatedItem key={plan.id}>
                <LuxuryCard className="h-full flex flex-col p-8 bg-[var(--color-surface)]/50 glass-card">
                  
                  <div className="relative z-10 flex flex-col flex-grow">
                    <h4 className="font-serif text-2xl text-[var(--color-on-surface)] mb-4 leading-tight">{plan.name}</h4>
                    <div className="flex items-baseline gap-2 mb-6 border-b border-[var(--color-border)] pb-6">
                      <p className="font-serif text-5xl text-[var(--color-primary)]">₹{plan.price.toFixed(0)}</p>
                      <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">/ {plan.validityDays} days</p>
                    </div>
                    
                    <p className="font-sans text-sm text-[var(--color-on-surface-variant)] mb-8 flex-grow leading-relaxed">{plan.description}</p>
                    
                    <ul className="space-y-4 mb-10">
                      <li className="flex items-start font-sans text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                        <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px] mr-3 shrink-0">verified</span>
                        {plan.discountRate}% privileges on all services
                      </li>
                      {plan.planType === 'SESSION_COUNT' && (
                        <li className="flex items-start font-sans text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                          <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px] mr-3 shrink-0">verified</span>
                          {plan.totalSessions} complimentary sessions
                        </li>
                      )}
                    </ul>
                    
                    <button 
                      className="w-full gradient-btn px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wider mt-auto disabled:opacity-70 disabled:cursor-not-allowed"
                      onClick={() => purchaseMutation.mutate(plan.id)}
                      disabled={purchaseMutation.isPending}
                    >
                      {purchaseMutation.isPending ? 'Processing...' : 'Select Ritual'}
                    </button>
                  </div>
                </LuxuryCard>
              </AnimatedItem>
            ))}
          </AnimatePresence>
        </div>
        
        {planPageData && planPageData.totalPages > 1 && (
          <div className="mt-12 p-4 border border-[var(--color-primary)]/20 bg-[var(--color-surface)]/30 backdrop-blur-md flex justify-between items-center rounded-2xl">
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                planPage === 0 
                  ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                  : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
              }`}
              disabled={planPage === 0} 
              onClick={() => setPlanPage(p => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span className="text-[var(--color-on-surface-variant)] font-sans text-sm font-semibold tracking-wider uppercase">
              Page {planPageData.pageNo + 1} of {planPageData.totalPages}
            </span>
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                planPageData.last 
                  ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                  : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
              }`}
              disabled={planPageData.last} 
              onClick={() => setPlanPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
};
