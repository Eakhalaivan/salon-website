import { useQuery } from '@tanstack/react-query';
import { billingService } from '../../api/services/billingService';

export const useMyInvoicesQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['invoices', 'my', page, size],
    queryFn: () => billingService.getMyInvoices(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllInvoicesQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['invoices', 'all', page, size],
    queryFn: () => billingService.getAllInvoices(page, size),
    staleTime: 5 * 60 * 1000,
  });
};
