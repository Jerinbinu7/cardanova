import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_BASE_PATH } from './adminConstants';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      toast.success('Welcome back!');
      navigate(ADMIN_BASE_PATH);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
        setError('Connection Error: Unable to reach authentication server. Please check your internet connection, disable AdBlockers/VPN, or verify Supabase environment variables on your host deployment.');
      } else {
        setError(msg || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#071309] text-[#FAF8F5] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(197,160,70,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C5A046]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C5A046]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to site */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A046] hover:text-white transition-colors bg-[#0D2012]/80 px-4 py-2 rounded-full border border-[#C5A046]/30 backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Public Website
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#0D2012]/90 border border-[#C5A046]/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/images/cardanova-emblem.png" alt="Cardanova Emblem" width={538} height={470}
            className="h-20 w-auto object-contain mb-3 filter drop-shadow-[0_0_16px_rgba(197,160,70,0.35)]"
          />
          <img src="/images/cardanova-wordmark-light.png" alt="Cardanova Spices" width={944} height={232}
            className="h-9 w-auto object-contain"
          />
          <p className="text-[10px] uppercase tracking-widest text-[#C5A046] mt-3 font-semibold">
            CMS & Operations Management
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C5A046] mb-2 font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cardanovaspices.com"
                className="w-full bg-[#071309]/80 border border-[#C5A046]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C5A046] focus:ring-1 focus:ring-[#C5A046] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider text-[#C5A046] font-medium">Password</label>
              <Link to={`${ADMIN_BASE_PATH}/forgot-password`} className="text-[11px] text-[#C5A046]/70 hover:text-[#C5A046] transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#071309]/80 border border-[#C5A046]/30 rounded-xl pl-10 pr-11 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C5A046] focus:ring-1 focus:ring-[#C5A046] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="admin-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-widest text-[#071309] bg-gradient-to-r from-[#C5A046] via-[#DFBF6C] to-[#C5A046] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(197,160,70,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
