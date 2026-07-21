import { useState, useMemo } from 'react';
import { useStaffQuery, useCreateStaff, useUpdateStaff, useDeleteStaff } from '../../hooks/api/useStaff';
import { useServicesQuery } from '../../hooks/api/useAppointments';
import { useBranchesQuery } from '../../hooks/api/useBranches';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const Staff = () => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: staffPage, isLoading } = useStaffQuery(page, searchQuery ? 1000 : 10);
  const staff = staffPage?.content || [];
  const { data: servicesPage } = useServicesQuery();
  const services = servicesPage?.content || [];
  const { data: branches } = useBranchesQuery();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleName: 'STAFF',
    branchId: 1,
    baseSalary: '',
    commissionRate: '',
    serviceIds: [] as number[],
  });

  const filteredStaff = useMemo(() => {
    return staff.filter((member: any) => {
      const name = `${member.firstName} ${member.lastName}`.toLowerCase();
      const role = (member.roleName || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [staff, searchQuery]);

  const handleOpenModal = (member?: any) => {
    setError(null);
    if (member) {
      setEditingStaff(member);
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        roleName: member.roleName || 'STAFF',
        branchId: member.branchId || branches?.[0]?.id || 1,
        baseSalary: member.baseSalary || '',
        commissionRate: member.commissionRate || '',
        serviceIds: member.serviceIds || [],
      });
    } else {
      setEditingStaff(null);
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        roleName: 'STAFF', branchId: branches?.[0]?.id || 1, baseSalary: '', commissionRate: '', serviceIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleServiceToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter(s => s !== id)
        : [...prev.serviceIds, id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = { ...formData, baseSalary: Number(formData.baseSalary), commissionRate: Number(formData.commissionRate) };
    
    const handleError = (err: any) => {
      const data = err.response?.data;
      let msg = data?.message;
      if (typeof msg === 'string') {
        setError(msg);
      } else if (data?.fieldErrors) {
        setError(Object.values(data.fieldErrors).join(', '));
      } else {
        setError('Failed to save. Please try again.');
      }
    };

    if (editingStaff) {
      updateStaff.mutate({ id: editingStaff.id, data: payload }, {
        onSuccess: () => setIsModalOpen(false),
        onError: handleError
      });
    } else {
      createStaff.mutate(payload, {
        onSuccess: () => setIsModalOpen(false),
        onError: handleError
      });
    }
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      deleteStaff.mutate(staffToDelete.id, {
        onSuccess: () => setIsDeleteDialogOpen(false)
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Artisans & Guides</h1>
          <p className="font-body-lg text-on-surface-variant">Manage your team of master therapists and consultants.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <Input 
              placeholder="Search artisans..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<span className="material-symbols-outlined">search</span>}
            />
            <div className="absolute top-full left-0 mt-2 p-2 bg-surface-container-high rounded text-on-surface-variant font-label-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-full text-center border border-outline-variant/30">
              Local search: retrieving extended results for filtering.
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0">
            <span className="material-symbols-outlined font-light mr-2">person_add</span>
            Add Artisan
          </Button>
        </div>
      </header>

      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                icon="badge" 
                title="No Artisans Found" 
                description="No team members match your search, or none have been added yet."
              />
            </div>
          ) : (
            filteredStaff.map((member: any) => (
              <Card 
                key={member.id} 
                className="h-full flex flex-col p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 hover:border-primary/50 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display-sm text-2xl border border-primary/20 shrink-0 group-hover:scale-110 transition-transform shadow-inner mr-5">
                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display-sm text-2xl text-on-surface leading-tight">{member.firstName} {member.lastName}</h3>
                      <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mt-1 opacity-70">
                        {member.roleName === 'THERAPIST' || member.roleName === 'STAFF' ? 'Master Therapist' : (member.roleName ?? 'Team Member')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mb-4">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.serviceIds && member.serviceIds.length > 0 ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-label-sm bg-primary/5 text-primary border border-primary/20">
                          <span className="material-symbols-outlined font-light text-[14px] mr-1">spa</span>
                          {member.serviceIds.length} service{member.serviceIds.length !== 1 ? 's' : ''} assigned
                        </span>
                      ) : (
                        <span className="font-body-md text-on-surface-variant/50 italic">No expertise assigned yet.</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-outline-variant/20 flex gap-3">
                    <button onClick={() => handleOpenModal(member)} className="flex-1 py-3 border border-primary/30 text-primary rounded-xl font-label-md hover:bg-primary hover:text-white transition-all duration-300">
                      Manage Profile
                    </button>
                    <button onClick={() => { setStaffToDelete(member); setIsDeleteDialogOpen(true); }} className="px-4 border border-error/30 text-error rounded-xl font-label-md hover:bg-error hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        <div className="mt-8 p-4 border-t border-outline-variant/20 bg-surface/30 flex justify-between items-center rounded-2xl">
          <Button 
            variant="outline" 
            disabled={page === 0} 
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-on-surface-variant font-label-md">
            Page {staffPage ? staffPage.pageNo + 1 : 1} of {staffPage ? staffPage.totalPages : 1}
          </span>
          <Button 
            variant="outline" 
            disabled={staffPage ? staffPage.last : true} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </AnimatedSection>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? "Edit Artisan" : "Add Artisan"}>
        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-xl font-body-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
          </div>
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Role (STAFF, MANAGER)" value={formData.roleName} onChange={e => setFormData({...formData, roleName: e.target.value})} required />
            <div className="flex flex-col">
              <label className="text-xs font-label-sm uppercase tracking-widest text-on-surface-variant mb-2">Branch</label>
              <select 
                className="w-full h-11 bg-surface-container border border-outline-variant/30 rounded-xl px-4 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                value={formData.branchId} 
                onChange={e => setFormData({...formData, branchId: Number(e.target.value)})} 
                required
              >
                {branches?.map(b => (
                  <option key={b.id} value={b.id}>{b.name || `Branch ${b.id}`}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Salary" type="number" step="0.01" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} />
            <Input label="Commission Rate" type="number" step="0.01" value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-label-sm text-on-surface-variant mb-2">Expertise (Services)</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-outline-variant/20 rounded-xl">
              {services.map((svc: any) => (
                <label key={svc.id} className="flex items-center gap-2 text-sm bg-surface-container/50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-primary/10">
                  <input type="checkbox" checked={formData.serviceIds.includes(svc.id)} onChange={() => handleServiceToggle(svc.id)} className="accent-primary" />
                  {svc.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createStaff.isPending || updateStaff.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} title="Remove Artisan">
        <div className="mb-6">
          <p>Are you sure you want to remove <strong>{staffToDelete?.firstName} {staffToDelete?.lastName}</strong>?</p>
          <p className="text-sm text-on-surface-variant mt-2">This will deactivate their account but retain historical data.</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} className="bg-error hover:bg-error/90 text-white border-none" disabled={deleteStaff.isPending}>Yes, Remove</Button>
        </div>
      </Modal>
    </div>
  );
};
