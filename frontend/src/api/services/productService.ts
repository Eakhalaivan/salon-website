import axiosClient from '../axiosClient';
import type { ProductDto, PageResponse } from '../types';

export const productService = {
  getAll: async (page = 0, size = 10): Promise<PageResponse<ProductDto>> => {
    const res = await axiosClient.get(`/products?page=${page}&size=${size}`);
    return res.data;
  },
  getRetail: async (page = 0, size = 10): Promise<PageResponse<ProductDto>> => {
    const res = await axiosClient.get(`/products/retail?page=${page}&size=${size}`);
    return res.data;
  },
  create: async (data: Partial<ProductDto>): Promise<ProductDto> => {
    const res = await axiosClient.post('/products', data);
    return res.data;
  },
  update: async (id: number, data: Partial<ProductDto>): Promise<ProductDto> => {
    const res = await axiosClient.put(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/products/${id}`);
  },
};
