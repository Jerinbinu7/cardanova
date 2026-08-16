import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from '../lib/auth';
import { ADMIN_BASE_PATH } from './adminConstants';

export default function AdminForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071309] text-[#FAF8F5] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(197,160,70,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0D2012]/90 border border-[#C5A046]/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
      >
        <Link to={`${ADMIN_BASE_PATH}/login`} className="flex items-center gap-2 text-xs text-[#C5A046] mb-6 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        <div className="mb-6">
          <h1 className="text-lg font-light text-[#FAF8F5]">Reset Password</h1>
          <p className="text-xs text-gray-400 mt-1">Enter your admin email to receive a password reset link.</p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/40">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-[#FAF8F5] font-medium">Check your email</p>
              <p className="text-xs text-gray-400 mt-1">
                A password reset link has been sent to <span className="text-[#C5A046]">{email}</span>.
              </p>
            </div>
            <Link to={`${ADMIN_BASE_PATH}/login`} className="text-xs text-[#C5A046] hover:underline mt-2">
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C5A046] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cardanovaspices.com"
                    className="w-full bg-[#071309]/80 border border-[#C5A046]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C5A046] transition-all"
                  />
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
