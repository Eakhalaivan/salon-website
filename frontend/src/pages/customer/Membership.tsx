import { useState } from 'react';
import { format } from 'date-fns';
import { useMySubscriptionsQuery, useSubscriptionPlansQuery, usePurchaseSubscription } from '../../hooks/api/useSubscriptions';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { PricingCard } from '../../components/ui/PricingCard';
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
        <span className="material-symbols-outlined animate-spin text-gold-500 text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-bg text-danger-text p-6 rounded-2xl border border-danger-bg/50 font-sans text-center max-w-2xl mx-auto mt-12">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />

      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 relative z-10 pt-4">
        <h2 className="font-serif text-5xl mb-3 text-ink-900">
          My Memberships
        </h2>
        <p className="font-sans text-ink-400 text-[15px] mb-10">
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
                  <Card className="p-8 relative overflow-hidden group border-none shadow-sm">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-gold-500/10 transition-colors duration-700"></div>
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <span className="inline-block px-4 py-1.5 bg-surface text-gold-500 font-sans text-[11px] font-semibold rounded-full mb-4 uppercase tracking-widest border border-gold-500/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                          {sub.status}
                        </span>
                        <h3 className="font-serif text-3xl text-ink-900 leading-tight">{sub.plan.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-1">Valid Until</p>
                        <p className="font-serif text-xl text-ink-900">{format(new Date(sub.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="bg-surface-muted rounded-2xl p-6 mb-8 relative z-10 border border-ink-200/50 flex justify-between items-center">
                      {sub.plan.planType === 'WALLET' ? (
                        <div>
                          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Remaining Balance</p>
                          <p className="font-serif text-4xl text-gold-500">₹{sub.remainingBalance.toFixed(2)}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-ink-400 mb-2">Remaining Sessions</p>
                          <p className="font-serif text-4xl text-gold-500">{sub.remainingBalance}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-4 relative z-10">
                      <PrimaryButton 
                        className="flex-1 disabled:opacity-70 disabled:cursor-not-allowed"
                        onClick={() => purchaseMutation.mutate(sub.plan.id)}
                        disabled={purchaseMutation.isPending}
                      >
                        {purchaseMutation.isPending ? 'Processing...' : 'Renew Plan'}
                      </PrimaryButton>
                      <button className="flex-1 px-6 py-3 rounded-full font-sans text-sm font-medium tracking-wider transition-all border border-gold-500 text-gold-500 hover:bg-gold-50">
                        View History
                      </button>
                    </div>
                  </Card>
                </AnimatedItem>
              ))}
            </AnimatePresence>
            
            {subPageData && subPageData.totalPages > 1 && (
              <div className="xl:col-span-2 mt-8 p-4 border border-ink-200/50 bg-surface/50 backdrop-blur-md flex justify-between items-center rounded-2xl">
                <button 
                  className={`px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border ${
                    subPage === 0 
                      ? 'opacity-50 cursor-not-allowed border-ink-200 text-ink-400' 
                      : 'border-gold-500 text-gold-500 hover:bg-gold-50'
                  }`}
                  disabled={subPage === 0} 
                  onClick={() => setSubPage(p => Math.max(0, p - 1))}
                >
                  PREVIOUS
                </button>
                <span className="text-ink-400 font-sans text-sm font-semibold tracking-wider uppercase">
                  Page {subPageData.pageNo + 1} of {subPageData.totalPages}
                </span>
                <button 
                  className={`px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border ${
                    subPageData.last 
                      ? 'opacity-50 cursor-not-allowed border-ink-200 text-ink-400' 
                      : 'border-gold-500 text-gold-500 hover:bg-gold-50'
                  }`}
                  disabled={subPageData.last} 
                  onClick={() => setSubPage(p => p + 1)}
                >
                  NEXT
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
              <PrimaryButton 
                className="mt-4"
                onClick={() => document.getElementById('available-plans')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Plans Below
              </PrimaryButton>
            }
          />
        )}
      </AnimatedSection>

      {/* Available Plans Section */}
      <AnimatedSection id="available-plans" stagger delay={0.2} className="pt-16 mt-8 border-t border-ink-200/50">
        <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 relative z-10">
          <h3 className="font-serif text-4xl text-ink-900 mb-4">Available Plans</h3>
          <p className="font-sans text-ink-400 text-[15px] tracking-wide">
            Select a curated membership designed to elevate your personal luxury.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {availablePlans.map((plan, index) => {
              const isPremium = index === 1; // Highlight the middle one if there are 3
              
              const features = [
                `${plan.discountRate}% privileges on all services`,
                ...(plan.planType === 'SESSION_COUNT' ? [`${plan.totalSessions} complimentary sessions`] : [])
              ];
              
              return (
              <AnimatedItem key={plan.id} className="h-full">
                <PricingCard
                  title={plan.name}
                  price={`₹${plan.price.toFixed(0)}`}
                  period={`/ ${plan.validityDays} days`}
                  features={features}
                  isHighlighted={isPremium}
                  onSelect={() => purchaseMutation.mutate(plan.id)}
                  buttonText={purchaseMutation.isPending ? 'Processing...' : 'Select Ritual'}
                />
              </AnimatedItem>
            )})}
          </AnimatePresence>
        </div>
        
        {planPageData && planPageData.totalPages > 1 && (
          <div className="mt-12 p-4 border border-ink-200/50 bg-surface/50 backdrop-blur-md flex justify-between items-center rounded-2xl">
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border ${
                planPage === 0 
                  ? 'opacity-50 cursor-not-allowed border-ink-200 text-ink-400' 
                  : 'border-gold-500 text-gold-500 hover:bg-gold-50'
              }`}
              disabled={planPage === 0} 
              onClick={() => setPlanPage(p => Math.max(0, p - 1))}
            >
              PREVIOUS
            </button>
            <span className="text-ink-400 font-sans text-sm font-semibold tracking-wider uppercase">
              Page {planPageData.pageNo + 1} of {planPageData.totalPages}
            </span>
            <button 
              className={`px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border ${
                planPageData.last 
                  ? 'opacity-50 cursor-not-allowed border-ink-200 text-ink-400' 
                  : 'border-gold-500 text-gold-500 hover:bg-gold-50'
              }`}
              disabled={planPageData.last} 
              onClick={() => setPlanPage(p => p + 1)}
            >
              NEXT
            </button>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
};
