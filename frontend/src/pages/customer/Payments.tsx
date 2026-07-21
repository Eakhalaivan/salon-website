import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyInvoicesQuery } from '../../hooks/api/useBilling';
import { StripeCheckout } from '../../components/payments/StripeCheckout';
import { RazorpayCheckout } from '../../components/payments/RazorpayCheckout';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { LuxuryCard } from '../../components/luxury/LuxuryCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShimmerText } from '../../components/luxury/ShimmerText';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/use-toast';
import axiosClient from '../../api/axiosClient';
import { AnimatePresence } from 'framer-motion';

export const Payments = () => {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const { data: pageData, isLoading, isFetching } = useMyInvoicesQuery(page, 10);
  const invoices = pageData?.content || [];
  
  const [couponCodes, setCouponCodes] = useState<Record<number, string>>({});
  const [applyingCoupon, setApplyingCoupon] = useState<Record<number, boolean>>({});
  const [couponError, setCouponError] = useState<Record<number, string>>({});

  const { toast } = useToast();

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
    toast({ title: 'Success', description: 'Payment successful!' });
  };

  const handlePaymentError = () => {
    toast({ title: 'Payment Failed', description: 'Please try again.', variant: 'destructive' });
  };

  const handleApplyCoupon = async (invoiceId: number) => {
    const code = couponCodes[invoiceId];
    if (!code || applyingCoupon[invoiceId]) return;
    
    setApplyingCoupon(prev => ({ ...prev, [invoiceId]: true }));
    setCouponError(prev => ({ ...prev, [invoiceId]: '' }));
    
    try {
      await axiosClient.post(`/api/v1/invoices/${invoiceId}/apply-coupon`, { code });
      queryClient.invalidateQueries({ queryKey: ['customer-invoices'] });
      toast({ title: 'Success', description: 'Coupon applied successfully!' });
    } catch (error: any) {
      setCouponError(prev => ({ ...prev, [invoiceId]: error.response?.data?.message || 'Failed to apply coupon' }));
    } finally {
      setApplyingCoupon(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />
      
      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10 pt-8">
        <h2 className="font-serif text-6xl mb-4 tracking-wide text-[var(--color-on-surface)]">
          <ShimmerText text="Billing & Payments" />
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg mb-10 tracking-wide">
          Review your invoices and manage your payment methods securely.
        </p>
      </header>
      
      <AnimatedSection stagger className="relative z-10 max-w-5xl mx-auto">
        {invoices && invoices.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {invoices.map((invoice: any) => (
                <AnimatedItem key={invoice.id}>
                  <LuxuryCard className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glass-card bg-[var(--color-surface)] overflow-hidden">
                    <div className="p-8 flex items-start gap-6 flex-grow border-b md:border-b-0 md:border-r border-[var(--color-border)] border-dashed">
                      <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent text-[var(--color-primary)] rounded-full flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30">
                        <span className="material-symbols-outlined font-light text-[28px]">receipt_long</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif text-2xl text-[var(--color-on-surface)]">Invoice #{invoice.id.toString().padStart(4, '0')}</h3>
                          {invoice.status === 'PAID' ? (
                            <span className="status-pill status-pill-success">
                              <span className="status-pill-dot" />
                              Settled
                            </span>
                          ) : (
                            <span className="status-pill status-pill-warning">
                              <span className="status-pill-dot" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-[10px] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-4">
                          Issued {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-3">
                            <p className="font-serif text-3xl text-[var(--color-primary)]">₹{invoice.totalAmount.toFixed(2)}</p>
                            {invoice.couponDiscount > 0 && (
                              <p className="text-[var(--color-on-surface-variant)] text-sm line-through opacity-70">
                                ₹{(invoice.totalAmount + invoice.couponDiscount).toFixed(2)}
                              </p>
                            )}
                          </div>
                          
                          {invoice.couponCode && (
                            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-md w-fit mt-2 border border-[var(--color-primary)]/20">
                              <span className="material-symbols-outlined text-[14px]">local_offer</span>
                              {invoice.couponCode} applied (-₹{invoice.couponDiscount.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 w-full md:w-80 flex flex-col items-center justify-center bg-[var(--color-surface)]/30">
                      {invoice.status !== 'PAID' && (
                        <div className="w-full">
                          {!invoice.couponCode && (
                            <div className="flex gap-2 mb-6">
                              <div className="flex-grow">
                                <Input
                                  placeholder="Promo code"
                                  value={couponCodes[invoice.id] || ''}
                                  onChange={(e) => setCouponCodes(prev => ({ ...prev, [invoice.id]: e.target.value }))}
                                  className="text-sm py-2 bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-on-surface)]"
                                />
                                {couponError[invoice.id] && <p className="text-[var(--color-error)] text-xs mt-1">{couponError[invoice.id]}</p>}
                              </div>
                              <button 
                                className="px-4 py-2 border border-[var(--color-primary)] rounded-lg text-[var(--color-primary)] font-sans text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-primary)]/10 disabled:opacity-50"
                                onClick={() => handleApplyCoupon(invoice.id)}
                                disabled={applyingCoupon[invoice.id] || !couponCodes[invoice.id]}
                              >
                                {applyingCoupon[invoice.id] ? '...' : 'Apply'}
                              </button>
                            </div>
                          )}

                          <div className="space-y-3 w-full">
                            <StripeCheckout
                              invoiceId={invoice.id}
                              amount={invoice.totalAmount}
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                            />
                            <div className="text-center text-xs text-[var(--color-on-surface-variant)] font-semibold uppercase tracking-wider my-2">
                              - OR -
                            </div>
                            <RazorpayCheckout
                              invoiceId={invoice.id}
                              amount={invoice.totalAmount}
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                            />
                          </div>
                        </div>
                      )}
                      
                      {invoice.status === 'PAID' && (
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 text-green-500">
                            <span className="material-symbols-outlined text-[32px]">check_circle</span>
                          </div>
                          <p className="font-serif text-xl text-[var(--color-on-surface)] mb-1">Payment Complete</p>
                          <p className="font-sans text-xs text-[var(--color-on-surface-variant)]">Thank you for your business.</p>
                        </div>
                      )}
                    </div>
                  </LuxuryCard>
                </AnimatedItem>
              ))}
            </AnimatePresence>
            
            <div className="mt-12 p-4 border border-[var(--color-primary)]/20 bg-[var(--color-surface)]/30 backdrop-blur-md flex justify-between items-center rounded-2xl">
              <button 
                className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                  page === 0 
                    ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                    : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                }`}
                disabled={page === 0 || isFetching} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className="text-[var(--color-on-surface-variant)] font-sans text-sm font-semibold tracking-wider uppercase">
                Page {pageData ? pageData.pageNo + 1 : 1} of {pageData ? pageData.totalPages : 1}
              </span>
              <button 
                className={`px-6 py-2 rounded-full font-sans text-sm font-semibold tracking-wider transition-all border ${
                  pageData?.last 
                    ? 'opacity-50 cursor-not-allowed border-[var(--color-border)] text-[var(--color-on-surface-variant)]' 
                    : 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                }`}
                disabled={(pageData ? pageData.last : true) || isFetching} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="receipt_long"
            title="No Invoices Yet"
            description="You don't have any billing history at this time."
          />
        )}
      </AnimatedSection>
    </div>
  );
};
