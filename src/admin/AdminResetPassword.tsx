import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updatePassword } from '../lib/auth';
import { ADMIN_BASE_PATH } from './adminConstants';
import toast from 'react-hot-toast';

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Supabase sends the access_token via URL hash — detect session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate(`${ADMIN_BASE_PATH}/login`), 2500);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update password.');
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
        <div className="mb-6">
          <h1 className="text-lg font-light text-[#FAF8F5]">Set New Password</h1>
          <p className="text-xs text-gray-400 mt-1">Enter and confirm your new admin password.</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/40">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm text-[#FAF8F5]">Password updated! Redirecting to login…</p>
          </div>
        ) : !hasSession ? (
          <div className="py-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-gray-300 mb-4">Invalid or expired reset link.</p>
            <Link to={`${ADMIN_BASE_PATH}/forgot-password`} className="text-xs text-[#C5A046] hover:underline">
              Request a new link
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
                <label className="block text-xs uppercase tracking-wider text-[#C5A046] mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#071309]/80 border border-[#C5A046]/30 rounded-xl pl-10 pr-11 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C5A046] transition-all"
                  />
                  <button type="button" onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" tabIndex={-1}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C5A046] mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#071309]/80 border border-[#C5A046]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C5A046] transition-all"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60">
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
