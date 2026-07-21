import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../api/services/productService';
import type { ProductDto } from '../../api/types';

export const useAdminProductsQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['products', 'admin', page, size],
    queryFn: () => productService.getAll(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRetailProductsQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['products', 'retail', page, size],
    queryFn: () => productService.getRetail(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProductDto>) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductDto> }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
