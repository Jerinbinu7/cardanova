import React, { useEffect, useState } from 'react';
import { cmsService } from '../../services/cmsService';
import { ProductItem } from '../../services/mockSanityStore';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, Star, X } from 'lucide-react';

export default function ProductManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<ProductItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await cmsService.getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingProduct({
      id: '',
      name: '',
      category: 'cardamom',
      shortDescription: '',
      description: '',
      images: [],
      specifications: [{ label: 'Origin', value: 'Idukki, Kerala, India' }],
      grades: [{ gradeName: 'Extra Bold 8.5mm', sizeMm: '8.5mm+', density: '440 g/L', description: 'Export quality' }],
      packagingOptions: ['5kg Vacuum Foil Pack'],
      isFeatured: false,
      isPublished: true,
      seoTitle: '',
      seoDescription: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await cmsService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleTogglePublish = async (product: ProductItem) => {
    const updated = { ...product, isPublished: !product.isPublished };
    await cmsService.saveProduct(updated);
    loadProducts();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          setEditingProduct((prev) => ({
            ...prev,
            images: [...(prev?.images || []), url],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name) return;

    await cmsService.saveProduct(editingProduct as ProductItem);
    setIsModalOpen(false);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Product Catalog CMS</h2>
          <p className="text-xs text-gray-400 mt-1">Manage spice varieties, grades, packaging specs, and publication status</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Product List Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading product catalog...</div>
      ) : (
        <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#FAF8F5]">
              <thead className="bg-[#071309]/80 text-[#C5A046] uppercase text-[11px] tracking-wider border-b border-[#C5A046]/20">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Grades</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A046]/10">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#C5A046]/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://via.placeholder.com/80'}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[#C5A046]/30 shrink-0"
                        />
                        <div>
                          <p className="font-medium text-sm text-[#FAF8F5]">{p.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{p.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-xs text-gray-300">{p.category}</td>
                    <td className="p-4 text-xs text-gray-400">{p.grades?.length || 0} Grades Defined</td>
                    <td className="p-4">
                      {p.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border cursor-pointer transition-all ${
                          p.isPublished
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-gray-900 text-gray-400 border-gray-700'
                        }`}
                      >
                        {p.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {p.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 rounded-lg bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 text-[#FAF8F5] shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center border-b border-[#C5A046]/20 pb-4">
              <h3 className="text-lg font-light text-[#FAF8F5]">
                {editingProduct.id ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'cardamom'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  >
                    <option value="cardamom">Cardamom</option>
                    <option value="pepper">Black Pepper</option>
                    <option value="turmeric">Turmeric</option>
                    <option value="other">Other Spices</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#C5A046] uppercase mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#C5A046] uppercase mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-xs text-[#C5A046] uppercase mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {editingProduct.images?.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 group rounded-lg overflow-hidden border border-[#C5A046]/30">
                      <img src={img} alt="Product" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct((prev) => ({
                            ...prev,
                            images: prev?.images?.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#C5A046]/10 border border-[#C5A046]/40 rounded-xl text-xs text-[#C5A046] cursor-pointer hover:bg-[#C5A046]/20">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {/* Price, Rating, Review Count, Export Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Price per Kg (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.pricePerKg ?? 2500}
                    onChange={(e) => setEditingProduct({ ...editingProduct, pricePerKg: Number(e.target.value) })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Rating (1–5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingProduct.rating ?? 4.8}
                    onChange={(e) => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Review Count</label>
                  <input
                    type="number"
                    value={editingProduct.reviewCount ?? 50}
                    onChange={(e) => setEditingProduct({ ...editingProduct, reviewCount: Number(e.target.value) })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs uppercase text-gray-300">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="accent-[#C5A046]"
                  />
                  Featured Product
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs uppercase text-gray-300">
                  <input
                    type="checkbox"
                    checked={editingProduct.exportTag ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, exportTag: e.target.checked })}
                    className="accent-[#C5A046]"
                  />
                  Export Grade Badge
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs uppercase text-gray-300">
                  <input
                    type="checkbox"
                    checked={editingProduct.isPublished ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                    className="accent-[#C5A046]"
                  />
                  Published
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#C5A046]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-xs text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
