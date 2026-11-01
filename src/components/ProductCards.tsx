import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Box } from 'lucide-react';
import { getFeaturedProducts } from '../services/productsService';
import { CartItem } from './CartDrawer';

interface ProductCardsProps {
  onOpenQuoteModal: (grade?: string, pricePerKg?: number) => void;
  onNavigateToProducts: () => void;
  onNavigateToPackets?: () => void;
  onAddToCart?: (item: CartItem) => void;
}

const CARDAMOM_GRADES = [
  {
    id: '8mm-plus',
    gradeNum: '8.0+',
    gradeUnit: 'mm',
    gradeName: '8 mm+ Extra Bold',
    badge: 'Extra Bold Reserve',
    origin: 'Top estate harvest. Maximum pod density and volatile essential oils. Flagship grade for GCC luxury retail and connoisseur blending.',
    packaging: '5 kg Vacuum Packs / 10 kg Master Carton',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>8.0% V/W',
    pricePerKg: 3500,
    image: '/images/cardamom-8.5mm.jpg',
  },
  {
    id: '7-8mm',
    gradeNum: '7.5',
    gradeUnit: 'mm',
    gradeName: '7.5 mm Export Bold',
    badge: 'Export Benchmark',
    origin: 'The global trade standard for Indian green cardamom. Impeccable chromatic sorting, vibrant green hue, and intense aroma.',
    packaging: '10 kg / 25 kg Jute with Poly Liner',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>7.5% V/W',
    pricePerKg: 2900,
    image: '/images/cardamom-7.5mm.jpg',
  },
  {
    id: '6-7mm',
    gradeNum: '6–7',
    gradeUnit: 'mm',
    gradeName: '6 to 7 mm Commercial',
    badge: 'Foodservice Standard',
    origin: 'Naturally cured Kerala green cardamom. Ideal for institutional food service, wholesale kitchen supply, and spice powder blenders.',
    packaging: '25 kg HDPE Multi-Ply Sacks',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>7.0% V/W',
    pricePerKg: 2600,
    image: '/images/cardamom-7.0mm.jpg',
  },
  {
    id: 'mixed-pods',
    gradeNum: 'MIX',
    gradeUnit: '',
    gradeName: 'Mixed Pods Bulk',
    badge: 'Natural Lot',
    origin: 'Natural unsorted estate harvest pods with intact seeds. Cost-effective volume grade for spice mills, masala grinders, and food production.',
    packaging: '25 kg / 50 kg Bulk Bags',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>6.5% V/W',
    pricePerKg: 2200,
    image: '/images/cardamom-mixed.jpg',
  },
  {
    id: 'rejection',
    gradeNum: 'IND',
    gradeUnit: '',
    gradeName: 'Distillation / Industrial',
    badge: 'Extraction Grade',
    origin: 'Open pods, loose seeds, and extraction cuts suited for essential oil steam distillation, oleoresin extraction, and herbal pharma.',
    packaging: '50 kg Industrial HDPE Sacks',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: 'Variable',
    pricePerKg: 1200,
    image: '/images/cardamom-extraction.jpg',
  },
];

export default function ProductCards({
  onOpenQuoteModal,
  onNavigateToProducts,
  onNavigateToPackets,
}: ProductCardsProps) {
  const [cards, setCards] = useState(CARDAMOM_GRADES);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const prods = await getFeaturedProducts(5);
        if (prods && prods.length > 0) {
          const mapped = prods.map((p, idx) => {
            const defaultItem = CARDAMOM_GRADES[idx % CARDAMOM_GRADES.length];
            const sizeStr =
              p.grades?.[0]?.size_mm ||
              p.specifications?.find((s) => s.label.toLowerCase().includes('size'))?.value ||
              '';

            let cleanGradeName = defaultItem.gradeName;
            if (p.name && p.name.length > 10 && !p.name.toLowerCase().includes('best')) {
              cleanGradeName = p.name;
            }

            let cleanOrigin = defaultItem.origin;
            if (
              p.short_description &&
              p.short_description.length > 25 &&
              !p.short_description.toLowerCase().includes('best')
            ) {
              cleanOrigin = p.short_description;
            }

            return {
              id: p.id,
              gradeNum: sizeStr || defaultItem.gradeNum,
              gradeUnit: sizeStr ? '' : defaultItem.gradeUnit,
              gradeName: cleanGradeName,
              badge: defaultItem.badge,
              origin: cleanOrigin,
              packaging: p.packaging_info || defaultItem.packaging,
              ports: 'FOB Cochin / CIF Worldwide',
              moq: '100 kg',
              volatile:
                p.specifications?.find((s) => s.label.toLowerCase().includes('oil'))?.value ||
                defaultItem.volatile,
              pricePerKg: p.price_per_kg || defaultItem.pricePerKg,
              image: p.main_image_url || p.images?.[0]?.url || defaultItem.image,
            };
          });
          setCards(mapped);
        }
      } catch (e) {
        console.error(e);
        setCards(CARDAMOM_GRADES);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section
      id="products"
      className="relative overflow-hidden bg-[#071309] text-[#FAF8F5] py-20 sm:py-28 border-b border-white/[0.08]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-8 pb-8 border-b border-white/[0.08]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A046]/40 bg-[#112D15] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A046] mb-3.5">
              <Sparkles className="w-3 h-3 text-[#E2BF63]" />
              <span>B2B Wholesale & Bulk Export Division</span>
            </div>

            <h2 className="font-display font-light text-[#FAF8F5] text-3xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Export-Grade Cardamom –
              <span className="font-serif italic text-[#E2BF63] font-normal block sm:inline sm:ml-2">
                Wholesale Specifications
              </span>
            </h2>

            <p className="mt-4 text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-xl">
              Sieve-calibrated pod diameters (6.0 mm to 8.5 mm+), Spices Board India certified export grading, and verified laboratory CoAs. Direct containerized sea/air cargo dispatched via Cochin & Tuticorin ports.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateToPackets && (
              <button
                type="button"
                onClick={onNavigateToPackets}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <span>🇮🇳 Domestic Packets (50g – 1kg)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateToProducts}
              className="inline-flex items-center gap-2 rounded-full gold-gradient-bg px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071309] hover:brightness-105 transition-all cursor-pointer shadow-md"
            >
              <span>Full Trade Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimal 5-Card Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {cards.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="group bg-[#0D2213] rounded-2xl border border-white/[0.08] hover:border-[#C5A046]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.gradeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2213] via-transparent to-transparent" />

                {/* Caliber Pill */}
                <div className="absolute top-3 left-3 bg-[#071309]/90 border border-[#C5A046]/40 text-[#E2BF63] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  {item.gradeNum}{item.gradeUnit}
                </div>

                {/* MOQ Badge */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-stone-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  MOQ 100 kg
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A046]/80 block mb-0.5">
                    {item.badge}
                  </span>
                  <h3 className="font-display text-base font-semibold text-[#FAF8F5] leading-snug">
                    {item.gradeName}
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-1.5 line-clamp-2 leading-relaxed">
                    {item.origin}
                  </p>
                </div>

                {/* Minimal Specs Strip */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-[11px] text-stone-300 font-light">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Packaging:</span>
                    <span className="text-right text-stone-200 font-medium truncate max-w-[130px]">
                      {item.packaging}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Moisture:</span>
                    <span className="text-stone-200 font-medium font-mono">≤ 9.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Volatile Oil:</span>
                    <span className="text-stone-200 font-medium font-mono">{item.volatile}</span>
                  </div>
                </div>

                {/* Request Quote Button */}
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal(item.gradeName, item.pricePerKg)}
                  className="w-full rounded-xl gold-gradient-bg py-2.5 text-xs font-bold uppercase tracking-wider text-[#071309] hover:brightness-105 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span>Request Trade Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Minimal Bottom Trust Note */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.08] text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A046]" />
            <span>Spices Board Export Registered • Phytosanitary & CoA Documentation Provided</span>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="text-stone-300 hover:text-[#C5A046] underline underline-offset-4 cursor-pointer"
          >
            Review Full Incoterms (FOB / CIF / CFR) →
          </button>
        </div>
      </div>
    </section>
  );
}
