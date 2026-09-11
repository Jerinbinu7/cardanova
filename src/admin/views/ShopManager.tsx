import React, { useEffect, useState } from 'react';
import { Save, Edit2, X, IndianRupee, ToggleLeft, ToggleRight, RefreshCw, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { domesticService, DEFAULT_RETAIL_PRODUCTS, UPI_CONFIG } from '../../services/domesticService';
import type { RetailPacketProduct, WeightVariant } from '../../types/domestic';
import { SkeletonCard } from '../components/Skeleton';

const inputClass = 'w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all';
const labelClass = 'block text-[10px] text-[#C5A046] uppercase tracking-wider font-medium mb-1.5';

export default function ShopManager() {
  const [products, setProducts] = useState<RetailPacketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<RetailPacketProduct | null>(null);
  const [isModal, setIsModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    try {
      const prods = domesticService.getProducts();
      setProducts(prods);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (product: RetailPacketProduct) => {
    setEditingProduct(JSON.parse(JSON.stringify(product)));
    setIsModal(true);
  };

  const closeModal = () => {
    setIsModal(false);
    setEditingProduct(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);

    try {
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id ? editingProduct : p
      );
      domesticService.saveProducts(updatedProducts);
      setProducts(updatedProducts);
      toast.success(`${editingProduct.name} updated!`);
      closeModal();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (!window.confirm('Reset all shop products to factory defaults? This will overwrite current prices and settings.')) return;
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

  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);
  const inStockCount = products.filter((p) => p.inStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-[#0D2012]/80 p-4 sm:p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#C5A046]" />
            Shop — Domestic Store
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage retail packet products, variant pricing, and stock status for the domestic consumer store
          </p>
        </div>
        <button
          onClick={handleResetToDefaults}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071309] border border-[#C5A046]/30 text-xs text-[#C5A046] hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset to Defaults
        </button>
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
          <p><span className="text-[#C5A046] font-medium">Free Shipping Above:</span> ₹{UPI_CONFIG.freeShippingAboveInr}</p>
          <p><span className="text-[#C5A046] font-medium">Standard Shipping:</span> ₹{UPI_CONFIG.standardShippingFeeInr}</p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No shop products found. Click "Reset to Defaults" to restore them.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((product) => {
            const cheapest = Math.min(...product.variants.map((v) => v.priceInr));
            const mostExpensive = Math.max(...product.variants.map((v) => v.priceInr));

            return (
              <div
                key={product.id}
                className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-lg hover:border-[#C5A046]/40 transition-all"
              >
                {/* Product Header */}
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#C5A046]/20">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#FAF8F5] truncate">{product.name}</h3>
                    <p className="text-[10px] text-[#C5A046] font-medium uppercase tracking-wider mt-0.5">{product.gradeBadge}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.tagline}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-300 font-mono">
                        ₹{cheapest.toLocaleString()} – ₹{mostExpensive.toLocaleString()}
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
                        {['Weight', 'Price ₹', 'Original ₹', 'Stock'].map((h) => (
                          <th key={h} className="px-3 py-2 text-[9px] text-[#C5A046] uppercase tracking-wider font-normal whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A046]/5">
                      {product.variants.map((v) => (
                        <tr key={v.weight} className="hover:bg-[#C5A046]/5 transition-colors">
                          <td className="px-3 py-1.5 text-xs text-gray-200 font-medium">{v.label}</td>
                          <td className="px-3 py-1.5 text-xs text-emerald-300 font-mono">₹{v.priceInr.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-xs text-gray-500 line-through font-mono">₹{v.originalPriceInr.toLocaleString()}</td>
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

                {/* Actions */}
                <div className="border-t border-[#C5A046]/10 px-4 py-3 flex justify-between items-center">
                  <button
                    onClick={() => handleToggleStock(product.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {product.inStock
                      ? <><ToggleRight className="w-4 h-4 text-emerald-400" /> Mark Out of Stock</>
                      : <><ToggleLeft className="w-4 h-4 text-red-400" /> Mark In Stock</>
                    }
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-3xl my-4 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#C5A046]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#C5A046]/20 shrink-0">
                  <img src={editingProduct.image} alt={editingProduct.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-base font-light text-[#FAF8F5]">Edit Product</h3>
                  <p className="text-xs text-[#C5A046]">{editingProduct.gradeBadge}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Product Name</label>
                  <input
                    className={inputClass}
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Grade Badge</label>
                  <input
                    className={inputClass}
                    value={editingProduct.gradeBadge}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gradeBadge: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  className={inputClass}
                  value={editingProduct.tagline}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className={inputClass + ' min-h-[80px] resize-y'}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Pod Diameter</label>
                  <input
                    className={inputClass}
                    value={editingProduct.podDiameter}
                    onChange={(e) => setEditingProduct({ ...editingProduct, podDiameter: e.target.value })}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className={labelClass}>In Stock</label>
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
                </div>
              </div>

              {/* Weight Variants / Pricing */}
              <div>
                <h4 className="text-xs text-[#C5A046] uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Weight Variant Pricing
                </h4>
                <div className="bg-[#071309]/60 border border-[#C5A046]/15 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#C5A046]/15">
                        {['Weight', 'Label', 'Selling Price (₹)', 'Original Price (₹)', 'In Stock'].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-[9px] text-[#C5A046] uppercase tracking-wider font-normal whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A046]/10">
                      {editingProduct.variants.map((variant, i) => (
                        <tr key={variant.weight} className="hover:bg-[#C5A046]/5 transition-colors">
                          <td className="px-3 py-2 text-xs text-gray-200 font-mono font-medium">{variant.weight}</td>
                          <td className="px-3 py-2">
                            <input
                              className="bg-transparent border border-[#C5A046]/20 rounded-lg px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-[#C5A046]"
                              value={variant.label}
                              onChange={(e) => updateVariantField(i, 'label', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-emerald-400">₹</span>
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
                              <span className="text-xs text-gray-500">₹</span>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Save / Cancel buttons */}
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
