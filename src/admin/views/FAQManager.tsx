import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../../services/faqService';
import type { FaqRow } from '../../types/database';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/Skeleton';

export default function FAQManager() {
  const [faqs, setFaqs]               = useState<FaqRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState<Partial<FaqRow> | null>(null);
  const [isModal, setIsModal]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FaqRow | null>(null);
  const [saving, setSaving]           = useState(false);

  const load = async () => {
    setLoading(true);
    try { setFaqs(await getFaqs(false)); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing({ question: '', answer: '', published: true, display_order: faqs.length }); setIsModal(true); };
  const openEdit   = (f: FaqRow) => { setEditing({ ...f }); setIsModal(true); };
  const closeModal = () => { setIsModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.question || !editing?.answer) return;
    setSaving(true);
    try {
      if (editing.id) await updateFaq(editing.id, { question: editing.question, answer: editing.answer, published: editing.published, display_order: editing.display_order });
      else await createFaq({ question: editing.question, answer: editing.answer, published: editing.published ?? true, display_order: editing.display_order ?? 0 });
      toast.success(editing.id ? 'FAQ updated!' : 'FAQ created!');
      closeModal(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteFaq(deleteTarget.id); toast.success('FAQ deleted.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const inputClass = "w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046]";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">FAQ Manager</h2>
          <p className="text-xs text-gray-400 mt-1">Edit frequently asked questions displayed on the website</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>
        : faqs.length === 0 ? <div className="text-center py-16 text-gray-400 text-sm">No FAQs yet.</div>
        : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl p-5 flex gap-4">
                <div className="text-gray-600 pt-0.5"><GripVertical className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium text-[#FAF8F5]">{faq.question}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!faq.published && <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-700">Draft</span>}
                      <button onClick={() => openEdit(faq)} className="p-1.5 rounded-lg bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(faq)} className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {isModal && editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#C5A046]/20">
              <h3 className="text-lg font-light">{editing.id ? 'Edit FAQ' : 'New FAQ'}</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Question *</label>
                <input required value={editing.question ?? ''} onChange={(e) => setEditing((p) => ({ ...p, question: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Answer *</label>
                <textarea required rows={5} value={editing.answer ?? ''} onChange={(e) => setEditing((p) => ({ ...p, answer: e.target.value }))} className={`${inputClass} resize-none`} />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-300 uppercase cursor-pointer">
                <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing((p) => ({ ...p, published: e.target.checked }))} className="accent-[#C5A046]" /> Published
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-gray-600 text-xs text-gray-300 hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete FAQ" message={`Delete this FAQ?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
