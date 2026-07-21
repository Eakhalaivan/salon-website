import { useState, useEffect } from 'react';
import { useMyProfileQuery, useUpdateMyProfileMutation } from '../../hooks/api/useCustomers';
import type { CustomerDto } from '../../api/types';
import { Input } from '../../components/ui/Input';
import { LuxuryCard } from '../../components/luxury/LuxuryCard';
import { ShimmerText } from '../../components/luxury/ShimmerText';
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
        <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <GoldRibbon position="top-right" />

      <header className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 relative z-10 pt-8">
        <h2 className="font-serif text-6xl mb-4 tracking-wide text-[var(--color-on-surface)]">
          <ShimmerText text="My Profile" />
        </h2>
        <p className="font-sans text-[var(--color-on-surface-variant)] text-lg tracking-wide mb-8">
          Manage your personal information and preferences.
        </p>

        {profile.totalPoints !== undefined && (
          <div className="bg-[var(--color-surface)] px-8 py-4 rounded-3xl text-center border border-[var(--color-primary)]/20 shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex flex-col items-center">
            <span className="block font-serif text-4xl bg-gradient-to-r from-[#fedebb] via-[#e5ae85] to-[#b1724a] bg-clip-text text-transparent">{profile.totalPoints}</span>
            <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-[var(--color-primary)] mt-1 block">Luxe Points</span>
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
              className="bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 p-4 rounded-lg mb-6 text-center font-sans text-sm font-semibold"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-500/10 text-green-500 border border-green-500/20 p-4 rounded-lg mb-6 flex items-center justify-center font-sans text-sm font-semibold"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">check_circle</span>
              Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <LuxuryCard className="p-10 bg-[var(--color-surface)] glass-card">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-sans text-xs font-semibold tracking-widest uppercase text-[var(--color-on-surface-variant)] mb-3">First Name</label>
                  <Input 
                    type="text" 
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    required
                    className="bg-[var(--color-surface)]/30 border-[var(--color-border)] text-[var(--color-on-surface)] focus-visible:border-[var(--color-primary)]/50 h-12"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold tracking-widest uppercase text-[var(--color-on-surface-variant)] mb-3">Last Name</label>
                  <Input 
                    type="text" 
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    required
                    className="bg-[var(--color-surface)]/30 border-[var(--color-border)] text-[var(--color-on-surface)] focus-visible:border-[var(--color-primary)]/50 h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold tracking-widest uppercase text-[var(--color-on-surface-variant)] mb-3">Email Address</label>
                <Input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  disabled
                  className="bg-[var(--color-surface)]/10 text-[var(--color-on-surface-variant)] cursor-not-allowed opacity-50 border-[var(--color-border)]/50 h-12"
                />
                <p className="font-sans text-xs text-[var(--color-on-surface-variant)] mt-2 tracking-wide">Email cannot be changed online.</p>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold tracking-widest uppercase text-[var(--color-on-surface-variant)] mb-3">Phone Number</label>
                <Input 
                  type="tel" 
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  className="bg-[var(--color-surface)]/30 border-[var(--color-border)] text-[var(--color-on-surface)] focus-visible:border-[var(--color-primary)]/50 h-12"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold tracking-widest uppercase text-[var(--color-on-surface-variant)] mb-3">Special Requests or Notes</label>
                <textarea 
                  name="notes"
                  value={profile.notes || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-[var(--color-surface)]/30 text-[var(--color-on-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-colors resize-none placeholder-[var(--color-on-surface-variant)]/30 font-sans text-sm"
                  placeholder="E.g., allergic to lavender, prefer quiet sessions..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-8 border-t border-[var(--color-border)]">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="gradient-btn px-8 py-3 rounded-full font-sans text-sm font-semibold tracking-wider flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">progress_activity</span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
        </LuxuryCard>
      </motion.div>
    </div>
  );
};
