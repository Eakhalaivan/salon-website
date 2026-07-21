import { Link } from 'react-router-dom';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { LuxuryCard } from '../../components/luxury/LuxuryCard';
import { AnimatedCounter } from '../../components/luxury/AnimatedCounter';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { useAuthStore, selectUser } from '../../store/useAuthStore';
import { format } from 'date-fns';

interface ActivityDto {
  title: string;
  description: string;
  date: string;
  icon: string;
}

export const Dashboard = () => {
  const user = useAuthStore(selectUser);

  useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/v1/customers/me/activity/stats');
      return res.data;
    }
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyaltyPoints'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/v1/loyalty/me');
      return res.data;
    }
  });

  const { data: walletData } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/v1/wallet/me');
      return res.data;
    }
  });

  const { data: membershipData } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/v1/subscriptions/me');
      return res.data;
    }
  });

  const { data: activityList } = useQuery<ActivityDto[]>({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const res = await axiosClient.get('/api/v1/customers/me/activity');
      return res.data;
    }
  });

    const points = loyaltyData?.pointsBalance || 0;
  const balance = walletData?.balance || 0;
  const membershipTier = membershipData?.plan?.name || 'Standard';

  return (
    <div className="space-y-10 animate-fade-in pb-12 pt-8">
      {/* Header */}
      <header className="mb-8 relative z-10">
        <h2 className="font-serif text-5xl mb-2 text-[var(--color-on-surface)] tracking-wide">
          Welcome back, {user?.firstName} <span className="text-[var(--color-primary)]">✦</span>
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg tracking-wide">
          Here's your wellness overview.
        </p>
      </header>

      {/* Analytics Overview Stats (4 Cards) */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedItem>
          <LuxuryCard className="p-6 h-full flex flex-col justify-between gold-border-card bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <span className="material-symbols-outlined font-light text-[20px]">calendar_today</span>
              </div>
            </div>
            <div>
              <p className="font-sans text-[var(--color-on-surface-variant)] mb-1 tracking-widest uppercase text-[0.65rem] font-semibold">Upcoming</p>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter value={2} className="font-serif text-4xl text-[var(--color-on-surface)]" />
              </div>
            </div>
          </LuxuryCard>
        </AnimatedItem>

        <AnimatedItem>
          <LuxuryCard className="p-6 h-full flex flex-col justify-between gold-border-card bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <span className="material-symbols-outlined font-light text-[20px]">workspace_premium</span>
              </div>
            </div>
            <div>
              <p className="font-sans text-[var(--color-on-surface-variant)] mb-1 tracking-widest uppercase text-[0.65rem] font-semibold">Luxe Points</p>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter value={points} className="font-serif text-4xl text-[var(--color-primary)]" />
              </div>
            </div>
          </LuxuryCard>
        </AnimatedItem>

        <AnimatedItem>
          <LuxuryCard className="p-6 h-full flex flex-col justify-between gold-border-card bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <span className="material-symbols-outlined font-light text-[20px]">account_balance_wallet</span>
              </div>
            </div>
            <div>
              <p className="font-sans text-[var(--color-on-surface-variant)] mb-1 tracking-widest uppercase text-[0.65rem] font-semibold">Wallet Balance</p>
              <div className="flex items-baseline gap-1 font-serif text-4xl text-[var(--color-on-surface)]">
                <span className="text-2xl text-[var(--color-on-surface-variant)]">₹</span>
                <AnimatedCounter value={balance} />
              </div>
            </div>
          </LuxuryCard>
        </AnimatedItem>

        <AnimatedItem>
          <LuxuryCard className="p-6 h-full flex flex-col justify-between gold-border-card bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <span className="material-symbols-outlined font-light text-[20px]">diamond</span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="font-sans text-[var(--color-on-surface-variant)] mb-1 tracking-widest uppercase text-[0.65rem] font-semibold">Membership</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-soft)]">{membershipTier}</span>
              </div>
            </div>
          </LuxuryCard>
        </AnimatedItem>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left: 2 columns wide) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <AnimatedSection delay={0.2}>
            <h3 className="font-serif text-2xl text-[var(--color-on-surface)] mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/book" className="flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">edit_calendar</span>
                </div>
                <span className="font-sans text-sm text-[var(--color-on-surface)]">Book Now</span>
              </Link>
              <Link to="/customer/services" className="flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">spa</span>
                </div>
                <span className="font-sans text-sm text-[var(--color-on-surface)]">Services</span>
              </Link>
              <Link to="/customer/products" className="flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">inventory_2</span>
                </div>
                <span className="font-sans text-sm text-[var(--color-on-surface)]">Products</span>
              </Link>
              <Link to="/customer/gift-cards" className="flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">featured_play_list</span>
                </div>
                <span className="font-sans text-sm text-[var(--color-on-surface)]">Gift Cards</span>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Sidebar Area (Right: 1 column wide) - Recent Activity */}
        <AnimatedSection delay={0.3}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 h-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="font-serif text-2xl text-[var(--color-on-surface)] mb-6">Recent Activity</h3>
            
            <div className="space-y-6">
              {activityList && activityList.length > 0 ? (
                activityList.map((activity, index) => (
                  <div key={index} className="flex gap-4 relative">
                    {index !== activityList.length - 1 && (
                      <div className="absolute top-10 left-5 bottom-[-1.5rem] w-px bg-gradient-to-b from-[var(--color-primary)]/30 to-transparent" />
                    )}
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[var(--color-surface)] border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)] z-10 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                      <span className="material-symbols-outlined text-[18px]">{activity.icon}</span>
                    </div>
                    <div className="pt-2">
                      <p className="font-sans text-sm font-semibold text-[var(--color-on-surface)] leading-none mb-1">{activity.title}</p>
                      <p className="font-sans text-xs text-[var(--color-on-surface-variant)] mb-1">{activity.description}</p>
                      <p className="font-sans text-[10px] text-[var(--color-on-surface-variant)]/60 tracking-wider uppercase">{format(new Date(activity.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]/30 mb-2">history</span>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">No recent activity.</p>
                </div>
              )}
            </div>
            
            {activityList && activityList.length > 0 && (
              <button className="w-full mt-8 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors">
                View All Activity
              </button>
            )}
          </div>
        </AnimatedSection>
      </div>

    </div>
  );
};
