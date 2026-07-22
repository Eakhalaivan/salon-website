import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, ChevronDown } from 'lucide-react';

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate('/login');
  };

  const currentNavItem = navItems.find(item => location.pathname.startsWith(item.path)) || navItems[0];

  const SidebarContent = () => (
    <>
      <div className="mb-10 cursor-pointer flex flex-col items-center justify-center text-center mt-2 relative" onClick={() => navigate('/')}>
        <div className="flex items-center gap-2 mb-3">
          {/* Thin lotus/flame icon approximation */}
          <span className="material-symbols-outlined text-gold-500 font-light text-[32px]">spa</span>
        </div>
        <h1 className="font-serif text-2xl tracking-[0.15em] text-gold-500 leading-tight">LUMINA SPA</h1>
        <p className="font-sans text-[0.65rem] text-ink-400 mt-1 uppercase tracking-[0.3em]">Wellness & Beyond</p>

        <button 
          className="lg:hidden absolute top-0 right-0 text-ink-400 p-1 rounded-full hover:bg-black/5 transition-colors"
          onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }}
        >
          <span className="material-symbols-outlined font-light">close</span>
        </button>
      </div>
      
      <nav className="space-y-[14px] flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-4 px-5 py-3 rounded-full font-sans text-[13px] transition-all duration-200",
              isActive 
                ? "text-[#D4AF37] bg-[#FDF9F1] font-medium" 
                : "text-ink-400 hover:text-ink-700 hover:bg-black/5"
            )}
          >
            {({ isActive }) => (
              <>
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

      <div className="pt-6 border-t border-ink-200 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-4 px-5 py-3 text-ink-400 hover:text-ink-700 hover:bg-black/5 transition-colors font-sans text-[13px] rounded-full"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex font-sans overflow-x-hidden min-h-screen bg-[#FDFBF7] text-ink-700 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] fixed left-0 top-0 bg-[#FDFBF7] flex-col h-full p-6 z-40 border-r border-ink-200/30 transition-colors duration-300">
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
              className="fixed inset-y-0 left-0 w-72 bg-surface border-r border-ink-200 shadow-2xl flex flex-col h-full p-6 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="lg:ml-[240px] flex-1 min-h-screen relative overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-ink-200/50 sticky top-0 z-30">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-ink-900 hover:bg-black/5 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          
          <h2 className="font-serif text-ink-900 tracking-tight">LUMINA SPA</h2>
          <div className="w-10 flex items-center justify-end">
            <button className="relative p-2 text-ink-400 hover:text-ink-900 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <div className="relative z-10 flex-1 p-4 sm:p-6 lg:p-[32px] pt-12 lg:pt-12">
          {/* Topbar (Desktop) */}
          <header className="hidden lg:flex items-center justify-end absolute top-10 right-[32px] z-50">
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-ink-400 hover:text-gold-500 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full shadow-[0_0_8px_rgba(201,153,46,0.8)]"></span>
              </button>
              
              {/* Avatar Chip */}
              <div className="flex items-center gap-3 cursor-pointer group bg-white border border-ink-200/50 rounded-full py-1.5 px-2 pr-4 shadow-sm hover:shadow-card transition-shadow">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-sans font-medium text-sm">
                  {user?.firstName?.[0] || "G"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <p className="text-[10px] text-ink-400 uppercase tracking-widest leading-none mb-1">Elite Guest</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-ink-900 font-medium leading-none">
                      {user?.firstName || "Guest"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
                  </div>
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
