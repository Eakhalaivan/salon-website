import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, animate, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

const links = [
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Blog', path: '/blog' },
  { name: 'Testimonials', path: '/testimonials' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Careers', path: '/careers' },
  { name: 'Franchise', path: '/franchise' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-3 glass-premium shadow-xl border-b border-primary-500/20' : 'py-6 bg-transparent'}`}>
      {/* Scroll Progress Bar */}
      <motion.div 
        style={{ scaleX, transformOrigin: "0%" }}
        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary-600 to-primary-400 z-50"
      />
      
      {/* Underlay Gradient for top-of-page legibility */}
      <div className={`absolute inset-0 bg-gradient-to-b from-black/40 to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-0' : 'opacity-100'} pointer-events-none`} />
      
      <div className="flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-4 relative z-50">
          <Link to="/" className="font-display-lg text-3xl text-primary tracking-tighter">LUMINA SPA</Link>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path || location.pathname + location.hash === link.path;
            
            return (
              <motion.div 
                key={link.name} 
                className="relative px-2 xl:px-4 py-2 cursor-pointer"
                initial="initial"
                whileHover="hover"
              >
                <a 
                  href={link.path} 
                  onClick={(e) => {
                    if (!link.path.includes('#')) {
                      e.preventDefault();
                      navigate(link.path);
                    } else if (window.location.pathname === '/') {
                      e.preventDefault();
                      const hash = link.path.split('#')[1];
                      const element = document.getElementById(hash);
                      if (element) {
                        const y = element.getBoundingClientRect().top + window.scrollY - 80;
                        animate(window.scrollY, y, {
                          type: 'spring',
                          stiffness: 50,
                          damping: 20,
                          onUpdate: (latest) => window.scrollTo(0, latest)
                        });
                      } else {
                        navigate(link.path);
                      }
                    }
                  }}
                  className={`font-label-md text-sm xl:text-base relative z-10 transition-all duration-300 ${
                    isActive 
                      ? 'text-primary ' + (!isScrolled ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : '')
                      : (isScrolled ? 'text-on-surface/70 hover:text-on-surface' : 'text-white/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]')
                  }`}
                >
                  {link.name}
                </a>
                
                {/* Active Link Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-md"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Hover Underline */}
                {!isActive && (
                  <motion.span
                    variants={{
                      initial: { scaleX: 0 },
                      hover: { scaleX: 1 }
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`absolute bottom-0 left-2 xl:left-4 right-2 xl:right-4 h-[2px] rounded-t-md origin-left ${isScrolled ? 'bg-on-surface/40' : 'bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)]'}`}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
        
        <div className="hidden lg:flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={() => navigate('/login')} variant="primary" size="md" magnetic>
            Login /sign in
          </Button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button 
            className="text-primary z-50 p-2 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, pointerEvents: 'none' }}
            animate={{ opacity: 1, pointerEvents: 'auto' }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-3/4 h-full bg-surface shadow-2xl p-8 pt-24 flex flex-col gap-6"
            >
              {links.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  onClick={(e) => {
                    if (!link.path.includes('#')) {
                      e.preventDefault();
                      navigate(link.path);
                    } else if (window.location.pathname === '/') {
                      e.preventDefault();
                      const hash = link.path.split('#')[1];
                      const element = document.getElementById(hash);
                      if (element) {
                        const y = element.getBoundingClientRect().top + window.scrollY - 80;
                        animate(window.scrollY, y, {
                          type: 'spring',
                          stiffness: 50,
                          damping: 20,
                          onUpdate: (latest) => window.scrollTo(0, latest)
                        });
                      } else {
                        navigate(link.path);
                      }
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="font-headline-md text-2xl text-on-surface border-b border-outline-variant/30 pb-4 block"
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} variant="primary" size="lg" className="w-full">
                  Book Now
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
