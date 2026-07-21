import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';


export const useShiftsByBranchQuery = (branchId?: number) => {
  return useQuery({
    queryKey: ['shifts', 'branch', branchId],
    queryFn: async (): Promise<any[]> => {
      const res = await axiosClient.get(`/schedule/branch/${branchId}`);
      return res.data;
    },
    enabled: !!branchId,
  });
};

export const useShiftsByStaffQuery = (staffId?: number) => {
  return useQuery({
    queryKey: ['shifts', 'staff', staffId],
    queryFn: async (): Promise<any[]> => {
      const res = await axiosClient.get(`/schedule/staff/${staffId}`);
      return res.data;
    },
    enabled: !!staffId,
  });
};

export const useCreateShiftMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shiftData: any) => {
      const res = await axiosClient.post('/schedule/shifts', shiftData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};

export const usePublishShiftsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shiftIds: number[]) => {
      const res = await axiosClient.post('/schedule/shifts/publish', shiftIds);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};
