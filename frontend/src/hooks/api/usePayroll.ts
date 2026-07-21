import { useQuery } from '@tanstack/react-query';
import { payrollService } from '../../api/services/payrollService';

export const useStaffPayrollQuery = (staffId: number | undefined, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['staffPayroll', staffId, page, size],
    queryFn: () => payrollService.getStaffPayroll(staffId!, page, size),
    enabled: !!staffId,
  });
};
