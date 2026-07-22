import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../components/ui/use-toast';

export interface AdminGiftCardSendRequest {
  recipientCustomerId: number;
  amount: number;
  message?: string;
  expiresAt?: string;
}

export const useAdminGiftCardsHistory = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['adminGiftCards', page, size],
    queryFn: async () => {
      const response = await axiosClient.get(`/gift-cards/admin/history?page=${page}&size=${size}`);
      return response.data;
    },
  });
};

export const useSendAdminGiftCard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AdminGiftCardSendRequest) => {
      const response = await axiosClient.post('/gift-cards/admin/send', data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Gift card sent successfully!' });
      queryClient.invalidateQueries({ queryKey: ['adminGiftCards'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending gift card',
        description: error.response?.data?.error || error.message,
        variant: 'destructive',
      });
    },
  });
};
