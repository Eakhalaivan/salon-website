import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export interface StaffNote {
  id?: number;
  content: string;
  updatedAt?: string;
}

export const useStaffNoteQuery = () => {
  return useQuery({
    queryKey: ['staffNote'],
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get('/staff-notes/me');
        return data as StaffNote;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
};

export const useUpdateStaffNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await axiosClient.post('/staff-notes/me', { content });
      return data as StaffNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffNote'] });
    },
  });
};
