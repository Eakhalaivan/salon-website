import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import axiosClient from '../api/axiosClient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { role, branchId, staffId, customerId, firstName, lastName, email: userEmail } = response.data;
      
      const path = window.location.pathname;
      const isAdminLogin = path === '/admin/login' || path === '/staff/login';
      
      if (isAdminLogin && role === 'CUSTOMER') {
        setError('Unauthorized access. Please use the customer login.');
        setLoading(false);
        return;
      }
      
      if (!isAdminLogin && ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF', 'THERAPIST'].includes(role)) {
        setError('Staff members must use the staff login portal.');
        setLoading(false);
        return;
      }

      // Tokens are now stored securely in HttpOnly cookies by the backend

      // Set auth state (zustand set() is synchronous — no setTimeout needed)
      setAuth(role, branchId || null, { staffId, customerId, firstName, lastName, email: userEmail });

      // Per-role routing — any unrecognised role goes to /unauthorized
      let destination: string;
      if (role === 'ADMIN' || role === 'MANAGER') {
        destination = '/admin/dashboard';
      } else if (role === 'STAFF' || role === 'RECEPTIONIST' || role === 'THERAPIST') {
        destination = '/staff/dashboard';
      } else if (role === 'CUSTOMER') {
        destination = '/customer/dashboard';
      } else {
        destination = '/unauthorized';
      }

      navigate(destination, { replace: true });

    } catch (err: any) {
      const data = err.response?.data;
      let msg = data?.message;
      
      if (typeof msg === 'string') {
        setError(msg);
      } else if (data?.fieldErrors) {
        setError(Object.values(data.fieldErrors).join(', '));
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isCustomerLogin = window.location.pathname !== '/admin/login' && window.location.pathname !== '/staff/login';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center p-6 relative overflow-hidden bg-on-background selection:bg-primary/30">
      {/* Full screen background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-scrim/60 backdrop-blur-[2px] z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
          alt="Spa background"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none z-10"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-20"
      >
        <Card className="glass-panel p-10 md:p-14 shadow-2xl backdrop-blur-xl border-outline-variant/20 relative overflow-visible">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="font-display-lg text-4xl text-primary tracking-wide mb-2">LUMINA</h1>
            <h2 className="font-headline-sm text-on-surface-variant">Welcome Back</h2>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-4 bg-error/10 text-error text-sm rounded-xl border border-error/20 font-body-md text-center"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <motion.div variants={itemVariants} className="space-y-5">
              <Input 
                label="Email Address"
                type="email" 
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<span className="material-symbols-outlined font-light text-[20px]">mail</span>}
              />
              <div className="relative">
                <Input 
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-end pt-1">
              <Link to="/forgot-password" className="font-label-sm text-xs text-primary hover:opacity-70 transition-opacity uppercase tracking-widest">Forgot Password?</Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full text-white shadow-[0px_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0px_15px_35px_rgba(212,175,55,0.3)]"
              >
                {loading ? 'Entering Sanctuary...' : 'Sign In'}
              </Button>
            </motion.div>
          </form>

          {isCustomerLogin && (
            <motion.div variants={itemVariants} className="mt-10 text-center font-body-sm text-sm text-on-surface-variant">
              <span>Are you new to Lumina? </span>
              <Link to="/register" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1">
                Begin your journey
              </Link>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </main>
  );
};
