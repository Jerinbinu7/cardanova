import React, { useEffect, useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAboutContent, updateAboutContent, uploadAboutImage, deleteAboutImage } from '../../services/aboutService';
import type { AboutContentRow } from '../../types/database';
import FileUpload from '../components/FileUpload';
import { SkeletonText } from '../components/Skeleton';

export default function AboutManager() {
  const [content, setContent] = useState<Partial<AboutContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'founders' | 'ceo' | 'images' | 'timeline'>('story');
  const [uploadingFactory, setUploadingFactory] = useState(0);
  const [uploadingWarehouse, setUploadingWarehouse] = useState(0);
  const [uploadingFounder, setUploadingFounder] = useState<number | null>(null);

  useEffect(() => {
    getAboutContent().then((d) => {
      if (d) {
        if (!d.founders || d.founders.length === 0) {
          d.founders = [
            {
              name: 'Akhilkumar K A',
              position: 'Co-Founder',
              photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
              intro: 'A passionate entrepreneur dedicated to delivering premium-quality spices while building lasting relationships with customers and farmers. With a strong focus on quality, transparency, and innovation, he believes every shipment represents the trust of the Cardanova brand.',
              quote: '"Every shipment carries the trust of our brand and the hard work of Kerala\'s spice farmers."',
              linkedin: 'https://linkedin.com',
              facebook: 'https://facebook.com',
              email: 'akhilkumar@cardanovaspices.com',
            },
            {
              name: 'Amal Babu',
              position: 'Co-Founder',
              photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
              intro: 'Driven by a vision to connect the finest spices of Kerala with international markets, Amal focuses on customer relationships, business growth, and ensuring every buyer experiences the authenticity and reliability that define Cardanova.',
              quote: '"Building a global brand means ensuring every buyer experiences the pure authenticity of our origin."',
              linkedin: 'https://linkedin.com',
              facebook: 'https://facebook.com',
              email: 'amal@cardanovaspices.com',
            },
          ];
        }
        setContent(d);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await updateAboutContent(content); toast.success('About page saved!'); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleUploadFactory = async (files: File[]) => {
    setUploadingFactory(10);
    try {
      const url = await uploadAboutImage('factory', files[0], (p) => setUploadingFactory(p));
      setContent((c) => ({ ...c, factory_images: [...(c.factory_images ?? []), url] }));
      toast.success('Factory image uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setUploadingFactory(0), 1500); }
  };

  const handleUploadWarehouse = async (files: File[]) => {
    setUploadingWarehouse(10);
    try {
      const url = await uploadAboutImage('warehouse', files[0], (p) => setUploadingWarehouse(p));
      setContent((c) => ({ ...c, warehouse_images: [...(c.warehouse_images ?? []), url] }));
      toast.success('Warehouse image uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setUploadingWarehouse(0), 1500); }
  };

  const removeFactoryImage = async (url: string) => {
    await deleteAboutImage(url).catch(() => {});
    setContent((c) => ({ ...c, factory_images: (c.factory_images ?? []).filter((u) => u !== url) }));
  };

  const removeWarehouseImage = async (url: string) => {
    await deleteAboutImage(url).catch(() => {});
    setContent((c) => ({ ...c, warehouse_images: (c.warehouse_images ?? []).filter((u) => u !== url) }));
  };

  if (loading) return <SkeletonText lines={10} />;

  const inputClass = "w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all";
  const labelClass = "block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5";
  const textareaClass = `${inputClass} resize-none`;
  const tabs = [
    { id: 'story' as const, label: 'Story & Values' },
    { id: 'founders' as const, label: 'Founders' },
    { id: 'ceo' as const, label: 'CEO Message' },
    { id: 'images' as const, label: 'Images' },
    { id: 'timeline' as const, label: 'Timeline' },
  ];

  const handleFounderPhotoUpload = async (founderIdx: number, files: File[]) => {
    setUploadingFounder(founderIdx);
    try {
      const url = await uploadAboutImage('founders', files[0], () => {});
      setContent((c) => {
        const founders = [...(c.founders ?? [])];
        founders[founderIdx] = { ...founders[founderIdx], photo: url };
        return { ...c, founders };
      });
      toast.success('Founder photo uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setUploadingFounder(null); }
  };

  const updateFounder = (idx: number, field: string, value: string) => {
    const founders = [...(content.founders ?? [])];
    founders[idx] = { ...founders[idx], [field]: value };
    setContent((c) => ({ ...c, founders }));
  };

  const addFounder = () => {
    setContent((c) => ({
      ...c,
      founders: [...(c.founders ?? []), { name: '', position: 'Co-Founder', photo: '', intro: '', quote: '', linkedin: '', facebook: '', email: '' }],
    }));
  };

  const removeFounder = (idx: number) => {
    setContent((c) => ({ ...c, founders: (c.founders ?? []).filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <h2 className="text-xl font-light text-[#FAF8F5]">About Page CMS</h2>
        <p className="text-xs text-gray-400 mt-1">Edit company story, mission, vision, CEO message, and gallery</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#C5A046]/20 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-xs uppercase tracking-wider shrink-0 transition-colors ${activeTab === t.id ? 'text-[#C5A046] border-b-2 border-[#C5A046]' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {activeTab === 'story' && (
          <div className="space-y-5">
            <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-4">
              <label className={labelClass}>Company Story</label>
              <textarea rows={5} value={content.company_story ?? ''} onChange={(e) => setContent((c) => ({ ...c, company_story: e.target.value }))} className={textareaClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-2">
                <label className={labelClass}>Mission</label>
                <textarea rows={3} value={content.mission ?? ''} onChange={(e) => setContent((c) => ({ ...c, mission: e.target.value }))} className={textareaClass} />
              </div>
              <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-2">
                <label className={labelClass}>Vision</label>
                <textarea rows={3} value={content.vision ?? ''} onChange={(e) => setContent((c) => ({ ...c, vision: e.target.value }))} className={textareaClass} />
              </div>
            </div>
            <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Core Values</label>
                <button type="button" onClick={() => setContent((c) => ({ ...c, core_values: [...(c.core_values ?? []), { title: '', description: '' }] }))}
                  className="flex items-center gap-1 text-xs text-[#C5A046] hover:underline"><Plus className="w-3.5 h-3.5" /> Add Value</button>
              </div>
              {(content.core_values ?? []).map((v, idx) => (
                <div key={idx} className="flex gap-2">
                  <input value={v.title} onChange={(e) => { const arr = [...(content.core_values ?? [])]; arr[idx] = { ...arr[idx], title: e.target.value }; setContent((c) => ({ ...c, core_values: arr })); }}
                    placeholder="Value title" className={`${inputClass} w-1/3`} />
                  <input value={v.description} onChange={(e) => { const arr = [...(content.core_values ?? [])]; arr[idx] = { ...arr[idx], description: e.target.value }; setContent((c) => ({ ...c, core_values: arr })); }}
                    placeholder="Description" className={`${inputClass} flex-1`} />
                  <button type="button" onClick={() => setContent((c) => ({ ...c, core_values: (c.core_values ?? []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'founders' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-[#C5A046] font-medium">Co-Founders / Team Members</h3>
              <button type="button" onClick={addFounder}
                className="flex items-center gap-1 text-xs text-[#C5A046] hover:underline"><Plus className="w-3.5 h-3.5" /> Add Founder</button>
            </div>
            {(content.founders ?? []).map((f, idx) => (
              <div key={idx} className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#C5A046] uppercase tracking-wider font-semibold">Founder #{idx + 1}</span>
                  <button type="button" onClick={() => removeFounder(idx)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                </div>
                {/* Photo */}
                <div className="flex items-start gap-4">
                  {f.photo && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#C5A046]/30 shrink-0">
                      <img src={f.photo} alt={f.name || 'Founder'} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => updateFounder(idx, 'photo', '')}
                        className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  <div className="flex-1">
                    <FileUpload
                      label={f.photo ? 'Change Photo' : 'Upload Photo'}
                      accept="image"
                      defaultAspect="3:4"
                      onFiles={(files) => handleFounderPhotoUpload(idx, files)}
                      progress={uploadingFounder === idx ? 50 : 0}
                    />
                  </div>
                </div>
                {/* Name & Position */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className={labelClass}>Full Name</label>
                    <input value={f.name} onChange={(e) => updateFounder(idx, 'name', e.target.value)} placeholder="e.g. Akhilkumar K A" className={inputClass} />
                  </div>
                  <div><label className={labelClass}>Position</label>
                    <input value={f.position} onChange={(e) => updateFounder(idx, 'position', e.target.value)} placeholder="e.g. Co-Founder" className={inputClass} />
                  </div>
                </div>
                {/* Intro */}
                <div><label className={labelClass}>Introduction</label>
                  <textarea rows={3} value={f.intro} onChange={(e) => updateFounder(idx, 'intro', e.target.value)} placeholder="Brief bio / description" className={textareaClass} />
                </div>
                {/* Quote */}
                <div><label className={labelClass}>Quote</label>
                  <input value={f.quote} onChange={(e) => updateFounder(idx, 'quote', e.target.value)} placeholder='"Every shipment carries the trust..."' className={inputClass} />
                </div>
                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><label className={labelClass}>LinkedIn URL</label>
                    <input value={f.linkedin} onChange={(e) => updateFounder(idx, 'linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className={inputClass} />
                  </div>
                  <div><label className={labelClass}>Facebook URL</label>
                    <input value={f.facebook} onChange={(e) => updateFounder(idx, 'facebook', e.target.value)} placeholder="https://facebook.com/..." className={inputClass} />
                  </div>
                  <div><label className={labelClass}>Email</label>
                    <input value={f.email} onChange={(e) => updateFounder(idx, 'email', e.target.value)} placeholder="name@cardanovaspices.com" className={inputClass} />
                  </div>
                </div>
              </div>
            ))}
            {(content.founders ?? []).length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No founders added yet.</p>
                <button type="button" onClick={addFounder} className="text-xs text-[#C5A046] hover:underline mt-2">Add the first founder →</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ceo' && (
          <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>CEO Name</label><input value={content.ceo_name ?? ''} onChange={(e) => setContent((c) => ({ ...c, ceo_name: e.target.value }))} className={inputClass} /></div>
              <div><label className={labelClass}>CEO Title</label><input value={content.ceo_title ?? ''} onChange={(e) => setContent((c) => ({ ...c, ceo_title: e.target.value }))} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>CEO Message</label>
              <textarea rows={6} value={content.ceo_message ?? ''} onChange={(e) => setContent((c) => ({ ...c, ceo_message: e.target.value }))} className={textareaClass} />
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-5">
            <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-4">
              <h4 className="text-sm text-[#C5A046] font-medium">Factory Images</h4>
              <div className="flex flex-wrap gap-3">
                {(content.factory_images ?? []).map((url) => (
                  <div key={url} className="relative w-24 h-24 group rounded-xl overflow-hidden border border-[#C5A046]/30">
                    <img src={url} alt="Factory" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFactoryImage(url)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <FileUpload label="Add Factory Image" accept="image" onFiles={handleUploadFactory} progress={uploadingFactory} />
            </div>
            <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-4">
              <h4 className="text-sm text-[#C5A046] font-medium">Warehouse Images</h4>
              <div className="flex flex-wrap gap-3">
                {(content.warehouse_images ?? []).map((url) => (
                  <div key={url} className="relative w-24 h-24 group rounded-xl overflow-hidden border border-[#C5A046]/30">
                    <img src={url} alt="Warehouse" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeWarehouseImage(url)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <FileUpload label="Add Warehouse Image" accept="image" onFiles={handleUploadWarehouse} progress={uploadingWarehouse} />
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm text-[#C5A046] font-medium">Company Timeline</h4>
              <button type="button" onClick={() => setContent((c) => ({ ...c, timeline: [...(c.timeline ?? []), { year: '', title: '', description: '' }] }))}
                className="flex items-center gap-1 text-xs text-[#C5A046] hover:underline"><Plus className="w-3.5 h-3.5" /> Add Entry</button>
            </div>
            {(content.timeline ?? []).map((t, idx) => (
              <div key={idx} className="p-3 bg-[#071309]/60 border border-[#C5A046]/20 rounded-xl space-y-2">
                <div className="flex gap-2">
                  <input value={t.year} onChange={(e) => { const arr = [...(content.timeline ?? [])]; arr[idx] = { ...arr[idx], year: e.target.value }; setContent((c) => ({ ...c, timeline: arr })); }}
                    placeholder="Year" className={`${inputClass} w-24`} />
                  <input value={t.title} onChange={(e) => { const arr = [...(content.timeline ?? [])]; arr[idx] = { ...arr[idx], title: e.target.value }; setContent((c) => ({ ...c, timeline: arr })); }}
                    placeholder="Milestone title" className={`${inputClass} flex-1`} />
                  <button type="button" onClick={() => setContent((c) => ({ ...c, timeline: (c.timeline ?? []).filter((_, i) => i !== idx) }))} className="text-red-400"><X className="w-4 h-4" /></button>
                </div>
                <input value={t.description} onChange={(e) => { const arr = [...(content.timeline ?? [])]; arr[idx] = { ...arr[idx], description: e.target.value }; setContent((c) => ({ ...c, timeline: arr })); }}
                  placeholder="Description" className={inputClass} />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 cursor-pointer shadow-xl disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save About Page'}
          </button>
        </div>
      </form>
    </div>
  );
}
