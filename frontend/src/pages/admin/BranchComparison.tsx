import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { CountUp } from '../../components/ui/CountUp';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Building2, TrendingUp, Users, CalendarDays, DollarSign } from 'lucide-react';

interface DashboardStatsDto {
  totalAppointmentsToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  newCustomersThisMonth: number;
}

interface Branch {
  id: number;
  name: string;
}

export const BranchComparison = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<Record<number, DashboardStatsDto>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: branchData } = await axiosClient.get('/branches');
        setBranches(branchData.content || branchData); // handle paginated response just in case

        const branchesList = branchData.content || branchData;
        const statsData: Record<number, DashboardStatsDto> = {};
        for (const branch of branchesList) {
          try {
            const { data } = await axiosClient.get(`/analytics/dashboard?branchId=${branch.id}`);
            statsData[branch.id] = data;
          } catch (e) {
            console.error(`Failed to load stats for branch ${branch.id}`);
          }
        }
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load comparison data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Branch Performance</h1>
          <p className="font-body-lg text-on-surface-variant">Compare metrics across all salon locations.</p>
        </div>
      </header>

      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {branches.map(branch => (
            <div key={branch.id} className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-primary-container text-primary flex items-center justify-center shadow-inner">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-display-sm text-2xl text-on-surface">{branch.name}</h3>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-widest text-xs mt-1">Branch #{branch.id}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <DollarSign size={20} className="text-primary" />
                    <span className="font-label-md">Month Revenue</span>
                  </div>
                  <CountUp value={stats[branch.id]?.revenueThisMonth || 0} format="currency" className="font-display-sm text-xl text-on-surface" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <TrendingUp size={20} className="text-primary" />
                    <span className="font-label-md">Today's Revenue</span>
                  </div>
                  <CountUp value={stats[branch.id]?.revenueToday || 0} format="currency" className="font-display-sm text-xl text-on-surface" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <CalendarDays size={20} className="text-primary" />
                    <span className="font-label-md">Bookings Today</span>
                  </div>
                  <CountUp value={stats[branch.id]?.totalAppointmentsToday || 0} className="font-display-sm text-xl text-on-surface" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-outline-variant/20 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Users size={20} className="text-primary" />
                    <span className="font-label-md">New Members (Mo)</span>
                  </div>
                  <CountUp value={stats[branch.id]?.newCustomersThisMonth || 0} className="font-display-sm text-xl text-on-surface" />
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-outline-variant/20">
                <button className="w-full py-3 text-primary font-label-md hover:bg-primary/5 rounded-xl transition-colors">
                  View Detailed Report
                </button>
              </div>
            </div>
          ))}

          {branches.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 glass-panel rounded-[32px]">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">business_off</span>
              <p className="font-display-sm text-xl text-on-surface-variant">No branch data available.</p>
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
};
