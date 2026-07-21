import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../../api/services/customerService';
import type { CustomerDto } from '../../api/types';
import { useAuthStore } from '../../store/useAuthStore';

export const useCustomersQuery = (search: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['customers', search, page, size],
    queryFn: () => customerService.getAll(search, page, size),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyProfileQuery = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  return useQuery({
    queryKey: ['customers', 'my'],
    queryFn: customerService.getMyProfile,
    staleTime: 5 * 60 * 1000,
    enabled: isLoggedIn,
  });
};

export const useUpdateMyProfileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profile: Partial<CustomerDto>) => customerService.updateMyProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'my'] });
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CustomerDto>) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
