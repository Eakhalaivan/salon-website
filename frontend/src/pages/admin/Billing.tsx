import { useState } from 'react';
import { useAllInvoicesQuery } from '../../hooks/api/useBilling';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Button } from '../../components/ui/Button';
import { CountUp } from '../../components/ui/CountUp';
import { EmptyState } from '../../components/ui/EmptyState';
import { Receipt, Download, RefreshCcw } from 'lucide-react';

export const Billing = () => {
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading, refetch } = useAllInvoicesQuery(page, 15);
  const invoices = pageData?.content || [];

  const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
  const pendingInvoices = invoices.filter((inv: any) => inv.status === 'PENDING').length;

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Billing & Payments</h1>
          <p className="font-body-lg text-on-surface-variant">View all transactions, invoices, and payment statuses.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="outline" onClick={() => refetch()} className="shrink-0">
            <RefreshCcw size={18} className="mr-2" />
            Refresh
          </Button>
          <Button className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0">
            <Receipt size={18} className="mr-2" />
            Generate Invoice
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">Total Captured Revenue (Page)</p>
          <CountUp value={totalRevenue} format="currency" className="font-display-md text-5xl text-on-surface block" />
        </div>

        <div className="glass-panel p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
          </div>
          <p className="font-label-md text-on-surface-variant mb-2 tracking-widest uppercase text-xs">Pending Invoices</p>
          <CountUp value={pendingInvoices} className="font-display-md text-5xl text-on-surface block" />
        </div>
      </section>

      <AnimatedSection>
        <div className="glass-panel rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/40 dark:bg-black/40">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Recent Transactions</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Invoice ID</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Customer</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Amount</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <EmptyState 
                        icon="receipt_long" 
                        title="No invoices found" 
                        description="There are currently no invoices to display." 
                      />
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4 font-label-md text-on-surface">INV-{invoice.id.toString().padStart(5, '0')}</td>
                      <td className="px-6 py-4">
                        <div className="font-label-md text-on-surface">{invoice.customerName || `Customer #${invoice.customerId}`}</div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-label-sm">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-label-md text-primary">
                        ₹{invoice.totalAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-pill ${invoice.status === 'PAID' ? 'success' : invoice.status === 'CANCELLED' ? 'error' : 'warning'}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 rounded-full" title="Download PDF">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pageData && pageData.totalPages > 1 && (
            <div className="p-4 border-t border-outline-variant/20 bg-surface/30 flex justify-between items-center">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</Button>
              <span className="text-on-surface-variant font-label-md">Page {pageData.pageNo + 1} of {pageData.totalPages}</span>
              <Button variant="outline" disabled={pageData.last} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
};
