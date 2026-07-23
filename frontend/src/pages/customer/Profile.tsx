import { useState, useEffect, useRef } from 'react';
import { useMyProfileQuery, useUpdateMyProfileMutation } from '../../hooks/api/useCustomers';
import type { CustomerDto } from '../../api/types';
import { motion, AnimatePresence } from 'framer-motion';

export const Profile = () => {
  const { data: profileData, isLoading: loading, isError } = useMyProfileQuery();
  const updateProfile = useUpdateMyProfileMutation();
  
  const [profile, setProfile] = useState<CustomerDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    isPrimaryMember: false,
    totalPoints: 0
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    }
    if (isError) {
      setError('Failed to load profile.');
    }
  }, [profileData, isError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile(prev => {
          const newProfile = { ...prev, profilePhoto: base64String };
          // Auto-save the photo change
          updateProfile.mutate(newProfile, {
            onSuccess: () => {
              setSuccess(true);
              setTimeout(() => setSuccess(false), 3000);
            }
          });
          return newProfile;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    updateProfile.mutate(profile, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: () => {
        setError('Failed to update profile.');
      }
    });
  };

  const saving = updateProfile.isPending;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  // Calculate points progress (mocking the 3000 point tier)
  const nextTierPoints = 3000;
  const pointsRemaining = Math.max(0, nextTierPoints - (profile.totalPoints || 0));
  const progressPercent = Math.min(100, ((profile.totalPoints || 0) / nextTierPoints) * 100);

  return (
    <main className="lg:px-[40px] px-[16px] min-h-[calc(100vh-80px)] relative overflow-hidden py-12 animate-fade-in">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
      </div>

      <div className="max-w-container-max-width mx-auto relative z-10">
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-secondary mb-2 font-label-sm text-label-sm uppercase tracking-widest">
            <span>Customer</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-bold">Profile</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">My Profile</h2>
          <p className="text-secondary font-body-md mt-1">Manage your personal information and preferences.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-error-container text-on-error-container border border-error-container/20 p-4 rounded-xl mb-6 text-center font-body-md shadow-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 text-green-700 border border-green-700/20 p-4 rounded-xl mb-6 flex items-center justify-center font-body-md font-semibold shadow-sm"
            >
              <span className="material-symbols-outlined mr-2">check_circle</span>
              Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Personal Card & Stats */}
          <div className="lg:col-span-4 space-y-gutter">
            {/* Profile Card */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-center border border-outline-variant/10 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-container"></div>
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full border-2 border-primary-container p-1 relative z-10 mx-auto transition-transform duration-500 group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-dim">
                    <img
                      className="w-full h-full object-cover" 
                      src={profile.profilePhoto || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZk4EJsHtpgx8tysD3NCRd9PLuFRwnPiJ444yDLW5IYmqUdeyM40wRcw4eyD1a19DjGjFJrAaUp7iv5xUSYT0A-ktUk-1GQ8faAbYeh1eVqmYz_zU-TI0oslmiAqxQp6kwZMP6XrtUdmh4BtHPm5T2qhZT-I-CT6PZ8M-jl9d1IEB8d-SzGqpDPrqG162Sesjbx-tQ1FW8TBw6vTLKbPrM4UfwYyCkINHQQ_O9x805-yfUSQk_ONIR103qYVbDhm7e44uJpjDO6rXz"}
                      alt="Profile"
                      loading="lazy"
                    />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-container transition-colors z-20"
                >
                  <span className="material-symbols-outlined text-lg">photo_camera</span>
                </button>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-secondary font-body-md mb-4">{profile.email}</p>
              
              {profile.isPrimaryMember && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-container/10 rounded-full border border-primary-container/20">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Elite Member</span>
                </div>
              )}
            </div>

            {/* Luxe Points Balance */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-secondary font-label-sm text-label-sm uppercase tracking-widest mb-1">Lumina Points</p>
                  <h4 className="font-display-lg text-display-lg text-primary leading-none">
                    {profile.totalPoints?.toLocaleString()}
                  </h4>
                </div>
                <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sparkles</span>
                </div>
              </div>
              <p className="text-secondary font-body-md mt-4">
                You're {pointsRemaining.toLocaleString()} points away from your next free facial treatment!
              </p>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <button className="w-full mt-6 py-3 border border-outline text-on-surface font-label-md text-label-md rounded-full hover:bg-surface-container-low transition-colors uppercase tracking-widest">
                View Rewards History
              </button>
            </div>
          </div>

          {/* Right Column: Personal Information Form */}
          <div className="lg:col-span-8">
            <div className="bg-surface-container-lowest rounded-xl p-6 lg:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-outline-variant/20 gap-4">
                <h4 className="font-headline-md text-headline-md text-on-surface">Personal Information</h4>
                <span className="text-secondary font-label-sm text-label-sm uppercase tracking-widest">Last updated: Today</span>
              </div>
              
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                  <div className="space-y-2 group/input">
                    <label className="font-label-md text-label-md text-secondary uppercase tracking-wider block">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md outline-none" 
                    />
                  </div>
                  <div className="space-y-2 group/input">
                    <label className="font-label-md text-label-md text-secondary uppercase tracking-wider block">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-container-lowest border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md outline-none" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-secondary uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-surface-container-low border-outline-variant/50 rounded-lg py-3 px-4 text-secondary/70 font-body-md cursor-not-allowed outline-none" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary/40 text-lg">lock</span>
                  </div>
                  <p className="text-xs text-secondary italic mt-1">Email cannot be changed online. Please contact support.</p>
                </div>
                
                <div className="space-y-2 group/input">
                  <label className="font-label-md text-label-md text-secondary uppercase tracking-wider block">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md outline-none" 
                  />
                </div>
                
                <div className="space-y-2 group/input">
                  <label className="font-label-md text-label-md text-secondary uppercase tracking-wider block">Special Requests or Notes</label>
                  <textarea 
                    name="notes"
                    value={profile.notes || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-surface-container-lowest border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md outline-none resize-y" 
                    placeholder="E.g. prefer quiet rooms, allergic to lavender..."
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-end pt-6">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-full font-label-md text-label-md uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[0_0_20px_rgba(197,160,89,0.15)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Security Section */}
            <div className="mt-8 bg-surface-container-lowest rounded-xl p-6 lg:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Account Security</h4>
                  <p className="text-secondary font-body-md mt-1">Update your password and security settings.</p>
                </div>
                <button className="px-6 py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded-full hover:bg-surface-container-low transition-colors uppercase tracking-widest whitespace-nowrap">
                  Manage Security
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
