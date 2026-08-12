import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, uploadGalleryImage } from '../../services/galleryService';
import type { GalleryItemRow, GalleryFolder } from '../../types/database';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/Skeleton';

const FOLDERS: { id: GalleryFolder; label: string }[] = [
  { id: 'factory',      label: 'Factory' },
  { id: 'warehouse',    label: 'Warehouse' },
  { id: 'products',     label: 'Products' },
  { id: 'packaging',    label: 'Packaging' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'events',       label: 'Events' },
  { id: 'homepage_hero', label: 'Homepage Hero Slides' },
];

export default function GalleryManager() {
  const [activeFolder, setActiveFolder] = useState<GalleryFolder>('factory');
  const [items, setItems]               = useState<GalleryItemRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItemRow | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newTitle, setNewTitle]         = useState('');
  const [showUpload, setShowUpload]     = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await getGalleryItems(activeFolder)); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [activeFolder]);

  const handleUpload = async (files: File[]) => {
    if (!newTitle.trim()) { toast.error('Please enter a title for the image.'); return; }
    setUploadProgress(10);
    try {
      for (const file of files) {
        const url = await uploadGalleryImage(activeFolder, file, (p) => setUploadProgress(p));
        await createGalleryItem({ title: newTitle, folder: activeFolder, image_url: url, display_order: items.length });
      }
      toast.success('Image(s) uploaded!');
      setNewTitle('');
      setShowUpload(false);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setUploadProgress(0), 1500); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteGalleryItem(deleteTarget); toast.success('Image deleted.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const newItems = [...items];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    // Swap
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    
    // Update display order sequentially
    const updated = newItems.map((item, i) => ({ ...item, display_order: i }));
    setItems(updated);
    
    try {
      const { reorderGalleryItems } = await import('../../services/galleryService');
      await reorderGalleryItems(updated.map(i => ({ id: i.id, display_order: i.display_order })));
      toast.success('Images reordered successfully.');
    } catch (e: any) {
      toast.error('Failed to reorder images.');
      load(); // Revert on failure
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Gallery Manager</h2>
          <p className="text-xs text-gray-400 mt-1">Upload and manage images across all gallery folders</p>
        </div>
        <button onClick={() => setShowUpload((s) => !s)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg">
          <Plus className="w-4 h-4" /> Upload Images
        </button>
      </div>

      {/* Folder tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {FOLDERS.map((f) => (
          <button key={f.id} onClick={() => setActiveFolder(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider shrink-0 transition-all ${
              activeFolder === f.id ? 'bg-[#C5A046] text-[#071309]' : 'bg-[#0D2012]/80 text-gray-300 border border-[#C5A046]/20 hover:border-[#C5A046]/50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-[#0D2012]/80 border border-[#C5A046]/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-[#C5A046] font-medium">Upload to {FOLDERS.find((f) => f.id === activeFolder)?.label}</h3>
            <button onClick={() => setShowUpload(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1.5">Image Title *</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. High Altitude Plantation"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046]" />
          </div>
          <FileUpload label="Choose Images" accept="image" multiple onFiles={handleUpload} progress={uploadProgress} />
        </div>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No images in this folder yet.</p>
          <button onClick={() => setShowUpload(true)} className="text-xs text-[#C5A046] hover:underline mt-2">Upload the first image →</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item, idx) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border border-[#C5A046]/20 aspect-square bg-[#0D2012]/80 flex flex-col">
              <img src={item.image_url} alt={item.title} className="w-full flex-1 object-cover transition-transform group-hover:scale-105 duration-300" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                <p className="text-xs text-white text-center line-clamp-2">{item.title}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleMove(idx, 'left')} 
                    disabled={idx === 0}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#C5A046]/80 text-[#071309] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#C5A046] transition-colors"
                    title="Move Left/Earlier"
                  >
                    &larr;
                  </button>
                  <button 
                    onClick={() => setDeleteTarget(item)} 
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleMove(idx, 'right')} 
                    disabled={idx === items.length - 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#C5A046]/80 text-[#071309] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#C5A046] transition-colors"
                    title="Move Right/Later"
                  >
                    &rarr;
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-2 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/10">Order: {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Image" message={`Delete "${deleteTarget?.title}"? This will also remove the image from Supabase Storage.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
