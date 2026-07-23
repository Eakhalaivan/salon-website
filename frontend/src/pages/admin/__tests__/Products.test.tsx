import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { AdminProducts } from '../Products';
import * as productsHooks from '../../../hooks/api/useProducts';
import * as branchStore from '../../../store/useBranchStore';
import * as aiHooks from '../../../hooks/api/useAi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver as any;

vi.mock('../../../hooks/api/useProducts');
vi.mock('../../../store/useBranchStore');
vi.mock('../../../hooks/api/useAi');

const queryClient = new QueryClient();

describe('Products with BusinessTypeBadge', () => {
  beforeEach(() => {
    vi.spyOn(branchStore, 'useBranchStore').mockReturnValue({ selectedBranchId: 1 } as any);
    vi.spyOn(aiHooks, 'useAiInventoryAlerts').mockReturnValue({ data: [], isLoading: false } as any);
    
    vi.spyOn(productsHooks, 'useCreateProduct').mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.spyOn(productsHooks, 'useUpdateProduct').mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.spyOn(productsHooks, 'useDeleteProduct').mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
  });

  it('renders BusinessTypeBadge for SPA, SALON, and BOTH', () => {
    vi.spyOn(productsHooks, 'useAdminProductsQuery').mockReturnValue({
      data: {
        content: [
          { id: 1, name: 'Product A', businessType: 'SPA', type: 'RETAIL', price: 10, stockQuantity: 100, isActive: true },
          { id: 2, name: 'Product B', businessType: 'SALON', type: 'BACKBAR', price: 20, stockQuantity: 50, isActive: true },
          { id: 3, name: 'Product C', businessType: 'BOTH', type: 'RETAIL', price: 30, stockQuantity: 10, isActive: true },
        ],
        pageNo: 0,
        totalPages: 1,
        last: true
      }
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminProducts />
      </QueryClientProvider>
    );

    // Assert that badges are rendered
    expect(screen.getByText('Spa', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Salon', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Both', { selector: 'span' })).toBeInTheDocument();
  });

  it('filters products by business type', async () => {
    vi.spyOn(productsHooks, 'useAdminProductsQuery').mockReturnValue({
      data: {
        content: [
          { id: 1, name: 'Product A', businessType: 'SPA', type: 'RETAIL', price: 10, stockQuantity: 100, isActive: true },
          { id: 2, name: 'Product B', businessType: 'SALON', type: 'BACKBAR', price: 20, stockQuantity: 50, isActive: true },
        ],
        pageNo: 0,
        totalPages: 1,
        last: true
      }
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminProducts />
      </QueryClientProvider>
    );

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'SPA' } });

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.queryByText('Product B')).not.toBeInTheDocument();
    });
  });
});
