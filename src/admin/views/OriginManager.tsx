import { useEffect, useState, useRef } from 'react';
import { Save, Check, Upload, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHomepageContent, updateHomepageContent } from '../../services/homepageService';
import { uploadGalleryImage, createGalleryItem, getGalleryItems, deleteGalleryItem } from '../../services/galleryService';
import { SkeletonText } from '../components/Skeleton';

const DEFAULT_STEPS = [
  {
    step: 1,
    phase: 'Cultivation',
    title: 'Grown in the Clouds',
    loc: 'Idukki High Ranges · 1,100m Elevation',
    desc: 'Cardanova\'s cardamom originates from the misty high-altitude estates of Idukki, Kerala — one of the world\'s most biodiverse spice-growing regions.',
    body: 'At elevations exceeding 1,100 metres, cool temperatures, consistent rainfall, and mineral-rich volcanic soil create the perfect conditions for premium-grade green cardamom with naturally intense volatile oil content exceeding 8.5% V/W.',
    detail: 'Our 120+ acres of estate land are intercropped with shade trees — maintaining soil health and natural biodiversity without synthetic inputs.',
    image: '',
  },
  {
    step: 2,
    phase: 'Hand Harvesting',
    title: 'Handpicked at Peak Ripeness',
    loc: 'September – December · Harvest Season',
    desc: 'Every cardamom pod is harvested by hand — individually plucked at the precise moment of peak maturity.',
    body: 'Our network of 250+ trusted smallholder farming families follows strict harvesting protocols: only pods that pass a visual ripeness check are collected per plant.',
    detail: 'Harvesting by hand ensures zero mechanical damage to the pod skin — critical for preserving the essential oils locked within.',
    image: '',
  },
  {
    step: 3,
    phase: 'Curing & Drying',
    title: 'Flue-Cured for Colour Retention',
    loc: 'Controlled Temperature · 40–55°C',
    desc: 'Immediately after harvest, pods undergo our proprietary flue-curing process — a temperature-controlled curing method.',
    body: 'Unlike sun-drying (which bleaches pods and degrades oils), flue-curing at 40–55°C preserves the natural chlorophyll pigment and locks in volatile oil concentrations.',
    detail: 'Pods are spread on raised bamboo curing beds inside curing chambers — ensuring uniform airflow and consistent moisture reduction to under 9.5%.',
    image: '',
  },
  {
    step: 4,
    phase: 'Grading & Sorting',
    title: 'Precision Optical Grading',
    loc: 'Sieve-Graded · 7.0mm – 8.5mm+',
    desc: 'Post-curing, every batch passes through our multi-stage grading facility.',
    body: 'Pods are first mechanically sieved into size classifications (8.5mm, 8.0mm, 7.5mm, 7.0mm), then optically sorted to remove any discoloured, broken, or off-grade pods.',
    detail: 'Independent lab testing of volatile oil content (>7.5% V/W), moisture levels, and microbial counts is conducted on every export batch.',
    image: '',
  },
  {
    step: 5,
    phase: 'Vacuum Packaging',
    title: 'Aroma-Locked & Sealed',
    loc: 'Multi-Layer Foil · 5kg – 25kg Packs',
    desc: 'Graded cardamom is immediately transferred to our food-grade vacuum packaging line.',
    body: 'Each unit is sealed using multi-layer aluminium foil vacuum packs that maintain an airtight, oxygen-free environment, preserving volatile oil content (>7.5% V/W).',
    detail: 'All packaging materials are food-grade certified. Each pack is labelled with batch number, grade, weight, origin, and packing date for full traceability.',
    image: '',
  },
  {
    step: 6,
    phase: 'Global Export',
    title: 'Shipped to 30+ Countries',
    loc: 'FCL / LCL · FOB & CIF · Cochin Port',
    desc: 'Cardanova exports containerized shipments via Cochin International Container Transshipment Terminal.',
    body: 'We offer both FCL (Full Container Load) and LCL options, with FOB and CIF pricing available.',
    detail: 'Our in-house trade documentation team coordinates with freight forwarders, customs brokers, and inspection agencies to ensure zero shipment delays.',
    image: '',
  },
];

// Map step index to gallery subsection key
const STEP_GALLERY_KEYS = [
  'origin_step_1', 'origin_step_2', 'origin_step_3',
  'origin_step_4', 'origin_step_5', 'origin_step_6',
];

export default function OriginManager() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [heroImage, setHeroImage] = useState('');
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [uploadingStep, setUploadingStep] = useState<number | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const stepInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    Promise.all([
      getHomepageContent(),
      ...STEP_GALLERY_KEYS.map((key) => getGalleryItems(key)),
      getGalleryItems('origin_hero'),
    ]).then(([homepageData, ...galleryResults]) => {
      const heroGallery = galleryResults.pop(); // last one is origin_hero
      
      // Load text content from homepage_content
      let merged = [...DEFAULT_STEPS];
      if (homepageData?.farm_to_export_steps && homepageData.farm_to_export_steps.length > 0) {
        merged = DEFAULT_STEPS.map((def, idx) => {
          const saved = homepageData.farm_to_export_steps![idx];
          if (!saved) return def;
          return {
            ...def,
            step: saved.step || def.step,
            phase: saved.phase || def.phase,
            title: saved.title || def.title,
            loc: saved.loc || def.loc,
            desc: saved.desc || def.desc,
            body: saved.body || def.body,
            detail: saved.detail || def.detail,
            image: saved.image || def.image,
          };
        });
      }

      // Load gallery images per step
      galleryResults.forEach((items, idx) => {
        if (items && (items as any[]).length > 0 && (items as any[])[0].image_url) {
          merged[idx] = { ...merged[idx], image: (items as any[])[0].image_url };
        }
      });

      setSteps(merged);

      // Load hero image
      if (heroGallery && (heroGallery as any[]).length > 0 && (heroGallery as any[])[0].image_url) {
        setHeroImage((heroGallery as any[])[0].image_url);
      }
    }).catch((e) => {
      console.warn('Failed to load origin content', e);
    }).finally(() => setLoading(false));
  }, []);

  const updateStep = (idx: number, field: string, val: string) => {
    setSteps((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const stepsToSave = steps.map((s) => ({
        step: s.step,
        title: s.title,
        loc: s.loc,
        desc: s.desc,
        phase: s.phase,
        body: s.body,
        detail: s.detail,
        image: s.image,
      }));
      await updateHomepageContent({ farm_to_export_steps: stepsToSave } as any);
      toast.success('Our Origin content saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploadingHero(true);
    try {
      const url = await uploadGalleryImage('factory', files[0]);
      // Delete existing hero gallery items
      const existing = await getGalleryItems('origin_hero');
      if (existing) {
        for (const item of existing) {
          await deleteGalleryItem(item);
        }
      }
      await createGalleryItem({
        title: '[origin_hero] Origin Page Hero Background',
        image_url: url,
        folder: 'factory',
        display_order: 0,
      });
      setHeroImage(url);
      toast.success('Hero background updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleStepImageUpload = async (idx: number, files: FileList) => {
    if (!files.length) return;
    setUploadingStep(idx);
    try {
      const galleryKey = STEP_GALLERY_KEYS[idx];
      const dbFolder = idx < 4 ? 'factory' : idx === 4 ? 'packaging' : 'events';
      const url = await uploadGalleryImage(dbFolder as any, files[0]);

      // Delete existing gallery items for this step
      const existing = await getGalleryItems(galleryKey);
      if (existing) {
        for (const item of existing) {
          await deleteGalleryItem(item);
        }
      }

      await createGalleryItem({
        title: `[${galleryKey}] Step ${idx + 1}: ${steps[idx].phase}`,
        image_url: url,
        folder: dbFolder as any,
        display_order: 0,
      });

      updateStep(idx, 'image', url);
      toast.success(`Step ${idx + 1} image updated!`);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingStep(null);
    }
  };

  const handleDeleteStepImage = async (idx: number) => {
    const galleryKey = STEP_GALLERY_KEYS[idx];
    try {
      const existing = await getGalleryItems(galleryKey);
      if (existing) {
        for (const item of existing) {
          await deleteGalleryItem(item);
        }
      }
      updateStep(idx, 'image', '');
      toast.success(`Step ${idx + 1} image removed`);
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  if (loading) return <SkeletonText lines={12} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">🌿 Our Origin Page Manager</h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage the 6 origin journey steps — text, descriptions, and images. Changes sync to the live website & gallery.
          </p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Check className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>

      {/* Hero Background */}
      <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#C5A046] uppercase tracking-wider font-semibold">
            🖼️ Hero Background Image
          </span>
        </div>
        <div className="flex items-center gap-4">
          {heroImage ? (
            <div className="relative group w-40 h-24 rounded-xl overflow-hidden border border-[#C5A046]/30">
              <img src={heroImage} alt="Hero bg" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  className="text-white text-[10px] bg-[#C5A046]/80 px-2 py-1 rounded"
                >
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <div className="w-40 h-24 rounded-xl border-2 border-dashed border-[#C5A046]/30 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div>
            <button
              type="button"
              disabled={uploadingHero}
              onClick={() => heroInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071309] border border-[#C5A046]/30 text-xs text-[#C5A046] hover:bg-[#C5A046]/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadingHero ? 'Uploading…' : 'Upload Hero Image'}
            </button>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleHeroUpload(e.target.files)}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <form onSubmit={handleSave} className="space-y-3">
        {steps.map((st, idx) => {
          const isExpanded = expandedStep === idx;
          return (
            <div
              key={st.step}
              className="bg-[#0D2012]/80 rounded-2xl border border-[#C5A046]/20 shadow-lg overflow-hidden"
            >
              {/* Step Header — collapsible */}
              <button
                type="button"
                onClick={() => setExpandedStep(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#C5A046]/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5A046] to-[#DFBF6C] flex items-center justify-center text-[#071309] text-xs font-bold">
                    {String(st.step).padStart(2, '0')}
                  </span>
                  <div className="text-left">
                    <span className="text-sm text-[#FAF8F5] font-medium">{st.phase || st.title}</span>
                    <span className="text-[10px] text-gray-500 block">{st.loc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {st.image && (
                    <img src={st.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#C5A046]/20" />
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-[#C5A046]/10">
                  {/* Image Upload */}
                  <div className="pt-4">
                    <label className="block text-xs text-gray-300 mb-2">Step Image</label>
                    <div className="flex items-center gap-4">
                      {st.image ? (
                        <div className="relative group w-36 h-24 rounded-xl overflow-hidden border border-[#C5A046]/30">
                          <img src={st.image} alt={`Step ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => stepInputRefs.current[idx]?.click()}
                              className="text-white text-[10px] bg-[#C5A046]/80 px-2 py-1 rounded"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStepImage(idx)}
                              className="text-white text-[10px] bg-red-600/80 px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-36 h-24 rounded-xl border-2 border-dashed border-[#C5A046]/30 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={uploadingStep === idx}
                        onClick={() => stepInputRefs.current[idx]?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#071309] border border-[#C5A046]/30 text-xs text-[#C5A046] hover:bg-[#C5A046]/10 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingStep === idx ? 'Uploading…' : 'Upload'}
                      </button>
                      <input
                        ref={(el) => { stepInputRefs.current[idx] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleStepImageUpload(idx, e.target.files)}
                      />
                    </div>
                  </div>

                  {/* Text Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-300 mb-1">Phase Name</label>
                      <input
                        type="text"
                        value={st.phase}
                        onChange={(e) => updateStep(idx, 'phase', e.target.value)}
                        placeholder="e.g. Cultivation"
                        className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:border-[#C5A046] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => updateStep(idx, 'title', e.target.value)}
                        placeholder="e.g. Grown in the Clouds"
                        className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:border-[#C5A046] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Subtitle / Location</label>
                    <input
                      type="text"
                      value={st.loc}
                      onChange={(e) => updateStep(idx, 'loc', e.target.value)}
                      placeholder="e.g. Idukki High Ranges · 1,100m Elevation"
                      className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:border-[#C5A046] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={st.desc}
                      onChange={(e) => updateStep(idx, 'desc', e.target.value)}
                      className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:border-[#C5A046] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Full Body Text</label>
                    <textarea
                      rows={3}
                      value={st.body}
                      onChange={(e) => updateStep(idx, 'body', e.target.value)}
                      className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:border-[#C5A046] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Additional Detail</label>
                    <textarea
                      rows={2}
                      value={st.detail}
                      onChange={(e) => updateStep(idx, 'detail', e.target.value)}
                      className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:border-[#C5A046] focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider cursor-pointer shadow-xl hover:brightness-110 disabled:opacity-60 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
