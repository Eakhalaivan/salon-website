import { useMotionValue, useTransform } from 'framer-motion';
import type { MouseEvent } from 'react';

export const use3DTilt = (maxRotation = 8) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [maxRotation, -maxRotation]);
  const rotateY = useTransform(x, [-100, 100], [-maxRotation, maxRotation]);
  const sheenX = useTransform(x, [-100, 100], [-150, 150]);
  const sheenY = useTransform(y, [-100, 100], [-150, 150]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, sheenX, sheenY, handleMouseMove, handleMouseLeave };
};
