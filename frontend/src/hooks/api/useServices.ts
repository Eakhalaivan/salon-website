import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonService } from '../../api/services/salonService';
import type { ServiceDto } from '../../api/types';
import { useProviderStore } from '../../store/useProviderStore';

export const useServicesQuery = (page = 0, size = 10) => {
  const businessType = useProviderStore((s) => s.businessType);
  return useQuery({
    queryKey: ['services', page, size, businessType],
    queryFn: () => salonService.getAll(page, size, businessType),
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveServicesQuery = (page = 0, size = 10) => {
  const businessType = useProviderStore((s) => s.businessType);
  return useQuery({
    queryKey: ['services', 'active', page, size, businessType],
    queryFn: () => salonService.getActive(page, size, businessType),
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
