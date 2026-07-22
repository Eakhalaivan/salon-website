import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  format?: 'currency' | 'number' | 'percentage';
  className?: string;
}

export const CountUp = ({ value, duration = 1.5, format = 'number', className = '' }: CountUpProps) => {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  
  const displayValue = useTransform(spring, (current) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(current);
    }
    if (format === 'percentage') {
      return `${current.toFixed(1)}%`;
    }
    return new Intl.NumberFormat('en-US').format(Math.round(current));
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};
