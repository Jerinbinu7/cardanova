import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';

export default function HomepageManager() {
  const [saved, setSaved] = useState(false);
  const [heroHeadline, setHeroHeadline] = useState('Single-Origin Cardamom & Premium Spices From Idukki');
  const [heroSubtext, setHeroSubtext] = useState('Cultivated in high-altitude estates of Kerala. Processed to European & Middle Eastern export standards.');
  const [primaryCta, setPrimaryCta] = useState('Request B2B Export Quote');
  const [secondaryCta, setSecondaryCta] = useState('Explore Spice Catalog');

  const [stat1Val, setStat1Val] = useState('30+');
  const [stat1Label, setStat1Label] = useState('Export Destinations');
  const [stat2Val, setStat2Val] = useState('8.5mm+');
  const [stat2Label, setStat2Label] = useState('AGEB Extra Bold Pod Size');
  const [stat3Val, setStat3Val] = useState('100%');
  const [stat3Label, setStat3Label] = useState('Traceable Single Origin');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cardanova_homepage_cms', JSON.stringify({
      heroHeadline,
      heroSubtext,
      primaryCta,
      secondaryCta,
      stat1Val,
      stat1Label,
      stat2Val,
      stat2Label,
      stat3Val,
      stat3Label,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Homepage CMS Manager</h2>
          <p className="text-xs text-gray-400 mt-1">Edit headlines, Hero slide text, Call to Actions, and statistics</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Check className="w-4 h-4" /> Homepage Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section Card */}
        <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">
            1. Hero Banner Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Main Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Sub-headline Description</label>
              <textarea
                rows={2}
                value={heroSubtext}
                onChange={(e) => setHeroSubtext(e.target.value)}
                className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-3 text-sm text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Primary CTA Button Text</label>
                <input
                  type="text"
                  value={primaryCta}
                  onChange={(e) => setPrimaryCta(e.target.value)}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Secondary CTA Button Text</label>
                <input
                  type="text"
                  value={secondaryCta}
                  onChange={(e) => setSecondaryCta(e.target.value)}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">
            2. Key Performance Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-[#071309] border border-[#C5A046]/20 rounded-xl space-y-2">
              <label className="block text-xs text-[#C5A046]">Stat 1 Value</label>
              <input
                type="text"
                value={stat1Val}
                onChange={(e) => setStat1Val(e.target.value)}
                className="w-full bg-[#0D2012] border border-[#C5A046]/30 rounded-lg p-2 text-xs text-white"
              />
              <label className="block text-xs text-gray-400">Stat 1 Label</label>
              <input
                type="text"
                value={stat1Label}
                onChange={(e) => setStat1Label(e.target.value)}
                className="w-full bg-[#0D2012] border border-[#C5A046]/30 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="p-3 bg-[#071309] border border-[#C5A046]/20 rounded-xl space-y-2">
              <label className="block text-xs text-[#C5A046]">Stat 2 Value</label>
              <input
                type="text"
                value={stat2Val}
                onChange={(e) => setStat2Val(e.target.value)}
                className="w-full bg-[#0D2012] border border-[#C5A046]/30 rounded-lg p-2 text-xs text-white"
              />
              <label className="block text-xs text-gray-400">Stat 2 Label</label>
              <input
                type="text"
                value={stat2Label}
                onChange={(e) => setStat2Label(e.target.value)}
                className="w-full bg-[#0D2012] border border-[#C5A046]/30 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="p-3 bg-[#071309] border border-[#C5A046]/20 rounded-xl space-y-2">
              <label className="block text-xs text-[#C5A046]">Stat 3 Value</label>
              <input
                type="text"
                value={stat3Val}
                onChange={(e) => setStat3Val(e.target.value)}
                className="w-full bg-[#0D2012] border border-[#C5A046]/30 rounded-lg p-2 text-xs text-white"
              />
              <label className="block text-xs text-gray-400">Stat 3 Label</label>
              <input
                type="text"
                value={stat3Label}
                onChange={(e) => setStat3Label(e.target.value)}
                className="w-full bg-[#0D2012] border border-[#C5A046]/30 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-xl"
          >
            <Save className="w-4 h-4" /> Save Homepage Content
          </button>
        </div>
      </form>
    </div>
  );
}
