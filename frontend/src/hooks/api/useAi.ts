import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';

interface AiRecommendationDto {
  serviceId: number;
  name: string;
  price: number;
  durationMinutes: number;
  rationale: string;
}

export const useAiRecommendations = () => {
  const user = useAuthStore(s => s.user);
  
  return useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async (): Promise<AiRecommendationDto[]> => {
      if (!user?.id) return [];
      const { data } = await axiosClient.get(`/recommendations/services/${user.id}`);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export interface AiMarketingSuggestionDto {
  idea: string;
  rationale: string;
  suggestedTargetAudience: string;
  suggestedCouponCode: string;
}

export const useAiMarketingSuggestions = () => {
  return useQuery({
    queryKey: ['ai-marketing-suggestions'],
    queryFn: async (): Promise<AiMarketingSuggestionDto[]> => {
      const { data } = await axiosClient.post('/admin/ai/marketing-suggestions');
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour (save API calls)
  });
};

export interface AiSalesForecastDto {
  currentWeekRevenue: number;
  projectedNextWeekRevenue: number;
  weekOverWeekGrowthPercentage: number;
  aiSummary: string;
  historicalTrend: number[];
}

export const useAiSalesForecast = (branchId?: number | null) => {
  return useQuery({
    queryKey: ['ai-sales-forecast', branchId],
    queryFn: async (): Promise<AiSalesForecastDto> => {
      const url = branchId 
        ? `/admin/ai/sales-forecast?branchId=${branchId}`
        : `/admin/ai/sales-forecast`;
      const { data } = await axiosClient.get(url);
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });
};

export interface AiInventoryAlertDto {
  productId: number;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  estimatedDaysRemaining: number;
}

export const useAiInventoryAlerts = (branchId?: number | null) => {
  return useQuery({
    queryKey: ['ai-inventory-alerts', branchId],
    queryFn: async (): Promise<AiInventoryAlertDto[]> => {
      const url = branchId 
        ? `/admin/ai/inventory-alerts?branchId=${branchId}`
        : `/admin/ai/inventory-alerts`;
      const { data } = await axiosClient.get(url);
      return data;
    },
  });
};
