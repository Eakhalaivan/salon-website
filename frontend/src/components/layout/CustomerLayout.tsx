import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronDown } from 'lucide-react';
import { FloatingParticles } from '../luxury/FloatingParticles';

const navItems = [
  { name: 'Dashboard', icon: 'home', path: '/customer/dashboard' },
  { name: 'Book Appointment', icon: 'edit_calendar', path: '/book' },
  { name: 'Services', icon: 'spa', path: '/customer/services' },
  { name: 'Products', icon: 'inventory_2', path: '/customer/products' },
  { name: 'Membership', icon: 'card_membership', path: '/customer/membership' },
  { name: 'Wallet', icon: 'account_balance_wallet', path: '/customer/wallet' },
  { name: 'Gift Cards', icon: 'featured_play_list', path: '/customer/gift-cards' },
  { name: 'Payments', icon: 'payments', path: '/customer/payments' },
  { name: 'Referrals', icon: 'group_add', path: '/customer/referrals' },
  { name: 'Profile', icon: 'person', path: '/customer/profile' },
];

export const CustomerLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);


  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="mb-10 cursor-pointer flex flex-col items-center justify-center text-center mt-2 relative" onClick={() => navigate('/')}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1" className="mb-3">
          <path d="M12 22s-8-4.5-8-11.8A6 6 0 0 1 12 2c2 0 8 2.2 8 8.2S12 22 12 22z" fill="url(#goldGradient)"/>
          <path d="M12 22s4-5 4-10a4 4 0 0 0-4-6 4 4 0 0 0-4 6c0 5 4 10 4 10z" fill="var(--color-background)"/>
          <path d="M12 22s-2-4-2-8a2 2 0 0 1 4 0c0 4-2 8-2 8z" fill="url(#goldGradient)"/>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stopColor="#D4AF37"/>
              <stop offset="100%" stopColor="#B8860B"/>
            </linearGradient>
          </defs>
        </svg>
        <h1 className="font-serif text-2xl tracking-[0.15em] text-[var(--color-primary)] leading-tight">LUMINA SPA</h1>
        <p className="font-sans text-[0.65rem] text-[var(--color-on-surface-variant)] mt-1 uppercase tracking-[0.3em]">Guest Portal</p>

        <button 
          className="lg:hidden absolute top-0 right-0 text-white/50 p-1 rounded-full hover:bg-white/10 transition-colors"
          onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }}
        >
          <span className="material-symbols-outlined font-light">close</span>
        </button>
      </div>
      
      <nav className="space-y-2 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-4 px-5 py-3.5 rounded-2xl font-label-md text-sm transition-all duration-300 relative group",
              isActive 
                ? "text-[var(--color-primary)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 shadow-[inset_4px_0_0_var(--color-primary)]" 
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] border border-transparent"
            )}
          >
            {({ isActive }) => (
              <>
                {!isActive && (
                  <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/5 transition-colors duration-300 rounded-2xl" />
                )}
                <span 
                  className="material-symbols-outlined transition-transform duration-300 group-hover:scale-110" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-outline-variant/30 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-4 px-5 py-3.5 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/5 transition-colors font-label-md text-sm rounded-2xl"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className={`${isDarkMode ? "dark" : ""} flex font-body-md overflow-x-hidden min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)]`}>
      <FloatingParticles />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] fixed left-0 top-0 bg-[var(--color-surface)]/80 backdrop-blur-2xl border-r border-[var(--color-border)] flex-col h-full p-6 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, pointerEvents: 'none' }}
              animate={{ opacity: 1, pointerEvents: 'auto' }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              className="fixed inset-0 bg-scrim/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-surface/90 backdrop-blur-3xl border-r border-primary/10 shadow-2xl flex flex-col h-full p-6 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="lg:ml-[280px] flex-1 min-h-screen relative overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-primary/10 sticky top-0 z-30">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-on-surface hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          
          <h2 className="font-headline-sm text-primary tracking-tight">LUMINA SPA</h2>
          <div className="w-10 flex items-center justify-end">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors flex items-center"
            >
              <span className="material-symbols-outlined font-light text-[22px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

        </header>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-primary-container opacity-5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 p-4 sm:p-6 lg:p-margin-desktop pt-0 lg:pt-0">
          
          {/* Top User Header (Desktop) */}
          <header className="hidden lg:flex items-center justify-end py-6 mb-2">
            <div className="flex items-center gap-6">
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined font-light text-[22px]">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              <button className="relative p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">

                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
              </button>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-soft)] flex items-center justify-center text-[var(--color-on-primary)] font-serif font-bold text-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-shadow">
                  {user?.firstName?.[0] || "G"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[0.65rem] text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-0.5">Welcome,</p>
                  <p className="text-sm text-[var(--color-on-surface)] font-medium flex items-center gap-1">
                    {user?.firstName || "Guest"}
                    <ChevronDown className="w-4 h-4 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors" />
                  </p>
                </div>
              </div>
            </div>
          </header>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
