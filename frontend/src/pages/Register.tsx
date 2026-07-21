import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import axiosClient from '../api/axiosClient';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTos, setAgreedToTos] = useState(false);
  const [error, setError] = useState<ReactNode>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-outline-variant/30', width: 'w-0' };
    let score = 0;
    if (pass.length > 7) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;
    
    if (score < 2) return { score, label: 'Weak', color: 'bg-error', width: 'w-1/3' };
    if (score < 4) return { score, label: 'Medium', color: 'bg-warning', width: 'w-2/3' };
    return { score, label: 'Strong', color: 'bg-success', width: 'w-full' };
  };
  const strength = getPasswordStrength(formData.password);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    if (!agreedToTos) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setFieldErrors({ password: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number" });
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };
      
      const response = await axiosClient.post('/auth/register', payload);
      const { role, branchId, staffId, customerId } = response.data;
      setAuth(role, branchId || null, { staffId, customerId });
      
      navigate('/customer/dashboard');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(
          <span>
            An account with this email or phone already exists — <Link to="/login" className="underline font-bold hover:text-primary transition-colors">try logging in instead</Link>
          </span>
        );
        return;
      }
      
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      }
      
      const msg = data?.message;
      if (typeof msg === 'string') {
        setError(msg);
      } else if (!data?.fieldErrors) {
        setError('Registration failed. Please check your inputs.');
      } else {
        setError('');
      }
    } finally {
      setLoading(false);
    }
  };

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
    <main className="flex min-h-[100svh] items-center justify-center p-6 relative overflow-x-hidden bg-on-background selection:bg-primary/30">
      {/* Full screen background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-scrim/60 backdrop-blur-[2px] z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1600334089648-b5d9d06b52dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
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
        className="w-full max-w-lg relative z-20 my-12"
      >
        <Card className="glass-panel p-8 md:p-12 shadow-2xl backdrop-blur-xl border-outline-variant/20 relative overflow-visible">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="font-display-lg text-4xl text-primary tracking-wide mb-2">LUMINA</h1>
            <h2 className="font-headline-sm text-on-surface-variant">Create an Account</h2>
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

          <form className="space-y-5" onSubmit={handleRegister}>
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Input 
                  label="First Name"
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!fieldErrors.firstName}
                  icon={<span className="material-symbols-outlined font-light text-[20px]">person</span>}
                />
                {fieldErrors.firstName && <p className="text-error text-xs mt-1 ml-2">{fieldErrors.firstName}</p>}
              </div>
              <div className="flex flex-col">
                <Input 
                  label="Last Name"
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!fieldErrors.lastName}
                />
                {fieldErrors.lastName && <p className="text-error text-xs mt-1 ml-2">{fieldErrors.lastName}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input 
                label="Email Address"
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                error={!!fieldErrors.email}
                icon={<span className="material-symbols-outlined font-light text-[20px]">mail</span>}
              />
              {fieldErrors.email && <p className="text-error text-xs mt-1 ml-2">{fieldErrors.email}</p>}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input 
                label="Phone Number"
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!fieldErrors.phone}
                icon={<span className="material-symbols-outlined font-light text-[20px]">call</span>}
              />
              {fieldErrors.phone && <p className="text-error text-xs mt-1 ml-2">{fieldErrors.phone}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <Input 
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                error={!!fieldErrors.password}
                icon={<span className="material-symbols-outlined font-light text-[20px]">lock</span>}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center z-20"
              >
                <span className="material-symbols-outlined font-light text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
              {fieldErrors.password && <p className="text-error text-xs mt-1 ml-2">{fieldErrors.password}</p>}
              {!fieldErrors.password && <p className="text-on-surface-variant/60 text-[11px] mt-1 ml-2">Must be 8+ characters, include uppercase, lowercase, & number</p>}
              {formData.password && (
                <div className="mt-2 ml-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-on-surface-variant/70 font-medium">Password strength</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-outline-variant/30 rounded-full overflow-hidden flex">
                    <div className={`h-full ${strength.width} ${strength.color} transition-all duration-300 rounded-full`}></div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <Input 
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!fieldErrors.confirmPassword}
                icon={<span className="material-symbols-outlined font-light text-[20px]">lock_reset</span>}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center z-20"
              >
                <span className="material-symbols-outlined font-light text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
              {fieldErrors.confirmPassword && <p className="text-error text-xs mt-1 ml-2">{fieldErrors.confirmPassword}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="tos-checkbox"
                    type="checkbox"
                    required
                    checked={agreedToTos}
                    onChange={(e) => setAgreedToTos(e.target.checked)}
                    className="h-4 w-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary/20 focus:ring-offset-0 focus:ring-2 cursor-pointer transition-all"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="tos-checkbox" className="text-on-surface-variant cursor-pointer">
                    I agree to the <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                  </label>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full text-white shadow-[0px_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0px_15px_35px_rgba(212,175,55,0.3)]"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center font-body-sm text-sm text-on-surface-variant">
            <span>Already part of Lumina? </span>
            <Link to="/login" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1">
              Sign in
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </main>
  );
};
