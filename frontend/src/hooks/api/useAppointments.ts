import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../../api/services/appointmentService';

export const useServicesQuery = (page = 0, size = 100) => {
  return useQuery({
    queryKey: ['services', page, size],
    queryFn: () => appointmentService.getServices(page, size),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useStaffAppointmentsQuery = (staffId: number, date: string) => {
  return useQuery({
    queryKey: ['staffAppointments', staffId, date],
    queryFn: () => appointmentService.getAppointmentsByStaff(staffId, date),
    enabled: !!staffId && !!date,
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => appointmentService.createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointmentStatusMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => appointmentService.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staffAppointments'] });
    },
  });
};

export const useAppointmentsByBranchQuery = (branchId: number | null, start: string, end: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['appointments', branchId, start, end, page, size],
    queryFn: () => appointmentService.getAppointmentsByBranch(branchId!, start, end, page, size),
    enabled: !!branchId && !!start && !!end,
  });
};
