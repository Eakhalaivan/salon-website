import axiosClient from '../axiosClient';

export const payrollService = {
  getStaffPayroll: async (staffId: number, page = 0, size = 10) => {
    const res = await axiosClient.get(`/payroll/staff/${staffId}?page=${page}&size=${size}`);
    return res.data;
  }
};
