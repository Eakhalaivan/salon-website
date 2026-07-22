import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export const useExpensesQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['expenses', page, size],
    queryFn: async () => {
      const response = await axiosClient.get(`/expenses?page=${page}&size=${size}`);
      return response.data;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosClient.post('/expenses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
