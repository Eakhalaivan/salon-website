import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useMyInvoicesQuery } from '../../hooks/api/useBilling';
import { StripeCheckout } from '../../components/payments/StripeCheckout';
import { RazorpayCheckout } from '../../components/payments/RazorpayCheckout';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/use-toast';
import axiosClient from '../../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark } from 'lucide-react';

export const Payments = () => {
  const [page, setPage] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { data: pageData, isLoading, isFetching } = useMyInvoicesQuery(page, 10);
  const invoices = pageData?.content || [];

  const { data: customerInfo } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await axiosClient.get('/customers/my');
      return res.data;
    }
  });
  
  const { toast } = useToast();

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
    setSelectedInvoice(null);
    toast({ title: 'Success', description: 'Payment successful!' });
  };

  const handlePaymentError = () => {
    toast({ title: 'Payment Failed', description: 'Please try again.', variant: 'destructive' });
  };

  // Mock summary data for missing endpoints
  const totalSpent = invoices.filter((i: any) => i.status === 'PAID').reduce((acc: number, curr: any) => acc + curr.totalAmount, 0) || 8450;
  const pendingAmount = invoices.filter((i: any) => i.status !== 'PAID').reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative overflow-hidden py-12 animate-fade-in">
      <div className="max-w-container-max-width mx-auto relative z-10">
        
        {/* Breadcrumbs & Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-label-sm text-secondary mb-4">
            <span>Customer</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Payments</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Billing & Payments</h2>
          <p className="text-secondary font-body-md max-w-2xl">
            Review your invoices and manage your payment methods securely. Your wellness journey, handled with care.
          </p>
        </div>

        {/* Summary Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
          {/* Total Spent */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Total Spent</span>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-display-lg text-on-surface">₹{totalSpent.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-primary mt-1 font-semibold">This Year</p>
            </div>
          </div>
          
          {/* Total Invoices */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Total Invoices</span>
              <div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-display-lg text-on-surface">{pageData?.totalElements || 12}</h3>
              <p className="text-xs text-secondary mt-1">Invoices</p>
            </div>
          </div>
          
          {/* Pending Amount */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Pending Amount</span>
              <div className="p-2 bg-error-container rounded-lg text-on-error-container">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-display-lg text-on-surface">₹{pendingAmount.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-secondary mt-1">Outstanding</p>
            </div>
          </div>
          
          {/* Luse Points */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Lumina Points</span>
              <div className="p-2 bg-primary-fixed rounded-lg text-on-primary-fixed">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-display-lg text-primary">{customerInfo?.totalPoints || 2450}</h3>
              <p className="text-xs text-primary mt-1 font-semibold">Points</p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-5 text-primary rotate-12">
              <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 overflow-hidden mb-stack-lg">
          <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface">Invoices</h3>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex items-center flex-1 sm:flex-none">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">search</span>
                <input 
                  type="text"
                  placeholder="Search Invoices" 
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border border-outline-variant rounded-full bg-surface-container-low text-label-md focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {invoices.length > 0 ? (
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 font-label-md text-label-md text-secondary uppercase tracking-widest text-xs">Description</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-secondary uppercase tracking-widest text-xs">Date</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-secondary uppercase tracking-widest text-xs">Amount</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-secondary uppercase tracking-widest text-xs">Status</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-secondary uppercase tracking-widest text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 flex items-center justify-center bg-surface-container-high rounded-lg text-primary shrink-0">
                            <span className="material-symbols-outlined">{invoice.status === 'PAID' ? 'receipt' : 'pending_actions'}</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">INV-{new Date(invoice.createdAt).getFullYear()}-{invoice.id.toString().padStart(4, '0')}</p>
                            <p className="text-sm text-secondary truncate max-w-[200px]">Spa Services</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-on-surface-variant font-body-md whitespace-nowrap">
                        {new Date(invoice.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-on-surface font-semibold whitespace-nowrap">
                        ₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-6">
                        {invoice.status === 'PAID' ? (
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-200">Paid</span>
                        ) : (
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">Pending</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {invoice.status === 'PAID' ? (
                          <button className="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant text-primary font-label-md rounded-full hover:bg-surface-container-high transition-colors text-sm">
                            <span className="material-symbols-outlined text-sm">download</span> Download
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSelectedInvoice(invoice)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-label-md rounded-full hover:shadow-md hover:bg-primary/90 transition-all active:scale-95 text-sm"
                          >
                            <span className="material-symbols-outlined text-sm">payment</span> Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12">
                <EmptyState
                  icon="receipt_long"
                  title="No Invoices Yet"
                  description="You don't have any billing history at this time."
                />
              </div>
            )}
          </div>
          
          {pageData && pageData.totalPages > 1 && (
            <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest">
              <p className="text-sm text-secondary">
                Showing page {page + 1} of {pageData.totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  disabled={page === 0 || isFetching}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button 
                  className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  disabled={pageData.last || isFetching}
                  onClick={() => setPage(p => p + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods - Supplemental Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-md text-headline-md text-on-surface">Saved Methods</h4>
              <button className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-base">add</span> Add New
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-outline-variant rounded-xl flex items-center justify-between hover:bg-surface-container-lowest/80 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-[#1A1A1A] rounded flex items-center justify-center text-white text-[10px] font-bold italic">VISA</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">•••• •••• •••• 3456</p>
                    <p className="text-xs text-secondary mt-0.5">Expires 12/29</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded">Default</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between group">
            <div className="relative z-10">
              <h4 className="font-headline-md text-headline-md text-white mb-2">Exclusive Benefits</h4>
              <p className="text-white/90 font-body-md text-sm md:text-base leading-relaxed">Get 5% cash back on all services when you pay using Lumina Wallet.</p>
            </div>
            <div className="relative z-10 mt-6 md:mt-8">
              <button className="bg-surface text-primary px-6 py-2.5 rounded-full font-label-md text-sm md:text-base hover:shadow-lg transition-shadow active:scale-95 duration-150">
                Recharge Wallet
              </button>
            </div>
            {/* Aesthetic Glass Blur */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-500"></div>
          </div>
        </div>

      </div>

      {/* Payment Modal Overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
              onClick={() => setSelectedInvoice(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-ink-200/50 bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <Landmark className="w-6 h-6 text-primary" />
                  <span className="font-headline-md text-xl text-on-surface">Pay Invoice</span>
                </div>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-secondary hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-surface-container-lowest space-y-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-secondary uppercase tracking-widest font-semibold mb-2">Total Amount Due</p>
                  <h2 className="text-4xl font-serif text-primary">₹{selectedInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                  <p className="text-sm text-on-surface-variant mt-2">INV-{new Date(selectedInvoice.createdAt).getFullYear()}-{selectedInvoice.id.toString().padStart(4, '0')}</p>
                </div>

                <div className="space-y-4">
                  <StripeCheckout
                    invoiceId={selectedInvoice.id}
                    amount={selectedInvoice.totalAmount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-outline-variant/30"></div>
                    <span className="flex-shrink-0 mx-4 text-secondary text-xs uppercase tracking-widest font-semibold">Or</span>
                    <div className="flex-grow border-t border-outline-variant/30"></div>
                  </div>
                  
                  <RazorpayCheckout
                    invoiceId={selectedInvoice.id}
                    amount={selectedInvoice.totalAmount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
