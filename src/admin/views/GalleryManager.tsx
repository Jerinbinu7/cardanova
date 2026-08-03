import React, { useEffect, useState } from 'react';
import { cmsService } from '../../services/cmsService';
import { GalleryItemData } from '../../services/mockSanityStore';
import { Upload, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';

export default function GalleryManager() {
  const [gallery, setGallery] = useState<GalleryItemData[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'cultivation' | 'processing' | 'quality' | 'export'>('cultivation');
  const [uploadedImage, setUploadedImage] = useState<string>('');

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    const data = await cmsService.getGallery();
    setGallery(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setUploadedImage(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !uploadedImage) return;

    await cmsService.saveGalleryItem({
      id: '',
      title,
      category,
      image: uploadedImage,
      displayOrder: gallery.length + 1,
    });

    setTitle('');
    setUploadedImage('');
    loadGallery();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this gallery image?')) {
      await cmsService.deleteGalleryItem(id);
      loadGallery();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;

    const newGallery = [...gallery];
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = temp;

    // re-index
    newGallery.forEach((item, i) => {
      item.displayOrder = i + 1;
      cmsService.saveGalleryItem(item);
    });

    setGallery(newGallery);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <h2 className="text-xl font-light text-[#FAF8F5]">Gallery Management CMS</h2>
        <p className="text-xs text-gray-400 mt-1">Upload, categorize, and reorder estate and processing photos</p>
      </div>

      {/* Upload Form */}
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload New Gallery Photo
        </h3>

        <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Image Title / Description</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cardamom Flue Drying Chamber"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="cultivation">Cultivation & Estate</option>
              <option value="processing">Processing & Curing</option>
              <option value="quality">Quality Inspection</option>
              <option value="export">Export & Shipment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Select File</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2 bg-[#C5A046]/10 border border-[#C5A046]/30 rounded-xl text-xs text-[#C5A046] cursor-pointer hover:bg-[#C5A046]/20 flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {uploadedImage ? 'Photo Selected' : 'Choose File'}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Add Image
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {gallery.map((item, idx) => (
          <div key={item.id} className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden group shadow-lg">
            <div className="relative h-44">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#071309]/80 text-[10px] text-[#C5A046] uppercase border border-[#C5A046]/30">
                {item.category}
              </div>
            </div>
            <div className="p-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[#FAF8F5] line-clamp-1">{item.title}</p>
                <p className="text-[10px] text-gray-400">Order: #{item.displayOrder}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded bg-[#071309] text-gray-300 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === gallery.length - 1}
                  className="p-1 rounded bg-[#071309] text-gray-300 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded bg-red-950/60 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
