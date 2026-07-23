import axiosClient from '../axiosClient';
import type { ServiceDto, PageResponse } from '../types';

export const salonService = {
  getAll: async (page = 0, size = 10, businessType?: string): Promise<PageResponse<ServiceDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (businessType && businessType !== 'BOTH') params.set('businessType', businessType);
    const res = await axiosClient.get(`/services?${params}`);
    return res.data;
  },
  getActive: async (page = 0, size = 10, businessType?: string): Promise<PageResponse<ServiceDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (businessType && businessType !== 'BOTH') params.set('businessType', businessType);
    const res = await axiosClient.get(`/services/active?${params}`);
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
