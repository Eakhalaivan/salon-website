import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';


export const useAttendanceByStaffQuery = (staffId?: number) => {
  return useQuery({
    queryKey: ['attendance', 'staff', staffId],
    queryFn: async (): Promise<any[]> => {
      const res = await axiosClient.get(`/attendance/staff/${staffId}`);
      return res.data;
    },
    enabled: !!staffId,
  });
};

export const useLiveAttendanceQuery = () => {
  return useQuery({
    queryKey: ['attendance', 'live'],
    queryFn: async (): Promise<any[]> => {
      const res = await axiosClient.get('/attendance/live');
      return res.data;
    },
    refetchInterval: 10000,
  });
};

export const useClockInMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ staffId, lat, lng }: { staffId: number; lat: number; lng: number }) => {
      const res = await axiosClient.post(`/attendance/clock-in/${staffId}`, {
        locationLat: lat,
        locationLng: lng
      });
      return res.data;
    },
    onSuccess: (_, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'live'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'staff', staffId] });
    },
  });
};

export const useClockOutMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffId: number) => {
      const res = await axiosClient.post(`/attendance/clock-out/${staffId}`);
      return res.data;
    },
    onSuccess: (_, staffId) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'live'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'staff', staffId] });
    },
  });
};
