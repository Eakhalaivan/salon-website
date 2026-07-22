import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosClient from '../../api/axiosClient';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      setMessage(typeof response.data === 'string' ? response.data : 'If your email is registered, a reset link will be sent.');
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Failed to send reset password request. Please try again.');
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
            <h2 className="font-headline-sm text-on-surface-variant">Reset Password</h2>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-error/10 text-error text-sm rounded-xl border border-error/20 text-center">
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-primary/10 text-primary text-sm rounded-xl border border-primary/20 text-center">
              {message}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Email Address"
              type="email" 
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<span className="material-symbols-outlined font-light text-[20px]">mail</span>}
            />

            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full text-white shadow-[0px_10px_30px_rgba(212,175,55,0.2)]"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline underline-offset-4">Back to Login</Link>
          </div>
        </Card>
      </motion.div>
    </main>
  );
};
