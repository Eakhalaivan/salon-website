import { useState, useEffect } from 'react';
import { useCustomersQuery, useCreateCustomer } from '../../hooks/api/useCustomers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Modal } from '../../components/ui/Modal';

export const Customers = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: pageData, isLoading } = useCustomersQuery(debouncedSearch, page, 10);
  const createCustomer = useCreateCustomer();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const customers = pageData?.content || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createCustomer.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '' });
      },
      onError: (err: any) => {
        const data = err.response?.data;
        let msg = data?.message;
        if (typeof msg === 'string') {
          setError(msg);
        } else if (data?.fieldErrors) {
          setError(Object.values(data.fieldErrors).join(', '));
        } else {
          setError('Failed to create guest. Please try again.');
        }
      }
    });
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Customers</h1>
          <p className="font-body-lg text-on-surface-variant">Manage client profiles and loyalty points.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)]">
          <span className="material-symbols-outlined font-light mr-2">person_add</span>
          Add Guest
        </Button>
      </header>

      <AnimatedSection>
        <div className="bg-surface/50 backdrop-blur-xl rounded-3xl shadow-lg border border-outline-variant/20 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/40">
            <h3 className="font-display-sm text-2xl text-on-surface">Client Roster</h3>
            <div className="w-full sm:w-80 relative group">
              <Input 
                icon={<span className="material-symbols-outlined text-[20px]">search</span>}
                type="text" 
                placeholder="Search clientele..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="absolute top-full left-0 mt-2 p-2 bg-surface-container-high rounded text-on-surface-variant font-label-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-full text-center border border-outline-variant/30">
                Local search: retrieving extended results for filtering.
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-variant/20 bg-surface/30">
                  <TableHead className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant py-6">Guest</TableHead>
                  <TableHead className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant py-6">Contact</TableHead>
                  <TableHead className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant py-6">Status / Points</TableHead>
                  <TableHead className="font-label-sm text-xs uppercase tracking-widest text-on-surface-variant py-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12"><span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span></TableCell></TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-12">
                      <EmptyState 
                        icon="group_off" 
                        title="No guests found" 
                        description="Try adjusting your search criteria or add a new guest."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((c) => (
                    <TableRow key={c.id} className="group transition-all duration-300 hover:bg-surface-container/50 border-outline-variant/10">
                      <TableCell className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display-sm text-xl border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                            {c.firstName.charAt(0)}
                          </div>
                          <div className="font-display-sm text-lg text-on-surface">{c.firstName} {c.lastName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="text-on-surface font-body-md">{c.email || '—'}</div>
                        <div className="text-on-surface-variant font-label-sm mt-1 flex items-center gap-1 opacity-70">
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          {c.phone || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-label-sm uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                          {c.totalPoints} pts
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-6">
                        <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-end w-full group/btn">
                          <span className="font-label-md mr-2 opacity-0 group-hover/btn:opacity-100 transition-opacity">Profile</span>
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-outline-variant/20 bg-surface/30 flex justify-between items-center">
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
        </div>
      </AnimatedSection>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Guest">
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
          <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createCustomer.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
