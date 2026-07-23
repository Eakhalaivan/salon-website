/**
 * ProviderTypeSelector — Global business-type toggle for Spa / Salon / Both.
 *
 * Renders a segmented pill button that sets the global provider filter.
 * Consumed by AdminLayout, ManagerLayout, and StaffLayout in the sidebar/header.
 */
import { useProviderStore, type BusinessType } from '../../store/useProviderStore';
import { motion } from 'framer-motion';

const OPTIONS: { label: string; value: BusinessType; icon: string }[] = [
  { label: 'Spa',   value: 'SPA',   icon: 'hot_tub'  },
  { label: 'Salon', value: 'SALON', icon: 'content_cut' },
  { label: 'Both',  value: 'BOTH',  icon: 'auto_awesome' },
];

interface Props {
  /** compact — render as icon-only pills (for narrow sidebars / mobile headers) */
  compact?: boolean;
}

export const ProviderTypeSelector = ({ compact = false }: Props) => {
  const { businessType, setBusinessType } = useProviderStore();

  return (
    <div className="w-full">
      {!compact && (
        <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider font-label-sm">
          Provider Type
        </label>
      )}

      <div
        className="flex rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-high/50"
        role="group"
        aria-label="Provider type filter"
      >
        {OPTIONS.map((opt) => {
          const isActive = businessType === opt.value;
          return (
            <button
              key={opt.value}
              id={`provider-type-${opt.value.toLowerCase()}`}
              onClick={() => setBusinessType(opt.value)}
              title={opt.label}
              aria-pressed={isActive}
              className={[
                'relative flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'text-on-primary z-10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5',
              ].join(' ')}
            >
              {isActive && (
                <motion.div
                  layoutId="provider-pill"
                  className="absolute inset-0 bg-primary rounded-lg"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.3 }}
                />
              )}
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {opt.icon}
              </span>
              {!compact && <span>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
