import axiosClient from '../axiosClient';
import type { ServiceDto, PageResponse } from '../types';

export const salonService = {
  getAll: async (page = 0, size = 10): Promise<PageResponse<ServiceDto>> => {
    const res = await axiosClient.get(`/services?page=${page}&size=${size}`);
    return res.data;
  },
  getActive: async (page = 0, size = 10): Promise<PageResponse<ServiceDto>> => {
    const res = await axiosClient.get(`/services/active?page=${page}&size=${size}`);
    return res.data;
  },
  getById: async (id: number): Promise<ServiceDto> => {
    const res = await axiosClient.get(`/services/${id}`);
    return res.data;
  },
  create: async (data: Partial<ServiceDto>): Promise<ServiceDto> => {
    const res = await axiosClient.post('/services', data);
    return res.data;
  },
  update: async (id: number, data: Partial<ServiceDto>): Promise<ServiceDto> => {
    const res = await axiosClient.put(`/services/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/services/${id}`);
  },
};
