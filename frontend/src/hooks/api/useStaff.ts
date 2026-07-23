import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../../api/services/staffService';
import type { StaffDto } from '../../api/types';
import { useProviderStore } from '../../store/useProviderStore';

export const useStaffQuery = (page = 0, size = 10) => {
  const businessType = useProviderStore((s) => s.businessType);
  return useQuery({
    queryKey: ['staff', page, size, businessType],
    queryFn: () => staffService.getAll(page, size, businessType),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StaffDto>) => staffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StaffDto> }) => staffService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => staffService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};
