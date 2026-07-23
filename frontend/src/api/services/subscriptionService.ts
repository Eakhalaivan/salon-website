import axiosClient from '../axiosClient';
import type { SubscriptionDto, SubscriptionPlanDto, PageResponse } from '../types';

export const subscriptionService = {
  getMySubscriptions: async (page = 0, size = 10): Promise<PageResponse<SubscriptionDto>> => {
    const res = await axiosClient.get(`/subscriptions/my?page=${page}&size=${size}`);
    return res.data;
  },
  
  getPlans: async (page = 0, size = 10, businessType?: string): Promise<PageResponse<SubscriptionPlanDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (businessType && businessType !== 'BOTH') params.set('businessType', businessType);
    const res = await axiosClient.get(`/subscriptions/plans?${params}`);
    return res.data;
  },

  purchase: async (planId: number): Promise<SubscriptionDto> => {
    const res = await axiosClient.post(`/subscriptions/${planId}`);
    return res.data;
  },
};
