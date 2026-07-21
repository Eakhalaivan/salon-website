import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../../api/services/subscriptionService';

export const useMySubscriptionsQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['subscriptions', 'my', page, size],
    queryFn: () => subscriptionService.getMySubscriptions(page, size),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubscriptionPlansQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['subscriptions', 'plans', page, size],
    queryFn: () => subscriptionService.getPlans(page, size),
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
