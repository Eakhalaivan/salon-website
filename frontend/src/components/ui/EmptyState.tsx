import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center bg-surface/50 rounded-[2rem] border border-outline-variant/30 backdrop-blur-sm"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-float shadow-inner">
        <span className="material-symbols-outlined text-4xl text-primary font-light">{icon}</span>
      </div>
      <h3 className="font-display-md text-3xl text-on-surface mb-4">{title}</h3>
      <p className="font-body-lg text-on-surface-variant max-w-md mb-10 leading-relaxed">{description}</p>
      {action && (
        <div>{action}</div>
      )}
    </motion.div>
  );
};
