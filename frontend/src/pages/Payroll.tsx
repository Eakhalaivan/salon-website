import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/use-toast';
import { Loader2, DollarSign, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { useNavigate } from 'react-router-dom';

interface PayrollRecord {
  id: number;
  periodStart: string;
  periodEnd: string;
  baseSalary: number;
  commissionEarned: number;
  totalAppointmentsCompleted: number;
  grossPay: number;
  status: string;
  generatedAt: string;
}

export default function Payroll() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const [staffIdInput, setStaffIdInput] = useState(role === 'STAFF' ? user?.id?.toString() || '' : '');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const isAdminOrManager = ['ADMIN', 'MANAGER'].includes(role || '');

  const { data: payrollRecords, isLoading, refetch } = useQuery({
    queryKey: ['payroll', staffIdInput],
    queryFn: async () => {
      if (!staffIdInput) return [];
      const response = await axiosClient.get(`/api/v1/payroll/staff/${staffIdInput}`);
      return response.data.content as PayrollRecord[];
    },
    enabled: !!staffIdInput
  });

  const handleGenerate = async () => {
    if (!staffIdInput || !periodStart || !periodEnd) {
      toast({ title: 'Missing fields', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    
    setIsGenerating(true);
    try {
      await axiosClient.post('/api/v1/payroll/generate', {
        staffId: Number(staffIdInput),
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString()
      });
      
      toast({ title: 'Payroll Generated', variant: 'success' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <AnimatedSection variant="fade">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="group mb-8 flex items-center text-label-md font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </button>
          <h1 className="text-headline-lg font-serif text-on-surface mb-2">Payroll & Commissions</h1>
          <p className="text-body-md text-on-surface-variant">View and generate staff payroll records.</p>
        </div>
      </AnimatedSection>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isAdminOrManager && (
          <AnimatedSection variant="slide-right" delay={0.1} className="md:col-span-1">
            <Card className="glass-panel border-transparent h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-title-lg font-serif">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Generate Payroll
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <Input 
                  type="number" 
                  value={staffIdInput} 
                  onChange={e => setStaffIdInput(e.target.value)}
                  label="Staff ID" 
                />
                <div className="space-y-2 relative group flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-label-md">
                    Start
                  </div>
                  <input 
                    type="datetime-local" 
                    value={periodStart} 
                    onChange={e => setPeriodStart(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:opacity-50 transition-all duration-300 py-3 pl-16 pr-4"
                  />
                </div>
                <div className="space-y-2 relative group flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-label-md">
                    End
                  </div>
                  <input 
                    type="datetime-local" 
                    value={periodEnd} 
                    onChange={e => setPeriodEnd(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:opacity-50 transition-all duration-300 py-3 pl-16 pr-4"
                  />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} variant="primary" size="lg" className="w-full mt-4 rounded-xl">
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Generate Payroll
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}
        
        <AnimatedSection variant="slide-left" delay={0.2} className={isAdminOrManager ? "md:col-span-2" : "md:col-span-3"}>
          <Card className="glass-panel border-transparent h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-title-lg font-serif">Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              {!staffIdInput ? (
                <div className="text-center py-12 text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <p>Enter a Staff ID to view payroll records.</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : payrollRecords?.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <p>No payroll records found for this staff member.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="text-label-sm uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/30">
                      <tr>
                        <th className="px-4 py-4 font-medium">Period</th>
                        <th className="px-4 py-4 font-medium">Base Salary</th>
                        <th className="px-4 py-4 font-medium">Commission</th>
                        <th className="px-4 py-4 font-medium">Gross Pay</th>
                        <th className="px-4 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {payrollRecords?.map(record => (
                        <tr key={record.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="px-4 py-4 text-body-md">
                            {new Date(record.periodStart).toLocaleDateString()} <span className="text-on-surface-variant px-1">-</span> {new Date(record.periodEnd).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-body-md text-on-surface-variant">₹{record.baseSalary.toFixed(2)}</td>
                          <td className="px-4 py-4 text-body-md text-green-600 dark:text-green-400 font-medium">+₹{record.commissionEarned.toFixed(2)}</td>
                          <td className="px-4 py-4 text-body-md font-bold text-on-surface">₹{record.grossPay.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 text-label-sm font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
}
