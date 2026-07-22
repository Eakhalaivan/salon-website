import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeToggle } from '../ui/ThemeToggle';

const navItems = [
  { name: 'Dashboard', icon: 'dashboard', path: '/manager/dashboard' },
  { name: 'Customers', icon: 'auto_awesome', path: '/manager/customers' },
  { name: 'Staff', icon: 'group', path: '/manager/staff' },
  { name: 'Appointments', icon: 'calendar_month', path: '/manager/appointments' },
  { name: 'Revenue', icon: 'payments', path: '/manager/revenue' },
  { name: 'Inventory', icon: 'inventory_2', path: '/manager/inventory' },
  { name: 'Reports', icon: 'analytics', path: '/manager/reports' },
];

export const ManagerLayout = () => {
  const { role, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="mb-8 cursor-pointer flex items-center justify-between" onClick={() => navigate('/')}>
        <div>
          <h1 className="font-display-md text-2xl text-primary tracking-wide">LUMINA SPA</h1>
          <p className="font-label-sm text-xs text-white/50 mt-1 uppercase tracking-widest">Manager Portal</p>
        </div>
        <button 
          className="lg:hidden text-white/50 p-1 -mr-2 rounded-full hover:bg-white/10 transition-colors"
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
              "flex items-center gap-4 px-4 py-3.5 rounded-xl font-label-md text-sm transition-all duration-300 relative group",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicatorManager"
                    className="absolute left-0 w-1 h-2/3 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
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

      <div className="pt-6 border-t border-outline-variant/30 space-y-4 mt-auto">
        <div className="px-4 mb-2">
          <button className="w-full py-3 bg-primary text-on-primary rounded-full font-label-md text-label-md shadow-lg hover:shadow-xl transition-shadow active:scale-95">
            Quick Book
          </button>
        </div>
        <button className="flex w-full items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md rounded-lg">
          <span className="material-symbols-outlined">help_outline</span>
          Help
        </button>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md rounded-xl"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex bg-surface font-body-md overflow-x-hidden min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 fixed left-0 top-0 bg-surface-container border-r border-outline-variant/10 flex-col h-full p-6 z-40">
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
              className="fixed inset-y-0 left-0 w-72 bg-surface-container shadow-2xl flex flex-col h-full p-6 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="lg:ml-72 flex-1 min-h-screen relative overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 sticky top-0 z-30">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-on-surface hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <h2 className="font-headline-sm text-primary tracking-tight">LUMINA SPA</h2>
          <ThemeToggle />
        </header>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-fixed opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-tertiary-fixed opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 p-4 sm:p-6 lg:p-margin-desktop">
          <div className="flex justify-between items-start">
            <Breadcrumbs />
            <div className="hidden lg:block"><ThemeToggle /></div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
