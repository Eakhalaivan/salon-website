import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyInvoicesQuery } from '../../hooks/api/useBilling';
import { StripeCheckout } from '../../components/payments/StripeCheckout';
import { RazorpayCheckout } from '../../components/payments/RazorpayCheckout';
import { AnimatedSection, AnimatedItem } from '../../components/ui/AnimatedSection';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/use-toast';
import axiosClient from '../../api/axiosClient';
import { AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

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
      await axiosClient.post(`/invoices/${invoiceId}/apply-coupon`, { code });
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
        <span className="material-symbols-outlined animate-spin text-gold-500 text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />
      
      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 relative z-10 pt-4">
        <h2 className="font-serif text-[40px] leading-[48px] mb-2 text-ink-900">
          Billing & Payments
        </h2>
        <p className="font-sans text-ink-400 text-[15px] mb-8">
          Review your invoices and manage your payment methods securely.
        </p>
      </header>
      
      <AnimatedSection stagger className="relative z-10 max-w-5xl mx-auto">
        {invoices && invoices.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {invoices.map((invoice: any) => (
                <AnimatedItem key={invoice.id}>
                  <Card className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden border-none shadow-sm">
                    <div className="p-8 flex items-start gap-6 flex-grow border-b md:border-b-0 md:border-r border-ink-200/50 border-dashed">
                      <div className="w-14 h-14 bg-surface text-gold-500 rounded-full flex items-center justify-center shrink-0 border border-gold-500/30">
                        <span className="material-symbols-outlined font-light text-[28px]">receipt_long</span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif text-2xl text-ink-900">Invoice #{invoice.id.toString().padStart(4, '0')}</h3>
                          {invoice.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-green-50 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-700" />
                              Settled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-yellow-50 text-yellow-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-700" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-[10px] font-semibold text-ink-400 uppercase tracking-widest mb-4">
                          Issued {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-3">
                            <p className="font-serif text-3xl text-gold-500">₹{invoice.totalAmount.toFixed(2)}</p>
                            {invoice.couponDiscount > 0 && (
                              <p className="text-ink-400 text-sm line-through opacity-70">
                                ₹{(invoice.totalAmount + invoice.couponDiscount).toFixed(2)}
                              </p>
                            )}
                          </div>
                          
                          {invoice.couponCode && (
                            <span className="inline-flex items-center gap-1 text-xs text-gold-500 bg-surface px-2.5 py-1 rounded-md w-fit mt-2 border border-gold-500/20">
                              <span className="material-symbols-outlined text-[14px]">local_offer</span>
                              {invoice.couponCode} applied (-₹{invoice.couponDiscount.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 w-full md:w-80 flex flex-col items-center justify-center bg-surface">
                      {invoice.status !== 'PAID' && (
                        <div className="w-full">
                          {!invoice.couponCode && (
                            <div className="flex gap-2 mb-6">
                              <div className="flex-grow">
                                <Input
                                  placeholder="Promo code"
                                  value={couponCodes[invoice.id] || ''}
                                  onChange={(e) => setCouponCodes(prev => ({ ...prev, [invoice.id]: e.target.value }))}
                                  className="text-sm py-2 bg-page border-ink-200/50 text-ink-900"
                                />
                                {couponError[invoice.id] && <p className="text-danger-text text-xs mt-1">{couponError[invoice.id]}</p>}
                              </div>
                              <button 
                                className="px-4 py-2 border border-gold-500 rounded-lg text-gold-500 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-gold-500/10 transition-colors disabled:opacity-50"
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
                            <div className="text-center text-[10px] text-ink-400 font-semibold uppercase tracking-widest my-2">
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
                          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-700/20 flex items-center justify-center mb-4 text-green-700">
                            <span className="material-symbols-outlined text-[32px]">check_circle</span>
                          </div>
                          <p className="font-serif text-xl text-ink-900 mb-1">Payment Complete</p>
                          <p className="font-sans text-xs text-ink-400">Thank you for your business.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </AnimatedItem>
              ))}
            </AnimatePresence>
            
            <div className="mt-12 p-4 border border-ink-200/50 bg-surface/30 backdrop-blur-md flex justify-between items-center rounded-2xl">
              <button 
                className={clsx(
                  "px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border",
                  page === 0 
                    ? "opacity-50 cursor-not-allowed border-ink-200 text-ink-400" 
                    : "border-[#D4AF37] text-[#D4AF37] hover:bg-gold-50"
                )}
                disabled={page === 0 || isFetching} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                PREVIOUS
              </button>
              <span className="text-ink-400 font-sans text-sm font-semibold tracking-wider uppercase">
                Page {pageData ? pageData.pageNo + 1 : 1} of {pageData ? pageData.totalPages : 1}
              </span>
              <button 
                className={clsx(
                  "px-6 py-2 rounded-full font-sans text-sm font-medium tracking-wider transition-all border",
                  pageData?.last 
                    ? "opacity-50 cursor-not-allowed border-ink-200 text-ink-400" 
                    : "border-[#D4AF37] text-[#D4AF37] hover:bg-gold-50"
                )}
                disabled={(pageData ? pageData.last : true) || isFetching} 
                onClick={() => setPage(p => p + 1)}
              >
                NEXT
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
