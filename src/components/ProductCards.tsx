import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { CartItem } from './CartDrawer';
import { getFeaturedProducts } from '../services/productsService';
import { getAuctionPrice } from '../services/auctionPriceService';
import { ArrowRight } from 'lucide-react';

interface ProductCardsProps {
  onOpenQuoteModal: (grade?: string, pricePerKg?: number) => void;
  onNavigateToProducts: () => void;
  onNavigateToPackets?: () => void;
  onAddToCart?: (item: CartItem) => void;
}

const CARDAMOM_GRADES = [
  {
    id: '8.5mm-bold',
    gradeNum: '8.5',
    gradeUnit: 'mm',
    gradeName: '8.5 mm+ Extra Bold (AGEB)',
    badge: 'AGEB Extra Bold',
    badgePrimary: true,
    origin: 'Top 1% harvest. Maximum pod density and highest volatile essential oil concentration (>8.5% V/W). Primary export to GCC luxury retail & coffee blending.',
    packaging: '5 kg Multi-Layer Vacuum Packs / 10 kg Master',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>8.5% V/W',
    pricePerKg: 3500,
    defaultQtyKg: 100,
    image: '/images/cardamom-8.5mm.jpg',
  },
  {
    id: '8.0mm-premium',
    gradeNum: '8.0',
    gradeUnit: 'mm',
    gradeName: '8.0 mm+ Premium Bold (AGB)',
    badge: 'AGB Premium Bold',
    badgePrimary: false,
    origin: 'Uniformly large deep emerald pods with signature camphor notes. Preferred by European & Gulf importers, gourmet blenders, and confectionery.',
    packaging: '10 kg Vacuum Foil Bags / 25 kg Cartons',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>8.0% V/W',
    pricePerKg: 3200,
    defaultQtyKg: 100,
    image: '/images/cardamom-8.0mm.jpg',
  },
  {
    id: '7.5mm-export',
    gradeNum: '7.5',
    gradeUnit: 'mm',
    gradeName: '7.5 mm+ Export Select (AGS)',
    badge: 'AGS Export Select',
    badgePrimary: false,
    origin: 'The international benchmark for green cardamom export trade. Impeccable chromatic sorting, rich aroma profile, and consistent lot-to-lot diameter conformity.',
    packaging: '10 kg / 25 kg Jute with Inner Poly Liner',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>7.5% V/W',
    pricePerKg: 2900,
    defaultQtyKg: 100,
    image: '/images/cardamom-7.5mm.jpg',
  },
  {
    id: '7.0mm-commercial',
    gradeNum: '7.0',
    gradeUnit: 'mm',
    gradeName: '7.0 mm+ Commercial Bold (AGE)',
    badge: 'AGE Commercial Bold',
    badgePrimary: false,
    origin: 'Authentic Kerala green cardamom for industrial spice extractors, commercial foodservice, institutional kitchens, and bulk culinary manufacturing.',
    packaging: '25 kg HDPE Multi-Ply Woven Sacks',
    ports: 'FOB Cochin / CIF Worldwide',
    moq: '100 kg',
    volatile: '>7.0% V/W',
    pricePerKg: 2600,
    defaultQtyKg: 100,
    image: '/images/cardamom-7.0mm.jpg',
  },
];

function CardamomCard({
  item,
  index,
  onOpenQuoteModal,
}: {
  item: typeof CARDAMOM_GRADES[0];
  index: number;
  onOpenQuoteModal: (g?: string, pricePerKg?: number) => void;
  onAddToCart?: (item: CartItem) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#071309] border border-white/[0.08] hover:border-[#C5A046]/50 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(197,160,70,0.12)]"
    >
      {/* Image with Export Badges */}
      <div className="relative h-48 w-full overflow-hidden shrink-0">
        <img
          src={item.image}
          alt={item.gradeName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071309] via-[#071309]/30 to-transparent" />
        
        {/* Export Grade Code Badge */}
        {item.badge && (
          <div className="absolute top-3 left-3 rounded-full gold-gradient-bg px-3 py-1 text-[#071309] font-bold text-[10px] uppercase tracking-wider shadow-md z-10">
            {item.badge}
          </div>
        )}

        {/* Export MOQ Pill */}
        <div className="absolute top-3 right-3 rounded-full bg-[#071309]/90 border border-[#C5A046]/40 px-2.5 py-1 text-[#E2BF63] font-mono text-[10px] uppercase tracking-wider shadow-sm z-10">
          MOQ 100 kg
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 gap-3.5">
        {/* Name & Export Description */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A046]/80 font-semibold block mb-0.5">
            Export Grade Specification
          </span>
          <h3 className="font-display text-lg font-light text-[#FAF8F5] leading-snug">
            {item.gradeName}
          </h3>
          <p className="text-xs text-stone-400 mt-1.5 font-light leading-relaxed line-clamp-2">
            {item.origin}
          </p>
        </div>

        {/* Grade specs row */}
        <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2.5 border border-white/[0.08]">
          <div className="text-center">
            <div className="text-[10px] text-stone-500 font-light">Pod Caliber</div>
            <div className="text-xs text-stone-200 font-semibold mt-0.5 font-mono">{item.gradeNum}{item.gradeUnit}+</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] text-stone-500 font-light">Export MOQ</div>
            <div className="text-xs text-stone-200 font-semibold mt-0.5 font-mono">{item.moq}</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] text-stone-500 font-light">Volatile Oil</div>
            <div className="text-xs text-stone-200 font-semibold mt-0.5 font-mono">{item.volatile}</div>
          </div>
        </div>

        {/* Export Logistics & Packaging Details */}
        <div className="rounded-lg bg-black/30 p-2.5 border border-white/[0.05] space-y-1 text-[10px] text-stone-400 font-light">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Shipping:</span>
            <span className="text-stone-300 font-medium font-mono">FOB Cochin / CIF Global</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Packaging:</span>
            <span className="text-stone-300 truncate max-w-[170px] text-right font-medium">
              {item.packaging}
            </span>
          </div>
        </div>

        {/* Single RFQ CTA */}
        <button
          type="button"
          onClick={() => onOpenQuoteModal(`${item.gradeName}`)}
          className="mt-auto w-full rounded-xl gold-gradient-bg py-3 text-[10px] font-bold uppercase tracking-widest text-[#071309] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md"
        >
          <span>REQUEST EXPORT QUOTE (FOB/CIF)</span>
          <ArrowRight className="w-3.5 h-3.5 pointer-events-none" />
        </button>
      </div>
    </motion.div>
  );
}

function getGradeInrPrice(name: string, sizeMm?: string, liveAvgInr: number = 3049, idx: number = 0): number {
  const str = `${name} ${sizeMm || ''}`.toLowerCase();
  let mult = 1.0;

  if (str.includes('8.5') || str.includes('extra bold')) mult = 1.15;
  else if (str.includes('8.0') || str.includes('8.0mm') || str.includes('premium bold') || str.includes('8mm')) mult = 1.05;
  else if (str.includes('7.5') || str.includes('7.5mm') || str.includes('export')) mult = 0.95;
  else if (str.includes('7.0') || str.includes('7.0mm') || str.includes('7mm') || str.includes('commercial')) mult = 0.85;
  else if (str.includes('6.5') || str.includes('mix') || str.includes('ageb')) mult = 0.70;
  else if (str.includes('rej') || str.includes('oil') || str.includes('extract')) mult = 0.50;
  else {
    const fallbackMults = [1.15, 1.05, 0.95, 0.85, 0.70, 0.50];
    mult = fallbackMults[idx % fallbackMults.length];
  }

  return Math.round(liveAvgInr * mult);
}

export default function ProductCards({
  onOpenQuoteModal,
  onNavigateToProducts,
  onNavigateToPackets,
  onAddToCart,
}: ProductCardsProps) {
  const [cards, setCards] = useState(CARDAMOM_GRADES);

  useEffect(() => {
    async function fetchProducts() {
      let liveAvg = 3049;
      try {
        const auctionRes = await getAuctionPrice('small_cardamom');
        if (auctionRes?.data?.avgPrice) {
          const parsed = parseFloat(auctionRes.data.avgPrice.replace(/,/g, ''));
          if (!isNaN(parsed) && parsed > 0) liveAvg = parsed;
        }
      } catch (e) {
        console.error('Failed to fetch benchmark rate:', e);
      }

      try {
        const prods = await getFeaturedProducts(4);
        if (prods && prods.length > 0) {
          const mapped = prods.map((p, idx) => {
            const defaultItem = CARDAMOM_GRADES[idx % CARDAMOM_GRADES.length];
            const sizeStr = p.grades?.[0]?.size_mm || p.specifications?.find((s) => s.label.toLowerCase().includes('size'))?.value || '';
            const fullGradeText = `${p.name} ${p.export_grade || ''} ${sizeStr}`;
            const liveInrPrice = getGradeInrPrice(fullGradeText, sizeStr, liveAvg, idx);
            const finalPrice = (p.price_per_kg && p.price_per_kg > 0) ? p.price_per_kg : liveInrPrice;

            // Sanitize names and descriptions so test data ("best quality", "bestest quality") never appears
            let cleanGradeName = defaultItem.gradeName;
            if (p.name && p.name.length > 10 && !p.name.toLowerCase().includes('best')) {
              cleanGradeName = p.name;
            }

            let cleanOrigin = defaultItem.origin;
            if (p.short_description && p.short_description.length > 25 && !p.short_description.toLowerCase().includes('best')) {
              cleanOrigin = p.short_description;
            }

            let cleanNum = defaultItem.gradeNum;
            if (sizeStr) {
              if (sizeStr.includes('85') || sizeStr.includes('8.5')) cleanNum = '8.5';
              else if (sizeStr.includes('8.0') || sizeStr.includes('8mm') || sizeStr === '8') cleanNum = '8.0';
              else if (sizeStr.includes('7.5')) cleanNum = '7.5';
              else if (sizeStr.includes('7.0') || sizeStr.includes('7mm') || sizeStr === '7') cleanNum = '7.0';
            }

            return {
              id: p.id,
              gradeNum: cleanNum,
              gradeUnit: 'mm',
              gradeName: cleanGradeName,
              badge: defaultItem.badge,
              badgePrimary: p.featured,
              origin: cleanOrigin,
              packaging: p.packaging_info || defaultItem.packaging,
              ports: 'FOB Cochin / CIF Worldwide',
              moq: '100 kg',
              volatile: p.specifications?.find((s) => s.label.toLowerCase().includes('oil'))?.value || defaultItem.volatile,
              pricePerKg: finalPrice,
              defaultQtyKg: 100,
              image: p.main_image_url || p.images?.[0]?.url || defaultItem.image,
            };
          });
          setCards(mapped);
        } else {
          setCards(CARDAMOM_GRADES);
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
      className="relative overflow-hidden bg-[#0A1F0D] text-[#FAF8F5] py-16 sm:py-28 border-b border-white/[0.06]"
    >
      {/* Ambient glows */}
      <div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[120px] pointer-events-none"
        style={{ background: '#C5A046' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px] pointer-events-none"
        style={{ background: '#C5A046' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header — Authority Export Division Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C5A046]/40 bg-[#112D15] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A046] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2BF63] animate-pulse" />
              <span>International B2B Bulk Export Division • Containerized Cargo</span>
            </div>
            
            <h2
              className="font-display font-light text-[#FAF8F5] leading-[0.92]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.6rem)' }}
            >
              Bulk Green Cardamom<br />
              <em className="not-italic gold-gradient-text">Export Specifications</em>
            </h2>
            <div className="mt-5 h-px w-20 bg-[#C5A046]/40" />
          </div>

          <div className="lg:text-right shrink-0 max-w-xs lg:max-w-md">
            <p className="text-xs text-stone-300 font-light leading-relaxed mb-4">
              Direct containerized shipments dispatched via Cochin & Tuticorin ports. Sieve-calibrated pod diameters (7.0mm to 8.5mm+), Spices Board India export grading, and certified laboratory CoAs (Export MOQ 100 kg).
            </p>
            <div className="flex flex-wrap items-center lg:justify-end gap-2.5">
              {onNavigateToPackets && (
                <button
                  type="button"
                  onClick={onNavigateToPackets}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-stone-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm"
                >
                  <span>🇮🇳 Retail Packets (50g - 1kg)</span>
                </button>
              )}
              <MagneticButton
                as="button"
                onClick={onNavigateToProducts}
                cursorLabel="Export Catalogue"
                className="inline-flex items-center gap-2 rounded-full gold-gradient-bg px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#071309] hover:brightness-110 transition-all cursor-pointer shadow-lg"
              >
                <span>Full Export Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Grade Cards Grid — dynamically balanced for 1 to 4 products */}
        {(() => {
          const displayCards = cards.slice(0, 4);
          const count = displayCards.length;
          let gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
          if (count === 1) gridColsClass = "grid-cols-1 max-w-sm mx-auto";
          else if (count === 2) gridColsClass = "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
          else if (count === 3) gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";

          return (
            <div className={`grid ${gridColsClass} gap-6`}>
              {displayCards.map((item, i) => (
                <CardamomCard
                  key={item.id}
                  item={item}
                  index={i}
                  onOpenQuoteModal={onOpenQuoteModal}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          );
        })()}

        {/* Bottom strip — elegant */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/[0.06]"
        >
          <p className="text-xs text-stone-500 font-light max-w-xl">
            Certificates of origin, phytosanitary documents, laboratory reports and other export documents can be provided based on buyer and destination requirements.
          </p>
          <button
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-2.5 rounded-full gold-gradient-bg px-7 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-[#071309] hover:brightness-110 transition-all cursor-pointer shadow-lg whitespace-nowrap"
          >
            Explore Full Export Catalogue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
