import React, { useEffect, useState } from 'react';
import { Save, Check, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHomepageContent, updateHomepageContent, uploadHeroBgImage } from '../../services/homepageService';
import type { HomepageContentRow, StatItem, WhyChooseUsFeature } from '../../types/database';
import FileUpload from '../components/FileUpload';
import { SkeletonText } from '../components/Skeleton';

const DEFAULT_WHY_ITEMS: WhyChooseUsFeature[] = [
  {
    title: 'High-Altitude Estates',
    tag: 'Single-Origin Idukki',
    stat: '1,100m',
    statLabel: 'Elevation',
    description: 'Cultivated across 120+ acres in the high ranges of Idukki, Kerala — where altitude, mist, and mineral-rich soil produce cardamom with unrivalled aroma and volatile oil content.',
  },
  {
    title: 'Kerala Farmer Network',
    tag: 'Direct Farmer Sourcing',
    stat: '250+',
    statLabel: 'Farmer Families',
    description: 'Direct partnerships with over 250 local smallholder farming families — ensuring ethical sourcing, fair pricing, and peak pod freshness at every harvest cycle.',
  },
  {
    title: 'Precision Export Grading',
    tag: 'Optical & Sieve Sorting',
    stat: '<9.5%',
    statLabel: 'Moisture Max',
    description: 'Every harvest batch is optically sorted, moisture-tested, and sieve-graded to exact mm dimensions (8.5mm, 8mm, 7.5mm, 7mm). Zero tolerance for sub-standard pods.',
  },
  {
    title: 'Global Port Logistics',
    tag: 'FOB / CIF Cochin',
    stat: '30+',
    statLabel: 'Countries Served',
    description: 'Containerized FCL & LCL delivery via Cochin Port to 30+ countries. Complete phytosanitary, origin certificates, and compliance documentation provided.',
  },
  {
    title: 'Direct Origin Pricing',
    tag: 'No Intermediaries',
    stat: '0',
    statLabel: 'Middlemen',
    description: 'Plantation-direct sourcing eliminates middleman margins — delivering trade-competitive rates for B2B importers, wholesalers, and food manufacturers worldwide.',
  },
  {
    title: 'Vacuum Sealed Freshness',
    tag: 'Aroma Locking Foil',
    stat: '24mo',
    statLabel: 'Shelf Life',
    description: 'Multi-layer food-grade vacuum aluminium foil sealing retains essential volatile oils (>7.5% V/W) for up to 24 months — maximising aroma and potency on arrival.',
  },
];

export default function HomepageManager() {
  const [content, setContent]   = useState<Partial<HomepageContentRow>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    getHomepageContent().then((d) => {
      if (d) {
        let features = d.why_choose_us_features ?? [];
        if (!features || features.length < 6) {
          const merged = DEFAULT_WHY_ITEMS.map((def, idx) => ({
            title: features[idx]?.title || def.title,
            tag: features[idx]?.tag || def.tag,
            stat: features[idx]?.stat || def.stat,
            statLabel: features[idx]?.statLabel || def.statLabel,
            description: features[idx]?.description || def.description,
          }));
          d.why_choose_us_features = merged;
        }
        setContent(d);
      }
    }).finally(() => setLoading(false));
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
          <p className="text-xs text-gray-400 mt-1">Edit hero, stats, CTAs, and all 6 Why Choose Us cards</p>
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
          <div className="flex items-center justify-between border-b border-[#C5A046]/20 pb-2">
            <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium">3. Why Choose Us (All 6 Feature Cards)</h3>
            <button
              type="button"
              onClick={() => {
                const arr = [...(content.why_choose_us_features ?? [])];
                arr.push({ title: 'New Feature', tag: 'Tag', stat: '100%', statLabel: 'Quality', description: 'Description text...' });
                setContent((c) => ({ ...c, why_choose_us_features: arr }));
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#C5A046]/20 text-[#C5A046] hover:bg-[#C5A046]/30 border border-[#C5A046]/30 transition-all flex items-center gap-1 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Feature Card
            </button>
          </div>

          <div>
            <label className={labelClass}>Section Title</label>
            <input value={content.why_choose_us_title ?? ''} onChange={(e) => setContent((c) => ({ ...c, why_choose_us_title: e.target.value }))} className={inputClass} placeholder="e.g. Why Us" />
          </div>

          <div className="space-y-4 pt-2">
            {(content.why_choose_us_features ?? DEFAULT_WHY_ITEMS).map((f, idx) => (
              <div key={idx} className="p-4 bg-[#071309]/80 border border-[#C5A046]/25 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#C5A046]/15 pb-2">
                  <span className="text-xs font-semibold text-[#C5A046] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5A046]" /> Card #{idx + 1}: {f.title || 'Untitled'}
                  </span>
                  {(content.why_choose_us_features ?? []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const arr = [...(content.why_choose_us_features ?? [])];
                        arr.splice(idx, 1);
                        setContent((c) => ({ ...c, why_choose_us_features: arr }));
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-medium px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/30 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-300 font-medium mb-1">Feature Title</label>
                    <input
                      value={f.title}
                      onChange={(e) => {
                        const arr = [...(content.why_choose_us_features ?? [])];
                        arr[idx] = { ...arr[idx], title: e.target.value };
                        setContent((c) => ({ ...c, why_choose_us_features: arr }));
                      }}
                      placeholder="e.g. High-Altitude Estates"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-300 font-medium mb-1">Badge / Tag</label>
                    <input
                      value={f.tag ?? ''}
                      onChange={(e) => {
                        const arr = [...(content.why_choose_us_features ?? [])];
                        arr[idx] = { ...arr[idx], tag: e.target.value };
                        setContent((c) => ({ ...c, why_choose_us_features: arr }));
                      }}
                      placeholder="e.g. Single-Origin Idukki"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-300 font-medium mb-1">Stat Number / Value</label>
                    <input
                      value={f.stat ?? ''}
                      onChange={(e) => {
                        const arr = [...(content.why_choose_us_features ?? [])];
                        arr[idx] = { ...arr[idx], stat: e.target.value };
                        setContent((c) => ({ ...c, why_choose_us_features: arr }));
                      }}
                      placeholder="e.g. 1,100m"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-300 font-medium mb-1">Stat Label</label>
                    <input
                      value={f.statLabel ?? ''}
                      onChange={(e) => {
                        const arr = [...(content.why_choose_us_features ?? [])];
                        arr[idx] = { ...arr[idx], statLabel: e.target.value };
                        setContent((c) => ({ ...c, why_choose_us_features: arr }));
                      }}
                      placeholder="e.g. Elevation"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-300 font-medium mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={f.description}
                    onChange={(e) => {
                      const arr = [...(content.why_choose_us_features ?? [])];
                      arr[idx] = { ...arr[idx], description: e.target.value };
                      setContent((c) => ({ ...c, why_choose_us_features: arr }));
                    }}
                    placeholder="Feature description text..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            ))}
          </div>
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
