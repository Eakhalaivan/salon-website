import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeToggle } from '../ui/ThemeToggle';

const navItems = [
  { name: 'Dashboard', icon: 'dashboard', path: '/customer/dashboard' },
  { name: 'Book Appointment', icon: 'calendar_month', path: '/book' },
  { name: 'Services', icon: 'spa', path: '/customer/services' },
  { name: 'Products', icon: 'shopping_bag', path: '/customer/products' },
  { name: 'Membership', icon: 'card_membership', path: '/customer/membership' },
  { name: 'Wallet', icon: 'account_balance_wallet', path: '/customer/wallet' },
  { name: 'Gift Cards', icon: 'redeem', path: '/customer/gift-cards' },
  { name: 'Payments', icon: 'payments', path: '/customer/payments' },
  { name: 'Referrals', icon: 'group_add', path: '/customer/referrals' },
  { name: 'Profile', icon: 'person', path: '/customer/profile' },
];

export const CustomerLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="px-gutter mb-12 cursor-pointer pt-stack-lg" onClick={() => navigate('/')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">spa</span>
            <div>
              <h1 className="font-headline-md text-headline-md font-medium tracking-tight text-on-surface leading-none">LUMINA SPA</h1>
              <p className="text-[10px] tracking-[0.2em] text-outline font-bold mt-1">WELLNESS &amp; BEYOND</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-on-surface-variant p-1 rounded-full hover:bg-surface-container-high transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }}
          >
            <span className="material-symbols-outlined font-light">close</span>
          </button>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-4 px-4 py-3 font-label-md text-label-md transition-colors duration-200 group rounded-r-lg",
              isActive 
                ? "text-primary font-bold border-l-4 border-primary bg-primary-container/10" 
                : "text-secondary hover:bg-surface-container-high border-l-4 border-transparent"
            )}
          >
            {({ isActive }) => (
              <>
                <span 
                  className={clsx(
                    "material-symbols-outlined transition-colors duration-200",
                    isActive ? "" : "group-hover:text-primary"
                  )} 
                >
                  {item.icon}
                </span>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto pb-stack-lg pt-4">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-4 px-4 py-3 text-secondary hover:bg-surface-container-high transition-colors duration-200 group rounded-lg"
        >
          <span className="material-symbols-outlined group-hover:text-error transition-colors">logout</span>
          <span className="font-label-md text-label-md">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] fixed left-0 top-0 bg-background border-r border-outline-variant/30 flex-col h-full z-40">
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
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-background border-r border-outline-variant/30 shadow-2xl flex flex-col h-full z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="lg:ml-[280px] flex-1 min-h-screen luxury-gradient relative flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-30">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-on-surface hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          
          <h2 className="font-headline-md text-on-surface tracking-tight">LUMINA SPA</h2>
          <div className="flex items-center justify-end gap-2">
            <ThemeToggle />
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>
        
        {/* Topbar (Desktop) */}
        <header className="hidden lg:flex h-20 w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md items-center justify-end px-[40px] gap-[16px]">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors mr-2">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            <div className="flex items-center gap-4 bg-surface-container-low py-1.5 px-4 rounded-full border border-outline-variant/30">
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface leading-none">{user?.firstName || 'Guest'} {user?.lastName || ''}</p>
                <p className="text-[10px] text-outline mt-1 font-bold">PREMIUM MEMBER</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center text-on-primary font-bold">
                 {user?.firstName?.[0] || "G"}
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1">
          <Outlet />
        </div>
      </main>
      
      {/* Contextual FAB (Hidden on some pages, but part of layout) */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">chat_bubble</span>
      </button>
    </div>
  );
};
