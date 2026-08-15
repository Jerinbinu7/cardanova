import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, X, Search, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  uploadProductImage, deleteProductImage, saveProductSpecifications,
  saveProductGrades, generateSlug, type ProductWithRelations
} from '../../services/productsService';
import { getCategories } from '../../services/categoriesService';
import type { CategoryRow, ProductRow, ProductImageRow } from '../../types/database';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonRow } from '../components/Skeleton';

type TabId = 'basic' | 'images' | 'specs' | 'grades' | 'seo';

const EMPTY_PRODUCT: Partial<ProductWithRelations> = {
  name: '', slug: '', short_description: '', long_description: '',
  origin: 'Idukki, Kerala, India', availability: 'in_stock',
  featured: false, published: true, display_order: 0,
  export_grade: '', hs_code: '', packaging_info: '',
  seo_title: '', seo_description: '', meta_keywords: '',
  images: [], specifications: [], grades: [],
};

export default function ProductManager() {
  const [products, setProducts]       = useState<ProductWithRelations[]>([]);
  const [categories, setCategories]   = useState<CategoryRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [editing, setEditing]         = useState<Partial<ProductWithRelations> | null>(null);
  const [isModal, setIsModal]         = useState(false);
  const [activeTab, setActiveTab]     = useState<TabId>('basic');
  const [deleteTarget, setDeleteTarget] = useState<ProductWithRelations | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving]           = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.short_description?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing({ ...EMPTY_PRODUCT, images: [], specifications: [], grades: [] }); setActiveTab('basic'); setIsModal(true); };
  const openEdit   = (p: ProductWithRelations) => { setEditing({ ...p }); setActiveTab('basic'); setIsModal(true); };
  const closeModal = () => { setIsModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name) { toast.error('Product name is required'); return; }
    setSaving(true);
    try {
      const payload: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'> = {
        name:              editing.name!,
        slug:              editing.slug || generateSlug(editing.name!),
        short_description: editing.short_description ?? null,
        long_description:  editing.long_description ?? null,
        origin:            editing.origin ?? null,
        category_id:       editing.category_id ?? null,
        availability:      editing.availability ?? 'in_stock',
        featured:          editing.featured ?? false,
        published:         editing.published ?? true,
        display_order:     editing.display_order ?? 0,
        export_grade:      editing.export_grade ?? null,
        hs_code:           editing.hs_code ?? null,
        packaging_info:    editing.packaging_info ?? null,
        main_image_url:    editing.main_image_url ?? null,
        seo_title:         editing.seo_title ?? null,
        seo_description:   editing.seo_description ?? null,
        meta_keywords:     editing.meta_keywords ?? null,
      };

      let saved: ProductRow;
      if (editing.id) {
        saved = await updateProduct(editing.id, payload);
      } else {
        saved = await createProduct(payload);
      }

      // Save specs & grades
      if (editing.specifications) {
        await saveProductSpecifications(saved.id, editing.specifications.map((s) => ({ label: s.label, value: s.value })));
      }
      if (editing.grades) {
        await saveProductGrades(saved.id, editing.grades.map((g) => ({
          grade_name: g.grade_name, size_mm: g.size_mm ?? undefined,
          density: g.density ?? undefined, description: g.description ?? undefined,
        })));
      }

      toast.success(editing.id ? 'Product updated!' : 'Product created!');
      closeModal();
      load();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteProduct(deleteTarget.id); toast.success('Product deleted.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const handleTogglePublish = async (p: ProductWithRelations) => {
    try { await updateProduct(p.id, { published: !p.published }); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleMovePosition = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filtered.length) return;

    const itemA = filtered[index];
    const itemB = filtered[targetIndex];

    const orderA = itemA.display_order ?? (index + 1);
    const orderB = itemB.display_order ?? (targetIndex + 1);

    let newOrderA = orderB;
    let newOrderB = orderA;
    if (newOrderA === newOrderB) {
      newOrderA = direction === 'up' ? orderB - 1 : orderB + 1;
      newOrderB = orderA;
    }

    try {
      await Promise.all([
        updateProduct(itemA.id, { display_order: newOrderA }),
        updateProduct(itemB.id, { display_order: newOrderB }),
      ]);
      toast.success('Product position updated!');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUploadImage = async (files: File[]) => {
    if (!editing?.id) { toast.error('Save the product first to upload images.'); return; }
    setUploadProgress(10);
    try {
      for (const file of files) {
        const img = await uploadProductImage(editing.id, file, (p) => setUploadProgress(p));
        setEditing((prev) => {
          if (!prev) return prev;
          const imgs = [...(prev.images ?? []), img];
          const mainUrl = prev.main_image_url || img.url;
          return { ...prev, images: imgs, main_image_url: mainUrl };
        });
      }
      toast.success('Image(s) uploaded!');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setUploadProgress(0), 1500); }
  };

  const handleSetMainImage = async (url: string) => {
    if (!editing?.id) return;
    try {
      await updateProduct(editing.id, { main_image_url: url });
      setEditing((prev) => prev ? { ...prev, main_image_url: url } : prev);
      toast.success('Set as main cover image!');
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteImage = async (img: ProductImageRow) => {
    if (!editing) return;
    try {
      await deleteProductImage(img);
      const remaining = (editing.images ?? []).filter((i) => i.id !== img.id);
      const newMain = editing.main_image_url === img.url ? (remaining[0]?.url ?? null) : editing.main_image_url;
      setEditing((prev) => prev ? { ...prev, images: remaining, main_image_url: newMain } : prev);
      if (editing.id && editing.main_image_url === img.url) {
        await updateProduct(editing.id, { main_image_url: newMain });
      }
      toast.success('Image removed.');
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'basic',  label: 'Basic Info' },
    { id: 'images', label: 'Images' },
    { id: 'specs',  label: 'Specifications' },
    { id: 'grades', label: 'Grades' },
    { id: 'seo',    label: 'SEO' },
  ];

  const input = (label: string, value: string, onChange: (v: string) => void, placeholder = '', required = false, type = 'text') => (
    <div>
      <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">{label}{required && ' *'}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all" />
    </div>
  );

  const textarea = (label: string, value: string, onChange: (v: string) => void, rows = 3) => (
    <div>
      <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all resize-none" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Product Catalog</h2>
          <p className="text-xs text-gray-400 mt-1">Manage spice products, grades, images, and SEO</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full sm:w-56 bg-[#071309] border border-[#C5A046]/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all" />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-lg shrink-0">
            <Plus className="w-4 h-4" /> New Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#FAF8F5]">
            <thead className="bg-[#071309]/80 text-[#C5A046] uppercase text-[11px] tracking-wider border-b border-[#C5A046]/20">
              <tr>
                <th className="p-4 text-center">Pos</th>
                <th className="p-4">Product</th>
                <th className="p-4 hidden md:table-cell">Category</th>
                <th className="p-4 hidden lg:table-cell">Grades</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A046]/10">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                : filtered.length === 0
                  ? <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No products found.</td></tr>
                  : filtered.map((p, index) => (
                    <tr key={p.id} className="hover:bg-[#C5A046]/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <span translate="no" className="w-6 h-6 flex items-center justify-center font-mono text-xs text-[#C5A046] font-bold bg-[#C5A046]/10 rounded border border-[#C5A046]/30 shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMovePosition(index, 'up')}
                              className="p-0.5 rounded bg-[#071309] hover:bg-[#C5A046]/20 text-[#C5A046] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move position up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === filtered.length - 1}
                              onClick={() => handleMovePosition(index, 'down')}
                              className="p-0.5 rounded bg-[#071309] hover:bg-[#C5A046]/20 text-[#C5A046] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move position down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {(p.main_image_url || p.images?.[0]?.url)
                            ? <img src={p.main_image_url || p.images?.[0]?.url} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-[#C5A046]/30 shrink-0" />
                            : <div className="w-12 h-12 rounded-lg bg-[#C5A046]/10 border border-[#C5A046]/20 shrink-0 flex items-center justify-center text-[10px] text-[#C5A046]/40">No img</div>
                          }
                          <div>
                            <p className="font-medium text-sm text-[#FAF8F5]">{p.name}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{p.short_description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs text-gray-300 capitalize">{(p.category as any)?.name ?? '—'}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-xs text-gray-400">{p.grades?.length ?? 0} grades</td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            try {
                              await updateProduct(p.id, { featured: !p.featured });
                              toast.success(p.featured ? 'Removed from Main Page' : 'Featured on Main Page (Max 4 displayed)');
                              load();
                            } catch (e: any) { toast.error(e.message); }
                          }}
                          title="Toggle Main Page Visibility"
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border cursor-pointer transition-all ${
                            p.featured
                              ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-sm hover:bg-amber-900/80'
                              : 'bg-gray-900/80 text-gray-400 border-gray-750 hover:border-gray-600 hover:text-gray-300'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                          {p.featured ? 'Main Page' : 'Catalogue Only'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleTogglePublish(p)}
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border cursor-pointer transition-all ${
                            p.published ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-gray-900 text-gray-400 border-gray-700'
                          }`}>
                          {p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {p.published ? 'Live' : 'Draft'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20 transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModal && editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-3xl my-4 sm:my-8 shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#C5A046]/20">
              <h3 className="text-base sm:text-lg font-light text-[#FAF8F5]">{editing.id ? 'Edit Product' : 'Create Product'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#C5A046]/20 overflow-x-auto scrollbar-none px-2">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 text-[11px] sm:text-xs uppercase tracking-wider shrink-0 transition-colors ${
                    activeTab === t.id ? 'text-[#C5A046] border-b-2 border-[#C5A046]' : 'text-gray-400 hover:text-white'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave}>
              <div className="p-4 sm:p-6 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
                {/* BASIC TAB */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {input('Product Name', editing.name ?? '', (v) => setEditing((p) => ({ ...p, name: v, slug: generateSlug(v) })), 'e.g. Kerala Green Cardamom', true)}
                      {input('Slug', editing.slug ?? '', (v) => setEditing((p) => ({ ...p, slug: v })), 'auto-generated')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Category</label>
                        <select value={editing.category_id ?? ''} onChange={(e) => setEditing((p) => ({ ...p, category_id: e.target.value || null }))}
                          className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all">
                          <option value="">— Select Category —</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Availability</label>
                        <select value={editing.availability ?? 'in_stock'} onChange={(e) => setEditing((p) => ({ ...p, availability: e.target.value as any }))}
                          className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all">
                          <option value="in_stock">In Stock</option>
                          <option value="seasonal">Seasonal</option>
                          <option value="on_request">On Request</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>
                    {textarea('Short Description', editing.short_description ?? '', (v) => setEditing((p) => ({ ...p, short_description: v })))}
                    {textarea('Full Description', editing.long_description ?? '', (v) => setEditing((p) => ({ ...p, long_description: v })), 5)}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {input('Origin', editing.origin ?? '', (v) => setEditing((p) => ({ ...p, origin: v })), 'Idukki, Kerala, India')}
                      {input('Golden Label / Badge', editing.export_grade ?? '', (v) => setEditing((p) => ({ ...p, export_grade: v })), 'e.g. 8.5 mm / Extra Bold / Flagship')}
                      {input('HS Code', editing.hs_code ?? '', (v) => setEditing((p) => ({ ...p, hs_code: v })), 'e.g. 0908.31')}
                    </div>
                    {textarea('Packaging Information', editing.packaging_info ?? '', (v) => setEditing((p) => ({ ...p, packaging_info: v })), 2)}
                    <div className="grid grid-cols-2 gap-4">
                      {input('Display Order', String(editing.display_order ?? 0), (v) => setEditing((p) => ({ ...p, display_order: parseInt(v) || 0 })), '0', false, 'number')}
                    </div>
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 uppercase font-medium">
                        <input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing((p) => ({ ...p, featured: e.target.checked }))} className="accent-[#C5A046]" />
                        Show on Main Page (Featured)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 uppercase font-medium">
                        <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing((p) => ({ ...p, published: e.target.checked }))} className="accent-[#C5A046]" />
                        Published
                      </label>
                    </div>
                  </div>
                )}

                {/* IMAGES TAB */}
                {activeTab === 'images' && (
                  <div className="space-y-4">
                    {!editing.id && (
                      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300">
                        Save the product first (click "Save Product" on the Basic Info tab), then return here to upload images.
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(editing.images ?? []).map((img) => {
                        const isMain = editing.main_image_url === img.url;
                        return (
                          <div key={img.id} className={`relative group rounded-xl overflow-hidden border aspect-square ${isMain ? 'border-[#C5A046] ring-2 ring-[#C5A046]/40' : 'border-[#C5A046]/30'}`}>
                            <img src={img.url} alt={img.alt_text ?? 'Product'} className="w-full h-full object-cover" />
                            {isMain && (
                              <span className="absolute top-1 left-1 bg-[#C5A046] text-[#071309] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                                Cover
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                              {!isMain && (
                                <button type="button" onClick={() => handleSetMainImage(img.url)}
                                  className="text-[10px] bg-[#C5A046] text-[#071309] font-medium px-2 py-1 rounded-md hover:brightness-110">
                                  Set Cover
                                </button>
                              )}
                              <button type="button" onClick={() => handleDeleteImage(img)}
                                className="text-[10px] bg-red-600 text-white font-medium px-2 py-1 rounded-md hover:bg-red-700">
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <FileUpload label="Add Images" accept="image" multiple onFiles={handleUploadImage} progress={uploadProgress} disabled={!editing.id} />
                  </div>
                )}

                {/* SPECS TAB */}
                {activeTab === 'specs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">Add key specification rows for this product.</p>
                      <button type="button" onClick={() => setEditing((p) => ({ ...p, specifications: [...(p?.specifications ?? []), { id: '', product_id: '', label: '', value: '', sort_order: 0 }] }))}
                        className="flex items-center gap-1.5 text-xs text-[#C5A046] hover:underline">
                        <Plus className="w-3.5 h-3.5" /> Add Row
                      </button>
                    </div>
                    {(editing.specifications ?? []).map((spec, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input value={spec.label} onChange={(e) => {
                          const s = [...(editing.specifications ?? [])]; s[idx] = { ...s[idx], label: e.target.value };
                          setEditing((p) => ({ ...p, specifications: s }));
                        }} placeholder="Label (e.g. Moisture)" className="flex-1 bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-sm text-white" />
                        <input value={spec.value} onChange={(e) => {
                          const s = [...(editing.specifications ?? [])]; s[idx] = { ...s[idx], value: e.target.value };
                          setEditing((p) => ({ ...p, specifications: s }));
                        }} placeholder="Value (e.g. < 10.5%)" className="flex-1 bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-sm text-white" />
                        <button type="button" onClick={() => setEditing((p) => ({ ...p, specifications: (p?.specifications ?? []).filter((_, i) => i !== idx) }))}
                          className="p-2 text-red-400 hover:bg-red-950/40 rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* GRADES TAB */}
                {activeTab === 'grades' && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setEditing((p) => ({ ...p, grades: [...(p?.grades ?? []), { id: '', product_id: '', grade_name: '', size_mm: '', density: '', description: '', sort_order: 0 }] }))}
                        className="flex items-center gap-1.5 text-xs text-[#C5A046] hover:underline">
                        <Plus className="w-3.5 h-3.5" /> Add Grade
                      </button>
                    </div>
                    {(editing.grades ?? []).map((g, idx) => (
                      <div key={idx} className="p-3 bg-[#071309]/60 border border-[#C5A046]/20 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#C5A046] font-medium">Grade {idx + 1}</span>
                          <button type="button" onClick={() => setEditing((p) => ({ ...p, grades: (p?.grades ?? []).filter((_, i) => i !== idx) }))}
                            className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input value={g.grade_name} onChange={(e) => { const gr = [...(editing.grades ?? [])]; gr[idx] = { ...gr[idx], grade_name: e.target.value }; setEditing((p) => ({ ...p, grades: gr })); }}
                            placeholder="Grade Name" className="bg-[#0D2012] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-sm text-white col-span-full md:col-span-1" />
                          <input value={g.size_mm ?? ''} onChange={(e) => { const gr = [...(editing.grades ?? [])]; gr[idx] = { ...gr[idx], size_mm: e.target.value }; setEditing((p) => ({ ...p, grades: gr })); }}
                            placeholder="Size (e.g. 8mm+)" className="bg-[#0D2012] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-sm text-white" />
                          <input value={g.density ?? ''} onChange={(e) => { const gr = [...(editing.grades ?? [])]; gr[idx] = { ...gr[idx], density: e.target.value }; setEditing((p) => ({ ...p, grades: gr })); }}
                            placeholder="Density (e.g. 435 g/L)" className="bg-[#0D2012] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-sm text-white" />
                        </div>
                        <input value={g.description ?? ''} onChange={(e) => { const gr = [...(editing.grades ?? [])]; gr[idx] = { ...gr[idx], description: e.target.value }; setEditing((p) => ({ ...p, grades: gr })); }}
                          placeholder="Description" className="w-full bg-[#0D2012] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-sm text-white" />
                      </div>
                    ))}
                  </div>
                )}

                {/* SEO TAB */}
                {activeTab === 'seo' && (
                  <div className="space-y-4">
                    {input('SEO Title', editing.seo_title ?? '', (v) => setEditing((p) => ({ ...p, seo_title: v })), 'Optimized page title (50-60 chars)')}
                    {textarea('SEO Description', editing.seo_description ?? '', (v) => setEditing((p) => ({ ...p, seo_description: v })), 3)}
                    {input('Meta Keywords', editing.meta_keywords ?? '', (v) => setEditing((p) => ({ ...p, meta_keywords: v })), 'Comma-separated keywords')}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center gap-3 p-6 border-t border-[#C5A046]/20">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-gray-600 text-xs text-gray-300 hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
