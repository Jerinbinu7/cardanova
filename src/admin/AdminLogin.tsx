import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { adminAuth } from '../services/adminAuth';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onReturnToSite: () => void;
}

export default function AdminLogin({ onSuccess, onReturnToSite }: AdminLoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const res = adminAuth.login(username, password);
      setIsLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Authentication failed. Please check credentials.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#071309] text-[#FAF8F5] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decorative Glow & Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(197,160,70,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C5A046]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C5A046]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Public Site Button */}
      <button
        onClick={onReturnToSite}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A046] hover:text-white transition-colors bg-[#0D2012]/80 px-4 py-2 rounded-full border border-[#C5A046]/30 backdrop-blur-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Public Website
      </button>

      {/* Cardanova Luxury Admin Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#0D2012]/90 border border-[#C5A046]/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/images/cardanova-emblem.png"
            alt="Cardanova Emblem"
            width={538}
            height={470}
            className="h-20 w-auto object-contain mb-3 filter drop-shadow-[0_0_16px_rgba(197,160,70,0.35)]"
          />
          <img
            src="/images/cardanova-wordmark-light.png"
            alt="Cardanova Spices — Exporting Nature's Finest"
            width={944}
            height={232}
            className="h-9 w-auto object-contain"
          />
          <p className="text-[10px] uppercase tracking-widest text-[#C5A046] mt-3 font-semibold">
            CMS & Operations Management Desk
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C5A046] mb-2 font-medium">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full bg-[#071309]/80 border border-[#C5A046]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C5A046] focus:ring-1 focus:ring-[#C5A046] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C5A046] mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#071309]/80 border border-[#C5A046]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C5A046] focus:ring-1 focus:ring-[#C5A046] transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-widest text-[#071309] bg-gradient-to-r from-[#C5A046] via-[#DFBF6C] to-[#C5A046] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(197,160,70,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-[#C5A046]/10 text-center space-y-3">
          <p className="text-[11px] text-gray-400">
            Default credentials: <code className="text-[#C5A046]">admin</code> / <code className="text-[#C5A046]">cardanova2026</code>
          </p>
          <button
            type="button"
            onClick={() => {
              adminAuth.resetDefaultCredentials();
              setUsername('admin');
              setPassword('');
              setError('');
              alert('Credentials have been reset to defaults.\nUsername: admin\nPassword: cardanova2026');
            }}
            className="text-[11px] text-[#C5A046]/70 hover:text-[#C5A046] underline underline-offset-2 transition-colors cursor-pointer"
          >
            Reset to Default Credentials
          </button>
        </div>
      </motion.div>
    </div>
  );
}
