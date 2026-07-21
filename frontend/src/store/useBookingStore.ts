/**
 * useBookingStore — Multi-step booking wizard state (Zustand).
 *
 * Tracks in-progress booking flow state across the /book and /book/category/:name
 * pages and persists it to localStorage so a page refresh doesn't lose progress.
 *
 * Flow: Category (Step 1) → Specialist (Step 2) → Ritual (Step 3) → Time (Step 4)
 *
 * ⚠️  This store holds only transient UI state for the booking wizard.
 * Actual appointment creation is handled via useMutation in useAppointments.ts.
 * Server data (service list, staff list) stays in TanStack Query caches — do not
 * duplicate it here. Only the selected IDs are stored here.
 *
 * Separation from useAuthStore:
 *   - Booking state is ephemeral (should reset after booking is confirmed).
 *   - Auth state is long-lived (survives across sessions).
 *   - Keeping them separate follows the single-responsibility principle and allows
 *     independent resets without clobbering session data.
 */
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Step constants for type safety and easy reference
export const BOOKING_STEPS = {
  CATEGORY: 1,
  SPECIALIST: 2,
  RITUAL: 3,
  TIME: 4,
} as const;

export type BookingStep = typeof BOOKING_STEPS[keyof typeof BOOKING_STEPS];

interface BookingState {
  // --- State ---
  currentStep: BookingStep;
  selectedCategory: string | null;   // e.g. "Hair", "Massage"
  selectedSpecialist: number | null; // staff ID
  selectedServices: number[];        // service IDs (can multi-select in step 3)
  selectedTime: string | null;       // ISO datetime string

  // --- Actions ---
  setStep: (step: BookingStep) => void;
  setCategory: (category: string) => void;
  setSpecialist: (staffId: number) => void;
  toggleService: (serviceId: number) => void;
  setServices: (serviceIds: number[]) => void;
  setTime: (isoTime: string) => void;
  resetBooking: () => void;

  // --- Validation Helpers ---
  canProceedToStep: (step: BookingStep) => boolean;
}

const INITIAL_STATE = {
  currentStep: BOOKING_STEPS.CATEGORY as BookingStep,
  selectedCategory: null,
  selectedSpecialist: null,
  selectedServices: [],
  selectedTime: null,
};

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        setStep: (step) =>
          set({ currentStep: step }, false, 'booking/setStep'),

        setCategory: (category) =>
          set({ selectedCategory: category, currentStep: BOOKING_STEPS.SPECIALIST }, false, 'booking/setCategory'),

        setSpecialist: (staffId) =>
          set({ selectedSpecialist: staffId, currentStep: BOOKING_STEPS.RITUAL }, false, 'booking/setSpecialist'),

        toggleService: (serviceId) =>
          set(
            (state) => ({
              selectedServices: state.selectedServices.includes(serviceId)
                ? state.selectedServices.filter((id) => id !== serviceId)
                : [...state.selectedServices, serviceId],
            }),
            false,
            'booking/toggleService'
          ),

        setServices: (serviceIds) =>
          set({ selectedServices: serviceIds }, false, 'booking/setServices'),

        setTime: (isoTime) =>
          set({ selectedTime: isoTime }, false, 'booking/setTime'),

        resetBooking: () =>
          set({ ...INITIAL_STATE }, false, 'booking/reset'),

        canProceedToStep: (step) => {
          const state = get();
          switch (step) {
            case BOOKING_STEPS.CATEGORY:
              return true;
            case BOOKING_STEPS.SPECIALIST:
              return state.selectedCategory !== null;
            case BOOKING_STEPS.RITUAL:
              return state.selectedSpecialist !== null;
            case BOOKING_STEPS.TIME:
              return state.selectedServices.length > 0;
            default:
              return false;
          }
        },
      }),
      {
        name: 'luxesuite-booking',
        // Persist everything except step (so users always land on Category on fresh visits
        // but retain their selections if they accidentally refresh mid-flow)
        partialize: (state) => ({
          selectedCategory: state.selectedCategory,
          selectedSpecialist: state.selectedSpecialist,
          selectedServices: state.selectedServices,
          selectedTime: state.selectedTime,
        }),
      }
    ),
    { name: 'BookingStore' }
  )
);

// --- Colocated Selectors ---
export const selectCurrentStep = (s: BookingState) => s.currentStep;
export const selectSelectedCategory = (s: BookingState) => s.selectedCategory;
export const selectSelectedSpecialist = (s: BookingState) => s.selectedSpecialist;
export const selectSelectedServices = (s: BookingState) => s.selectedServices;
export const selectSelectedTime = (s: BookingState) => s.selectedTime;
export const selectCanProceedToStep = (step: BookingStep) => (s: BookingState) =>
  s.canProceedToStep(step);
