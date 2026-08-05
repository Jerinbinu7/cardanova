import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, uploadTestimonialImage } from '../../services/testimonialsService';
import type { TestimonialRow } from '../../types/database';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/Skeleton';

export default function TestimonialsManager() {
  const [items, setItems]             = useState<TestimonialRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState<Partial<TestimonialRow> | null>(null);
  const [isModal, setIsModal]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialRow | null>(null);
  const [saving, setSaving]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = async () => {
    setLoading(true);
    try { setItems(await getAllTestimonials()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing({ customer_name: '', country: '', company: '', review: '', rating: 5, featured: false, published: true, display_order: 0 }); setIsModal(true); };
  const openEdit   = (t: TestimonialRow) => { setEditing({ ...t }); setIsModal(true); };
  const closeModal = () => { setIsModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.customer_name || !editing?.review) return;
    setSaving(true);
    try {
      const payload = {
        customer_name: editing.customer_name!, country: editing.country ?? null, company: editing.company ?? null,
        review: editing.review!, rating: editing.rating ?? 5, image_url: editing.image_url ?? null,
        featured: editing.featured ?? false, published: editing.published ?? true, display_order: editing.display_order ?? 0,
      };
      if (editing.id) await updateTestimonial(editing.id, payload);
      else await createTestimonial(payload);
      toast.success(editing.id ? 'Updated!' : 'Created!');
      closeModal(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteTestimonial(deleteTarget); toast.success('Deleted.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const handleUpload = async (files: File[]) => {
    if (!editing) return;
    setUploadProgress(10);
    try {
      const id = editing.id || 'new';
      const url = await uploadTestimonialImage(id, files[0], (p) => setUploadProgress(p));
      setEditing((p) => p ? { ...p, image_url: url } : p);
      if (editing.id) {
        await updateTestimonial(editing.id, { image_url: url });
        load();
      }
      toast.success('Photo uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setUploadProgress(0), 1500); }
  };

  const inputClass = "w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046]";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Testimonials</h2>
          <p className="text-xs text-gray-400 mt-1">Manage customer reviews and ratings</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>
        : items.length === 0 ? <div className="text-center py-16 text-gray-400 text-sm">No testimonials yet.</div>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((t) => (
              <div key={t.id} className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  {t.image_url
                    ? <img src={t.image_url} alt={t.customer_name} className="w-12 h-12 rounded-full object-cover border border-[#C5A046]/30 shrink-0" />
                    : <div className="w-12 h-12 rounded-full bg-[#C5A046]/10 border border-[#C5A046]/20 shrink-0 flex items-center justify-center text-[#C5A046] font-bold">{t.customer_name[0]}</div>
                  }
                  <div className="flex-1">
                    <p className="font-medium text-sm text-[#FAF8F5]">{t.customer_name}</p>
                    <p className="text-xs text-[#C5A046]/80">{[t.company, t.country].filter(Boolean).join(', ')}</p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.featured && <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">Featured</span>}
                    {!t.published && <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-700">Draft</span>}
                  </div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-3 italic">"{t.review}"</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)} className="flex items-center gap-1.5 text-xs text-[#C5A046] bg-[#C5A046]/10 px-3 py-1.5 rounded-lg hover:bg-[#C5A046]/20"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => setDeleteTarget(t)} className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 px-3 py-1.5 rounded-lg hover:bg-red-900/60"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {isModal && editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#C5A046]/20">
              <h3 className="text-lg font-light">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Customer Name *</label>
                  <input required value={editing.customer_name ?? ''} onChange={(e) => setEditing((p) => ({ ...p, customer_name: e.target.value }))} className={inputClass} /></div>
                <div><label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Country</label>
                  <input value={editing.country ?? ''} onChange={(e) => setEditing((p) => ({ ...p, country: e.target.value }))} className={inputClass} /></div>
              </div>
              <div><label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Company</label>
                <input value={editing.company ?? ''} onChange={(e) => setEditing((p) => ({ ...p, company: e.target.value }))} className={inputClass} /></div>
              <div><label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Review *</label>
                <textarea required rows={4} value={editing.review ?? ''} onChange={(e) => setEditing((p) => ({ ...p, review: e.target.value }))} className={`${inputClass} resize-none`} /></div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setEditing((p) => ({ ...p, rating: n }))}>
                      <Star className={`w-6 h-6 cursor-pointer transition-colors ${n <= (editing.rating ?? 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-600 hover:text-amber-400'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-xs text-gray-300 uppercase cursor-pointer">
                  <input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing((p) => ({ ...p, featured: e.target.checked }))} className="accent-[#C5A046]" /> Featured
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 uppercase cursor-pointer">
                  <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing((p) => ({ ...p, published: e.target.checked }))} className="accent-[#C5A046]" /> Published
                </label>
              </div>
              <FileUpload label="Customer Photo" currentUrl={editing.image_url} accept="image" onFiles={handleUpload} progress={uploadProgress} onRemove={() => setEditing((p) => p ? { ...p, image_url: null } : p)} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-gray-600 text-xs text-gray-300 hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Testimonial" message={`Delete review from "${deleteTarget?.customer_name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
