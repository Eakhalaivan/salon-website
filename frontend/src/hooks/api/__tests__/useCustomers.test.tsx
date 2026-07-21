import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCustomersQuery } from '../useCustomers';
import { customerService } from '../../../api/services/customerService';
import React from 'react';

// Mock the API service
vi.mock('../../../api/services/customerService', () => ({
  customerService: {
    getAll: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useCustomersQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should call customerService.getAll with search, page, and size parameters', async () => {
    const mockResponse = {
      content: [{ id: 1, firstName: 'John', lastName: 'Doe' }],
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };

    (customerService.getAll as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCustomersQuery('John', 0, 10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(customerService.getAll).toHaveBeenCalledWith('John', 0, 10);
    expect(result.current.data).toEqual(mockResponse);
  });
});
