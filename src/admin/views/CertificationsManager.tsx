import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCertifications, createCertification, updateCertification, deleteCertification, uploadCertificationImage, uploadCertificationPdf } from '../../services/certificationsService';
import type { CertificationRow } from '../../types/database';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/Skeleton';

export default function CertificationsManager() {
  const [certs, setCerts]             = useState<CertificationRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState<Partial<CertificationRow> | null>(null);
  const [isModal, setIsModal]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CertificationRow | null>(null);
  const [saving, setSaving]           = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const [pdfProgress, setPdfProgress] = useState(0);

  const load = async () => {
    setLoading(true);
    try { setCerts(await getCertifications()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing({ title: '', issuing_body: '', description: '', is_active: true, display_order: 0 }); setIsModal(true); };
  const openEdit   = (c: CertificationRow) => { setEditing({ ...c }); setIsModal(true); };
  const closeModal = () => { setIsModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title) return;
    setSaving(true);
    try {
      const payload: Omit<CertificationRow, 'id' | 'created_at' | 'updated_at'> = {
        title: editing.title!, issuing_body: editing.issuing_body ?? null, description: editing.description ?? null,
        image_url: editing.image_url ?? null, pdf_url: editing.pdf_url ?? null,
        issue_date: editing.issue_date ?? null, expiry_date: editing.expiry_date ?? null,
        is_active: editing.is_active ?? true, display_order: editing.display_order ?? 0,
      };
      if (editing.id) await updateCertification(editing.id, payload);
      else await createCertification(payload);
      toast.success(editing.id ? 'Updated!' : 'Created!');
      closeModal(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteCertification(deleteTarget); toast.success('Certification deleted.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const handleUploadImage = async (files: File[]) => {
    if (!editing) return;
    setImgProgress(10);
    try {
      const certId = editing.id || 'new';
      const url = await uploadCertificationImage(certId, files[0], (p) => setImgProgress(p));
      setEditing((p) => p ? { ...p, image_url: url } : p);
      if (editing.id) {
        await updateCertification(editing.id, { image_url: url });
        load();
      }
      toast.success('Image uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setImgProgress(0), 1500); }
  };

  const handleUploadPdf = async (files: File[]) => {
    if (!editing) return;
    setPdfProgress(10);
    try {
      const certId = editing.id || 'new';
      const url = await uploadCertificationPdf(certId, files[0], (p) => setPdfProgress(p));
      setEditing((p) => p ? { ...p, pdf_url: url } : p);
      if (editing.id) {
        await updateCertification(editing.id, { pdf_url: url });
        load();
      }
      toast.success('PDF uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setPdfProgress(0), 1500); }
  };

  const inputClass = "w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046]";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Certifications</h2>
          <p className="text-xs text-gray-400 mt-1">Manage export certifications and compliance documents</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg">
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map((i) => <SkeletonCard key={i} />)}</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No certifications yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certs.map((c) => (
            <div key={c.id} className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl p-5 flex gap-4 hover:border-[#C5A046]/40 transition-colors">
              <div className="shrink-0">
                {c.image_url
                  ? <img src={c.image_url} alt={c.title} className="w-16 h-16 rounded-xl object-cover border border-[#C5A046]/30" />
                  : <div className="w-16 h-16 rounded-xl bg-[#C5A046]/10 border border-[#C5A046]/20 flex items-center justify-center"><FileText className="w-6 h-6 text-[#C5A046]/50" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-[#FAF8F5] leading-snug">{c.title}</p>
                    {c.issuing_body && <p className="text-xs text-[#C5A046]/80 mt-0.5">{c.issuing_body}</p>}
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.is_active ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-gray-900 text-gray-500 border border-gray-700'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => openEdit(c)} className="flex items-center gap-1.5 text-xs text-[#C5A046] bg-[#C5A046]/10 px-3 py-1.5 rounded-lg hover:bg-[#C5A046]/20">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 px-3 py-1.5 rounded-lg hover:bg-red-900/60">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                  {c.pdf_url && (
                    <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-950/40 px-3 py-1.5 rounded-lg hover:bg-blue-900/60">
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModal && editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#C5A046]/20">
              <h3 className="text-lg font-light">{editing.id ? 'Edit Certification' : 'New Certification'}</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Title *</label>
                <input required value={editing.title ?? ''} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Issuing Body</label>
                <input value={editing.issuing_body ?? ''} onChange={(e) => setEditing((p) => ({ ...p, issuing_body: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows={3} value={editing.description ?? ''} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Issue Date</label>
                  <input type="date" value={editing.issue_date ?? ''} onChange={(e) => setEditing((p) => ({ ...p, issue_date: e.target.value || null }))} className={`${inputClass} text-gray-300`} />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input type="date" value={editing.expiry_date ?? ''} onChange={(e) => setEditing((p) => ({ ...p, expiry_date: e.target.value || null }))} className={`${inputClass} text-gray-300`} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 uppercase">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing((p) => ({ ...p, is_active: e.target.checked }))} className="accent-[#C5A046]" />
                Active / Visible on website
              </label>
              <FileUpload label="Certificate Image" currentUrl={editing.image_url} accept="image" onFiles={handleUploadImage} progress={imgProgress} onRemove={() => setEditing((p) => p ? { ...p, image_url: null } : p)} />
              <FileUpload label="Certificate PDF" currentUrl={editing.pdf_url} accept="pdf" onFiles={handleUploadPdf} progress={pdfProgress} onRemove={() => setEditing((p) => p ? { ...p, pdf_url: null } : p)} />
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

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Certification" message={`Delete "${deleteTarget?.title}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
