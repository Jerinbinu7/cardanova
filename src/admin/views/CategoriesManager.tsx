import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '../../services/categoriesService';
import { generateSlug } from '../../services/productsService';
import type { CategoryRow } from '../../types/database';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonRow } from '../components/Skeleton';

export default function CategoriesManager() {
  const [categories, setCategories]   = useState<CategoryRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState<Partial<CategoryRow> | null>(null);
  const [isModal, setIsModal]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [saving, setSaving]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = async () => {
    setLoading(true);
    try { setCategories(await getCategories()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing({ name: '', slug: '', description: '', display_order: 0 }); setIsModal(true); };
  const openEdit   = (c: CategoryRow) => { setEditing({ ...c }); setIsModal(true); };
  const closeModal = () => { setIsModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name) return;
    setSaving(true);
    try {
      const payload = { name: editing.name!, slug: editing.slug || generateSlug(editing.name!), description: editing.description ?? null, image_url: editing.image_url ?? null, display_order: editing.display_order ?? 0 };
      if (editing.id) await updateCategory(editing.id, payload);
      else await createCategory(payload);
      toast.success(editing.id ? 'Category updated!' : 'Category created!');
      closeModal(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteCategory(deleteTarget.id); toast.success('Category deleted.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const handleUploadImage = async (files: File[]) => {
    if (!editing) return;
    setUploadProgress(10);
    try {
      const catId = editing.id || 'new';
      const url = await uploadCategoryImage(catId, files[0]);
      setEditing((p) => p ? { ...p, image_url: url } : p);
      if (editing.id) {
        await updateCategory(editing.id, { image_url: url });
        load();
      }
      toast.success('Image uploaded!');
      setUploadProgress(100);
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setUploadProgress(0), 1500); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Categories</h2>
          <p className="text-xs text-gray-400 mt-1">Manage product category groups</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-[#FAF8F5]">
          <thead className="bg-[#071309]/80 text-[#C5A046] uppercase text-[11px] tracking-wider border-b border-[#C5A046]/20">
            <tr>
              <th className="p-4">Category</th>
              <th className="p-4 hidden md:table-cell">Slug</th>
              <th className="p-4 hidden md:table-cell">Order</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C5A046]/10">
            {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
              : categories.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">No categories yet.</td></tr>
              : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#C5A046]/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {cat.image_url
                        ? <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-[#C5A046]/30" />
                        : <div className="w-10 h-10 rounded-lg bg-[#C5A046]/10 border border-[#C5A046]/20" />
                      }
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        {cat.description && <p className="text-xs text-gray-400 line-clamp-1">{cat.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-xs text-gray-400 font-mono">{cat.slug}</td>
                  <td className="p-4 hidden md:table-cell text-xs text-gray-400">{cat.display_order}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="p-2 rounded-lg bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {isModal && editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#C5A046]/20">
              <h3 className="text-lg font-light">{editing.id ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Name *</label>
                <input required value={editing.name ?? ''} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046]" />
              </div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Slug</label>
                <input value={editing.slug ?? ''} onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#C5A046]" />
              </div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows={3} value={editing.description ?? ''} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] resize-none" />
              </div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Display Order</label>
                <input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing((p) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046]" />
              </div>
              <FileUpload label="Category Image" currentUrl={editing.image_url} accept="image" onFiles={handleUploadImage} progress={uploadProgress} onRemove={() => setEditing((p) => p ? { ...p, image_url: null } : p)} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-gray-600 text-xs text-gray-300 hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Category" message={`Delete "${deleteTarget?.name}"? Products in this category will become uncategorized.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
