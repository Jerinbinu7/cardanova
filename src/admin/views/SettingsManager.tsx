import React, { useState } from 'react';
import { getSanityConfig } from '../../services/sanityClient';
import { adminAuth } from '../../services/adminAuth';
import { Database, Key, Shield, Check, Save } from 'lucide-react';

export default function SettingsManager() {
  const currentSanity = getSanityConfig();

  const [projectId, setProjectId] = useState(currentSanity.projectId);
  const [dataset, setDataset] = useState(currentSanity.dataset);
  const [token, setToken] = useState(currentSanity.token);

  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveSanity = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sanity_project_id', projectId);
    localStorage.setItem('sanity_dataset', dataset);
    localStorage.setItem('sanity_token', token);
    setSavedMsg('Sanity project settings updated! Reloading connection...');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    adminAuth.updateCredentials(newUsername, newPassword || undefined);
    setSavedMsg('Admin credentials successfully updated!');
    setNewPassword('');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">System Settings & Sanity Integration</h2>
          <p className="text-xs text-gray-400 mt-1">Configure live Sanity Cloud API keys, database connections, and Admin credentials</p>
        </div>
        {savedMsg && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Check className="w-4 h-4" /> {savedMsg}
          </span>
        )}
      </div>

      {/* Connection Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
        currentSanity.isConfigured
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              {currentSanity.isConfigured ? 'Live Sanity Cloud Connected' : 'Running in Local Storage Fallback Mode'}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {currentSanity.isConfigured
                ? `Project ID: ${currentSanity.projectId} | Dataset: ${currentSanity.dataset}`
                : 'Sanity credentials not detected. Full local CRUD is active. Enter credentials below to sync with Sanity.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sanity Credentials Form */}
      <form onSubmit={handleSaveSanity} className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2 flex items-center gap-2">
          <Database className="w-4 h-4" /> Sanity Project Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Sanity Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="e.g. abc123xyz"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Dataset Name</label>
            <input
              type="text"
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              placeholder="production"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-300 mb-1">Sanity API Token (Write/Editor Access)</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="sk..."
            className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white font-mono"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs rounded-xl uppercase tracking-wider cursor-pointer hover:brightness-110"
          >
            <Save className="w-4 h-4" /> Save Sanity Connection
          </button>
        </div>
      </form>

      {/* Admin Account Credentials Form */}
      <form onSubmit={handleSaveSecurity} className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Update Admin Login Credentials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Admin Username</label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">New Password (Leave blank to keep unchanged)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs rounded-xl uppercase tracking-wider cursor-pointer hover:brightness-110"
          >
            <Key className="w-4 h-4" /> Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
