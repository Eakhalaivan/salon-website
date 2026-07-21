import axiosClient from '../axiosClient';
import type { CustomerDto, PageResponse } from '../types';

export const customerService = {
  getAll: async (search?: string, page = 0, size = 10): Promise<PageResponse<CustomerDto>> => {
    let url = `/customers?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await axiosClient.get(url);
    return res.data;
  },
  
  getMyProfile: async (): Promise<CustomerDto> => {
    const res = await axiosClient.get('/customers/my');
    return res.data;
  },
  
  updateMyProfile: async (profile: Partial<CustomerDto>): Promise<CustomerDto> => {
    const res = await axiosClient.put('/customers/my', profile);
    return res.data;
  },
  
  create: async (data: Partial<CustomerDto>): Promise<CustomerDto> => {
    const res = await axiosClient.post('/customers', data);
    return res.data;
  }
};
