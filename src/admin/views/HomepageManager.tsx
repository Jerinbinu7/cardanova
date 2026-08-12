import React, { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHomepageContent, updateHomepageContent, uploadHeroBgImage } from '../../services/homepageService';
import type { HomepageContentRow, StatItem } from '../../types/database';
import FileUpload from '../components/FileUpload';
import { SkeletonText } from '../components/Skeleton';

export default function HomepageManager() {
  const [content, setContent]   = useState<Partial<HomepageContentRow>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    getHomepageContent().then((d) => { if (d) setContent(d); }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHomepageContent(content);
      toast.success('Homepage content saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleHeroUpload = async (files: File[]) => {
    setUploadProgress(10);
    try {
      const url = await uploadHeroBgImage(files[0], (p) => setUploadProgress(p));
      setContent((c) => ({ ...c, hero_bg_image_url: url }));
      
      const { createGalleryItem } = await import('../../services/galleryService');
      await createGalleryItem({
        title: '[homepage_hero] Homepage Hero Background',
        folder: 'homepage_hero',
        image_url: url,
        display_order: 0,
      });

      toast.success('Hero background uploaded and synced to Gallery!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setUploadProgress(0), 1500); }
  };

  const updateStat = (idx: number, key: keyof StatItem, value: string) => {
    const stats = [...(content.stats ?? [])];
    stats[idx] = { ...stats[idx], [key]: value };
    setContent((c) => ({ ...c, stats }));
  };

  if (loading) return <div className="space-y-6"><SkeletonText lines={8} /></div>;

  const inputClass = "w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all";
  const labelClass = "block text-xs text-gray-300 mb-1.5";
  const sectionClass = "bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Homepage CMS</h2>
          <p className="text-xs text-gray-400 mt-1">Edit hero, stats, CTAs, and all homepage sections</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Check className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section */}
        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">1. Hero Banner</h3>
          <div>
            <label className={labelClass}>Hero Title</label>
            <input value={content.hero_title ?? ''} onChange={(e) => setContent((c) => ({ ...c, hero_title: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hero Subtitle</label>
            <textarea rows={2} value={content.hero_subtitle ?? ''} onChange={(e) => setContent((c) => ({ ...c, hero_subtitle: e.target.value }))} className={`${inputClass} resize-none`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Primary CTA Text</label>
              <input value={content.hero_cta_primary_text ?? ''} onChange={(e) => setContent((c) => ({ ...c, hero_cta_primary_text: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Primary CTA URL</label>
              <input value={content.hero_cta_primary_url ?? ''} onChange={(e) => setContent((c) => ({ ...c, hero_cta_primary_url: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Secondary CTA Text</label>
              <input value={content.hero_cta_secondary_text ?? ''} onChange={(e) => setContent((c) => ({ ...c, hero_cta_secondary_text: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Secondary CTA URL</label>
              <input value={content.hero_cta_secondary_url ?? ''} onChange={(e) => setContent((c) => ({ ...c, hero_cta_secondary_url: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <FileUpload label="Hero Background Image" currentUrl={content.hero_bg_image_url} accept="image" onFiles={handleHeroUpload} progress={uploadProgress} onRemove={() => setContent((c) => ({ ...c, hero_bg_image_url: null }))} />
        </div>

        {/* Stats */}
        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">2. Key Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(content.stats ?? []).map((stat, idx) => (
              <div key={idx} className="p-3 bg-[#071309] border border-[#C5A046]/20 rounded-xl space-y-2">
                <input value={stat.value} onChange={(e) => updateStat(idx, 'value', e.target.value)} placeholder="30+" className={`${inputClass} text-xs`} />
                <input value={stat.label} onChange={(e) => updateStat(idx, 'label', e.target.value)} placeholder="Export Countries" className={`${inputClass} text-xs`} />
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">3. Why Choose Us</h3>
          <div>
            <label className={labelClass}>Section Title</label>
            <input value={content.why_choose_us_title ?? ''} onChange={(e) => setContent((c) => ({ ...c, why_choose_us_title: e.target.value }))} className={inputClass} />
          </div>
          {(content.why_choose_us_features ?? []).map((f, idx) => (
            <div key={idx} className="p-3 bg-[#071309]/60 border border-[#C5A046]/20 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={f.title} onChange={(e) => {
                const arr = [...(content.why_choose_us_features ?? [])]; arr[idx] = { ...arr[idx], title: e.target.value };
                setContent((c) => ({ ...c, why_choose_us_features: arr }));
              }} placeholder="Feature title" className={inputClass} />
              <input value={f.description} onChange={(e) => {
                const arr = [...(content.why_choose_us_features ?? [])]; arr[idx] = { ...arr[idx], description: e.target.value };
                setContent((c) => ({ ...c, why_choose_us_features: arr }));
              }} placeholder="Feature description" className={inputClass} />
            </div>
          ))}
        </div>

        {/* Footer tagline */}
        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">4. Footer Tagline</h3>
          <input value={content.footer_tagline ?? ''} onChange={(e) => setContent((c) => ({ ...c, footer_tagline: e.target.value }))} className={inputClass} />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 cursor-pointer shadow-xl disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Homepage'}
          </button>
        </div>
      </form>
    </div>
  );
}
