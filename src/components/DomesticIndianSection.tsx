import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  ArrowRight,
  Package,
  MessageSquareQuote,
  Truck,
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { domesticService, UPI_CONFIG } from '../services/domesticService';
import { PackagingOption } from '../types/domestic';
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
  const packagingOptions = domesticService.getPackagingOptions();
  const [selectedPackId, setSelectedPackId] = useState<string>(packagingOptions[0].id);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [activeSpecModal, setActiveSpecModal] = useState<PackagingOption | null>(null);

  const selectedPack =
    packagingOptions.find((p) => p.id === selectedPackId) || packagingOptions[0];

  const handleAddToCart = (pack: PackagingOption) => {
    if (onAddToCart) {
      onAddToCart({
        id: `natures-finest-${pack.weight}`,
        gradeName: `Nature’s Finest – Premium Green Cardamom (${pack.title})`,
        gradeNum: 'Estate Bold',
        gradeUnit: '',
        image: pack.image,
        quantityKg: pack.weightKg,
        packaging: pack.title,
        pricePerKg: Math.round(pack.priceInr / pack.weightKg),
      });

      setAddedToast(`Added ${pack.title} to Cart • ₹${pack.priceInr.toLocaleString('en-IN')}!`);
      setTimeout(() => setAddedToast(null), 3000);
    }
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello Cardanova Spices, I am interested in Domestic Bulk Orders (MOQ 50 kg) of Nature’s Finest Premium Green Cardamom. Please share current wholesale rates and lot details.`
    );
    window.open(`https://wa.me/${UPI_CONFIG.supportWhatsApp}?text=${text}`, '_blank');
  };

  return (
    <section
      id="domestic-india"
      className="relative overflow-hidden bg-[#FBF9F5] text-[#112D15] py-20 sm:py-28 border-b border-stone-200"
    >
      {/* Background Decorative Texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #112D15 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating Added-to-Cart Toast */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -24, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[800] bg-[#112D15] text-[#FAF8F5] px-6 py-3.5 rounded-full shadow-2xl border border-[#C5A046]/70 flex items-center gap-3 text-xs sm:text-sm font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-[#C5A046] text-[#112D15] flex items-center justify-center font-bold">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{addedToast}</span>
            <button
              onClick={onNavigateToPackets}
              className="ml-2 px-3 py-1 bg-[#C5A046] text-[#112D15] rounded-full text-xs font-semibold hover:bg-[#E2BF63] transition-colors cursor-pointer"
            >
              View Catalog
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 relative z-10">
        {/* ── Section Header: Product Presentation ── */}
        <div className="mb-14 sm:mb-20 pb-12 border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8B712A]/30 bg-[#FFF9ED] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#8B712A] mb-5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Single Origin • Idukki Highlands • Pan-India Express</span>
              </div>

              {/* Title Requirement: Nature’s Finest – Premium Green Cardamom */}
              <h2 className="font-display font-light text-[#112D15] text-3xl sm:text-5xl lg:text-6xl leading-[1.12] tracking-tight">
                Nature’s Finest –
                <span className="block font-serif italic gold-gradient-text text-3xl sm:text-5xl lg:text-6xl font-normal mt-1 sm:mt-2">
                  Premium Green Cardamom
                </span>
              </h2>

              <p className="mt-5 text-stone-600 text-base sm:text-lg leading-relaxed font-light">
                Hand-harvested at optimal maturity from high-altitude estates in Idukki, Kerala. Flue-cured within hours of picking to lock in volatile essential oils, natural emerald vibrancy, and intense sweetness. We classify our flagship harvest by bespoke packaging options crafted for tabletop elegance, luxury gifting, and culinary volume.
              </p>
            </div>

            {/* Premium Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3.5 w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-3.5 rounded-2xl bg-white border border-stone-200/90 p-4 shadow-sm hover:border-[#8B712A]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9ED] border border-[#8B712A]/25 flex items-center justify-center shrink-0 text-[#8B712A]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#112D15] block">Pan-India Express</span>
                  <span className="text-[11px] text-stone-500 block">Fast tracked door delivery</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-white border border-stone-200/90 p-4 shadow-sm hover:border-[#8B712A]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9ED] border border-[#8B712A]/25 flex items-center justify-center shrink-0 text-[#8B712A]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#112D15] block">100% Single Origin</span>
                  <span className="text-[11px] text-stone-500 block">Pure Idukki, Kerala</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-white border border-stone-200/90 p-4 shadow-sm hover:border-[#8B712A]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#FFF9ED] border border-[#8B712A]/25 flex items-center justify-center shrink-0 text-[#8B712A]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#112D15] block">Aroma-Lock Formats</span>
                  <span className="text-[11px] text-stone-500 block">Sealed for peak flavor</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Packaging Options: Classified by Quantities ── */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8B712A] mb-1">
                <span>Tailored Pack Sizes</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl text-[#112D15] font-light">
                Packaging Options & Available Quantities
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-light mt-1 max-w-2xl">
                Choose from our 5 preservation formats. Each quantity is engineered with dedicated packaging to seal in authentic flavor from the plantation to your pantry.
              </p>
            </div>

            <button
              onClick={onNavigateToPackets}
              className="inline-flex items-center gap-2 rounded-full border border-[#8B712A]/40 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#8B712A] hover:bg-[#8B712A] hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
            >
              <span>VIEW FULL DOMESTIC CATALOG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spacious 5-Option Luxury Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-6">
            {packagingOptions.map((pack, index) => {
              const discountPercent = Math.round(
                ((pack.originalPriceInr - pack.priceInr) / pack.originalPriceInr) * 100
              );
              const isSelected = selectedPackId === pack.id;

              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'border-[#8B712A] shadow-xl ring-2 ring-[#8B712A]/20'
                      : 'border-stone-200/90 shadow-sm hover:shadow-lg hover:border-[#8B712A]/50'
                  }`}
                >
                  {/* Top Image Showcase — Taller luxury presentation with drop shadow */}
                  <div className="relative aspect-[4/5] sm:h-64 bg-[#F8F5F0] overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={pack.image}
                      alt={pack.title}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quantity Badge (Top-Right, high contrast) */}
                    <div className="absolute top-3 right-3 z-20 bg-[#112D15] text-[#FAF8F5] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-[#C5A046]/40 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E2BF63]" />
                      <span>{pack.weight}</span>
                    </div>

                    {/* Concise Packaging Type Tag (Top-Left) */}
                    <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md text-[#8B712A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs border border-stone-200">
                      {pack.packagingType === 'Bottle' ? 'Glass Bottle' : pack.packagingType === 'Square Box' ? 'Gift Box' : 'Zipper Pouch'}
                    </div>

                    {/* Discount Badge */}
                    <div className="absolute bottom-3 left-3 z-20 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {discountPercent}% OFF
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Highlight Badge */}
                      {pack.badge && (
                        <span className="inline-block text-[10px] font-bold text-[#8B712A] uppercase tracking-wider mb-1">
                          ★ {pack.badge}
                        </span>
                      )}

                      <h4 className="font-display text-lg font-semibold text-[#112D15] leading-snug">
                        {pack.title}
                      </h4>

                      <p className="text-[11px] text-[#8B712A] font-medium mt-0.5">
                        {pack.subtitle}
                      </p>

                      <p className="text-stone-500 text-xs mt-2 line-clamp-2 leading-relaxed font-light">
                        {pack.description}
                      </p>
                    </div>

                    {/* Ideal For Note */}
                    <div className="bg-[#FAF8F5] rounded-xl p-2.5 border border-stone-100">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
                        Best For:
                      </span>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-tight">
                        {pack.idealFor}
                      </p>
                    </div>

                    {/* Price and Action Bar */}
                    <div className="pt-3 border-t border-stone-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                            Direct Price
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display text-xl font-bold text-[#112D15]">
                              ₹{pack.priceInr.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-stone-400 line-through">
                              ₹{pack.originalPriceInr.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSpecModal(pack);
                          }}
                          className="text-[11px] text-stone-400 hover:text-[#8B712A] inline-flex items-center gap-0.5 cursor-pointer"
                          title="View Specifications"
                        >
                          <Info className="w-3 h-3" />
                          <span>Specs</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(pack);
                          }}
                          className="w-full py-2.5 px-2 rounded-xl border border-[#112D15] hover:bg-[#112D15] hover:text-[#FAF8F5] text-[#112D15] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Cart</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(pack);
                            onNavigateToPackets();
                          }}
                          className="w-full py-2.5 px-2 rounded-xl gold-gradient-bg text-[#071309] text-xs font-bold uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── For Larger Indian Buyers: Domestic Bulk Orders – MOQ 50 kg ── */}
        <div className="rounded-3xl bg-[#0C2010] text-[#FAF8F5] p-8 sm:p-12 border border-[#C5A046]/40 shadow-2xl relative overflow-hidden mb-16">
          {/* Ambient Gold Glow & Texture */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15 pointer-events-none blur-3xl"
            style={{ background: '#C5A046' }}
          />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 pointer-events-none blur-3xl"
            style={{ background: '#2E6930' }}
          />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-white/10">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A046]/20 border border-[#C5A046]/40 text-[#E2BF63] text-[11px] font-semibold uppercase tracking-widest">
                  <Package className="w-3.5 h-3.5" />
                  <span>Wholesale & Institutional Spice Supply</span>
                </div>

                {/* Exact Requirement Title */}
                <h3 className="font-display text-3xl sm:text-4xl font-light text-[#FAF8F5] leading-tight">
                  For Larger Indian Buyers:
                  <span className="block font-serif italic text-[#E2BF63] text-2xl sm:text-3xl font-normal mt-1">
                    Domestic Bulk Orders – MOQ 50 kg
                  </span>
                </h3>

                <p className="text-sm text-stone-300 font-light leading-relaxed">
                  We supply wholesale whole green cardamom directly from Kerala auction hubs to Indian spice merchants, confectioners, sweet manufacturers, Ayurvedic pharmacies, tea blending houses, and commercial kitchens across India.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal('Domestic Bulk Orders – MOQ 50 kg')}
                  className="rounded-full gold-gradient-bg px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#071309] hover:brightness-110 transition-all cursor-pointer text-center shadow-xl flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>REQUEST BULK PRICE (MOQ 50 KG)</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="rounded-full border border-white/25 bg-white/10 hover:bg-white/15 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <span>CHAT WITH COMMODITY DESK</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Commercial Bulk Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-sm">
                <div className="text-xl font-bold font-mono text-[#E2BF63] mb-1">MOQ 50 kg</div>
                <div className="text-xs font-semibold text-white">Direct Wholesale Volume</div>
                <p className="text-[11px] text-stone-300 mt-1 font-light leading-snug">
                  Packed in food-grade multi-layer bags or master sacks tailored for storage.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-sm">
                <div className="text-xl font-bold font-mono text-[#E2BF63] mb-1">Direct Wholesale</div>
                <div className="text-xs font-semibold text-white">Transparent Origin Pricing</div>
                <p className="text-[11px] text-stone-300 mt-1 font-light leading-snug">
                  Direct farm-gate wholesale rates with zero unnecessary intermediary markups.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-sm">
                <div className="text-xl font-bold font-mono text-[#E2BF63] mb-1">≤ 9.5% Moisture</div>
                <div className="text-xs font-semibold text-white">Flue-Cured Lab Quality</div>
                <p className="text-[11px] text-stone-300 mt-1 font-light leading-snug">
                  High volatile oil content with lot-specific inspection and quality report.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-sm">
                <div className="text-xl font-bold font-mono text-[#E2BF63] mb-1">Pan-India Freight</div>
                <div className="text-xs font-semibold text-white">Insured Doorstep Cargo</div>
                <p className="text-[11px] text-stone-300 mt-1 font-light leading-snug">
                  Fast road, train, and air logistics with verified invoice and e-way bill.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Clear Navigation Across All 3 Order Scales ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between hover:border-[#8B712A]/40 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B712A] block mb-1">
                Option 1 • Consumer & Kitchens
              </span>
              <h4 className="font-display text-lg font-semibold text-[#112D15]">
                Domestic Retail Packets
              </h4>
              <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">
                Fixed transparent pricing for 50g Bottle, 100g Square Box, 250g, 500g, and 1kg Zipper Pouches with direct online UPI payment.
              </p>
            </div>
            <button
              onClick={onNavigateToPackets}
              className="mt-5 text-xs font-semibold text-[#8B712A] hover:text-[#5E4A16] inline-flex items-center gap-1.5 cursor-pointer group"
            >
              <span>Explore Retail Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between hover:border-[#8B712A]/40 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B712A] block mb-1">
                Option 2 • Indian Commercial
              </span>
              <h4 className="font-display text-lg font-semibold text-[#112D15]">
                Domestic Bulk (MOQ 50 kg)
              </h4>
              <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">
                Direct wholesale pricing for Indian spice traders, sweet makers, caterers, and wholesale distributors.
              </p>
            </div>
            <button
              onClick={() => onOpenQuoteModal('Domestic Bulk Orders – MOQ 50 kg')}
              className="mt-5 text-xs font-semibold text-[#8B712A] hover:text-[#5E4A16] inline-flex items-center gap-1.5 cursor-pointer group"
            >
              <span>Request Wholesale Rates</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between hover:border-[#8B712A]/40 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B712A] block mb-1">
                Option 3 • Global Trade
              </span>
              <h4 className="font-display text-lg font-semibold text-[#112D15]">
                Export & International (MOQ 100 kg+)
              </h4>
              <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">
                FOB / CIF containerized shipping from Cochin & Tuticorin ports with full phytosanitary & Spices Board export clearance.
              </p>
            </div>
            <button
              onClick={() => onOpenQuoteModal('International Export Trade Order (MOQ 100 kg+)')}
              className="mt-5 text-xs font-semibold text-[#8B712A] hover:text-[#5E4A16] inline-flex items-center gap-1.5 cursor-pointer group"
            >
              <span>Request Export Quote</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Packaging Specifications Modal ── */}
      <AnimatePresence>
        {activeSpecModal && (
          <div className="fixed inset-0 z-[750] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden text-[#112D15]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B712A]">
                    Packaging Specifications
                  </span>
                  <h3 className="font-display text-xl font-bold mt-0.5">
                    {activeSpecModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSpecModal(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Packaging Format</span>
                  <span className="font-semibold text-right">{activeSpecModal.specs.format}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Sealing Technology</span>
                  <span className="font-semibold text-right">{activeSpecModal.specs.sealing}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Shelf Life</span>
                  <span className="font-semibold text-right">{activeSpecModal.specs.shelfLife}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Net Quantity</span>
                  <span className="font-semibold text-right">{activeSpecModal.weight}</span>
                </div>
                <div className="pt-2">
                  <span className="text-stone-500 font-medium block mb-1">Recommended Usage</span>
                  <p className="text-stone-700 font-light leading-relaxed">
                    {activeSpecModal.idealFor}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveSpecModal(null)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(activeSpecModal);
                    setActiveSpecModal(null);
                  }}
                  className="px-5 py-2 rounded-full gold-gradient-bg text-[#071309] text-xs font-bold uppercase tracking-wider hover:brightness-110 cursor-pointer"
                >
                  Add to Cart • ₹{activeSpecModal.priceInr.toLocaleString('en-IN')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
