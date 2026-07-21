import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export interface LeaveRequest {
  id?: number;
  type: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  createdAt?: string;
}

export const useMyLeaveRequestsQuery = () => {
  return useQuery({
    queryKey: ['myLeaveRequests'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/leave-requests/me');
      return data as LeaveRequest[];
    },
  });
};

export const useCreateLeaveRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<LeaveRequest>) => {
      const { data } = await axiosClient.post('/leave-requests/me', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
    },
  });
};
