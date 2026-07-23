/**
 * useProviderStore — Global business-type (provider type) state (Zustand).
 *
 * Controls whether the UI shows Spa, Salon, or Both data across all pages.
 * The selected businessType is passed as a query param to every API call
 * that supports filtering (appointments, services, staff, products, subscriptions).
 *
 * Persisted to localStorage so the selection survives page refreshes.
 */
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export type BusinessType = 'SPA' | 'SALON' | 'BOTH';

interface ProviderState {
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
}

export const useProviderStore = create<ProviderState>()(
  devtools(
    persist(
      (set) => ({
        businessType: 'BOTH',
        setBusinessType: (type) =>
          set({ businessType: type }, false, 'provider/setBusinessType'),
      }),
      {
        name: 'luxesuite-provider',
        partialize: (state) => ({ businessType: state.businessType }),
      }
    ),
    { name: 'ProviderStore' }
  )
);

// Colocated selectors
export const selectBusinessType = (s: ProviderState) => s.businessType;
