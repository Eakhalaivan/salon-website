import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Wallet from '../Wallet';
import axiosClient from '../../api/axiosClient';

// Mock dependencies
vi.mock('../../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../components/payments/RazorpayWalletTopup', () => ({
  RazorpayWalletTopup: ({ amount }: { amount: number }) => (
    <div data-testid="razorpay-topup">Razorpay Mock: {amount}</div>
  ),
}));

describe('Wallet Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders wallet balance and elements correctly', async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: { id: 1, customerId: 10, balance: 1250.50 }
    });

    renderWithProviders(<Wallet />);

    // Wait for the balance to be rendered by PremiumWalletCard (we assume PremiumWalletCard will display it)
    // The loading might take a tick, we can assert existence of "My Wallet" and "Add Funds"
    expect(screen.getByText('My Wallet')).toBeInTheDocument();
    expect(screen.getByText('Add Funds')).toBeInTheDocument();
  });

  it('allows selecting a quick amount and initiates payment', async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: { id: 1, customerId: 10, balance: 500 }
    });

    renderWithProviders(<Wallet />);

    // Click quick amount
    const amountButton = screen.getByText('₹1,000');
    fireEvent.click(amountButton);

    // Proceed to pay
    const proceedButton = screen.getByText('Proceed To Pay');
    expect(proceedButton).not.toBeDisabled();
    fireEvent.click(proceedButton);

    // Assert that the Razorpay modal is opened with the correct amount
    expect(screen.getByTestId('razorpay-topup')).toHaveTextContent('Razorpay Mock: 1000');
  });

  it('allows custom amount entry', async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({
      data: { id: 1, customerId: 10, balance: 500 }
    });

    renderWithProviders(<Wallet />);

    const customInput = screen.getByLabelText(/Custom Amount/i);
    fireEvent.change(customInput, { target: { value: '2500' } });

    const proceedButton = screen.getByText('Proceed To Pay');
    expect(proceedButton).not.toBeDisabled();
    fireEvent.click(proceedButton);

    expect(screen.getByTestId('razorpay-topup')).toHaveTextContent('Razorpay Mock: 2500');
  });
});
