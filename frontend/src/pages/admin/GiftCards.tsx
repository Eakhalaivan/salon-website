import React, { useState } from 'react';
import { useAdminGiftCardsHistory, useSendAdminGiftCard } from '../../hooks/api/useAdminGiftCards';
import { useCustomersQuery } from '../../hooks/api/useCustomers';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { EmptyState } from '../../components/ui/EmptyState';
import { Gift, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminGiftCards() {
  const [page, setPage] = useState(0);
  const { data: historyData, isLoading } = useAdminGiftCardsHistory(page, 10);
  const { data: customersData } = useCustomersQuery('', 0, 100);
  
  const sendMutation = useSendAdminGiftCard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipientCustomerId: '',
    amount: '',
    message: ''
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientCustomerId || !formData.amount) return;
    
    sendMutation.mutate({
      recipientCustomerId: Number(formData.recipientCustomerId),
      amount: Number(formData.amount),
      message: formData.message
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ recipientCustomerId: '', amount: '', message: '' });
      }
    });
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Gift Cards</h1>
          <p className="font-body-lg text-on-surface-variant">Administer gift cards and issue manual rewards.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button onClick={() => setIsModalOpen(true)} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0">
            <Plus size={18} className="mr-2" />
            Send Gift Card
          </Button>
        </div>
      </header>

      <AnimatedSection>
        <div className="glass-panel rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/40 dark:bg-black/40">
            <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <Gift size={20} className="text-primary" />
              Gift Card History
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Code</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Recipient</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Amount</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Source</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Issued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                    </td>
                  </tr>
                ) : historyData?.content?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <EmptyState 
                        icon="redeem" 
                        title="No gift cards found" 
                        description="There are currently no gift cards to display." 
                      />
                    </td>
                  </tr>
                ) : (
                  historyData?.content?.map((card: any, i: number) => (
                    <motion.tr 
                      key={card.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-on-surface">{card.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-label-md text-on-surface">{card.recipientName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-label-md text-primary">
                        ₹{card.initialBalance?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-pill ${card.status === 'ACTIVE' ? 'success' : 'error'}`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-pill ${card.source === 'ADMIN_GIFTED' ? 'warning' : 'primary'}`}>
                          {card.source === 'ADMIN_GIFTED' ? 'ADMIN' : 'PURCHASED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-label-sm">
                        {new Date(card.issuedAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {historyData && historyData.totalPages > 1 && (
            <div className="p-4 border-t border-outline-variant/20 bg-surface/30 flex justify-between items-center">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</Button>
              <span className="text-on-surface-variant font-label-md">Page {historyData.pageNo + 1} of {historyData.totalPages}</span>
              <Button variant="outline" disabled={historyData.last} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </AnimatedSection>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Send Gift Card to Customer">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Customer</label>
            <select 
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
              value={formData.recipientCustomerId}
              onChange={e => setFormData({...formData, recipientCustomerId: e.target.value})}
              required
            >
              <option value="">Select a customer...</option>
              {customersData?.content?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.user?.email || 'No email'})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Amount (₹)</label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md"
              type="number" 
              required 
              min="1"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface">Message (Optional)</label>
            <textarea 
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-body-md resize-y"
              rows={3}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="Enjoy this gift on us!"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sendMutation.isPending}>
              {sendMutation.isPending ? 'Sending...' : 'Send Gift Card'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
