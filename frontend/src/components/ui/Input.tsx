import React, { useId } from 'react';
import { cn } from './Table';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  error?: boolean | string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, error, id: propId, placeholder, ...props }, ref) => {
    const defaultId = useId();
    const id = propId || defaultId;

    return (
      <div className="relative flex-1 group">
        <motion.div 
          animate={error ? { x: [-2, 2, -2, 2, 0] } : {}} 
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={id}
            placeholder={label ? " " : placeholder} // Use empty space placeholder for floating label
            className={cn(
              "peer w-full bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:opacity-50 transition-all duration-300",
              label ? "pt-6 pb-2" : "py-3",
              icon ? "pl-11 pr-4" : "px-4",
              error && "border-error focus:ring-error/20 focus:border-error",
              className
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute text-on-surface-variant/70 transition-all duration-300 transform pointer-events-none origin-[0]",
                icon ? "left-11" : "left-4",
                "top-3.5 -translate-y-2 scale-75",
                "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0",
                "peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:text-primary",
                error && "peer-focus:text-error text-error"
              )}
            >
              {label}
            </label>
          )}
        </motion.div>
        {typeof error === 'string' && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-error text-label-sm mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
