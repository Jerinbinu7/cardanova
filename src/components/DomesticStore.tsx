import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Check,
  ChevronRight,
  Info,
  X,
  Zap,
  Leaf,
  Plus,
  Minus,
  Award,
} from 'lucide-react';
import { RetailPacketProduct, WeightOption, DomesticOrderItem } from '../types/domestic';
import { DEFAULT_RETAIL_PRODUCTS, UPI_CONFIG } from '../services/domesticService';
import UpiCheckoutModal from './UpiCheckoutModal';

interface DomesticStoreProps {
  onSwitchToExport?: () => void;
}

export default function DomesticStore({ onSwitchToExport }: DomesticStoreProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, WeightOption>>({
    'cnd-pouch-85mm': '100g',
    'cnd-pouch-80mm': '100g',
    'cnd-pouch-75mm': '250g',
    'cnd-pouch-70mm': '250g',
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({
    'cnd-pouch-85mm': 1,
    'cnd-pouch-80mm': 1,
    'cnd-pouch-75mm': 1,
    'cnd-pouch-70mm': 1,
  });

  const [activeModalProduct, setActiveModalProduct] = useState<RetailPacketProduct | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<DomesticOrderItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleVariantChange = (productId: string, weight: WeightOption) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: weight }));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleQuickBuy = (product: RetailPacketProduct) => {
    const selectedWeight = selectedVariants[product.id] || '100g';
    const variant = product.variants.find((v) => v.weight === selectedWeight) || product.variants[0];
    const qty = quantities[product.id] || 1;

    const item: DomesticOrderItem = {
      productId: product.id,
      productName: product.name,
      gradeBadge: product.gradeBadge,
      weight: variant.weight,
      quantity: qty,
      unitPriceInr: variant.priceInr,
      totalPriceInr: variant.priceInr * qty,
      image: product.image,
    };

    setCheckoutItems([item]);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#112D15]">
      {/* ── Top Hero / Context Header ── */}
      <section className="relative overflow-hidden bg-[#112D15] text-[#FAF8F5] pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#C5A046]/30">
        {/* Subtle background decorative glow */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(197,160,70,0.8) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#C5A046]/40 text-[#C5A046] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Consumer Store • Pan-India Delivery</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#FAF8F5] leading-tight">
            Single-Origin <span className="italic text-[#E2BF63]">Idukki Cardamom</span> Packets
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base font-light">
            Enjoy the authentic flavor and royal aroma of whole green cardamom directly from our high-altitude estates in Kerala. Packed in freshness-preserving zipper pouches and delivered to your doorstep.
          </p>

          {/* Quick Perks Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-stone-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A046]" />
              <span>100% Pure GI-Tagged Alleppey Green</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C5A046]" />
              <span>Free Shipping on Orders Above ₹{UPI_CONFIG.freeShippingAboveInr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C5A046]" />
              <span>Instant 1-Tap UPI Payment (GPay, PhonePe, Paytm)</span>
            </div>
          </div>

          {/* Switch to B2B banner button */}
          {onSwitchToExport && (
            <div className="pt-2">
              <button
                onClick={onSwitchToExport}
                className="text-xs text-[#C5A046] hover:text-[#E2BF63] underline underline-offset-4 inline-flex items-center gap-1 transition-colors"
              >
                <span>Looking for Commercial Bulk B2B Export (500 kg+ FOB/CIF)? Click here</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Product Catalog Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {DEFAULT_RETAIL_PRODUCTS.map((product) => {
            const selectedWeight = selectedVariants[product.id] || '100g';
            const currentVariant =
              product.variants.find((v) => v.weight === selectedWeight) || product.variants[0];
            const qty = quantities[product.id] || 1;
            const savings = currentVariant.originalPriceInr - currentVariant.priceInr;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="group relative bg-white rounded-2xl border border-stone-200 hover:border-[#C5A046]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Sale / Fresh Harvest Ribbon */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#112D15] text-[#FAF8F5] text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md shadow-sm border border-[#C5A046]/40">
                  <Leaf className="w-3 h-3 text-[#C5A046]" />
                  <span>Fresh Harvest</span>
                </div>

                {/* Grade Pod Diameter Badge */}
                <div className="absolute top-3 right-3 z-10 bg-[#FAF8F5]/90 backdrop-blur-md text-[#112D15] text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md shadow-sm border border-stone-300">
                  {product.podDiameter}
                </div>

                {/* Top Image Section */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setActiveModalProduct(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Product Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Grade Title */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-[#8B712A] uppercase tracking-wider">
                        {product.gradeBadge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg text-[#112D15] font-semibold leading-snug mt-1 group-hover:text-[#8B712A] transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Weight Selector Buttons */}
                  <div>
                    <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                      Select Net Weight:
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {product.variants.map((v) => {
                        const isSelected = v.weight === selectedWeight;
                        return (
                          <button
                            key={v.weight}
                            type="button"
                            onClick={() => handleVariantChange(product.id, v.weight)}
                            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#112D15] text-[#FAF8F5] shadow-sm'
                                : 'bg-[#F3EFEA] text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {v.weight}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing Bar */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-display font-semibold text-[#112D15]">
                          ₹{(currentVariant.priceInr * qty).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          ₹{(currentVariant.originalPriceInr * qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 block">
                        Save ₹{(savings * qty).toLocaleString('en-IN')} (Fresh direct price)
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        className="p-1 text-stone-600 hover:text-black rounded hover:bg-stone-100 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold font-mono text-[#112D15]">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        className="p-1 text-stone-600 hover:text-black rounded hover:bg-stone-100 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickBuy(product)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] text-xs font-medium flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#C5A046]" />
                      <span>Buy with UPI • ₹{(currentVariant.priceInr * qty).toLocaleString('en-IN')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalProduct(product)}
                      className="w-full py-2 px-3 text-[11px] font-medium text-stone-600 hover:text-[#112D15] hover:bg-stone-100 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-[#C5A046]" />
                      <span>View Specifications & Origin</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Product Details Modal ── */}
      <AnimatePresence>
        {activeModalProduct && (
          <div
            className="fixed inset-0 z-[600] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(7, 19, 9, 0.85)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#C5A046]/30 overflow-hidden"
            >
              <div className="bg-[#112D15] text-[#FAF8F5] px-6 py-4 flex items-center justify-between border-b border-[#C5A046]/20">
                <div>
                  <span className="label-caps text-[#C5A046] text-[0.6rem] tracking-[0.2em] block">
                    Product Specification Sheet
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl text-[#FAF8F5]">
                    {activeModalProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="p-1.5 text-[#C5A046] hover:text-white rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
                <div className="space-y-4">
                  <img
                    src={activeModalProduct.image}
                    alt={activeModalProduct.name}
                    className="w-full aspect-[4/3] object-cover rounded-xl border border-stone-200 shadow-sm"
                  />
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {activeModalProduct.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-stone-200 divide-y divide-stone-100 text-xs">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Origin:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.origin}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Speciality:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.speciality}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Pod Grade:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.grade}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Essential Oil:</span>
                      <span className="font-medium text-emerald-800 text-right">{activeModalProduct.specs.essentialOil}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Moisture Content:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.moisture}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Packaging:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.packaging}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Shelf Life:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.shelfLife}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const prod = activeModalProduct;
                      setActiveModalProduct(null);
                      handleQuickBuy(prod);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 shadow"
                  >
                    <Zap className="w-4 h-4 text-[#C5A046]" />
                    <span>Proceed to Order Packets</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Direct UPI Checkout Modal ── */}
      <UpiCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderItems={checkoutItems}
      />
    </div>
  );
}
