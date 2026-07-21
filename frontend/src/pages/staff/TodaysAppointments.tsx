import { useState } from 'react';
import { useStaffAppointmentsQuery, useUpdateAppointmentStatusMutation } from '../../hooks/api/useAppointments';
import { useAuthStore } from '../../store/useAuthStore';
import { EmptyState } from '../../components/ui/EmptyState';


export const TodaysAppointments = () => {
  const { user } = useAuthStore();
  const staffId = user?.staffId;
  const today = new Date().toISOString().split('T')[0];
  
  const { data: appointments, isLoading } = useStaffAppointmentsQuery(staffId || 0, today);
  const updateStatusMutation = useUpdateAppointmentStatusMutation();
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  const handleUpdateStatus = async (id: number, status: string) => {
    setStatusUpdating(id);
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } finally {
      setStatusUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-surface-container rounded-xl"></div>
          ))}
        </div>
      </>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <>
        <div className="mb-8">
          <h2 className="font-display-lg text-[32px] text-on-surface mb-2">Today's Appointments</h2>
          <p className="text-on-surface-variant text-body-lg">Manage your schedule and customer check-ins.</p>
        </div>
        <EmptyState 
          icon="event_available"
          title="No Appointments Today"
          description="You have no scheduled sessions today."
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display-lg text-[32px] text-on-surface mb-2">Today's Appointments</h2>
        <p className="text-on-surface-variant text-body-lg">You have {appointments.length} appointment(s) scheduled for today.</p>
      </div>

      <div className="glass-panel overflow-hidden rounded-[24px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest/50">
                <th className="p-4 font-label-md text-on-surface-variant font-medium">Time</th>
                <th className="p-4 font-label-md text-on-surface-variant font-medium">Customer</th>
                <th className="p-4 font-label-md text-on-surface-variant font-medium">Services</th>
                <th className="p-4 font-label-md text-on-surface-variant font-medium">Status</th>
                <th className="p-4 font-label-md text-on-surface-variant font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {appointments.map((apt: any) => (
                <tr key={apt.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="p-4">
                    <p className="font-display-sm text-primary">
                      {new Date(apt.services?.[0]?.startTime || apt.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-headline-sm text-on-surface">Customer #{apt.customerId}</p>
                    <p className="text-label-sm text-on-surface-variant">Phone: +1 555-0199</p>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-sm">
                        {apt.services?.length || 0} Service(s)
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`status-pill ${apt.status === 'COMPLETED' ? 'success' : apt.status === 'CANCELLED' ? 'error' : 'warning'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {apt.status === 'SCHEDULED' && (
                        <>
                          <button 
                            disabled={statusUpdating === apt.id}
                            onClick={() => handleUpdateStatus(apt.id, 'IN_PROGRESS')}
                            className="px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm hover:opacity-90 disabled:opacity-50"
                          >
                            Check In
                          </button>
                          <button 
                            disabled={statusUpdating === apt.id}
                            onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                            className="px-4 py-2 border border-outline text-on-surface rounded-full font-label-sm hover:bg-surface-container disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <button 
                          disabled={statusUpdating === apt.id}
                          onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                          className="px-4 py-2 bg-success text-white rounded-full font-label-sm hover:opacity-90 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
