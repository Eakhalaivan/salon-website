import { useState, useEffect } from 'react';
import { useMyProfileQuery, useUpdateMyProfileMutation } from '../../hooks/api/useCustomers';
import type { CustomerDto } from '../../api/types';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { GoldRibbon } from '../../components/ui/GoldRibbon';
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
        <span className="material-symbols-outlined animate-spin text-gold-500 text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />

      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 relative z-10 pt-4">
        <h2 className="font-serif text-[40px] leading-[48px] mb-2 text-ink-900">
          My Profile
        </h2>
        <p className="font-sans text-ink-400 text-[15px] mb-8">
          Manage your personal information and preferences.
        </p>

        {profile.totalPoints !== undefined && (
          <div className="bg-surface px-8 py-4 rounded-3xl text-center border border-ink-200/50 flex flex-col items-center shadow-inner">
            <span className="block font-serif text-4xl text-gold-500">{profile.totalPoints}</span>
            <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-gold-500 mt-1 block">Luxe Points</span>
          </div>
        )}
      </header>

      <motion.div 
        className="max-w-3xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-danger-surface text-danger-text border border-danger-border p-4 rounded-lg mb-6 text-center font-sans text-sm font-semibold"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 text-green-700 border border-green-700/20 p-4 rounded-lg mb-6 flex items-center justify-center font-sans text-sm font-semibold"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">check_circle</span>
              Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="p-10 border-none shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-sans text-[11px] font-semibold tracking-widest uppercase text-ink-400 mb-3">First Name</label>
                  <Input 
                    type="text" 
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    required
                    className="bg-surface border-ink-200/50 text-ink-900 focus-visible:border-gold-500 h-12"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] font-semibold tracking-widest uppercase text-ink-400 mb-3">Last Name</label>
                  <Input 
                    type="text" 
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    required
                    className="bg-surface border-ink-200/50 text-ink-900 focus-visible:border-gold-500 h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[11px] font-semibold tracking-widest uppercase text-ink-400 mb-3">Email Address</label>
                <Input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  disabled
                  className="bg-page text-ink-400 cursor-not-allowed opacity-70 border-ink-200/50 h-12"
                />
                <p className="font-sans text-xs text-ink-400 mt-2 tracking-wide">Email cannot be changed online.</p>
              </div>

              <div>
                <label className="block font-sans text-[11px] font-semibold tracking-widest uppercase text-ink-400 mb-3">Phone Number</label>
                <Input 
                  type="tel" 
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  className="bg-surface border-ink-200/50 text-ink-900 focus-visible:border-gold-500 h-12"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] font-semibold tracking-widest uppercase text-ink-400 mb-3">Special Requests or Notes</label>
                <textarea 
                  name="notes"
                  value={profile.notes || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-surface text-ink-900 border border-ink-200/50 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors resize-none placeholder-ink-400/50 font-sans text-sm"
                  placeholder="E.g., allergic to lavender, prefer quiet sessions..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-8 border-t border-ink-200/50">
                <PrimaryButton 
                  type="submit" 
                  disabled={saving}
                  className="px-8 h-12 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">progress_activity</span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </PrimaryButton>
              </div>
            </form>
        </Card>
      </motion.div>
    </div>
  );
};
