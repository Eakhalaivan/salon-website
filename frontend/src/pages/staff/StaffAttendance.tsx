import React, { useState } from 'react';
import { useAttendanceByStaffQuery, useClockInMutation, useClockOutMutation } from '../../hooks/api/useAttendance';
import { useAuthStore } from '../../store/useAuthStore';


export const StaffAttendance: React.FC = () => {
  const { user } = useAuthStore();
  const staffId = user?.staffId;
  
  const { data: attendances = [], isLoading: isAttendanceLoading } = useAttendanceByStaffQuery(staffId);
  const { mutateAsync: clockIn, isPending: isClockingIn } = useClockInMutation();
  const { mutateAsync: clockOut, isPending: isClockingOut } = useClockOutMutation();
  const isLoading = isAttendanceLoading || isClockingIn || isClockingOut;
  
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendances.find((a: any) => a.date === today);

  const handleClockIn = () => {
    if (!staffId) return;
    
    setIsGettingLocation(true);
    setGeoError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clockIn({ staffId, lat: position.coords.latitude, lng: position.coords.longitude })
            .finally(() => setIsGettingLocation(false));
        },
        () => {
          setGeoError("Location access denied. Location is required to clock in.");
          setIsGettingLocation(false);
        }
      );
    } else {
      setGeoError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
    }
  };

  const handleClockOut = () => {
    if (staffId) {
      clockOut(staffId);
    }
  };

  return (
    <>
<div className="mb-8">
        <h2 className="font-display-lg text-[32px] text-on-surface mb-2">My Attendance</h2>
        <p className="text-on-surface-variant text-body-lg">Clock in/out and view your history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-[32px] flex flex-col justify-center text-center">
          <h3 className="font-display-sm text-[24px] text-on-surface mb-8">Today's Status</h3>
          
          <div className="flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50 mb-6">schedule</span>
            <h2 className="font-display-lg text-[48px] text-on-surface mb-8 tracking-tight">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h2>
            
            {geoError && (
              <div className="flex items-center text-label-sm text-error mb-6 bg-error-container p-4 rounded-xl w-full">
                <span className="material-symbols-outlined text-[18px] mr-2">error</span>
                {geoError}
              </div>
            )}
            
            {!todayAttendance ? (
              <button 
                onClick={handleClockIn} 
                disabled={isLoading || isGettingLocation}
                className="w-full py-5 bg-primary text-on-primary rounded-[20px] font-label-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
              >
                {isGettingLocation ? 'Getting Location...' : 'Clock In'}
              </button>
            ) : todayAttendance.checkOutTime === null ? (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center text-success font-label-md bg-success/10 p-4 rounded-xl border border-success/20">
                  <span className="material-symbols-outlined text-[20px] mr-2">check_circle</span>
                  Clocked In at {new Date(todayAttendance.checkInTime!).toLocaleTimeString()}
                </div>
                <button 
                  onClick={handleClockOut} 
                  disabled={isLoading}
                  className="w-full py-5 border-2 border-error text-error rounded-[20px] font-label-lg font-bold hover:bg-error/10 disabled:opacity-50 transition-colors"
                >
                  Clock Out
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-2 text-on-surface-variant bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <span className="material-symbols-outlined text-[32px] text-success mb-2">check_circle</span>
                <p className="font-label-lg text-on-surface">Shift Completed</p>
                <div className="flex gap-4 mt-2 font-body-sm">
                  <span>In: {new Date(todayAttendance.checkInTime!).toLocaleTimeString()}</span>
                  <span>Out: {new Date(todayAttendance.checkOutTime).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[32px]">
          <h3 className="font-display-sm text-[24px] text-on-surface mb-6">Recent History</h3>
          <div className="space-y-4">
            {attendances.length === 0 ? (
              <p className="text-on-surface-variant text-body-md text-center py-8">No attendance history available.</p>
            ) : (
              attendances.slice().reverse().slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex justify-between items-center p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:border-outline transition-colors">
                  <div>
                    <p className="font-headline-sm text-on-surface mb-1">{new Date(log.date).toLocaleDateString()}</p>
                    <p className="font-label-sm text-on-surface-variant flex items-center">
                      <span className="material-symbols-outlined text-[16px] mr-1">schedule</span>
                      {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} 
                      <span className="mx-2">→</span> 
                      {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </p>
                  </div>
                  <span className={`status-pill ${
                    log.status === 'ON_TIME' ? 'success' : 
                    log.status === 'LATE' ? 'warning' : 'error'
                  }`}>
                    {log.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
