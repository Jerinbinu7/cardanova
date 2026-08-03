import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';

export default function AboutManager() {
  const [saved, setSaved] = useState(false);
  const [story, setStory] = useState(
    'Founded in the cardamom hills of Idukki, Cardanova Spices LLP stands as a premier producer and exporter of single-origin Indian spices.'
  );
  const [mission, setMission] = useState(
    'To deliver untainted, high-grade cardamom and pepper directly from native Kerala estates to global culinary and medicinal markets.'
  );
  const [vision, setVision] = useState(
    'To establish Cardanova as the gold standard of sustainable, origin-certified B2B spice supply chains globally.'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cardanova_about_cms', JSON.stringify({ story, mission, vision }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">About Page & Story CMS</h2>
          <p className="text-xs text-gray-400 mt-1">Manage corporate heritage story, mission, vision, and leadership profiles</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Check className="w-4 h-4" /> Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">
            Company Story
          </h3>
          <textarea
            rows={4}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-3 text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">
              Mission Statement
            </h3>
            <textarea
              rows={3}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">
              Vision Statement
            </h3>
            <textarea
              rows={3}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-3 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider cursor-pointer shadow-xl hover:brightness-110"
          >
            <Save className="w-4 h-4" /> Save About Page Content
          </button>
        </div>
      </form>
    </div>
  );
}
