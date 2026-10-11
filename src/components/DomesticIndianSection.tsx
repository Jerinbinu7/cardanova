import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowRight, Package, MessageSquareQuote, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { domesticService } from '../services/domesticService';
import { WeightOption } from '../types/domestic';
import { CartItem } from './CartDrawer';

interface DomesticIndianSectionProps {
  onOpenQuoteModal: (grade?: string, pricePerKg?: number) => void;
  onNavigateToPackets: () => void;
  onAddToCart?: (item: CartItem) => void;
}

export default function DomesticIndianSection({
  onOpenQuoteModal,
  onNavigateToPackets,
  onAddToCart,
}: DomesticIndianSectionProps) {
  const products = domesticService.getProducts();

  // Active weight state for each product card
  const [selectedWeights, setSelectedWeights] = useState<Record<string, WeightOption>>({
    'cnd-pouch-85mm': '100g',
    'cnd-pouch-80mm': '100g',
    'cnd-pouch-75mm': '250g',
    'cnd-pouch-70mm': '250g',
  });

  const [_addedToast, setAddedToast] = useState<string | null>(null);

  const handleWeightChange = (productId: string, weight: WeightOption) => {
    setSelectedWeights((prev) => ({ ...prev, [productId]: weight }));
  };

  const handleAddPackToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const weight = selectedWeights[productId] || '100g';
    const variant = product.variants.find((v) => v.weight === weight) || product.variants[0];

    // Convert weight string to numeric kg estimate for cart drawer
    let weightKg = 0.1;
    if (weight === '50g') weightKg = 0.05;
    else if (weight === '100g') weightKg = 0.1;
    else if (weight === '250g') weightKg = 0.25;
    else if (weight === '500g') weightKg = 0.5;
    else if (weight === '1kg') weightKg = 1.0;

    if (onAddToCart) {
      onAddToCart({
        id: `${product.id}-${weight}`,
        gradeName: `${product.name} (${weight})`,
        gradeNum: product.podDiameter,
        gradeUnit: '',
        image: product.image,
        quantityKg: weightKg,
        packaging: `Zipper Pouch (${weight})`,
        pricePerKg: Math.round(variant.priceInr / weightKg),
      });

      setAddedToast(`Added ${product.name} (${weight}) - ₹${variant.priceInr.toLocaleString('en-IN')}!`);
      setTimeout(() => setAddedToast(null), 2500);
    }
  };

  return (
    <section
      id="domestic-india"
      className="relative overflow-hidden bg-[#F4F0E8] text-[#112D15] py-16 sm:py-24 border-b border-stone-300/60"
    >
      {/* Background Texture & Glow */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #112D15 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <div className="mb-12 sm:mb-16 pb-10 border-b border-stone-200/80">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8B712A]/30 bg-[#FFF8E8] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#8B712A] mb-4">
                <span>🇮🇳 Domestic Retail & Wholesale Supply</span>
              </div>

              <h2 className="font-display font-light text-[#112D15] text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight">
                For Buyers Across India
                <span className="block font-serif italic gold-gradient-text text-2xl sm:text-3xl lg:text-4xl font-normal mt-2">
                  Direct from Idukki to your doorstep
                </span>
              </h2>

              <p className="mt-4 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                Premium Idukki green cardamom for wholesalers, retailers, food businesses, and home kitchens across India. Sourced directly from Kerala plantations, precision graded, and aroma-locked.
              </p>
            </div>

            {/* Quick Trust / Service Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-3 rounded-2xl bg-white border border-stone-200/80 px-4 py-3 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E8] border border-[#8B712A]/20 flex items-center justify-center shrink-0 text-[#8B712A]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#112D15] block">Pan-India Delivery</span>
                  <span className="text-[11px] text-stone-500 block">Fast tracked dispatch</span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white border border-stone-200/80 px-4 py-3 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E8] border border-[#8B712A]/20 flex items-center justify-center shrink-0 text-[#8B712A]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#112D15] block">100% Single Origin</span>
                  <span className="text-[11px] text-stone-500 block">Pure Idukki, Kerala</span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white border border-stone-200/80 px-4 py-3 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E8] border border-[#8B712A]/20 flex items-center justify-center shrink-0 text-[#8B712A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#112D15] block">Aroma-Locked Foil</span>
                  <span className="text-[11px] text-stone-500 block">Peak flavor retention</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ── Domestic Products Showcase Grid ── */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl text-[#112D15] font-light">
                Domestic Retail Packets
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Select net weight to see instant retail price & order online with Pan-India express delivery.
              </p>
            </div>

            <button
              onClick={onNavigateToPackets}
              className="inline-flex items-center gap-2 rounded-full border border-[#8B712A]/40 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#8B712A] hover:bg-[#8B712A] hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <span>VIEW DOMESTIC CATALOG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((prod) => {
              const selectedWeight = selectedWeights[prod.id] || '100g';
              const currentVariant =
                prod.variants.find((v) => v.weight === selectedWeight) || prod.variants[0];

              return (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-[#8B712A]/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image & Badge */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 mb-4">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 rounded-md bg-[#FAF8F5]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono font-bold text-[#112D15] border border-stone-300">
                      {prod.podDiameter}
                    </div>
                  </div>

                  {/* Title & Grade */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-[#8B712A] uppercase tracking-wider block">
                      {prod.gradeBadge}
                    </span>
                    <h4 className="font-display text-base font-semibold text-[#112D15] leading-snug mt-0.5">
                      {prod.name}
                    </h4>
                  </div>

                  {/* Weight Selector */}
                  <div className="mb-4">
                    <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                      Pack Size:
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {prod.variants.map((v) => {
                        const isSelected = v.weight === selectedWeight;
                        return (
                          <button
                            key={v.weight}
                            type="button"
                            onClick={() => handleWeightChange(prod.id, v.weight)}
                            className={`py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#112D15] text-[#FAF8F5] shadow-xs'
                                : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-200 border border-stone-200'
                            }`}
                          >
                            {v.weight}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-light">Price ({selectedWeight}):</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-lg font-bold text-[#112D15]">
                          ₹{currentVariant.priceInr.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          ₹{currentVariant.originalPriceInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPackToCart(prod.id)}
                      className="px-3 py-2 rounded-xl gold-gradient-bg text-[10px] font-bold uppercase tracking-wider text-[#071309] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Buy</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Domestic Bulk Orders (MOQ 50 kg) Banner ── */}
        <div className="rounded-3xl bg-[#112D15] text-[#FAF8F5] p-6 sm:p-10 border border-[#C5A046]/30 shadow-xl relative overflow-hidden mb-12">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
            style={{ background: '#C5A046' }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A046]/20 border border-[#C5A046]/40 text-[#E2BF63] text-[10px] font-semibold uppercase tracking-wider">
                <Package className="w-3.5 h-3.5" />
                <span>Domestic Bulk Orders — MOQ 50 kg</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-light text-[#FAF8F5] leading-tight">
                Wholesale & Commercial Bulk Cardamom Supply
              </h3>

              <p className="text-xs sm:text-sm text-stone-300/90 font-light leading-relaxed">
                Since daily spice auction prices change frequently across Kerala markets, domestic bulk orders (50 kg+) are priced dynamically. Contact us directly for today’s lot-specific rates.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => onOpenQuoteModal('Domestic Bulk Order (MOQ 50 kg)')}
                className="rounded-full gold-gradient-bg px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#071309] hover:brightness-110 transition-all cursor-pointer text-center shadow-lg flex items-center justify-center gap-2"
              >
                <MessageSquareQuote className="w-4 h-4" />
                <span>REQUEST BULK PRICE</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToPackets}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] hover:bg-white/10 transition-all cursor-pointer text-center"
              >
                VIEW DOMESTIC CATALOG →
              </button>
            </div>
          </div>
        </div>

        {/* ── Three Clear Buying Categories Summary ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B712A] block mb-1">
                Category 1
              </span>
              <h4 className="font-display text-lg font-semibold text-[#112D15]">
                Domestic Retail
              </h4>
              <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">
                Fixed transparent pricing for 50g, 100g, 250g, 500g, and 1kg zipper pouches with direct online UPI order.
              </p>
            </div>
            <button
              onClick={onNavigateToPackets}
              className="mt-4 text-xs font-semibold text-[#8B712A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Shop Retail Packs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B712A] block mb-1">
                Category 2
              </span>
              <h4 className="font-display text-lg font-semibold text-[#112D15]">
                Domestic Bulk (MOQ 50 kg)
              </h4>
              <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">
                Dynamic market rates for Indian spice traders, sweet makers, caterers, and wholesalers.
              </p>
            </div>
            <button
              onClick={() => onOpenQuoteModal('Domestic Bulk Order (MOQ 50 kg)')}
              className="mt-4 text-xs font-semibold text-[#8B712A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Request Bulk Price</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B712A] block mb-1">
                Category 3
              </span>
              <h4 className="font-display text-lg font-semibold text-[#112D15]">
                Export / International
              </h4>
              <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">
                FOB / CIF Cochin Port containerized shipments for overseas importers, distributors, and brands.
              </p>
            </div>
            <button
              onClick={() => onOpenQuoteModal('International Export Trade Order')}
              className="mt-4 text-xs font-semibold text-[#8B712A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Request Trade Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
