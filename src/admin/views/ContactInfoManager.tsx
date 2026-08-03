import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';

export default function ContactInfoManager() {
  const [saved, setSaved] = useState(false);
  const [address, setAddress] = useState('Cardanova Spices LLP, Main Processing Plant, Vandanmedu, Idukki District, Kerala - 685551, India');
  const [phonePrimary, setPhonePrimary] = useState('+91 94470 00000');
  const [phoneSecondary, setPhoneSecondary] = useState('+91 4868 270000');
  const [emailSales, setEmailSales] = useState('export@cardanova.in');
  const [emailSupport, setEmailSupport] = useState('info@cardanova.in');
  const [whatsAppNumber, setWhatsAppNumber] = useState('+919447000000');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      'cardanova_contact_cms',
      JSON.stringify({ address, phonePrimary, phoneSecondary, emailSales, emailSupport, whatsAppNumber })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Contact Information CMS</h2>
          <p className="text-xs text-gray-400 mt-1">Manage processing plant address, export phone lines, emails, and WhatsApp</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Check className="w-4 h-4" /> Information Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-5">
        <div>
          <label className="block text-xs text-[#C5A046] uppercase mb-1">Corporate HQ & Processing Plant Address</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-3 text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Primary Phone</label>
            <input
              type="text"
              value={phonePrimary}
              onChange={(e) => setPhonePrimary(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Export Desk Direct Line</label>
            <input
              type="text"
              value={phoneSecondary}
              onChange={(e) => setPhoneSecondary(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Sales / Export Email</label>
            <input
              type="email"
              value={emailSales}
              onChange={(e) => setEmailSales(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">General Inquiries Email</label>
            <input
              type="email"
              value={emailSupport}
              onChange={(e) => setEmailSupport(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">WhatsApp Quick Connect Number</label>
            <input
              type="text"
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider cursor-pointer shadow-xl hover:brightness-110"
          >
            <Save className="w-4 h-4" /> Save Contact Details
          </button>
        </div>
      </form>
    </div>
  );
}
