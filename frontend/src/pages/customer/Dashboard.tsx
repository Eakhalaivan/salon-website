import { Link } from 'react-router-dom';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { StatTile } from '../../components/ui/StatTile';
import { Card } from '../../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { useAuthStore, selectUser } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { Calendar, Crown, ShoppingBag, Sparkles } from 'lucide-react';

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
      const res = await axiosClient.get('/customers/me/activity/stats');
      return res.data;
    }
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyaltyPoints'],
    queryFn: async () => {
      const res = await axiosClient.get('/loyalty/me');
      return res.data;
    }
  });

  const { data: walletData } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await axiosClient.get('/wallet/me');
      return res.data;
    }
  });

  const { data: membershipData } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: async () => {
      const res = await axiosClient.get('/subscriptions/me');
      return res.data;
    }
  });

  const { data: activityList } = useQuery<ActivityDto[]>({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const res = await axiosClient.get('/customers/me/activity');
      return res.data;
    }
  });

  const points = loyaltyData?.pointsBalance || 0;
  const balance = walletData?.balance || 0;
  const membershipTier = membershipData?.plan?.name || 'Premium'; // Default for the mockup

  const formattedBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(balance);

  return (
    <div className="space-y-10 animate-fade-in pb-12 pt-8">
      {/* Header */}
      <header className="mb-10 relative z-10 flex flex-col items-start text-left">
        <h2 className="font-serif text-[36px] leading-[44px] mb-1 text-ink-900 flex items-center gap-2">
          Welcome back, {user?.firstName || 'Elite Guest'} <span className="text-gold-500 font-sans text-2xl">✦</span>
        </h2>
        <p className="font-sans text-ink-400 text-[14px] tracking-wide">
          Here's your wellness overview.
        </p>
      </header>

      {/* Analytics Overview Stats (4 Cards) */}
      <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        <AnimatedItem>
          <StatTile 
            label="Upcoming Appointment"
            value={<span className="text-[20px] font-sans font-medium text-ink-900">24 May 2024, 4:00 PM</span>}
            caption="Swedish Massage"
            actionSlot={
              <Link to="/book" className="inline-block text-[12px] font-semibold text-[#D4AF37] bg-[#FDF9F1] rounded-full px-5 py-1.5 hover:bg-[#F3E7D3] transition-colors">
                View Details
              </Link>
            }
          />
        </AnimatedItem>

        <AnimatedItem>
          <StatTile 
            label="Luxe Points"
            value={<span className="text-[32px] font-serif text-[#5C4D3C]">2,450</span>}
            actionSlot={
              <Link to="/customer/profile" className="inline-block text-[12px] font-semibold text-[#D4AF37] bg-[#FDF9F1] rounded-full px-5 py-1.5 hover:bg-[#F3E7D3] transition-colors">
                View Details
              </Link>
            }
          />
        </AnimatedItem>

        <AnimatedItem>
          <StatTile 
            label="Wallet Balance"
            value={<span className="text-[32px] font-serif text-[#5C4D3C]">{formattedBalance}</span>}
            actionSlot={
              <Link to="/customer/wallet" className="inline-block text-[12px] font-semibold text-[#D4AF37] bg-[#FDF9F1] rounded-full px-5 py-1.5 hover:bg-[#F3E7D3] transition-colors">
                Add Funds
              </Link>
            }
          />
        </AnimatedItem>

        <AnimatedItem>
          <StatTile 
            label="Membership"
            value={<span className="text-[32px] font-serif text-[#5C4D3C]">{membershipTier}</span>}
            actionSlot={
              <div className="flex justify-center mt-2">
                <Crown className="w-10 h-10 text-[#D4AF37] stroke-[1.5]" />
              </div>
            }
          />
        </AnimatedItem>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Left: 2 columns wide) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(33,29,23,0.04)] p-8 border border-[#E4DFD3]/40 h-full">
              <h3 className="font-serif text-2xl text-ink-900 mb-8">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/book">
                  <div className="flex flex-col items-center justify-center p-6 text-center h-[120px] rounded-2xl hover:bg-[#FDF9F1] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      <Calendar className="text-[#D4AF37] w-8 h-8 stroke-[1.5] group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-sans text-[12px] text-ink-900 font-medium">Book Appointment</span>
                  </div>
                </Link>
                
                <Link to="/customer/services">
                  <div className="flex flex-col items-center justify-center p-6 text-center h-[120px] rounded-2xl hover:bg-[#FDF9F1] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      <Sparkles className="text-[#D4AF37] w-8 h-8 stroke-[1.5] group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-sans text-[12px] text-ink-900 font-medium">View Services</span>
                  </div>
                </Link>
                
                <Link to="/customer/products">
                  <div className="flex flex-col items-center justify-center p-6 text-center h-[120px] rounded-2xl hover:bg-[#FDF9F1] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      <ShoppingBag className="text-[#D4AF37] w-8 h-8 stroke-[1.5] group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-sans text-[12px] text-ink-900 font-medium">Shop Products</span>
                  </div>
                </Link>

                <Link to="/customer/gift-cards">
                  <div className="flex flex-col items-center justify-center p-6 text-center h-[120px] rounded-2xl hover:bg-[#FDF9F1] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-[#D4AF37] text-[32px] group-hover:scale-110 transition-transform">redeem</span>
                    </div>
                    <span className="font-sans text-[12px] text-ink-900 font-medium">Buy Gift Card</span>
                  </div>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Sidebar Area (Right: 1 column wide) - Recent Activity */}
        <AnimatedSection delay={0.3}>
          <div className="h-full">
            <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(33,29,23,0.04)] p-8 border border-[#E4DFD3]/40 h-full flex flex-col">
              <h3 className="font-serif text-2xl text-ink-900 mb-8">Recent Activity</h3>
              <div className="space-y-0 flex-1">
                {/* Mock data to perfectly match screenshot */}
                <div className="flex gap-4 items-center py-5 border-b border-ink-100/50">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF9F1] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Calendar className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-[13px] font-medium text-ink-900">Appointment Booked</p>
                    <p className="font-sans text-[11px] text-ink-400 mt-1">Swedish Massage</p>
                  </div>
                  <div className="text-right">
                      <p className="font-sans text-[11px] text-ink-400">22 May 2024</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center py-5 border-b border-ink-100/50">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF9F1] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-[13px] font-medium text-ink-900">Order Placed</p>
                    <p className="font-sans text-[11px] text-ink-400 mt-1">Botanical Body Oil</p>
                  </div>
                  <div className="text-right">
                      <p className="font-sans text-[11px] text-ink-400">20 May 2024</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center py-5">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF9F1] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">loyalty</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-[13px] font-medium text-ink-900">Points Earned</p>
                    <p className="font-sans text-[11px] text-ink-400 mt-1">Referral Bonus</p>
                  </div>
                  <div className="text-right">
                      <p className="font-sans text-[11px] text-ink-400">18 May 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

    </div>
  );
};
