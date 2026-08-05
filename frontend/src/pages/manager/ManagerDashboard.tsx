import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useBranchStore } from '../../store/useBranchStore';
import { useAppointmentsByBranchQuery } from '../../hooks/api/useAppointments';
import { useLiveAttendanceQuery } from '../../hooks/api/useAttendance';
import { CountUp } from '../../components/ui/CountUp';
import { ShimmerSweep } from '../../components/ui/ShimmerSweep';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface DashboardStats {
  totalAppointmentsToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  newCustomersThisMonth: number;
}

export const ManagerDashboard = () => {
  const { user, branchId: authBranchId } = useAuthStore();
  const { selectedBranchId } = useBranchStore();
  const branchId = selectedBranchId || authBranchId;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: appointmentsResponse } = useAppointmentsByBranchQuery(
    branchId,
    todayStart.toISOString(),
    todayEnd.toISOString(),
    0,
    10
  );

  const { data: attendanceResponse } = useLiveAttendanceQuery();

  useEffect(() => {
    if (!branchId) return;
    setIsLoadingStats(true);
    axiosClient.get(`/analytics/dashboard?branchId=${branchId}`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setIsLoadingStats(false));
  }, [branchId]);

  const staffOnDuty = attendanceResponse?.filter((a: any) => a.clockOutTime === null) || [];
  const appointments = appointmentsResponse?.content || [];
  const completedCount = appointments.filter((a: any) => a.status === 'COMPLETED').length;
  const pendingCount = appointments.filter((a: any) => ['BOOKED', 'CONFIRMED'].includes(a.status)).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <header className="relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <ShimmerSweep className="opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] tracking-widest font-bold bg-secondary/10 text-secondary rounded-full border border-secondary/20 uppercase">Branch Manager</span>
          </div>
          <h2 className="font-display-md text-4xl text-on-surface">Good day, {user?.firstName || 'Manager'}</h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3 relative z-10 flex-wrap">
          <Link to="/manager/appointments" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-md shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            View Appointments
          </Link>
          <Link to="/manager/reports" className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant text-on-surface rounded-full font-label-md hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            Reports
          </Link>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Revenue Today',
            value: stats?.revenueToday || 0,
            format: 'currency' as const,
            icon: 'payments',
            color: 'text-green-600',
            bg: 'bg-green-500/10',
          },
          {
            label: 'Monthly Revenue',
            value: stats?.revenueThisMonth || 0,
            format: 'currency' as const,
            icon: 'trending_up',
            color: 'text-blue-600',
            bg: 'bg-blue-500/10',
          },
          {
            label: "Today's Appointments",
            value: stats?.totalAppointmentsToday || 0,
            format: 'number' as const,
            icon: 'event_available',
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            label: 'New Clients (Month)',
            value: stats?.newCustomersThisMonth || 0,
            format: 'number' as const,
            icon: 'person_add',
            color: 'text-purple-600',
            bg: 'bg-purple-500/10',
          },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-5 rounded-[24px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
            </div>
            <p className="font-label-sm text-on-surface-variant text-xs uppercase tracking-widest mb-1">{stat.label}</p>
            {isLoadingStats ? (
              <div className="h-9 w-24 bg-surface-container-high animate-pulse rounded-lg" />
            ) : (
              <CountUp value={stat.value} format={stat.format} className="font-display-md text-3xl text-on-surface block" />
            )}
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments Table */}
        <div className="lg:col-span-2 glass-panel rounded-[28px] overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest/60">
            <div>
              <h3 className="font-headline-sm text-on-surface">Today's Schedule</h3>
              <p className="text-label-sm text-on-surface-variant mt-0.5">{appointments.length} appointments · {completedCount} done · {pendingCount} pending</p>
            </div>
            <Link to="/manager/appointments" className="text-primary font-label-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="material-symbols-outlined text-outline/40 text-5xl mb-3">event_available</span>
                <p className="text-on-surface-variant">No appointments today.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/40">
                  <tr>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase text-[11px] tracking-wider">Time</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase text-[11px] tracking-wider">Client</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase text-[11px] tracking-wider">Service</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase text-[11px] tracking-wider">Staff</th>
                    <th className="px-5 py-3 font-label-sm text-on-surface-variant uppercase text-[11px] tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {appointments.map((apt: any) => (
                    <tr key={apt.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="px-5 py-3.5 font-label-md text-primary font-bold whitespace-nowrap">
                        {new Date(apt.services?.[0]?.startTime || apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary-container/30 flex items-center justify-center text-[11px] font-bold text-secondary shrink-0">
                            {apt.customerFirstName?.[0] || 'G'}
                          </div>
                          <span className="font-label-md text-on-surface text-sm">{apt.customerFirstName} {apt.customerLastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-on-surface-variant">
                          {apt.services?.[0]?.serviceName || `${apt.services?.length || 0} service(s)`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-on-surface-variant">
                        {apt.services?.[0]?.staffFirstName || '—'} {apt.services?.[0]?.staffLastName || ''}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`status-pill ${apt.status === 'COMPLETED' ? 'success' : apt.status === 'CANCELLED' ? 'error' : 'warning'}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Staff On Duty */}
          <div className="glass-panel p-6 rounded-[24px]">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-label-md text-on-surface uppercase tracking-widest text-xs">Staff on Duty</h4>
              <span className="px-2.5 py-1 bg-green-500/10 text-green-600 text-[11px] font-bold rounded-full">
                {staffOnDuty.length} Active
              </span>
            </div>
            {staffOnDuty.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No staff clocked in yet.</p>
            ) : (
              <div className="space-y-3">
                {staffOnDuty.slice(0, 5).map((att: any) => (
                  <div key={att.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-sm">
                      {att.staffId?.toString()[0] || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-on-surface text-sm">Staff #{att.staffId}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        Since {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                ))}
                {staffOnDuty.length > 5 && (
                  <p className="text-[11px] text-on-surface-variant text-center">+{staffOnDuty.length - 5} more</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-panel p-6 rounded-[24px]">
            <h4 className="font-label-md text-on-surface uppercase tracking-widest text-xs mb-5">Quick Actions</h4>
            <div className="space-y-2">
              {[
                { label: 'Schedule Builder', icon: 'calendar_month', to: '/manager/appointments' },
                { label: 'Revenue Report', icon: 'bar_chart', to: '/manager/revenue' },
                { label: 'Customer List', icon: 'group', to: '/manager/customers' },
                { label: 'Inventory Check', icon: 'inventory_2', to: '/manager/inventory' },
              ].map(action => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">{action.icon}</span>
                  <span className="font-label-md text-on-surface-variant group-hover:text-on-surface transition-colors text-sm">{action.label}</span>
                  <span className="material-symbols-outlined text-[16px] text-outline ml-auto group-hover:text-primary transition-colors">arrow_forward_ios</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
