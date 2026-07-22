import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosClient from '../../api/axiosClient';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/reset-password', { token, newPassword });
      setMessage(typeof response.data === 'string' ? response.data : 'Password successfully reset.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.message) {
        setError(data.message);
      } else if (data?.fieldErrors) {
        setError(Object.values(data.fieldErrors).join(', '));
      } else {
        setError('Failed to reset password. The link might have expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center p-6 relative overflow-hidden bg-on-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-scrim/60 backdrop-blur-[2px] z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
          alt="Spa background"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md relative z-20">
        <Card className="glass-panel p-10 md:p-14 shadow-2xl backdrop-blur-xl border-outline-variant/20">
          <div className="text-center mb-10">
            <h1 className="font-display-lg text-4xl text-primary tracking-wide mb-2">LUMINA</h1>
            <h2 className="font-headline-sm text-on-surface-variant">Set New Password</h2>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-error/10 text-error text-sm rounded-xl border border-error/20 text-center">
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-primary/10 text-primary text-sm rounded-xl border border-primary/20 text-center">
              {message} Redirecting to login...
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <Input 
                label="New Password"
                type={showPassword ? "text" : "password"}
                name="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<span className="material-symbols-outlined font-light text-[20px]">lock</span>}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center z-20"
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined font-light text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            <div className="relative">
              <Input 
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<span className="material-symbols-outlined font-light text-[20px]">lock_reset</span>}
              />
            </div>

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full text-white shadow-[0px_10px_30px_rgba(212,175,55,0.2)]"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </main>
  );
};
