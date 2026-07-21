import { useState } from 'react';
import { useStaffQuery } from '../../hooks/api/useStaff';

import { EmptyState } from '../../components/ui/EmptyState';

export const StaffDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: response, isLoading } = useStaffQuery(0, 100);

  const filteredStaff = response?.content?.filter((staff: any) => 
    `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
<div className="mb-8">
        <h2 className="font-display-lg text-[32px] text-on-surface mb-2">Staff Directory</h2>
        <p className="text-on-surface-variant text-body-lg">Connect with your team members.</p>
      </div>

      <div className="glass-panel overflow-hidden rounded-[24px]">
        <div className="p-6 border-b border-outline-variant flex gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search team members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container rounded-full py-3 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-body-md"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-32 bg-surface-container rounded-[24px]"></div>
            ))}
          </div>
        ) : !filteredStaff?.length ? (
          <EmptyState 
            icon="contact_phone"
            title="No staff members found"
            description="Try adjusting your search terms."
          />
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff: any) => (
              <div key={staff.id} className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant hover:border-outline transition-colors flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-display-sm text-[24px]">
                  {staff.firstName?.[0]}{staff.lastName?.[0]}
                </div>
                <div>
                  <h4 className="font-headline-sm text-on-surface">{staff.firstName} {staff.lastName}</h4>
                  <p className="text-label-sm text-on-surface-variant mb-2">{staff.role}</p>
                  {staff.phone && (
                    <a href={`tel:${staff.phone}`} className="flex items-center gap-1 text-primary text-label-sm hover:underline">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {staff.phone}
                    </a>
                  )}
                  {staff.user?.email && (
                    <a href={`mailto:${staff.user.email}`} className="flex items-center gap-1 text-primary text-label-sm hover:underline mt-1">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                      {staff.user.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
