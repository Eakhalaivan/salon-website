import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { useAuthStore, selectUser } from '../../store/useAuthStore';

export const Dashboard = () => {
  const user = useAuthStore(selectUser);

  const { data: profile } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      const res = await axiosClient.get('/customers/my');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: walletData } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await axiosClient.get('/wallet/me');
      return res.data;
    }
  });

  const { data: membershipData, isLoading: isLoadingMembership } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: async () => {
      const res = await axiosClient.get('/subscriptions/my');
      return res.data;
    }
  });

  const balance = walletData?.balance || 0;
  const activeSubscription = membershipData?.content?.[0];

  const formattedBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(balance);

  return (
    <section className="px-[16px] lg:px-[40px] py-[32px] max-w-[1200px] mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="mb-10">
        <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
          Welcome, {profile ? `${profile.firstName} ${profile.lastName || ''}`.replace(/\bUser\b/gi, '').trim() : (user?.firstName || 'Guest').replace(/\bUser\b/gi, '').trim()} <span className="text-2xl">✨</span>
        </h2>
        <p className="font-body-md text-body-md text-secondary mt-2">Here's your wellness overview for today.</p>
      </div>

      {/* Bento Grid - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px] mb-[32px]">
        
        {/* Upcoming Appointment */}
        <div className="lg:col-span-1 bg-surface-container-lowest spa-card-shadow rounded-xl p-[16px] flex flex-col border border-outline-variant/30">
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-3">Upcoming Appointment</p>
          <div className="mb-4">
            <p className="font-body-lg text-body-lg font-bold text-on-surface">24 May 2024, 4:00 PM</p>
            <p className="font-body-md text-body-md text-secondary">Swedish Massage</p>
          </div>
          <Link to="/book" className="mt-auto py-2 px-4 rounded-lg bg-primary-container/10 text-primary font-label-md text-label-md hover:bg-primary-container/20 transition-all border border-primary/20 text-center">
            View Details
          </Link>
        </div>

        {/* Lure Points */}
        <div className="bg-surface-container-lowest spa-card-shadow rounded-xl p-[16px] flex flex-col items-center justify-center text-center border border-outline-variant/30">
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2">Lure Points</p>
          <p className="font-display-lg text-display-lg text-primary">2,450</p>
          <Link to="/customer/profile" className="mt-4 text-primary font-label-md text-label-md hover:underline">View History</Link>
        </div>

        {/* Wallet Balance */}
        <div className="bg-surface-container-lowest spa-card-shadow rounded-xl p-[16px] flex flex-col items-center justify-center text-center border border-outline-variant/30">
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2">Wallet Balance</p>
          <p className="font-display-lg text-display-lg text-on-surface">{formattedBalance}</p>
          <Link to="/customer/wallet" className="mt-4 px-6 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:shadow-lg transition-all active:scale-95 inline-block">
            Add Funds
          </Link>
        </div>

        {/* Membership Status */}
        <div className="bg-surface-container-lowest spa-card-shadow rounded-xl p-[16px] flex flex-col border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-fixed/20 rounded-full blur-3xl"></div>
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-4">
            {activeSubscription ? activeSubscription.plan?.name : 'Membership'}
          </p>
          
          {isLoadingMembership ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="font-label-sm text-label-sm text-secondary">Loading membership...</p>
            </div>
          ) : activeSubscription ? (
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center justify-between">
                <p className="font-headline-sm text-headline-sm text-primary-container font-bold">Status</p>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${activeSubscription.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                  {activeSubscription.status}
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <p className="font-label-sm text-label-sm flex justify-between">
                  <span className="text-secondary">Valid From:</span>
                  <span className="text-on-surface">{new Date(activeSubscription.startDate).toLocaleDateString()}</span>
                </p>
                <p className="font-label-sm text-label-sm flex justify-between">
                  <span className="text-secondary">Expires:</span>
                  <span className="text-on-surface">{new Date(activeSubscription.endDate).toLocaleDateString()}</span>
                </p>
                <p className="font-label-sm text-label-sm flex justify-between">
                  <span className="text-secondary">Remaining Value:</span>
                  <span className="text-on-surface font-bold">₹{activeSubscription.remainingBalance}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
              <span className="material-symbols-outlined text-outline/50 text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 0" }}>card_membership</span>
              <p className="font-body-sm text-body-sm text-secondary mb-3">You don't have an active membership yet.</p>
              <Link to="/customer/membership" className="px-4 py-1.5 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary/5 transition-colors">
                Explore Plans
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Lower Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        
        {/* Quick Actions */}
        <section>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-[16px]">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/book" className="bg-surface-container-lowest spa-card-shadow border border-outline-variant/30 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-primary/40 hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">calendar_month</span>
              </div>
              <span className="font-label-md text-label-md text-secondary group-hover:text-primary">Book Appointment</span>
            </Link>
            
            <Link to="/customer/services" className="bg-surface-container-lowest spa-card-shadow border border-outline-variant/30 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-primary/40 hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">spa</span>
              </div>
              <span className="font-label-md text-label-md text-secondary group-hover:text-primary">View Services</span>
            </Link>
            
            <Link to="/customer/products" className="bg-surface-container-lowest spa-card-shadow border border-outline-variant/30 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-primary/40 hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
              </div>
              <span className="font-label-md text-label-md text-secondary group-hover:text-primary">Shop Products</span>
            </Link>
            
            <Link to="/customer/gift-cards" className="bg-surface-container-lowest spa-card-shadow border border-outline-variant/30 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-primary/40 hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">redeem</span>
              </div>
              <span className="font-label-md text-label-md text-secondary group-hover:text-primary">Buy Gift Card</span>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-[16px]">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
            <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
          </div>
          <div className="bg-surface-container-lowest spa-card-shadow border border-outline-variant/30 rounded-xl overflow-hidden">
            <div className="divide-y divide-outline-variant/30">
              
              <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">event_available</span>
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-bold text-on-surface">Appointment Booked</p>
                    <p className="font-label-sm text-label-sm text-secondary">Swedish Massage</p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-outline">22 May 2024</span>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">shopping_cart</span>
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-bold text-on-surface">Order Placed</p>
                    <p className="font-label-sm text-label-sm text-secondary">Botanical Body Oil</p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-outline">20 May 2024</span>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">loyalty</span>
                  </div>
                  <div>
                    <p className="font-body-md text-body-md font-bold text-on-surface">Points Earned</p>
                    <p className="font-label-sm text-label-sm text-secondary">Referral Bonus</p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm text-outline">18 May 2024</span>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* Bottom Wellness Banner */}
      <div className="mt-12 w-full h-[300px] rounded-2xl relative overflow-hidden spa-card-shadow group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDQlyK9aLgdN-z8nmnuZ9I-qmNEk-WV1yAnSJoPERRHA9PMqz2S7ijZDDbaPxvT8Ov5SFurq0AEkRowNnuu6NJayv_Awut9s9FbAZZbFG_-Xi3VkXpg-lSCrQY8uC9KrAfJ7JzAlyRe09a7fLzKnzjc7aVKL7byWOripNnnSkZFR0nah8hRrgNOKx3nlZIH0QpA2rjNVlr8x6UaaMNKi-q_-874aoF1sOqCLp5lQfT5SivrkhSENC-dWzlEu_HkxVcgb1KplZJIvi-h')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">spa</span>
            <h4 className="font-headline-lg text-headline-lg text-on-surface">LUMINA SPA</h4>
          </div>
          <p className="font-headline-md text-headline-md italic text-primary/80 max-w-md leading-relaxed">
            "Indulge in luxury. Experience tranquility."
          </p>
        </div>
      </div>
    </section>
  );
};
