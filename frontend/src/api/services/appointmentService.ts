import axiosClient from '../axiosClient';
import type { AppointmentDto, ServiceDto, PageResponse } from '../types';

export const appointmentService = {
  getServices: async (page = 0, size = 100, businessType?: string): Promise<PageResponse<ServiceDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (businessType && businessType !== 'BOTH') params.set('businessType', businessType);
    const res = await axiosClient.get(`/services?${params}`);
    return res.data;
  },
  
  createAppointment: async (payload: any): Promise<AppointmentDto> => {
    const res = await axiosClient.post('/appointments', payload);
    return res.data;
  },
  
  getAppointmentsByStaff: async (staffId: number, date: string): Promise<AppointmentDto[]> => {
    const res = await axiosClient.get(`/appointments/staff/${staffId}?date=${date}`);
    return res.data;
  },
  
  updateAppointmentStatus: async (id: number, status: string): Promise<AppointmentDto> => {
    const res = await axiosClient.patch(`/appointments/${id}/status`, { status });
    return res.data;
  },

  getAppointmentsByBranch: async (branchId: number, start: string, end: string, page = 0, size = 10, businessType?: string): Promise<PageResponse<AppointmentDto>> => {
    const params = new URLSearchParams({ start, end, page: String(page), size: String(size) });
    if (businessType && businessType !== 'BOTH') params.set('businessType', businessType);
    const res = await axiosClient.get(`/appointments/branch/${branchId}?${params}`);
    return res.data;
  }
};
