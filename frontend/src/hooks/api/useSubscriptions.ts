import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../../api/services/subscriptionService';
import { useProviderStore } from '../../store/useProviderStore';

export const useMySubscriptionsQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['subscriptions', 'my', page, size],
    queryFn: () => subscriptionService.getMySubscriptions(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubscriptionPlansQuery = (page = 0, size = 10) => {
  const businessType = useProviderStore((s) => s.businessType);
  return useQuery({
    queryKey: ['subscriptions', 'plans', page, size, businessType],
    queryFn: () => subscriptionService.getPlans(page, size, businessType),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const usePurchaseSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (planId: number) => subscriptionService.purchase(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'my'] });
    },
  });
};
