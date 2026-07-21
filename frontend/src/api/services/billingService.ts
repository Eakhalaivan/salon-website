import axiosClient from '../axiosClient';
import type { InvoiceDto, PageResponse } from '../types';

export const billingService = {
  getMyInvoices: async (page = 0, size = 10): Promise<PageResponse<InvoiceDto>> => {
    const res = await axiosClient.get(`/invoices/me?page=${page}&size=${size}`);
    return res.data;
  },
  getAllInvoices: async (page = 0, size = 10): Promise<PageResponse<InvoiceDto>> => {
    const res = await axiosClient.get(`/invoices?page=${page}&size=${size}`);
    return res.data;
  },
};
