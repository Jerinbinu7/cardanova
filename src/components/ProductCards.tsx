import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { CartItem } from './CartDrawer';
import { getFeaturedProducts } from '../services/productsService';
import { getAuctionPrice } from '../services/auctionPriceService';
import { ShoppingCart, ArrowRight, Plus, Minus } from 'lucide-react';
import { formatDisplayPrice } from '../utils/translation';

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
    gradeName: 'Extra Bold Green',
    badge: 'Flagship Grade',
    badgePrimary: true,
    origin: 'Single-Origin Idukki High Elevation',
    packaging: '5 kg Multi-Layer Vacuum Packs',
    moq: '25 kg',
    volatile: '>8.5% V/W',
    pricePerKg: 3500,
    defaultQtyKg: 25,
    image: '/images/cardamom-8.5mm.jpg',
  },
  {
    id: '8.0mm-premium',
    gradeNum: '8.0',
    gradeUnit: 'mm',
    gradeName: 'Premium Bold Green',
    badge: 'High Export Demand',
    badgePrimary: false,
    origin: 'Handpicked by Kerala Farmers',
    packaging: '10 kg Vacuum Bags',
    moq: '50 kg',
    volatile: '>8.0% V/W',
    pricePerKg: 3200,
    defaultQtyKg: 50,
    image: '/images/cardamom-8.0mm.jpg',
  },
  {
    id: '7.5mm-export',
    gradeNum: '7.5',
    gradeUnit: 'mm',
    gradeName: 'Export Standard Green',
    badge: 'Export Standard',
    badgePrimary: false,
    origin: 'Flue-Cured Peak Pod Freshness',
    packaging: '25 kg Jute + PE Liner',
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
    gradeName: 'Commercial Grade Green',
    badge: 'Commercial Grade',
    badgePrimary: false,
    origin: 'Direct Estate Harvest',
    packaging: '25 kg HDPE Woven Bags',
    moq: '250 kg',
    volatile: '>7.0% V/W',
    pricePerKg: 2600,
    defaultQtyKg: 250,
    image: '/images/cardamom-7.0mm.jpg',
  },
  {
    id: 'bleached-half',
    gradeNum: 'BL',
    gradeUnit: '',
    gradeName: 'Bleached / Half Bleached',
    badge: 'Gulf & ME Markets',
    badgePrimary: false,
    origin: 'Chemically Treated · Food-Grade Safe',
    packaging: '10 kg / 25 kg as required',
    moq: '50 kg',
    volatile: '>7.0% V/W',
    pricePerKg: 2200,
    defaultQtyKg: 50,
    image: '/images/cardamom-bleached.jpg',
  },
];

function CardamomCard({
  item,
  index,
  onOpenQuoteModal,
  onAddToCart,
}: {
  item: typeof CARDAMOM_GRADES[0];
  index: number;
  onOpenQuoteModal: (g?: string, pricePerKg?: number) => void;
  onAddToCart?: (item: CartItem) => void;
}) {
  const [qtyKg, setQtyKg] = useState(item.defaultQtyKg);
  const [addedToast, setAddedToast] = useState(false);
  const priceInfo = formatDisplayPrice(item.pricePerKg);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({
        id: item.id,
        gradeName: item.gradeName,
        gradeNum: item.gradeNum,
        gradeUnit: item.gradeUnit,
        image: item.image,
        quantityKg: qtyKg,
        packaging: item.packaging,
        pricePerKg: item.pricePerKg,
      });
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#071309] border border-white/[0.06] hover:border-[#C5A046]/40 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(197,160,70,0.08)]"
    >
      {/* Toast */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-3 left-3 right-3 z-20 rounded-xl gold-gradient-bg px-4 py-2.5 text-center text-[#071309] font-semibold text-xs shadow-lg"
          >
            ✓ Added {qtyKg} kg to Cart!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden shrink-0">
        <img
          src={item.image}
          alt={item.gradeName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071309] via-[#071309]/30 to-transparent" />
        {item.badge && (
          <div className="absolute top-3 left-3 rounded-full gold-gradient-bg px-3 py-1 text-[#071309] font-semibold text-[10px] uppercase tracking-wider shadow-sm z-10">
            {item.badge}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Name & Description */}
        <div>
          <h3 className="font-display text-lg font-light text-[#FAF8F5] leading-snug">
            {item.gradeName}
          </h3>
          <p className="text-xs text-stone-400 mt-1 font-light leading-relaxed line-clamp-2">
            {item.origin}
          </p>
        </div>

        {/* Price display */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-stone-400 font-light">Price: </span>
            <span translate="no" className="notranslate font-sans text-sm sm:text-base font-normal text-stone-200">{priceInfo.amountStr}</span>
            <span className="text-xs text-stone-400 font-light"> / kg</span>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 border border-white/[0.06]">
          <span className="text-xs text-stone-400 font-light">Quantity</span>
          <div translate="no" className="notranslate flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQtyKg((q) => Math.max(1, q <= 5 ? q - 1 : q - 5))}
              className="w-7 h-7 rounded-lg border border-[#C5A046]/30 bg-transparent text-[#C5A046] hover:bg-[#C5A046]/10 transition-colors cursor-pointer text-sm font-bold flex items-center justify-center active:scale-95 select-none"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 pointer-events-none" />
            </button>
            <span translate="no" className="notranslate font-mono text-xs text-[#FAF8F5] min-w-[50px] text-center font-medium select-none">
              {qtyKg} kg
            </span>
            <button
              type="button"
              onClick={() => setQtyKg((q) => q + (q < 5 ? 1 : 5))}
              className="w-7 h-7 rounded-lg border border-[#C5A046]/30 bg-transparent text-[#C5A046] hover:bg-[#C5A046]/10 transition-colors cursor-pointer text-sm font-bold flex items-center justify-center active:scale-95 select-none"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-auto pt-1">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-xl border border-[#C5A046]/30 bg-white/[0.03] py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#C5A046] hover:bg-[#C5A046]/10 hover:border-[#C5A046]/50 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5 pointer-events-none" />
            <span>Cart</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuoteModal(`${item.gradeNum}${item.gradeUnit} ${item.gradeName}`, item.pricePerKg)}
            className="w-full rounded-xl gold-gradient-bg py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#071309] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>RFQ</span>
            <ArrowRight className="w-3.5 h-3.5 pointer-events-none" />
          </button>
        </div>
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
        console.error('Failed to fetch live auction rate in ProductCards:', e);
      }

      try {
        const prods = await getFeaturedProducts(4);
        if (prods && prods.length > 0) {
          const mapped = prods.map((p, idx) => {
            const sizeStr = p.grades?.[0]?.size_mm || p.specifications?.find((s) => s.label.toLowerCase().includes('size'))?.value || '';
            const fullGradeText = `${p.name} ${p.export_grade || ''} ${sizeStr}`;
            return {
              id: p.id,
              gradeNum: sizeStr ? sizeStr.replace('mm', '').replace('+', '').trim() : String(8.5 - idx * 0.5),
              gradeUnit: sizeStr.includes('mm') ? 'mm' : '',
              gradeName: p.name,
              badge: p.export_grade || sizeStr || (p.featured ? 'Flagship Grade' : ''),
              badgePrimary: p.featured,
              origin: p.short_description || p.long_description || p.specifications?.find((s) => s.label === 'Origin')?.value || 'High-grade single origin green cardamom',
              packaging: p.packaging_info || '5 kg Multi-Layer Vacuum Packs',
              moq: '25 kg',
              volatile: p.specifications?.find((s) => s.label.toLowerCase().includes('oil'))?.value || '>8.0% V/W',
              pricePerKg: getGradeInrPrice(fullGradeText, sizeStr, liveAvg, idx),
              defaultQtyKg: 25,
              image: p.main_image_url || p.images?.[0]?.url || CARDAMOM_GRADES[idx % CARDAMOM_GRADES.length].image,
            };
          });
          setCards(mapped);
        } else {
          setCards(CARDAMOM_GRADES.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
        setCards(CARDAMOM_GRADES.slice(0, 4));
      }
    }
    fetchProducts();
  }, []);

  return (
    <section
      id="products"
      className="relative overflow-hidden bg-[#0A1F0D] text-[#FAF8F5] py-16 sm:py-28"
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
        {/* Header — clean, editorial */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-8">
          <div>
            <span className="label-caps text-[#C5A046] text-[10px]">Single-Origin · Idukki, Kerala</span>
            <h2
              className="font-display font-light text-[#FAF8F5] mt-3 leading-[0.92]"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.8rem)' }}
            >
              Premium Green<br />
              <em className="not-italic gold-gradient-text">Cardamom Grades</em>
            </h2>
            <div className="mt-5 h-px w-16 bg-[#C5A046]/40" />
          </div>

          <div className="lg:text-right shrink-0 max-w-xs lg:max-w-md">
            <p className="text-xs text-stone-500 font-light leading-relaxed mb-4">
              Direct farm-to-export sourcing. Select a grade, configure quantity, add to cart or request a custom FOB/CIF quotation.
            </p>
            <div className="flex flex-wrap items-center lg:justify-end gap-2.5">
              {onNavigateToPackets && (
                <button
                  type="button"
                  onClick={onNavigateToPackets}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A046]/50 bg-[#112D15]/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#E2BF63] hover:bg-[#112D15] hover:border-[#C5A046] transition-all cursor-pointer shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E2BF63] animate-pulse" />
                  <span>🇮🇳 Retail Packs (50g - 1kg)</span>
                </button>
              )}
              <MagneticButton
                as="button"
                onClick={onNavigateToProducts}
                cursorLabel="Catalogue"
                className="inline-flex items-center gap-2 rounded-full border border-[#C5A046]/30 bg-transparent px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#C5A046] hover:bg-[#C5A046]/8 hover:border-[#C5A046]/60 transition-all cursor-pointer"
              >
                Full Catalogue <ArrowRight className="w-3.5 h-3.5" />
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
          <p className="text-xs text-stone-500 font-light">
            All grades ship with Certificate of Origin · Phytosanitary Report · FSSAI Lab Analysis
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
