import React, { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSEOSettings, upsertSEOSettings } from '../../services/seoService';
import type { SeoSettingsRow } from '../../types/database';
import { SkeletonText } from '../components/Skeleton';

const PAGES = ['global', 'home', 'about', 'products', 'origin', 'contact'];

export default function SEOManager() {
  const [seoMap, setSeoMap]   = useState<Record<string, Partial<SeoSettingsRow>>>({});
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('global');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    getAllSEOSettings().then((rows) => {
      const map: Record<string, Partial<SeoSettingsRow>> = {};
      rows.forEach((r) => { map[r.page] = r; });
      PAGES.forEach((p) => { if (!map[p]) map[p] = { page: p }; });
      setSeoMap(map);
    }).finally(() => setLoading(false));
  }, []);

  const current = seoMap[activePage] ?? { page: activePage };
  const update = (key: keyof SeoSettingsRow, value: string) => {
    setSeoMap((m) => ({ ...m, [activePage]: { ...m[activePage], [key]: value } }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertSEOSettings(activePage, current);
      toast.success(`SEO for "${activePage}" saved!`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <SkeletonText lines={8} />;

  const inputClass = "w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">SEO Manager</h2>
          <p className="text-xs text-gray-400 mt-1">Configure meta titles, descriptions, and Open Graph for each page</p>
        </div>
        {saved && <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40"><Check className="w-4 h-4" /> Saved!</span>}
      </div>

      <div className="flex overflow-x-auto gap-2 pb-1">
        {PAGES.map((p) => (
          <button key={p} onClick={() => setActivePage(p)}
            className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider shrink-0 transition-all capitalize ${
              activePage === p ? 'bg-[#C5A046] text-[#071309]' : 'bg-[#0D2012]/80 text-gray-300 border border-[#C5A046]/20 hover:border-[#C5A046]/50'
            }`}>
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-5">
        <div>
          <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">
            Meta Title <span className="text-gray-500">(50–60 chars recommended)</span>
          </label>
          <input value={current.meta_title ?? ''} onChange={(e) => update('meta_title', e.target.value)} className={inputClass} maxLength={120} />
          <p className="text-[11px] text-gray-500 mt-1">{(current.meta_title?.length ?? 0)} characters</p>
        </div>
        <div>
          <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">
            Meta Description <span className="text-gray-500">(120–160 chars recommended)</span>
          </label>
          <textarea rows={3} value={current.meta_description ?? ''} onChange={(e) => update('meta_description', e.target.value)} className={`${inputClass} resize-none`} maxLength={300} />
          <p className="text-[11px] text-gray-500 mt-1">{(current.meta_description?.length ?? 0)} characters</p>
        </div>
        <div>
          <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Meta Keywords</label>
          <input value={current.meta_keywords ?? ''} onChange={(e) => update('meta_keywords', e.target.value)} placeholder="cardamom export, kerala spices, AGEB..." className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Canonical URL</label>
          <input value={current.canonical_url ?? ''} onChange={(e) => update('canonical_url', e.target.value)} placeholder="https://cardanovaspices.com/..." className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Open Graph Image URL</label>
          <input value={current.og_image_url ?? ''} onChange={(e) => update('og_image_url', e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : `Save ${activePage} SEO`}
          </button>
        </div>
      </form>
    </div>
  );
}
