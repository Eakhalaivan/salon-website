import axiosClient from '../axiosClient';
import type { StaffDto, PageResponse } from '../types';

export const staffService = {
  getAll: async (page = 0, size = 10, businessType?: string): Promise<PageResponse<StaffDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (businessType && businessType !== 'BOTH') params.set('businessType', businessType);
    const res = await axiosClient.get(`/staff?${params}`);
    return res.data;
  },
  getByBranch: async (branchId: number, page = 0, size = 10, businessType?: string): Promise<PageResponse<StaffDto>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (businessType && businessType !== 'BOTH') params.set('businessType', businessType);
    const res = await axiosClient.get(`/staff/branch/${branchId}?${params}`);
    return res.data;
  },
  create: async (data: Partial<StaffDto>): Promise<StaffDto> => {
    const res = await axiosClient.post('/staff', data);
    return res.data;
  },
  update: async (id: number, data: Partial<StaffDto>): Promise<StaffDto> => {
    const res = await axiosClient.put(`/staff/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/staff/${id}`);
  },
};
