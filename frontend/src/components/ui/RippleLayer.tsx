import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const useRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    // Remove the ripple after animation completes (approx 600ms)
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return { ripples, addRipple };
};

export const RippleLayer = ({ ripples }: { ripples: Ripple[] }) => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none z-0">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bg-white/40 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 50,
              height: 50,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
