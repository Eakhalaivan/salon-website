import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStaffAppointmentsQuery } from '../../hooks/api/useAppointments';
import { useStaffPayrollQuery } from '../../hooks/api/usePayroll';


export const Reports = () => {
  const { user } = useAuthStore();
  const staffId = user?.staffId;
  const [dateRange, setDateRange] = useState('month'); // week, month, year

  // Simulate picking a date string for the query based on range
  // In reality, this would need backend support for range queries. We use a single date for now 
  // or aggregate payroll history which comes in pages.
  const today = new Date().toISOString().split('T')[0];
  const { data: appointments, isLoading: isApptLoading } = useStaffAppointmentsQuery(staffId!, today);
  const { data: payroll, isLoading: isPayrollLoading } = useStaffPayrollQuery(staffId);

  const isLoading = isApptLoading || isPayrollLoading;

  const totalAppts = appointments?.length || 0;
  const completedAppts = appointments?.filter((a: any) => a.status === 'COMPLETED').length || 0;
  
  const totalEarnings = payroll?.content?.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0) || 0;
  const totalCommissions = payroll?.content?.reduce((acc: number, curr: any) => acc + curr.commissionAmount, 0) || 0;

  return (
    <>
<div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] text-on-surface mb-2">Performance Reports</h2>
          <p className="text-on-surface-variant text-body-lg">Track your key metrics and earnings.</p>
        </div>
        <select 
          className="bg-surface-container border border-outline-variant rounded-xl px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-surface-container rounded-[24px]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-[24px]">
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Earnings</h3>
            <p className="font-display-md text-[36px] text-primary">₹{totalEarnings.toFixed(2)}</p>
          </div>
          <div className="glass-panel p-6 rounded-[24px]">
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Commissions</h3>
            <p className="font-display-md text-[36px] text-on-surface">₹{totalCommissions.toFixed(2)}</p>
          </div>
          <div className="glass-panel p-6 rounded-[24px]">
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Appointments</h3>
            <p className="font-display-md text-[36px] text-on-surface">{totalAppts}</p>
          </div>
          <div className="glass-panel p-6 rounded-[24px]">
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Completion Rate</h3>
            <p className="font-display-md text-[36px] text-success">
              {totalAppts ? Math.round((completedAppts / totalAppts) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel p-8 rounded-[32px] min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50 mb-4">bar_chart</span>
          <h3 className="font-display-sm text-[24px] text-on-surface mb-2">Detailed Charts</h3>
          <p className="text-on-surface-variant text-body-md">Advanced visualizations will be available in the next update.</p>
        </div>
      </div>
    </>
  );
};
