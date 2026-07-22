import { useState, useMemo } from 'react';
import { useSuppliersQuery, useCreateSupplier, useUpdateSupplier } from '../../hooks/api/useSuppliers';
import { Button } from '../../components/ui/Button';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, Mail, Phone, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const Suppliers = () => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: pageData, isLoading } = useSuppliersQuery(page, searchQuery ? 1000 : 10);
  const suppliers = pageData?.content || [];
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    active: true,
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier: any) => {
      const name = (supplier.name || '').toLowerCase();
      const q = searchQuery.toLowerCase();
      return name.includes(q);
    });
  }, [suppliers, searchQuery]);

  const handleOpenModal = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        contactEmail: supplier.contactEmail || '',
        contactPhone: supplier.contactPhone || '',
        address: supplier.address || '',
        active: supplier.active,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '', contactEmail: '', contactPhone: '', address: '', active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier.mutate({ id: editingSupplier.id, data: formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createSupplier.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Suppliers</h1>
          <p className="font-body-lg text-on-surface-variant">Manage your product and service suppliers.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-on-surface-variant" />
            </div>
            <input 
              type="text"
              className="w-full bg-surface border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md shadow-sm"
              placeholder="Search suppliers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0 w-full sm:w-auto">
            <span className="material-symbols-outlined font-light mr-2">add_business</span>
            Add Supplier
          </Button>
        </div>
      </header>

      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                icon="domain_disabled" 
                title="No Suppliers Found" 
                description="No suppliers match your search, or none have been added yet." 
              />
            </div>
          ) : (
            filteredSuppliers.map((supplier: any, i: number) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="glass-panel h-full flex flex-col p-8 rounded-[32px] hover:-translate-y-2 hover:shadow-xl transition-all duration-500 hover:border-primary/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6 gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0">
                        <Building2 size={24} />
                      </div>
                      {!supplier.active && (
                        <span className="px-3 py-1 bg-error/10 text-error text-xs rounded-full font-label-md uppercase tracking-widest">Inactive</span>
                      )}
                    </div>
                    
                    <h3 className="font-display-sm text-2xl text-on-surface leading-tight mb-4">{supplier.name}</h3>
                    
                    <div className="flex-1 space-y-3 mb-8">
                      <p className="flex items-center gap-3 text-sm text-on-surface-variant font-body-md">
                        <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                        <span className="truncate">{supplier.contactEmail || 'No Email'}</span>
                      </p>
                      <p className="flex items-center gap-3 text-sm text-on-surface-variant font-body-md">
                        <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                        <span>{supplier.contactPhone || 'No Phone'}</span>
                      </p>
                      <p className="flex items-start gap-3 text-sm text-on-surface-variant font-body-md">
                        <MapPin className="h-4 w-4 text-primary/70 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{supplier.address || 'No Address'}</span>
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-outline-variant/20 mt-auto">
                      <button onClick={() => handleOpenModal(supplier)} className="w-full py-3 border border-primary/30 text-primary rounded-xl font-label-md hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {pageData && pageData.totalPages > 1 && (
          <div className="mt-8 p-4 border border-outline-variant/20 bg-surface/30 flex justify-between items-center rounded-[20px] shadow-sm">
            <Button 
              variant="outline" 
              disabled={page === 0} 
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <span className="text-on-surface-variant font-label-md">
              Page {pageData.pageNo + 1} of {pageData.totalPages}
            </span>
            <Button 
              variant="outline" 
              disabled={pageData.last} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </AnimatedSection>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? "Edit Supplier" : "Add Supplier"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Supplier Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Email" type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
            <Input label="Contact Phone" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
          </div>
          <Input label="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <label className="flex items-center gap-3 cursor-pointer mt-4 p-4 rounded-xl border border-outline-variant/30 bg-surface">
            <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 accent-primary rounded border-outline-variant" />
            <span className="font-label-md text-on-surface">Active Supplier</span>
          </label>
          <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/20 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createSupplier.isPending || updateSupplier.isPending}>
              {createSupplier.isPending || updateSupplier.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
