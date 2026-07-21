import axiosClient from '../axiosClient';

export interface BranchDto {
  id?: number;
  name: string;
  address: string;
  taxId?: string;
  phone?: string;
  timezone?: string;
  isActive: boolean;
}

export const branchService = {
  getAll: async (): Promise<BranchDto[]> => {
    const res = await axiosClient.get('/branches');
    return res.data;
  },
  create: async (data: BranchDto): Promise<BranchDto> => {
    const res = await axiosClient.post('/branches', data);
    return res.data;
  },
  update: async (id: number, data: BranchDto): Promise<BranchDto> => {
    const res = await axiosClient.put(`/branches/${id}`, data);
    return res.data;
  }
};
