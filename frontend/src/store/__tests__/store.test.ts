/**
 * Store Unit Tests for LuxeSuite Frontend
 *
 * Tests the logic of each Zustand store independently of React components,
 * analogous to BillingServiceTest.java on the backend: isolated, pure state logic.
 *
 * Run: npm test
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../useAuthStore';
import { useThemeStore } from '../useThemeStore';
import { useBookingStore, BOOKING_STEPS } from '../useBookingStore';

// ─── Auth Store Tests ───────────────────────────────────────────────────────

describe('useAuthStore', () => {
  // Reset store between tests using the store's own logout action
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should start in a logged-out state', () => {
    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.role).toBeNull();
    expect(state.branchId).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should set auth correctly on login', () => {
    useAuthStore.getState().setAuth('CUSTOMER', null, {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@luxesuite.com',
    });

    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.role).toBe('CUSTOMER');
    expect(state.user?.email).toBe('test@luxesuite.com');
    expect(state.isAuthenticated()).toBe(true);
  });

  it('should set branchId for staff/admin roles', () => {
    useAuthStore.getState().setAuth('ADMIN', 5);
    expect(useAuthStore.getState().branchId).toBe(5);
  });

  it('should fully clear state on logout', () => {
    useAuthStore.getState().setAuth('ADMIN', 5, { firstName: 'Admin' });
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.role).toBeNull();
    expect(state.branchId).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it('should NOT expose any token fields (security check)', () => {
    useAuthStore.getState().setAuth('CUSTOMER', null);
    const state = useAuthStore.getState();
    // Ensures no accidental token leakage into the store
    expect((state as any).accessToken).toBeUndefined();
    expect((state as any).refreshToken).toBeUndefined();
    expect((state as any).token).toBeUndefined();
  });
});

// ─── Theme Store Tests ──────────────────────────────────────────────────────

describe('useThemeStore', () => {
  it('should toggle between light and dark', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('should set theme directly', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');

    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });
});

// ─── Booking Store Tests ────────────────────────────────────────────────────

describe('useBookingStore', () => {
  beforeEach(() => {
    useBookingStore.getState().resetBooking();
  });

  it('should start at Category step with empty selections', () => {
    const state = useBookingStore.getState();
    expect(state.currentStep).toBe(BOOKING_STEPS.CATEGORY);
    expect(state.selectedCategory).toBeNull();
    expect(state.selectedSpecialist).toBeNull();
    expect(state.selectedServices).toHaveLength(0);
    expect(state.selectedTime).toBeNull();
  });

  it('setSpecialist() should advance step to RITUAL', () => {
    useBookingStore.getState().setSpecialist(3);
    const state = useBookingStore.getState();
    expect(state.selectedSpecialist).toBe(3);
    expect(state.currentStep).toBe(BOOKING_STEPS.RITUAL);
  });

  it('toggleService() should add and remove service IDs', () => {
    const { toggleService } = useBookingStore.getState();

    toggleService(10);
    expect(useBookingStore.getState().selectedServices).toContain(10);

    toggleService(20);
    expect(useBookingStore.getState().selectedServices).toHaveLength(2);

    toggleService(10); // Remove
    expect(useBookingStore.getState().selectedServices).not.toContain(10);
    expect(useBookingStore.getState().selectedServices).toHaveLength(1);
  });

  it('setTime() should store an ISO datetime string', () => {
    useBookingStore.getState().setTime('2026-07-15T10:00:00');
    expect(useBookingStore.getState().selectedTime).toBe('2026-07-15T10:00:00');
  });

  it('canProceedToStep() should enforce flow order', () => {
    const { canProceedToStep } = useBookingStore.getState();

    // Initially only category is accessible
    expect(canProceedToStep(BOOKING_STEPS.CATEGORY)).toBe(true);
    expect(canProceedToStep(BOOKING_STEPS.SPECIALIST)).toBe(false);
    expect(canProceedToStep(BOOKING_STEPS.RITUAL)).toBe(false);
    expect(canProceedToStep(BOOKING_STEPS.TIME)).toBe(false);

    // After choosing a specialist
    useBookingStore.getState().setSpecialist(1);
    expect(useBookingStore.getState().canProceedToStep(BOOKING_STEPS.RITUAL)).toBe(true);
    expect(useBookingStore.getState().canProceedToStep(BOOKING_STEPS.TIME)).toBe(false);

    // After selecting a service
    useBookingStore.getState().toggleService(5);
    expect(useBookingStore.getState().canProceedToStep(BOOKING_STEPS.TIME)).toBe(true);
  });

  it('resetBooking() should clear all selections and return to step 1', () => {
    useBookingStore.getState().setSpecialist(2);
    useBookingStore.getState().toggleService(7);
    useBookingStore.getState().setTime('2026-07-15T14:00:00');
    useBookingStore.getState().resetBooking();

    const state = useBookingStore.getState();
    expect(state.currentStep).toBe(BOOKING_STEPS.CATEGORY);
    expect(state.selectedSpecialist).toBeNull();
    expect(state.selectedServices).toHaveLength(0);
    expect(state.selectedTime).toBeNull();
  });

  it('setStep() should allow navigating back to a previous step', () => {
    useBookingStore.getState().setSpecialist(1); // Advances to RITUAL
    useBookingStore.getState().setStep(BOOKING_STEPS.SPECIALIST); // Go back
    expect(useBookingStore.getState().currentStep).toBe(BOOKING_STEPS.SPECIALIST);
  });
});
