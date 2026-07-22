import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Card } from '../../components/ui/Card';

export const Reports = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/analytics/dashboard')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load reports', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-headline-sm text-primary font-serif">Manager Reports</h1>
      
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-body-md text-on-surface-variant">Total Revenue</h3>
            <p className="text-headline-md text-primary mt-2">
              ${stats.totalRevenue?.toLocaleString()}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-body-md text-on-surface-variant">Appointments Today</h3>
            <p className="text-headline-md text-primary mt-2">
              {stats.appointmentsToday}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-body-md text-on-surface-variant">Active Customers</h3>
            <p className="text-headline-md text-primary mt-2">
              {stats.activeCustomers}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-body-md text-on-surface-variant">Staff on Leave</h3>
            <p className="text-headline-md text-primary mt-2">
              {stats.staffOnLeaveToday}
            </p>
          </Card>
        </div>
      ) : (
        <div>No reports data available.</div>
      )}
    </div>
  );
};
