import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../api/services/customerService';

import { EmptyState } from '../../components/ui/EmptyState';

export const StaffCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const page = 0;

  const { data: response, isLoading } = useQuery({
    queryKey: ['staffCustomers', searchTerm, page],
    queryFn: () => customerService.getAll(searchTerm, page, 10),
  });

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display-lg text-[32px] text-on-surface mb-2">My Customers</h2>
        <p className="text-on-surface-variant text-body-lg">View and manage customers assigned to you.</p>
      </div>

      <div className="glass-panel overflow-hidden rounded-[24px]">
        <div className="p-6 border-b border-outline-variant flex gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search customers by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container rounded-full py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-body-md"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-surface-container rounded-xl"></div>
            ))}
          </div>
        ) : !response?.content?.length ? (
          <EmptyState 
            icon="groups"
            title="No customers found"
            description={searchTerm ? "Try adjusting your search terms." : "You have no customers assigned to you yet."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-lowest/50">
                  <th className="p-4 font-label-md text-on-surface-variant font-medium">Customer</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-medium">Contact</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-medium">Lifetime Value</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {response.content.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-headline-sm">
                          {customer.firstName?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="font-headline-sm text-on-surface">{customer.firstName} {customer.lastName}</p>
                          <p className="text-label-sm text-on-surface-variant">Member since {new Date(customer.createdAt).getFullYear()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-body-md text-on-surface">{customer.email}</p>
                      <p className="text-body-sm text-on-surface-variant">{customer.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-display-sm text-primary">₹{customer.loyaltyPoints || 0}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="px-4 py-2 border border-outline text-on-surface rounded-full font-label-sm hover:bg-surface-container transition-colors">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
