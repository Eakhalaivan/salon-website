import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Payments } from '../Payments';
import { useMyInvoicesQuery } from '../../../hooks/api/useBilling';

// Mock dependencies
vi.mock('../../../hooks/api/useBilling', () => ({
  useMyInvoicesQuery: vi.fn(),
}));

vi.mock('../../../api/axiosClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { id: 10, email: 'test@example.com' } }),
  },
}));

vi.mock('../../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../../components/payments/RazorpayCheckout', () => ({
  RazorpayCheckout: ({ invoiceId }: { invoiceId: number }) => (
    <button data-testid={`pay-button-${invoiceId}`}>Pay Now</button>
  ),
}));

describe('Payments Component', () => {
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

  it('renders loading state initially', () => {
    vi.mocked(useMyInvoicesQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    renderWithProviders(<Payments />);
    expect(screen.getByText('progress_activity')).toBeInTheDocument();
  });

  it('renders invoices and stats', () => {
    const mockInvoices = [
      { id: 1, totalAmount: 1000, status: 'PAID', createdAt: '2026-08-01T10:00:00', branch: { name: 'Main Branch' } },
      { id: 2, totalAmount: 500, status: 'PENDING', createdAt: '2026-08-02T10:00:00', branch: { name: 'Main Branch' } },
    ];

    vi.mocked(useMyInvoicesQuery).mockReturnValue({
      data: { content: mockInvoices, totalElements: 2 },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    renderWithProviders(<Payments />);

    // Check stats (1000 paid, 500 pending)
    expect(screen.getByText('₹1,000')).toBeInTheDocument(); // Total Spent
    expect(screen.getByText('₹500')).toBeInTheDocument(); // Pending Amount
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Invoices

    // Check row data
    expect(screen.getByText('INV-1')).toBeInTheDocument();
    expect(screen.getByText('INV-2')).toBeInTheDocument();
  });

  it('renders Pay Now button for pending invoice and Download for paid invoice', () => {
    const mockInvoices = [
      { id: 1, totalAmount: 1000, status: 'PAID', createdAt: '2026-08-01T10:00:00', branch: { name: 'Main Branch' } },
      { id: 2, totalAmount: 500, status: 'PENDING', createdAt: '2026-08-02T10:00:00', branch: { name: 'Main Branch' } },
    ];

    vi.mocked(useMyInvoicesQuery).mockReturnValue({
      data: { content: mockInvoices, totalElements: 2 },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    renderWithProviders(<Payments />);

    // Invoice 2 is PENDING, so it should render the RazorpayCheckout mock button
    expect(screen.getByTestId('pay-button-2')).toBeInTheDocument();

    // Invoice 1 is PAID, so it should render Download button
    const downloadButtons = screen.getAllByText('Download');
    expect(downloadButtons.length).toBeGreaterThan(0);
  });
});
