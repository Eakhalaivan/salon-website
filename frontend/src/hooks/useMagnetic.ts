import { useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

export const useMagnetic = (magneticForce = 0.3) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Guard for fine pointer and reduced motion
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const checkEligibility = () => {
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsEligible(isFinePointer && !prefersReducedMotion);
    };
    
    checkEligibility();
    
    // Listen for changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', checkEligibility);
    return () => motionQuery.removeEventListener('change', checkEligibility);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isEligible) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Translate a fraction of the distance
    x.set((e.clientX - centerX) * magneticForce);
    y.set((e.clientY - centerY) * magneticForce);
  };

  const handleMouseLeave = () => {
    if (!isEligible) return;
    
    x.set(0);
    y.set(0);
  };

  return { x, y, handleMouseMove, handleMouseLeave, isEligible };
};
