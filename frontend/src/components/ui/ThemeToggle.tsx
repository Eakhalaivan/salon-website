import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full hover:bg-surface-variant/50 transition-colors flex items-center justify-center overflow-hidden"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : 90,
        }}
        transition={{ duration: 0.3, ease: 'backOut' }}
        className="absolute"
      >
        <Moon size={20} className="text-primary" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          opacity: theme === 'light' ? 1 : 0,
          rotate: theme === 'light' ? 0 : -90,
        }}
        transition={{ duration: 0.3, ease: 'backOut' }}
        className="absolute"
      >
        <Sun size={20} className="text-primary" />
      </motion.div>
      {/* Invisible placeholder to maintain button size */}
      <div className="opacity-0">
        <Sun size={20} />
      </div>
    </button>
  );
};
