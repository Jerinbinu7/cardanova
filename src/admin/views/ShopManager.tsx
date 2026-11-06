import React, { useEffect, useState } from 'react';
import {
  Save,
  Edit2,
  X,
  IndianRupee,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Store,
  Package,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { domesticService, DEFAULT_RETAIL_PRODUCTS, UPI_CONFIG, getPackagingLabel } from '../../services/domesticService';
import type { RetailPacketProduct, WeightVariant } from '../../types/domestic';
import { SkeletonCard } from '../components/Skeleton';
import FileUpload from '../components/FileUpload';
import { uploadFile } from '../../services/storageService';

const inputClass = 'w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all';
const labelClass = 'block text-[10px] text-[#C5A046] uppercase tracking-wider font-medium mb-1.5';

const PACKAGING_PRESETS = [
  'Glass Bottle',
  'Gift Box',
  'Zipper Pouch',
  'Tin Can',
  'Master Pouch',
  'Airtight Jar',
  'Bulk Sack',
];

const DEFAULT_NEW_PRODUCT: RetailPacketProduct = {
  id: '',
  name: 'New Cardamom Packet',
  gradeBadge: 'Net Weight',
  packagingBadge: 'Zipper Pouch',
  podDiameter: '8mm+ Estate Bold',
  tagline: 'Single-origin green cardamom handpicked from Idukki highlands.',
  description: 'Directly sourced from Idukki, Kerala. Premium single-origin green cardamom cured at source to preserve rich essential aroma oils.',
  image: '/images/pouch-8.5mm-royal.jpg',
  colorTheme: 'emerald',
  accentColor: '#112D15',
  featured: false,
  inStock: true,
  variants: [
    {
      weight: '250g',
      packagingType: 'Zipper Pouch',
      label: '250g Zipper Pouch',
      priceInr: 1299,
      originalPriceInr: 1799,
      inStock: true,
    },
  ],
  specs: {
    origin: 'Idukki, Kerala, India',
    speciality: '100% Single Origin Green Cardamom',
    grade: 'Flue-Cured Estate Reserve',
    moisture: 'Target moisture specification: ≤9.5%',
    essentialOil: 'Naturally rich in volatile aroma oils',
    packaging: 'Aroma-Lock Resealable Pouch',
    shelfLife: '24 Months',
  },
};

export default function ShopManager() {
  const [products, setProducts] = useState<RetailPacketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<RetailPacketProduct | null>(null);
  const [isModal, setIsModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = () => {
    setLoading(true);
    try {
      const prods = domesticService.getProducts();
      const normalized = prods.map((p) => ({
        ...p,
        packagingBadge: p.packagingBadge || getPackagingLabel(p),
      }));
      setProducts(normalized);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    const newId = `pack-${Date.now().toString().slice(-6)}`;
    const freshProduct: RetailPacketProduct = {
      ...JSON.parse(JSON.stringify(DEFAULT_NEW_PRODUCT)),
      id: newId,
    };
    setEditingProduct(freshProduct);
    setIsCreating(true);
    setIsModal(true);
    setUploadProgress(0);
  };

  const openEdit = (product: RetailPacketProduct) => {
    const clone: RetailPacketProduct = JSON.parse(JSON.stringify(product));
    if (!clone.packagingBadge) {
      clone.packagingBadge = getPackagingLabel(clone);
    }
    setEditingProduct(clone);
    setIsCreating(false);
    setIsModal(true);
    setUploadProgress(0);
  };

  const closeModal = () => {
    setIsModal(false);
    setEditingProduct(null);
    setIsCreating(false);
    setUploadProgress(0);
  };

  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0 || !editingProduct) return;
    const file = files[0];
    setUploadProgress(15);
    try {
      const url = await uploadFile('products', 'domestic', file, (pct) => {
        setUploadProgress(Math.max(15, pct));
      });
      setEditingProduct((prev) => prev ? { ...prev, image: url } : prev);
      setUploadProgress(100);
      toast.success('Image uploaded successfully!');
      setTimeout(() => setUploadProgress(0), 1200);
    } catch (err) {
      // Fallback: Read file as Base64 Data URL so it always works even if storage is offline
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setEditingProduct((prev) => prev ? { ...prev, image: dataUrl } : prev);
        setUploadProgress(100);
        toast.success('Image loaded successfully!');
        setTimeout(() => setUploadProgress(0), 1200);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file.');
        setUploadProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);

    try {
      const cleanedProduct = { ...editingProduct };
      if (!cleanedProduct.id || !cleanedProduct.id.trim()) {
        cleanedProduct.id = `pack-${Date.now().toString().slice(-6)}`;
      }
      if (!cleanedProduct.packagingBadge || !cleanedProduct.packagingBadge.trim()) {
        cleanedProduct.packagingBadge = getPackagingLabel(cleanedProduct);
      }
      if (!cleanedProduct.variants || cleanedProduct.variants.length === 0) {
        toast.error('Product must have at least one weight variant.');
        setSaving(false);
        return;
      }

      let updatedProducts: RetailPacketProduct[];
      if (isCreating || !products.some((p) => p.id === cleanedProduct.id)) {
        updatedProducts = [...products, cleanedProduct];
        toast.success(`${cleanedProduct.name} added to shop!`);
      } else {
        updatedProducts = products.map((p) =>
          p.id === cleanedProduct.id ? cleanedProduct : p
        );
        toast.success(`${cleanedProduct.name} updated successfully!`);
      }

      domesticService.saveProducts(updatedProducts);
      setProducts(updatedProducts);
      closeModal();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the shop?`)) return;
    const updated = products.filter((p) => p.id !== productId);
    domesticService.saveProducts(updated);
    setProducts(updated);
    toast.success(`"${name}" removed from the shop.`);
  };

  const handleResetToDefaults = () => {
    if (!window.confirm('Reset all shop products to factory defaults? This will restore default packaging badges, prices, and default 5 sizes.')) return;
    domesticService.saveProducts(DEFAULT_RETAIL_PRODUCTS);
    setProducts(DEFAULT_RETAIL_PRODUCTS);
    toast.success('All products reset to factory defaults.');
  };

  const handleToggleStock = (productId: string) => {
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    );
    domesticService.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    toast.success('Stock status updated.');
  };

  const updateVariantField = (variantIndex: number, field: keyof WeightVariant, value: any) => {
    if (!editingProduct) return;
    const newVariants = [...editingProduct.variants];
    newVariants[variantIndex] = { ...newVariants[variantIndex], [field]: value };
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const addVariant = () => {
    if (!editingProduct) return;
    const newVariant: WeightVariant = {
      weight: '500g',
      label: `${editingProduct.name || 'Product'} 500g`,
      packagingType: editingProduct.packagingBadge || 'Zipper Pouch',
      priceInr: 2449,
      originalPriceInr: 3299,
      inStock: true,
    };
    setEditingProduct({
      ...editingProduct,
      variants: [...editingProduct.variants, newVariant],
    });
  };

  const removeVariant = (idx: number) => {
    if (!editingProduct) return;
    if (editingProduct.variants.length <= 1) {
      toast.error('Product must have at least one weight variant.');
      return;
    }
    const next = editingProduct.variants.filter((_, i) => i !== idx);
    setEditingProduct({ ...editingProduct, variants: next });
  };

  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);
  const inStockCount = products.filter((p) => p.inStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-[#0D2012]/80 p-4 sm:p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#C5A046]" />
            Shop &mdash; Domestic Store
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage retail packet products, packaging badges, images, variant pricing, and stock status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors cursor-pointer"
            title="Reset to default products and pricing"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: products.length, color: 'text-[#C5A046]' },
          { label: 'Total Variants', value: totalVariants, color: 'text-blue-400' },
          { label: 'In Stock', value: inStockCount, color: 'text-emerald-400' },
          { label: 'Out of Stock', value: products.length - inStockCount, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0D2012]/60 border border-[#C5A046]/15 rounded-xl p-3 text-center">
            <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* UPI Info Banner */}
      <div className="bg-[#0D2012]/60 border border-[#C5A046]/15 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3">
        <div className="space-y-1 text-xs text-gray-300">
          <p><span className="text-[#C5A046] font-medium">UPI VPA:</span> {UPI_CONFIG.vpa}</p>
          <p><span className="text-[#C5A046] font-medium">Payee Name:</span> {UPI_CONFIG.payeeName}</p>
        </div>
        <div className="space-y-1 text-xs text-gray-300">
          <p><span className="text-[#C5A046] font-medium">Free Shipping Above:</span> &#8377;{UPI_CONFIG.freeShippingAboveInr}</p>
          <p><span className="text-[#C5A046] font-medium">Standard Shipping:</span> &#8377;{UPI_CONFIG.standardShippingFeeInr}</p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No shop products found. Click &quot;Add New Product&quot; or &quot;Reset Defaults&quot; to populate.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((product) => {
            const cheapest = Math.min(...product.variants.map((v) => v.priceInr));
            const mostExpensive = Math.max(...product.variants.map((v) => v.priceInr));
            const packagingTag = getPackagingLabel(product);

            return (
              <div
                key={product.id}
                className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-lg hover:border-[#C5A046]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Product Header */}
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#C5A046]/20 bg-[#FAF8F5]/5 flex items-center justify-center p-1">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#FAF8F5] truncate">{product.name}</h3>

                      {/* Badges: Grade + Packaging Tag */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-[#C5A046] font-medium uppercase tracking-wider">{product.gradeBadge}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#C5A046]/15 text-[#DFBF6C] border border-[#C5A046]/30 uppercase font-semibold tracking-wider">
                          {packagingTag}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.tagline}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-300 font-mono font-medium">
                          &#8377;{cheapest.toLocaleString()} &ndash; &#8377;{mostExpensive.toLocaleString()}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                          product.inStock
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-red-950/60 text-red-300 border-red-500/40'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="border-t border-[#C5A046]/10 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#C5A046]/10">
                          {['Weight', 'Format / Type', 'Price', 'Original', 'Stock'].map((h) => (
                            <th key={h} className="px-3 py-2 text-[9px] text-[#C5A046] uppercase tracking-wider font-normal whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C5A046]/5">
                        {product.variants.map((v) => (
                          <tr key={v.weight} className="hover:bg-[#C5A046]/5 transition-colors">
                            <td className="px-3 py-1.5 text-xs text-gray-200 font-medium">{v.label || v.weight}</td>
                            <td className="px-3 py-1.5 text-xs text-stone-300">{v.packagingType || packagingTag}</td>
                            <td className="px-3 py-1.5 text-xs text-emerald-300 font-mono">&#8377;{v.priceInr.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-xs text-gray-500 line-through font-mono">&#8377;{v.originalPriceInr.toLocaleString()}</td>
                            <td className="px-3 py-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${v.inStock ? 'bg-emerald-950/60 text-emerald-400' : 'bg-red-950/60 text-red-400'}`}>
                                {v.inStock ? 'Yes' : 'No'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-[#C5A046]/10 px-4 py-3 flex justify-between items-center gap-2">
                  <button
                    onClick={() => handleToggleStock(product.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {product.inStock
                      ? <><ToggleRight className="w-4 h-4 text-emerald-400" /> In Stock</>
                      : <><ToggleLeft className="w-4 h-4 text-red-400" /> Out of Stock</>
                    }
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-3xl my-4 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#C5A046]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#C5A046]/20 shrink-0 bg-[#FAF8F5]/5 flex items-center justify-center p-0.5">
                  <img src={editingProduct.image} alt={editingProduct.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#FAF8F5]">
                    {isCreating ? 'Add New Shop Product' : 'Edit Product & Packaging'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#C5A046]">{editingProduct.gradeBadge || 'Retail'}</span>
                    <span className="text-[10px] text-gray-400">&bull;</span>
                    <span className="text-xs text-stone-300 font-semibold">{editingProduct.packagingBadge || getPackagingLabel(editingProduct)}</span>
                  </div>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Product Image Section — File Upload + URL Input */}
              <div className="bg-[#071309] border border-[#C5A046]/40 p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#C5A046] uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#C5A046]" />
                    Product Image (Upload New or Change Existing)
                  </label>
                  <span className="text-[10px] text-gray-400">Square 1:1 image recommended</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <FileUpload
                    label="Drop or Choose Image File"
                    currentUrl={editingProduct.image}
                    accept="image"
                    defaultAspect="1:1"
                    progress={uploadProgress}
                    onFiles={handleImageUpload}
                    onRemove={() => setEditingProduct({ ...editingProduct, image: '' })}
                  />

                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Or Enter Image URL / Local Path</label>
                      <input
                        className={inputClass}
                        value={editingProduct.image}
                        placeholder="/images/package-50g-bottle.jpg or https://..."
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      />
                    </div>

                    {editingProduct.image && (
                      <div className="flex items-center gap-3 p-3 bg-[#0D2012] border border-[#C5A046]/20 rounded-xl">
                        <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={editingProduct.image}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xs text-gray-300 min-w-0">
                          <p className="font-semibold text-white">Live Store Preview</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[200px] mt-0.5">{editingProduct.image}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Packaging Tag / Badge Configuration */}
              <div className="bg-[#071309] border border-[#C5A046]/40 p-4 rounded-xl space-y-2.5 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs text-[#C5A046] uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#C5A046]" />
                    Packaging Format Badge (Store Card Tag)
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Displayed on the top-left badge of the product card (e.g. GLASS BOTTLE, GIFT BOX)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    className={inputClass + ' font-medium text-base text-[#FAF8F5] border-[#C5A046]/50'}
                    value={editingProduct.packagingBadge || ''}
                    placeholder="e.g. Glass Bottle, Gift Box, Zipper Pouch"
                    onChange={(e) => setEditingProduct({ ...editingProduct, packagingBadge: e.target.value })}
                  />
                  <div className="shrink-0 px-3 py-2 rounded-xl bg-[#C5A046]/20 border border-[#C5A046]/40 text-center">
                    <span className="block text-[9px] text-[#C5A046] uppercase tracking-wider">Store Preview</span>
                    <span className="text-xs font-bold text-white uppercase">
                      {editingProduct.packagingBadge || getPackagingLabel(editingProduct)}
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-medium mr-1">Quick Select:</span>
                  {PACKAGING_PRESETS.map((preset) => {
                    const isSelected = (editingProduct.packagingBadge || '').toLowerCase() === preset.toLowerCase();
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setEditingProduct({ ...editingProduct, packagingBadge: preset });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#C5A046] text-[#071309] border-[#C5A046] shadow-sm'
                            : 'bg-[#071309] text-gray-300 border-[#C5A046]/30 hover:border-[#C5A046] hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Product Name</label>
                  <input
                    className={inputClass}
                    value={editingProduct.name}
                    placeholder="e.g. 250 Grams – Aroma-Lock Zipper Pouch"
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Grade Badge (Sub-header Badge)</label>
                  <input
                    className={inputClass}
                    value={editingProduct.gradeBadge}
                    placeholder="e.g. 250g Net Weight"
                    onChange={(e) => setEditingProduct({ ...editingProduct, gradeBadge: e.target.value })}
                  />
                </div>
              </div>

              {/* Pod Diameter & Packaging Specification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Pod Diameter / Size Spec</label>
                  <input
                    className={inputClass}
                    value={editingProduct.podDiameter}
                    placeholder="e.g. 250 Grams or 8mm+ Bold"
                    onChange={(e) => setEditingProduct({ ...editingProduct, podDiameter: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Packaging Specification (Full Spec Text)</label>
                  <input
                    className={inputClass}
                    value={editingProduct.specs?.packaging || ''}
                    placeholder="e.g. 3-Layer Aluminum Foil Zipper Pouch with Nitrogen Flush"
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      specs: { ...editingProduct.specs, packaging: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  className={inputClass}
                  value={editingProduct.tagline}
                  placeholder="e.g. 3-layer food-grade aluminum barrier pouch with airtight resealable zip."
                  onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Description (Full Product Narrative)</label>
                <textarea
                  className={inputClass + ' min-h-[80px] resize-y'}
                  value={editingProduct.description}
                  placeholder="Enter detailed description displayed on the store card..."
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              {/* In Stock & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>In Stock Status</label>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, inStock: !editingProduct.inStock })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium w-full transition-colors cursor-pointer ${
                      editingProduct.inStock
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-950/60 text-red-300 border-red-500/40'
                    }`}
                  >
                    {editingProduct.inStock
                      ? <><ToggleRight className="w-4 h-4" /> In Stock</>
                      : <><ToggleLeft className="w-4 h-4" /> Out of Stock</>
                    }
                  </button>
                </div>
                <div>
                  <label className={labelClass}>Featured / Most Popular</label>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, featured: !editingProduct.featured })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium w-full transition-colors cursor-pointer ${
                      editingProduct.featured
                        ? 'bg-[#C5A046]/20 text-[#DFBF6C] border-[#C5A046]/50'
                        : 'bg-[#071309] text-gray-400 border-[#C5A046]/20'
                    }`}
                  >
                    {editingProduct.featured
                      ? <><ToggleRight className="w-4 h-4 text-[#C5A046]" /> Featured Product</>
                      : <><ToggleLeft className="w-4 h-4 text-gray-500" /> Standard Product</>
                    }
                  </button>
                </div>
              </div>

              {/* Weight Variants / Pricing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs text-[#C5A046] uppercase tracking-wider font-semibold flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Weight Variants, Packaging &amp; Pricing
                  </h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C5A046]/15 text-[#C5A046] hover:bg-[#C5A046]/25 text-[11px] font-semibold border border-[#C5A046]/30 cursor-pointer transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Add Variant
                  </button>
                </div>

                <div className="bg-[#071309]/60 border border-[#C5A046]/15 rounded-xl overflow-x-auto">
                  <table className="w-full text-left min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[#C5A046]/15">
                        {['Weight Badge', 'Label', 'Packaging Type', 'Selling Price', 'Original Price', 'In Stock', ''].map((h, idx) => (
                          <th key={idx} className="px-3 py-2.5 text-[9px] text-[#C5A046] uppercase tracking-wider font-normal whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A046]/10">
                      {editingProduct.variants.map((variant, i) => (
                        <tr key={i} className="hover:bg-[#C5A046]/5 transition-colors">
                          <td className="px-3 py-2">
                            <input
                              className="bg-transparent border border-[#C5A046]/30 rounded-lg px-2 py-1 text-xs text-emerald-300 font-mono font-bold w-20 focus:outline-none focus:border-[#C5A046]"
                              value={variant.weight}
                              placeholder="e.g. 50g"
                              onChange={(e) => updateVariantField(i, 'weight', e.target.value)}
                              title="Weight badge displayed on top-right of product card"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              className="bg-transparent border border-[#C5A046]/20 rounded-lg px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-[#C5A046]"
                              value={variant.label}
                              onChange={(e) => updateVariantField(i, 'label', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              list={`variant-pkg-types-${i}`}
                              className="bg-[#071309] border border-[#C5A046]/20 rounded-lg px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-[#C5A046]"
                              value={variant.packagingType || ''}
                              placeholder={editingProduct.packagingBadge || 'e.g. Glass Bottle'}
                              onChange={(e) => updateVariantField(i, 'packagingType', e.target.value)}
                            />
                            <datalist id={`variant-pkg-types-${i}`}>
                              {PACKAGING_PRESETS.map((p) => (
                                <option key={p} value={p} />
                              ))}
                            </datalist>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-emerald-400">&#8377;</span>
                              <input
                                type="number"
                                min="0"
                                className="bg-transparent border border-emerald-500/30 rounded-lg px-2 py-1 text-xs text-emerald-300 w-20 focus:outline-none focus:border-emerald-500 font-mono"
                                value={variant.priceInr}
                                onChange={(e) => updateVariantField(i, 'priceInr', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">&#8377;</span>
                              <input
                                type="number"
                                min="0"
                                className="bg-transparent border border-gray-600/40 rounded-lg px-2 py-1 text-xs text-gray-400 w-20 focus:outline-none focus:border-gray-500 font-mono"
                                value={variant.originalPriceInr}
                                onChange={(e) => updateVariantField(i, 'originalPriceInr', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => updateVariantField(i, 'inStock', !variant.inStock)}
                              className="cursor-pointer"
                            >
                              {variant.inStock
                                ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                                : <ToggleLeft className="w-5 h-5 text-red-400" />
                              }
                            </button>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeVariant(i)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer transition-colors"
                              title="Delete variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex justify-end gap-3 pt-2 border-t border-[#C5A046]/15">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-xs text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : isCreating ? 'Add Product to Shop' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
