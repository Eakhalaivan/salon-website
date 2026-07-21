import { useState } from 'react';
import { useMyLeaveRequestsQuery, useCreateLeaveRequestMutation } from '../../hooks/api/useLeaveRequests';

import { EmptyState } from '../../components/ui/EmptyState';

export const LeaveRequests = () => {
  const { data: requests, isLoading } = useMyLeaveRequestsQuery();
  const createMutation = useCreateLeaveRequestMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'VACATION',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setIsModalOpen(false);
    setFormData({ type: 'VACATION', fromDate: '', toDate: '', reason: '' });
  };

  return (
    <>
<div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display-lg text-[32px] text-on-surface mb-2">Leave Requests</h2>
          <p className="text-on-surface-variant text-body-lg">Manage and track your time off requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Request
        </button>
      </div>

      <div className="glass-panel overflow-hidden rounded-[24px]">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-surface-container rounded-xl"></div>
            ))}
          </div>
        ) : !requests || requests.length === 0 ? (
          <EmptyState 
            icon="flight_takeoff"
            title="No Leave Requests"
            description="You haven't requested any time off yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-lowest/50">
                  <th className="p-4 font-label-md text-on-surface-variant font-medium">Type</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-medium">Duration</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-medium">Reason</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-4">
                      <p className="font-headline-sm text-on-surface">{req.type}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        Requested on {new Date(req.createdAt || '').toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4 text-on-surface">
                      {req.fromDate} to {req.toDate}
                    </td>
                    <td className="p-4 text-on-surface-variant max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`status-pill ${req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'error' : 'warning'}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display-md text-2xl text-on-surface">New Leave Request</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface"
              >
                close
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Leave Type</label>
                <select 
                  className="w-full bg-surface-container rounded-xl p-3 text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="VACATION">Vacation</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">From</label>
                  <input 
                    type="date"
                    className="w-full bg-surface-container rounded-xl p-3 text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    value={formData.fromDate}
                    onChange={e => setFormData({...formData, fromDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">To</label>
                  <input 
                    type="date"
                    className="w-full bg-surface-container rounded-xl p-3 text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    value={formData.toDate}
                    onChange={e => setFormData({...formData, toDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Reason</label>
                <textarea 
                  className="w-full bg-surface-container rounded-xl p-3 text-on-surface outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  required
                  placeholder="Provide a brief reason for your request..."
                />
              </div>

              <button 
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-4 mt-4 bg-primary text-on-primary rounded-xl font-label-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
