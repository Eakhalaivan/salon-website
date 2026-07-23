import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { CustomerBooking } from '../CustomerBooking';
import { useBookingStore } from '../../store/useBookingStore';
import { BrowserRouter } from 'react-router-dom';

// Mock IntersectionObserver for Framer Motion
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock API Hooks
vi.mock('../../hooks/api/useAppointments', () => ({
  useServicesQuery: vi.fn(),
  useCreateAppointmentMutation: vi.fn(),
}));

vi.mock('../../hooks/api/useCustomers', () => ({
  useMyProfileQuery: vi.fn(),
}));

vi.mock('../../hooks/api/useAi', () => ({
  useAiRecommendations: vi.fn(),
}));

// Import mocks to configure them in tests
import { useServicesQuery, useCreateAppointmentMutation } from '../../hooks/api/useAppointments';
import { useMyProfileQuery } from '../../hooks/api/useCustomers';
import { useAiRecommendations } from '../../hooks/api/useAi';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe('CustomerBooking Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBookingStore.getState().resetBooking();
    window.scrollTo = vi.fn();

    // Default API Mocks
    (useServicesQuery as any).mockReturnValue({
      data: {
        content: [
          { id: 1, name: 'Swedish Massage', category: 'Massage', price: 100, durationMins: 60, description: 'Relaxing massage' },
          { id: 2, name: 'Deep Tissue', category: 'Massage', price: 120, durationMins: 60, description: 'Deep pressure' },
        ],
      },
      isLoading: false,
    });

    (useMyProfileQuery as any).mockReturnValue({
      data: { id: 1, firstName: 'Test', lastName: 'User' },
    });

    (useAiRecommendations as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    (useCreateAppointmentMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <CustomerBooking />
      </BrowserRouter>
    );

  it('renders category selection initially', () => {
    renderComponent();
    expect(screen.getByText('Begin Your Journey')).toBeInTheDocument();
    expect(screen.getByText('Massage')).toBeInTheDocument();
  });

  it('advances to specialist step and then ritual', async () => {
    renderComponent();
    
    // Select category (this navigates, but we mocked navigate)
    fireEvent.click(screen.getByText('Massage'));
    expect(mockNavigate).toHaveBeenCalledWith('/book/category/massage');

    // Simulate state change to specialist step manually
    useBookingStore.getState().setStep(2); // SPECIALIST
    
    renderComponent(); // re-render with new store state
    expect(screen.getByText('Choose Your Guide')).toBeInTheDocument();

    // Click on a specialist
    fireEvent.click(screen.getAllByText('Select Artisan')[0]);
    
    // Store should advance to RITUAL (step 3)
    await waitFor(() => {
      expect(useBookingStore.getState().currentStep).toBe(3); // RITUAL
    });
  });

  it('shows services and allows selection', async () => {
    // Start at Ritual step
    useBookingStore.getState().setStep(3); // RITUAL
    renderComponent();
    
    expect(screen.getByText('Curate Your Ritual')).toBeInTheDocument();
    expect(screen.getByText('Swedish Massage')).toBeInTheDocument();
    
    // Select a service
    fireEvent.click(screen.getByText('Swedish Massage'));
    expect(useBookingStore.getState().selectedServices).toContain(1);

    // Click continue
    fireEvent.click(screen.getByText('Continue to Scheduling'));
    
    // Should advance to TIME step
    await waitFor(() => {
      expect(useBookingStore.getState().currentStep).toBe(4);
    });
  });

  it('handles booking confirmation', async () => {
    const mockMutate = vi.fn((data, options) => {
      options.onSuccess();
    });
    
    (useCreateAppointmentMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    // Set selections first so we are allowed to proceed to TIME step
    useBookingStore.getState().setSpecialist(1);
    useBookingStore.getState().toggleService(1);
    useBookingStore.getState().setStep(4);
    
    renderComponent();
    
    // The time string rendered is locale dependent, just click the first button in the grid that doesn't say "Confirm Reservation"
    const buttons = screen.getAllByRole('button');
    const timeButton = buttons.find(b => b.textContent && b.textContent.includes(':00'));
    if (timeButton) {
      fireEvent.click(timeButton);
    }
    
    // Confirm booking
    fireEvent.click(screen.getByText('Confirm Reservation'));
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Should show success screen
    expect(screen.getByText('Your Sanctuary Awaits')).toBeInTheDocument();
  });
});
