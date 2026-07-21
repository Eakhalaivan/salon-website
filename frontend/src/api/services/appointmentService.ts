import axiosClient from '../axiosClient';
import type { AppointmentDto, ServiceDto, PageResponse } from '../types';

export const appointmentService = {
  getServices: async (page = 0, size = 100): Promise<PageResponse<ServiceDto>> => {
    const res = await axiosClient.get(`/services?page=${page}&size=${size}`);
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

  getAppointmentsByBranch: async (branchId: number, start: string, end: string, page = 0, size = 10): Promise<PageResponse<AppointmentDto>> => {
    const res = await axiosClient.get(`/appointments/branch/${branchId}?start=${start}&end=${end}&page=${page}&size=${size}`);
    return res.data;
  }
};
