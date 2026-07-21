import axiosClient from '../axiosClient';
import type { SubscriptionDto, SubscriptionPlanDto, PageResponse } from '../types';

export const subscriptionService = {
  getMySubscriptions: async (page = 0, size = 10): Promise<PageResponse<SubscriptionDto>> => {
    const res = await axiosClient.get(`/subscriptions/my?page=${page}&size=${size}`);
    return res.data;
  },
  
  getPlans: async (page = 0, size = 10): Promise<PageResponse<SubscriptionPlanDto>> => {
    const res = await axiosClient.get(`/subscriptions/plans?page=${page}&size=${size}`);
    return res.data;
  },

  purchase: async (planId: number): Promise<SubscriptionDto> => {
    const res = await axiosClient.post(`/subscriptions/${planId}`);
    return res.data;
  },
};
