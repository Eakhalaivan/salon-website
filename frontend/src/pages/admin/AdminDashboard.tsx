import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { CountUp } from '../../components/ui/CountUp';
import { useBranchStore } from '../../store/useBranchStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAiMarketingSuggestions, useAiSalesForecast } from '../../hooks/api/useAi';
import { Button } from '../../components/ui/Button';
import { useAppointmentsByBranchQuery } from '../../hooks/api/useAppointments';
import { useAdminProductsQuery } from '../../hooks/api/useProducts';
import { useLiveAttendanceQuery } from '../../hooks/api/useAttendance';
import { useServicesQuery } from '../../hooks/api/useServices';

interface DashboardStatsDto {
  totalAppointmentsToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  newCustomersThisMonth: number;
}

export const AdminDashboard = () => {
  const { selectedBranchId } = useBranchStore();
  const { user, role, branchId: userBranchId } = useAuthStore();
  
  const effectiveBranchId = role === 'ADMIN' ? selectedBranchId : userBranchId;
  
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  
  const { data: marketingSuggestions, isLoading: isMarketingLoading } = useAiMarketingSuggestions();
  const { data: salesForecast, isLoading: isForecastLoading } = useAiSalesForecast(effectiveBranchId);

  // Real data hooks
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const { data: appointmentsResponse } = useAppointmentsByBranchQuery(effectiveBranchId, todayStart.toISOString(), todayEnd.toISOString(), 0, 5);
  const { data: productsResponse } = useAdminProductsQuery(0, 5);
  const { data: attendanceResponse } = useLiveAttendanceQuery();
  const { data: servicesResponse } = useServicesQuery(0, 4);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = effectiveBranchId 
          ? `/analytics/dashboard?branchId=${effectiveBranchId}`
          : '/analytics/dashboard';
          
        const { data } = await axiosClient.get(url);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };
    fetchStats();
  }, [effectiveBranchId]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="font-display-md text-4xl text-on-surface mb-2">Welcome Back</h2>
          <p className="font-body-md text-on-surface-variant">Your Serenity awaits dashboard.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-on-surface font-bold">{user?.firstName || 'Admin User'}</p>
            <p className="font-label-sm text-on-surface-variant opacity-60">
              {role === 'ADMIN' ? (effectiveBranchId ? 'Branch View' : 'Global Admin') : 'Branch Manager'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container bg-surface-container-high flex items-center justify-center font-display-sm text-primary">
            {user?.firstName?.[0] || 'A'}
          </div>
        </div>
      </header>

      {/* Analytics Overview Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined font-light text-[24px]">payments</span>
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">Monthly Revenue</p>
          <CountUp value={stats?.revenueThisMonth || 0} format="currency" className="font-display-md text-5xl text-on-surface block" />
        </div>

        <div className="glass-panel p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined font-light text-[24px]">calendar_month</span>
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">Appointments Today</p>
          <CountUp value={stats?.totalAppointmentsToday || 0} className="font-display-md text-5xl text-on-surface block" />
        </div>

        <div className="glass-panel p-6 rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined font-light text-[24px]">person_add</span>
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">New Members (Month)</p>
          <CountUp value={stats?.newCustomersThisMonth || 0} className="font-display-md text-5xl text-on-surface block" />
        </div>
      </section>

      {/* AI Sales Forecast Section */}
      <section className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow bg-primary/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">AI Sales Forecast</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Projected revenue based on historical trends</p>
            </div>
          </div>
        </div>
        
        {isForecastLoading ? (
          <div className="h-24 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : salesForecast ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-body-lg italic text-on-surface-variant mb-6 border-l-2 border-primary pl-4">
                "{salesForecast.aiSummary}"
              </p>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Projected (Next Week)</p>
                  <p className="font-display-md text-3xl text-on-surface">₹{salesForecast.projectedNextWeekRevenue.toLocaleString()}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold ${salesForecast.weekOverWeekGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {salesForecast.weekOverWeekGrowthPercentage >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  {salesForecast.weekOverWeekGrowthPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="relative h-24 flex items-end justify-between px-2 gap-2">
              {salesForecast.historicalTrend.map((val, idx) => {
                const max = Math.max(...salesForecast.historicalTrend);
                const height = (val / max) * 100;
                const isProjected = idx === salesForecast.historicalTrend.length - 1;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-1000 ${isProjected ? 'bg-primary/50 border border-primary border-dashed' : 'bg-primary'}`} 
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-on-surface-variant">Forecast unavailable.</p>
        )}
      </section>

      {/* AI Marketing Insights */}
      <section className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">campaign</span>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Marketing Insights</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">AI-generated campaign ideas for review</p>
          </div>
        </div>

        {isMarketingLoading ? (
           <div className="h-24 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : marketingSuggestions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketingSuggestions.map((suggestion, idx) => (
              <div key={idx} className="border border-outline-variant/30 rounded-xl p-6 bg-surface hover:border-primary/50 transition-colors">
                <h5 className="font-display-sm text-xl text-on-surface mb-2">{suggestion.idea}</h5>
                <p className="font-body-sm text-on-surface-variant mb-4">{suggestion.rationale}</p>
                
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">Target: {suggestion.suggestedTargetAudience}</span>
                  <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">Code: {suggestion.suggestedCouponCode}</span>
                </div>
                
                <Button variant="outline" className="w-full text-sm">
                  Create Draft Campaign
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant">No marketing insights available.</p>
        )}
      </section>

      {/* Management & Tables Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Interactive Table (Span 2) */}
        <div className="lg:col-span-2 glass-panel rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/40 dark:bg-black/40">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Recent Bookings</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Client</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Service</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {appointmentsResponse?.content?.map((apt: any) => (
                  <tr key={apt.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center font-label-sm text-label-sm text-secondary">
                          {apt.customerName?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">Customer #{apt.customerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container rounded-full text-[12px] font-medium whitespace-nowrap">
                        {apt.services?.length} Service(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-label-sm whitespace-nowrap">
                      {new Date(apt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-pill ${apt.status === 'COMPLETED' ? 'success' : apt.status === 'CANCELLED' ? 'error' : 'warning'}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!appointmentsResponse?.content?.length && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      No recent appointments found for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Management Tabs Side Panel */}
        <div className="space-y-6">
          {/* Inventory Status */}
          <div className="glass-panel p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h5 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">Inventory Status</h5>
              <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
            </div>
            <div className="space-y-4">
              {productsResponse?.content?.slice(0, 3).map((product: any) => {
                const percentage = Math.min((product.stockQuantity / (product.minStockLevel || 10)) * 100, 100);
                const isLow = product.stockQuantity <= (product.minStockLevel || 5);
                return (
                  <div key={product.id} className="group">
                    <div className="flex justify-between font-label-sm text-label-sm mb-1.5">
                      <span className="text-on-surface">{product.name}</span>
                      <span className={isLow ? "text-error font-bold" : "text-on-surface-variant"}>{product.stockQuantity}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-error' : 'bg-primary'}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {!productsResponse?.content?.length && (
                <p className="text-sm text-on-surface-variant">No inventory records.</p>
              )}
            </div>
          </div>

          {/* Staff On Duty */}
          <div className="glass-panel p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
            <h5 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-6">Staff on Duty</h5>
            <div className="flex -space-x-3 mb-4">
              {attendanceResponse?.slice(0, 4).map((att: any) => (
                <div key={att.id} className="w-10 h-10 rounded-full border-2 border-surface bg-primary-container text-on-primary-container flex items-center justify-center hover:z-10 transition-all cursor-pointer">
                  {att.staffId}
                </div>
              ))}
              {attendanceResponse && attendanceResponse.length > 4 && (
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant hover:z-10 cursor-pointer">
                  +{attendanceResponse.length - 4}
                </div>
              )}
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {attendanceResponse?.filter((a: any) => a.clockOutTime === null).length || 0} staff active.
            </p>
          </div>
        </div>
      </section>

      {/* Service Management Preview */}
      <section className="pt-8 border-t border-outline-variant/30">
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Service Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {servicesResponse?.content?.map((service: any) => (
            <div key={service.id} className="glass-panel p-4 rounded-2xl hover:border-primary-container transition-all cursor-pointer group shadow-sm hover:shadow-md">
              <div className="aspect-square w-full rounded-xl bg-surface-container-high overflow-hidden mb-4 relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">spa</span>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">edit</span>
                </div>
              </div>
              <p className="font-label-md text-label-md text-on-surface text-center line-clamp-1">{service.name}</p>
            </div>
          ))}
          {!servicesResponse?.content?.length && (
            <p className="text-on-surface-variant col-span-4 text-center">No active services configured.</p>
          )}
        </div>
      </section>
    </div>
  );
};
