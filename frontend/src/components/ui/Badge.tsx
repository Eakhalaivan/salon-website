import React from 'react';

export type BadgeVariant = 'success' | 'pending' | 'danger' | 'gold' | 'dark';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className = '' }) => {
  const variantStyles = {
    success: 'bg-success-bg text-success-text',
    pending: 'bg-pending-bg text-pending-text',
    danger: 'bg-danger-bg text-danger-text',
    gold: 'bg-gold-50 text-gold-700',
    dark: 'bg-ink-900 text-gold-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full font-sans text-[11px] font-bold tracking-wider uppercase ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
