import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStaffAppointmentsQuery } from '../../hooks/api/useAppointments';
import { useLiveAttendanceQuery } from '../../hooks/api/useAttendance';
import { useStaffNoteQuery, useUpdateStaffNoteMutation } from '../../hooks/api/useStaffNote';


import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const staffId = user?.staffId;
  const today = new Date().toISOString().split('T')[0];
  
  const { data: appointments, isLoading: isLoadingAppointments } = useStaffAppointmentsQuery(staffId || 0, today);
  const { data: attendances } = useLiveAttendanceQuery();
  const { data: staffNote } = useStaffNoteQuery();
  const updateNoteMutation = useUpdateStaffNoteMutation();

  const myAttendance = attendances?.find(a => a.staffId === staffId && a.date === today);
  const clockedIn = myAttendance && myAttendance.checkInTime && !myAttendance.checkOutTime;
  
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (staffNote) {
      setNoteContent(staffNote.content || '');
    }
  }, [staffNote]);

  // Computed Stats
  const todaysAppointmentsCount = appointments?.length || 0;
  const completedToday = appointments?.filter((a: any) => a.status === 'COMPLETED').length || 0;
  
  // Shift progress calculation
  let shiftProgress = 0;
  if (myAttendance?.checkInTime) {
    const checkIn = new Date(myAttendance.checkInTime).getTime();
    const now = new Date().getTime();
    const workedHours = (now - checkIn) / (1000 * 60 * 60);
    shiftProgress = Math.min(100, Math.round((workedHours / 8) * 100)); // Assuming 8 hour shift
  }

  const handleSaveNote = () => {
    updateNoteMutation.mutate(noteContent);
    setIsEditingNote(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-1">
          <h2 className="font-display-lg text-display-lg text-primary tracking-tight">
            Good morning, {user?.firstName || 'Staff'}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant opacity-80">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest glass-panel rounded-full shadow-sm">
            <span className={`w-2 h-2 rounded-full ${clockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="font-label-md text-label-md text-on-surface">
              {clockedIn ? `Clocked In: ${new Date(myAttendance.checkInTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Not Clocked In'}
            </span>
          </div>
          <Link to="/staff/leave-requests" className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container transition-colors text-on-surface">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Leave Request
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-on-surface-variant font-label-md mb-2">Today's Appointments</p>
          <p className="font-display-lg text-4xl text-on-surface">{todaysAppointmentsCount}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-on-surface-variant font-label-md mb-2">Completed Today</p>
          <p className="font-display-lg text-4xl text-on-surface">{completedToday}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-on-surface-variant font-label-md mb-2">Hours Today</p>
          <p className="font-display-lg text-4xl text-on-surface">
            {myAttendance?.checkInTime ? Math.round(((new Date().getTime() - new Date(myAttendance.checkInTime).getTime()) / (1000 * 60 * 60)) * 10) / 10 : 0}h
          </p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Schedule Section (Bento Main) */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              Today's Schedule
              {appointments && (
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-label-sm font-label-sm rounded-full">
                  {appointments.length} Appointments
                </span>
              )}
            </h3>
            <Link to="/staff/schedule" className="text-primary font-label-md text-label-md hover:underline">View Full Calendar</Link>
          </div>
          
          <div className="space-y-4">
            {isLoadingAppointments ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-panel p-6 rounded-[24px] flex items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-surface-variant"></div>
                    <div className="flex-grow space-y-2">
                      <div className="h-6 bg-surface-variant rounded w-1/3"></div>
                      <div className="h-4 bg-surface-variant rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !appointments || appointments.length === 0 ? (
              <div className="p-6">
                <EmptyState 
                  icon="event_available" 
                  title="No appointments today" 
                  description="Enjoy your free time or help out around the branch." 
                />
              </div>
            ) : (
              appointments.map((appointment: any) => (
                <div key={appointment.id} className="glass-panel p-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-outline-variant flex items-center justify-center">
                      <span className="font-headline-sm text-surface">C</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-[20px] text-on-surface mb-1">Customer #{appointment.customerId}</h4>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-sm font-label-sm">
                          {appointment.services?.length || 0} Service(s)
                        </span>
                        <span className="text-on-surface-variant/60 font-label-sm text-label-sm">• ₹{appointment.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right ml-[5.5rem] sm:ml-0">
                    <p className="font-display-lg text-[24px] text-primary mb-1">
                      {new Date(appointment.services?.[0]?.startTime || appointment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <span className={`status-pill ${appointment.status === 'COMPLETED' ? 'success' : appointment.status === 'CANCELLED' ? 'error' : 'warning'}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sidebar Widgets */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          {/* Customer Notes Section */}
          <div className="glass-panel p-8 rounded-[32px]">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-sm text-[22px] text-on-surface">Client Insights</h4>
              <button 
                className="material-symbols-outlined text-primary hover:opacity-80"
                onClick={() => setIsEditingNote(!isEditingNote)}
              >
                {isEditingNote ? 'close' : 'edit_note'}
              </button>
            </div>
            
            <div className="space-y-6">
              {isEditingNote ? (
                <div className="space-y-3">
                  <textarea 
                    className="w-full bg-surface-container rounded-xl p-4 text-on-surface outline-none focus:ring-1 focus:ring-primary h-32 resize-none"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter your insights..."
                  />
                  <button 
                    onClick={handleSaveNote}
                    disabled={updateNoteMutation.isPending}
                    className="w-full py-2 bg-primary text-on-primary rounded-xl font-label-md"
                  >
                    {updateNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-tertiary-container/30 rounded-2xl border-l-4 border-primary">
                  <p className="font-label-sm text-label-sm text-primary mb-1">MY NOTES</p>
                  <p className="text-on-surface-variant italic font-body-md text-body-md whitespace-pre-wrap">
                    {staffNote?.content || "No insights added yet."}
                  </p>
                </div>
              )}
            </div>
            
            {!staffNote && !isEditingNote && (
              <button 
                onClick={() => setIsEditingNote(true)}
                className="w-full mt-6 py-3 border border-dashed border-outline-variant rounded-2xl text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Add General Note
              </button>
            )}
          </div>

          {/* Attendance Widget */}
          <div className="glass-panel p-6 rounded-[32px] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div className="flex-grow">
              <p className="font-label-md text-label-md text-on-surface font-semibold">Shift Progress</p>
              <div className="w-full h-2 bg-surface-container rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${shiftProgress}%` }}></div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label-sm text-label-sm text-on-surface-variant">{clockedIn ? 'Active' : 'Off-shift'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
