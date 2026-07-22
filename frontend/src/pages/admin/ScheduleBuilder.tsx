import React, { useEffect, useState, useMemo } from 'react';
import { useShiftsByBranchQuery, useCreateShiftMutation, usePublishShiftsMutation } from '../../hooks/api/useSchedule';
import { useStaffQuery } from '../../hooks/api/useStaff';
import { useBranchesQuery } from '../../hooks/api/useBranches';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ShiftCard = React.memo(({ shift, index }: { shift: any; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between rounded-2xl hover:shadow-md transition-shadow group">
      <div className="flex items-center space-x-6 mb-4 sm:mb-0">
        <div className="h-14 w-14 rounded-full bg-primary-container text-primary flex items-center justify-center font-display-sm text-xl">
          {shift.staffName?.charAt(0) || 'S'}
        </div>
        <div>
          <h4 className="font-display-sm text-xl text-on-surface mb-1">{shift.staffName}</h4>
          <div className="flex items-center text-sm text-on-surface-variant font-label-md">
            <Calendar className="h-4 w-4 mr-1.5 text-primary/70" />
            {new Date(shift.startTime).toLocaleDateString()}
            <Clock className="h-4 w-4 ml-4 mr-1.5 text-primary/70" />
            {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`status-pill mb-2 ${
          shift.status === 'PUBLISHED' ? 'success' : 'warning'
        }`}>
          {shift.status}
        </span>
        <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">{shift.type}</span>
      </div>
    </div>
  </motion.div>
));

export const ScheduleBuilder: React.FC = () => {
  const { role, branchId: userBranchId } = useAuthStore();
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const effectiveBranchId = role === 'ADMIN' ? selectedBranchId : (userBranchId || 1);
  
  const { data: shifts = [], isLoading: isShiftsLoading } = useShiftsByBranchQuery(effectiveBranchId);
  const { mutateAsync: createShift, isPending: isCreating } = useCreateShiftMutation();
  const { mutateAsync: publishShifts, isPending: isPublishing } = usePublishShiftsMutation();
  const isLoading = isShiftsLoading || isCreating || isPublishing;
  
  const { data: staffData } = useStaffQuery(0, 100);
  const { data: branches } = useBranchesQuery();
  const staff = staffData?.content || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [shiftStaffId, setShiftStaffId] = useState<number>(0);
  const [shiftDate, setShiftDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [shiftType, setShiftType] = useState<string>('REGULAR');

  useEffect(() => {
    if (branches && branches.length > 0 && selectedBranchId === 1) {
      if (branches[0].id) setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftStaffId || !shiftDate || !startTime || !endTime) return;
    
    try {
      const startDateTime = new Date(`${shiftDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${shiftDate}T${endTime}:00`).toISOString();

      await createShift({
        staffId: shiftStaffId,
        branchId: effectiveBranchId,
        startTime: startDateTime,
        endTime: endDateTime,
        type: shiftType as any
      });
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to create shift. It might overlap with an existing one.");
    }
  };

  const draftShifts = useMemo(() => shifts.filter((s: any) => s.status === 'DRAFT'), [shifts]);

  const handlePublish = async () => {
    if (draftShifts.length > 0) {
      await publishShifts(draftShifts.map((s: any) => s.id));
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Schedule Builder</h1>
          <p className="font-body-lg text-on-surface-variant">Manage staff shifts and publish schedules.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-end sm:items-center">
          {role === 'ADMIN' && (
            <select 
              className="rounded-lg border-outline-variant/30 bg-surface text-on-surface focus:border-primary focus:ring-primary font-body-md py-2 px-4 shadow-sm"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
            >
              {branches?.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          )}

          <Button variant="outline" onClick={() => setIsModalOpen(true)} disabled={isLoading} className="shrink-0">
            <span className="material-symbols-outlined font-light mr-2">add</span>
            Add Shift
          </Button>
          <Button onClick={handlePublish} disabled={draftShifts.length === 0 || isLoading} className="shrink-0 shadow-[0px_8px_20px_rgba(212,175,55,0.2)]">
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish Drafts ({draftShifts.length})
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatedSection>
            {shifts.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-[32px] shadow-sm">
                <Calendar className="mx-auto h-12 w-12 text-on-surface-variant mb-4 opacity-50" />
                <h3 className="font-display-sm text-xl text-on-surface mb-2">No Shifts Scheduled</h3>
                <p className="font-body-md text-on-surface-variant">Click "Add Shift" to start building the schedule.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shifts.map((shift: any, i: number) => (
                  <ShiftCard key={shift.id} shift={shift} index={i} />
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-display-sm text-2xl text-on-surface mb-6">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface/50 border border-outline-variant/20">
                <span className="font-label-md text-on-surface-variant">Total Shifts</span>
                <span className="font-display-sm text-xl text-on-surface">{shifts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface/50 border border-outline-variant/20">
                <span className="font-label-md text-on-surface-variant">Drafts</span>
                <span className="font-display-sm text-xl text-warning">{draftShifts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-surface/50 border border-outline-variant/20">
                <span className="font-label-md text-on-surface-variant">Published</span>
                <span className="font-display-sm text-xl text-success">{shifts.length - draftShifts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Shift">
        <form onSubmit={handleCreateShift} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Staff Member</label>
            <select
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
              value={shiftStaffId}
              onChange={(e) => setShiftStaffId(Number(e.target.value))}
              required
            >
              <option value={0} disabled>Select Staff</option>
              {staff.map((s: any) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Date</label>
            <input
              type="date"
              required
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">Start Time</label>
              <input
                type="time"
                required
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">End Time</label>
              <input
                type="time"
                required
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Shift Type</label>
            <select
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              required
            >
              <option value="REGULAR">Regular</option>
              <option value="OVERTIME">Overtime</option>
              <option value="ON_CALL">On Call</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Shift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
