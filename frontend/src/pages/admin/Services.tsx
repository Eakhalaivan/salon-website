import { useState, useMemo } from 'react';
import { useServicesQuery, useCreateService, useUpdateService, useDeleteService } from '../../hooks/api/useServices';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import type { ServiceDto } from '../../api/types';

export const AdminServices = () => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: pageData, isLoading } = useServicesQuery(page, searchQuery ? 1000 : 10);
  const services = pageData?.content || [];
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceDto | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMins: '30',
    price: '',
    genderCategory: 'UNISEX',
    category: 'Wellness',
    isActive: true,
  });

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const name = s.name.toLowerCase();
      const cat = s.category?.toLowerCase() || '';
      const q = searchQuery.toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [services, searchQuery]);

  const handleOpenModal = (service?: ServiceDto) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        description: service.description || '',
        durationMins: service.durationMins?.toString() || '30',
        price: service.price?.toString() || '',
        genderCategory: service.genderCategory || 'UNISEX',
        category: service.category || 'Wellness',
        isActive: service.isActive ?? true,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '', description: '', durationMins: '30', price: '', genderCategory: 'UNISEX', category: 'Wellness', isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<ServiceDto> = {
      ...formData,
      price: Number(formData.price),
      durationMins: Number(formData.durationMins),
      genderCategory: formData.genderCategory as "MEN" | "WOMEN" | "UNISEX" | undefined
    };

    if (editingService) {
      updateService.mutate({ id: editingService.id, data: payload }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createService.mutate(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const confirmDelete = () => {
    if (serviceToDelete?.id) {
      deleteService.mutate(serviceToDelete.id, {
        onSuccess: () => setIsDeleteDialogOpen(false)
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Service Menu Management</h1>
          <p className="font-body-lg text-on-surface-variant">Configure spa and salon services offered to customers.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <Input 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<span className="material-symbols-outlined">search</span>}
            />
            <div className="absolute top-full left-0 mt-2 p-2 bg-surface-container-high rounded text-on-surface-variant font-label-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-full text-center border border-outline-variant/30">
              Local search: retrieving extended results for filtering.
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0">
            <span className="material-symbols-outlined font-light mr-2">add_circle</span>
            Add Service
          </Button>
        </div>
      </header>

      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                icon="spa" 
                title="No Services Found" 
                description="No services match your search, or none have been added yet."
              />
            </div>
          ) : (
            filteredServices.map((service: ServiceDto) => (
              <Card 
                key={service.id} 
                className={`h-full flex flex-col p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 hover:border-primary/50 relative overflow-hidden group ${!service.isActive ? 'opacity-70' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="font-label-sm text-xs bg-primary/10 text-primary px-2 py-1 rounded-md uppercase tracking-widest">{service.category}</div>
                    <div className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">{service.genderCategory}</div>
                  </div>
                  <h3 className="font-display-sm text-xl text-on-surface mb-2 leading-tight">{service.name}</h3>
                  <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div>
                      <p className="font-label-sm text-xs text-on-surface-variant uppercase mb-1">Duration</p>
                      <p className="font-body-lg text-on-surface">{service.durationMins} min</p>
                    </div>
                    <div>
                      <p className="font-label-sm text-xs text-on-surface-variant uppercase mb-1">Price</p>
                      <p className="font-body-lg text-primary">₹{service.price}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-outline-variant/20 flex gap-3">
                    <button onClick={() => handleOpenModal(service)} className="flex-1 py-3 border border-primary/30 text-primary rounded-xl font-label-md hover:bg-primary hover:text-white transition-all duration-300">
                      Edit
                    </button>
                    <button onClick={() => { setServiceToDelete(service); setIsDeleteDialogOpen(true); }} className="px-4 border border-error/30 text-error rounded-xl font-label-md hover:bg-error hover:text-white transition-all duration-300" disabled={!service.isActive}>
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
            Page {pageData ? pageData.pageNo + 1 : 1} of {pageData ? pageData.totalPages : 1}
          </span>
          <Button 
            variant="outline" 
            disabled={pageData ? pageData.last : true} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </AnimatedSection>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? "Edit Service" : "Add Service"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Service Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Description</label>
            <textarea
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (mins)" type="number" value={formData.durationMins} onChange={e => setFormData({...formData, durationMins: e.target.value})} required />
            <Input label="Price (₹)" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category (e.g. Hair, Skin)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
            <Input label="Gender Target (MEN, WOMEN, UNISEX)" value={formData.genderCategory} onChange={e => setFormData({...formData, genderCategory: e.target.value})} required />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary" />
            <label htmlFor="isActive" className="font-label-md text-on-surface cursor-pointer">Service is active and bookable</label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createService.isPending || updateService.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} title="Deactivate Service">
        <div className="mb-6">
          <p>Are you sure you want to deactivate <strong>{serviceToDelete?.name}</strong>?</p>
          <p className="text-sm text-on-surface-variant mt-2">This will remove it from the booking flow but keep it in historical records.</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} className="bg-error hover:bg-error/90 text-white border-none" disabled={deleteService.isPending}>Yes, Deactivate</Button>
        </div>
      </Modal>
    </div>
  );
};
