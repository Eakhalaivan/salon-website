import React from 'react';
import { useLiveAttendanceQuery } from '../../hooks/api/useAttendance';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Users, Clock, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const LiveAttendance: React.FC = () => {
  const { data: attendances = [] } = useLiveAttendanceQuery();

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Live Attendance</h1>
          <p className="font-body-lg text-on-surface-variant">Real-time tracking of staff check-ins and locations.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">Present Now</p>
          <div className="font-display-md text-5xl text-on-surface block">
            {attendances.filter((a: any) => a.checkOutTime === null).length}
          </div>
        </div>
        
        <div className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-success">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">On Time</p>
          <div className="font-display-md text-5xl text-on-surface block">
            {attendances.filter((a: any) => a.status === 'ON_TIME').length}
          </div>
        </div>
        
        <div className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-error">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">Late / Absent</p>
          <div className="font-display-md text-5xl text-on-surface block">
            {attendances.filter((a: any) => a.status === 'LATE' || a.status === 'ABSENT').length}
          </div>
        </div>
      </section>

      <AnimatedSection>
        <div className="glass-panel rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/40 dark:bg-black/40">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Today's Logs</h4>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {attendances.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                No attendance logs for today yet.
              </div>
            ) : (
              attendances.map((log: any, i: number) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary-container flex items-center justify-center font-display-sm text-xl text-primary border border-primary/20">
                      {log.staffName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-display-sm text-xl text-on-surface">{log.staffName}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant mt-2 font-label-md">
                        {log.checkInTime && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5 text-success" /> 
                            In: {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {log.checkOutTime && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5 text-error" /> 
                            Out: {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {(log.locationLat && log.locationLng) && (
                          <span className="flex items-center text-secondary">
                            <MapPin className="h-4 w-4 mr-1.5" /> GPS Logged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`status-pill ${
                      log.status === 'ON_TIME' ? 'success' : 
                      log.status === 'LATE' ? 'warning' :
                      'error'
                    }`}>
                      {log.status.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};
