import React from 'react';
import { useShiftsByStaffQuery } from '../../hooks/api/useSchedule';
import { useAuthStore } from '../../store/useAuthStore';

import { EmptyState } from '../../components/ui/EmptyState';

export const StaffSchedule: React.FC = () => {
  const { user } = useAuthStore();
  const { data: shifts = [], isLoading } = useShiftsByStaffQuery(user?.staffId);

  const publishedShifts = shifts.filter((s: any) => s.status === 'PUBLISHED');

  return (
    <>
<div className="mb-8">
        <h2 className="font-display-lg text-[32px] text-on-surface mb-2">My Schedule</h2>
        <p className="text-on-surface-variant text-body-lg">View your upcoming shifts and working hours.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface-container rounded-xl"></div>
            ))}
          </div>
        ) : publishedShifts.length === 0 ? (
          <EmptyState 
            icon="calendar_month"
            title="No Upcoming Shifts"
            description="You don't have any published shifts scheduled."
          />
        ) : (
          publishedShifts.map((shift: any) => (
            <div
              key={shift.id}
              className="glass-panel p-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[20px] text-on-surface mb-1">
                    {new Date(shift.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  <div className="flex items-center text-on-surface-variant font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px] mr-2">schedule</span>
                    {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="sm:text-right flex flex-col items-start sm:items-end gap-2 ml-[5.5rem] sm:ml-0">
                <span className="status-pill success">Confirmed</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
                  {shift.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
