import { useState } from 'react';
import { useBranchesQuery, useCreateBranch, useUpdateBranch } from '../../hooks/api/useBranches';
import type { BranchDto } from '../../api/services/branchService';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { MapPin, Phone, Building2 } from 'lucide-react';

export const Branches = () => {
  const { data: branches = [], isLoading } = useBranchesQuery();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    taxId: '',
    phone: '',
    timezone: 'UTC',
    isActive: true
  });

  const handleOpenModal = (branch?: BranchDto) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        taxId: branch.taxId || '',
        phone: branch.phone || '',
        timezone: branch.timezone || 'UTC',
        isActive: branch.isActive
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        address: '',
        taxId: '',
        phone: '',
        timezone: 'UTC',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch?.id) {
      updateBranch.mutate({ id: editingBranch.id, data: formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createBranch.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  if (isLoading) {
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
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Salon Branches</h1>
          <p className="font-body-lg text-on-surface-variant">Manage your global locations and settings.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button onClick={() => handleOpenModal()} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0">
            <span className="material-symbols-outlined font-light mr-2">add_location</span>
            Add Branch
          </Button>
        </div>
      </header>

      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.map(branch => (
            <div key={branch.id} className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <span className={`status-pill ${branch.isActive ? 'success' : 'error'}`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <h3 className="font-display-sm text-2xl text-on-surface mb-4">{branch.name}</h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 text-on-surface-variant">
                    <MapPin size={18} className="shrink-0 mt-0.5 text-primary/70" />
                    <p className="font-body-md text-sm">{branch.address}</p>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Phone size={18} className="shrink-0 text-primary/70" />
                    <p className="font-body-md text-sm">{branch.phone || 'No phone set'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined shrink-0 text-primary/70 text-[18px]">schedule</span>
                    <p className="font-body-md text-sm">Timezone: {branch.timezone}</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-outline-variant/20 flex gap-3">
                  <button onClick={() => handleOpenModal(branch)} className="flex-1 py-3 border border-primary/30 text-primary rounded-xl font-label-md hover:bg-primary hover:text-white transition-all duration-300">
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          ))}
          {branches.length === 0 && (
            <div className="col-span-full text-center py-12 text-on-surface-variant glass-panel rounded-3xl">
              No branches configured.
            </div>
          )}
        </div>
      </AnimatedSection>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBranch ? "Edit Branch" : "Add Branch"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Branch Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Address</label>
            <textarea
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
              rows={3}
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Input label="Tax ID" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
          </div>
          <Input label="Timezone" value={formData.timezone} onChange={e => setFormData({...formData, timezone: e.target.value})} />
          
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary" />
            <label htmlFor="isActive" className="font-label-md text-on-surface cursor-pointer">Branch is active</label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createBranch.isPending || updateBranch.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
