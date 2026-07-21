import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonService } from '../../api/services/salonService';
import type { ServiceDto } from '../../api/types';

export const useServicesQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['services', page, size],
    queryFn: () => salonService.getAll(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveServicesQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['services', 'active', page, size],
    queryFn: () => salonService.getActive(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useServiceQuery = (id: number) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => salonService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ServiceDto>) => salonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ServiceDto> }) => salonService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salonService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
