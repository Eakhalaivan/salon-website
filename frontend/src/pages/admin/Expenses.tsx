import { useState } from 'react';
import { useExpensesQuery, useCreateExpense } from '../../hooks/api/useExpenses';
import { useSuppliersQuery } from '../../hooks/api/useSuppliers';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const Expenses = () => {
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading } = useExpensesQuery(page, 10);
  const expenses = pageData?.content || [];
  
  const { data: suppliersData } = useSuppliersQuery(0, 100);
  const suppliers = suppliersData?.content || [];
  
  const createExpense = useCreateExpense();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    supplierId: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const handleOpenModal = () => {
    setFormData({
      category: '', amount: '', description: '', supplierId: '', expenseDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: Number(formData.amount),
      supplierId: formData.supplierId ? Number(formData.supplierId) : undefined,
    };
    createExpense.mutate(payload, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Expenses</h1>
          <p className="font-body-lg text-on-surface-variant">Track salon expenditures and payments to suppliers.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button onClick={() => handleOpenModal()} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0">
            <span className="material-symbols-outlined font-light mr-2">receipt</span>
            Add Expense
          </Button>
        </div>
      </header>

      <AnimatedSection>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState 
              icon="account_balance_wallet" 
              title="No Expenses Found" 
              description="You have not recorded any expenses yet."
            />
          ) : (
            expenses.map((expense: any) => (
              <Card 
                key={expense.id} 
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-error/0 hover:border-l-error group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined font-light text-[24px]">payments</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-xl text-on-surface mb-1">{expense.category}</h3>
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-widest text-xs mb-1">
                      {expense.supplierName ? `Paid to: ${expense.supplierName}` : 'General Expense'}
                    </p>
                    <p className="font-label-sm text-on-surface-variant mb-2">
                      {expense.description}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Date: {expense.expenseDate}
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2">
                  <p className="font-display-sm text-2xl text-on-surface">₹{expense.amount.toFixed(2)}</p>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Category (e.g., Supplies, Utilities)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            <Input label="Expense Date" type="date" value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} required />
          </div>
          <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          <div>
            <label className="block text-sm font-label-sm text-on-surface-variant mb-2">Supplier (Optional)</label>
            <select
              value={formData.supplierId}
              onChange={e => setFormData({...formData, supplierId: e.target.value})}
              className="w-full px-4 py-3 bg-surface-container/50 border border-outline-variant/30 rounded-xl font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            >
              <option value="">-- None --</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createExpense.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
