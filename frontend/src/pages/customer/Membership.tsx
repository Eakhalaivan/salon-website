import { useState } from 'react';
import { format } from 'date-fns';
import { useMySubscriptionsQuery, useSubscriptionPlansQuery, usePurchaseSubscription } from '../../hooks/api/useSubscriptions';
import { PricingCard } from '../../components/ui/PricingCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatePresence } from 'framer-motion';

export const Membership = () => {
  const [planPage, setPlanPage] = useState(0);
  
  const purchaseMutation = usePurchaseSubscription();

  const { data: subPageData, isLoading: isLoadingSub } = useMySubscriptionsQuery(0, 10);
  const activeSubscriptions = subPageData?.content || [];
  
  const { data: planPageData, isLoading: isLoadingPlans, isError: isErrorPlans } = useSubscriptionPlansQuery(planPage, 10);
  const availablePlans = planPageData?.content || [];

  const loading = isLoadingSub || isLoadingPlans;
  const error = isErrorPlans ? 'Failed to load membership data. Please try again later.' : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-6 rounded-2xl font-body-md text-center max-w-2xl mx-auto mt-12">
        {error}
      </div>
    );
  }

  return (
    <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative overflow-hidden py-12 animate-fade-in">
      {/* Atmospheric Background Element */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Header Section */}
      <div className="mb-12">
        <nav className="flex items-center gap-2 text-outline mb-4">
          <span className="font-label-sm text-label-sm">Customer</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-label-sm text-label-sm text-primary">Membership</span>
        </nav>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Membership</h2>
        <p className="font-body-md text-body-md text-secondary">Elevate your experience with our exclusive membership tiers.</p>
      </div>

      {/* Active Subscriptions (if any) */}
      {activeSubscriptions.length > 0 && (
        <div className="mb-16 max-w-6xl mx-auto">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Your Active Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeSubscriptions.map((sub) => (
              <div key={sub.id} className="bg-surface-container-lowest spa-card-shadow rounded-2xl p-[32px] border border-primary/20 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[20px] pointer-events-none"></div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-3 py-1 bg-primary-container/10 text-primary font-label-sm rounded-full uppercase tracking-widest border border-primary/20">
                      {sub.status}
                    </span>
                    <p className="font-label-md text-outline">Valid until {format(new Date(sub.endDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-surface mb-6">{sub.plan.name}</h4>
                  
                  <div className="bg-surface-container-low rounded-xl p-4 flex justify-between items-center mb-6 border border-outline-variant/30">
                    {sub.plan.planType === 'WALLET' ? (
                      <div>
                        <p className="font-label-sm text-outline uppercase tracking-widest mb-1">Remaining Balance</p>
                        <p className="font-headline-md text-primary">₹{sub.remainingBalance.toFixed(2)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-label-sm text-outline uppercase tracking-widest mb-1">Remaining Sessions</p>
                        <p className="font-headline-md text-primary">{sub.remainingBalance}</p>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => purchaseMutation.mutate(sub.plan.id)}
                  disabled={purchaseMutation.isPending}
                  className="w-full py-3 rounded-full border border-primary text-primary font-label-md hover:bg-primary/5 transition-colors"
                >
                  {purchaseMutation.isPending ? 'Processing...' : 'Renew Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Tiers Bento Grid */}
      {availablePlans.length === 0 ? (
        <div className="max-w-6xl mx-auto mb-16">
          <EmptyState 
            icon="card_membership" 
            title="No membership plans" 
            description="There are currently no membership plans available for purchase." 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end mb-16">
          <AnimatePresence mode="popLayout">
          {availablePlans.map((plan, index) => {
            const isPremium = index === 1; // Middle one highlighted
            
            const features = [
              `${plan.discountRate}% privileges on all services`,
              ...(plan.planType === 'SESSION_COUNT' ? [`${plan.totalSessions} complimentary sessions`] : []),
              'Priority Booking'
            ];
            
            const isActive = activeSubscriptions.some(sub => sub.plan.id === plan.id && sub.status === 'ACTIVE');

            return (
              <div key={plan.id} className="h-full">
                <PricingCard
                  title={plan.name}
                  price={`₹${plan.price.toFixed(0)}`}
                  period={`/ ${plan.validityDays} days`}
                  features={features}
                  isHighlighted={isPremium}
                  isActive={isActive}
                  onSelect={() => purchaseMutation.mutate(plan.id)}
                  buttonText={purchaseMutation.isPending ? 'Processing...' : (isActive ? 'Renew Plan' : 'Choose Plan')}
                />
              </div>
            );
          })}
          </AnimatePresence>
        </div>
      )}
      
      {/* Pagination for Plans */}
      {planPageData && planPageData.totalPages > 1 && (
        <div className="max-w-6xl mx-auto mb-16 p-4 border border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center rounded-2xl spa-card-shadow">
          <button 
            className={`px-6 py-2 rounded-full font-label-md transition-all border ${
              planPage === 0 
                ? 'opacity-50 cursor-not-allowed border-outline text-outline' 
                : 'border-primary text-primary hover:bg-primary/5'
            }`}
            disabled={planPage === 0} 
            onClick={() => setPlanPage(p => Math.max(0, p - 1))}
          >
            PREVIOUS
          </button>
          <span className="text-secondary font-label-md tracking-wider uppercase">
            Page {planPageData.pageNo + 1} of {planPageData.totalPages}
          </span>
          <button 
            className={`px-6 py-2 rounded-full font-label-md transition-all border ${
              planPageData.last 
                ? 'opacity-50 cursor-not-allowed border-outline text-outline' 
                : 'border-primary text-primary hover:bg-primary/5'
            }`}
            disabled={planPageData.last} 
            onClick={() => setPlanPage(p => p + 1)}
          >
            NEXT
          </button>
        </div>
      )}

      {/* Trust Badges Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-12 border-t border-outline-variant/30">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
            <span className="material-symbols-outlined text-primary-container text-2xl">verified</span>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-on-surface">No Lock-in Period</h4>
            <p className="text-label-sm text-outline">Cancel or pause anytime</p>
          </div>
        </div>
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
            <span className="material-symbols-outlined text-primary-container text-2xl">redeem</span>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-on-surface">Exclusive Offers</h4>
            <p className="text-label-sm text-outline">Members only seasonal rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
            <span className="material-symbols-outlined text-primary-container text-2xl">support_agent</span>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-on-surface">Premium Support</h4>
            <p className="text-label-sm text-outline">24/7 dedicated concierge</p>
          </div>
        </div>
      </div>
    </main>
  );
};
