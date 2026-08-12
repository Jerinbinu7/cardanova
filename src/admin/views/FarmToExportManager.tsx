import React, { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHomepageContent, updateHomepageContent } from '../../services/homepageService';
import { SkeletonText } from '../components/Skeleton';

const DEFAULT_STEPS = [
  { step: 1, title: 'Hand Harvesting', loc: 'Vandanmedu & Bodimettu Estates', desc: 'Ripe cardamom capsules hand-picked at peak essential oil maturity.' },
  { step: 2, title: 'Controlled Flue Curing', loc: 'Processing Facility, Idukki', desc: '24-hour slow indirect heating maintaining 100% natural emerald green hue.' },
  { step: 3, title: 'Laser Grading & Sieving', loc: 'Quality Lab', desc: 'Sorted into 8.5mm AGEB, 8mm AGB, and 7.5mm grades with 0% foreign matter.' },
  { step: 4, title: 'Nitrogen Vacuum Packing', loc: 'Export Terminal', desc: 'Sealed in 5kg high-barrier aluminium foil bags inside 25kg master cartons.' },
];

export default function FarmToExportManager() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(DEFAULT_STEPS);

  useEffect(() => {
    getHomepageContent().then((data) => {
      if (data?.farm_to_export_steps && data.farm_to_export_steps.length > 0) {
        setSteps(data.farm_to_export_steps);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHomepageContent({ farm_to_export_steps: steps } as any);
      toast.success('Farm to Export steps saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save steps');
    } finally {
      setSaving(false);
    }
  };

  const updateStep = (idx: number, field: string, val: string) => {
    const copy = [...steps];
    (copy[idx] as any)[field] = val;
    setSteps(copy);
  };

  if (loading) return <SkeletonText lines={8} />;

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Farm to Export Journey CMS</h2>
          <p className="text-xs text-gray-400 mt-1">Manage processing steps, origin trace locations, and quality checks</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40">
            <Check className="w-4 h-4" /> Steps Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {steps.map((st, idx) => (
          <div key={st.step} className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#C5A046] uppercase tracking-wider font-semibold">
                Step {st.step}: {st.title}
              </span>
              <span className="text-[10px] text-gray-400">Order #{st.step}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Step Title</label>
                <input
                  type="text"
                  value={st.title}
                  onChange={(e) => updateStep(idx, 'title', e.target.value)}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Location / Facility</label>
                <input
                  type="text"
                  value={st.loc}
                  onChange={(e) => updateStep(idx, 'loc', e.target.value)}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={st.desc}
                onChange={(e) => updateStep(idx, 'desc', e.target.value)}
                className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider cursor-pointer shadow-xl hover:brightness-110 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Traceability Steps'}
          </button>
        </div>
      </form>
    </div>
  );
}

