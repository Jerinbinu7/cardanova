import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { CartItem } from './CartDrawer';
import { getProducts } from '../services/productsService';
import { getAuctionPrice } from '../services/auctionPriceService';

interface ProductCardsProps {
  onOpenQuoteModal: (grade?: string) => void;
  onNavigateToProducts: () => void;
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
    pricePerKg: 32,
    defaultQtyKg: 25,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop',
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
    pricePerKg: 28,
    defaultQtyKg: 50,
    image: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=1000&auto=format&fit=crop',
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
    pricePerKg: 24,
    defaultQtyKg: 100,
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '7.0mm-bold-std',
    gradeNum: '7.0',
    gradeUnit: 'mm',
    gradeName: 'Bold Standard Green',
    badge: 'Economy Export',
    badgePrimary: false,
    origin: 'Kerala Smallholder Network',
    packaging: '25 kg Jute + PE Liner',
    moq: '100 kg',
    volatile: '>7.0% V/W',
    pricePerKg: 20,
    defaultQtyKg: 100,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop',
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
    pricePerKg: 22,
    defaultQtyKg: 50,
    image: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=1000&auto=format&fit=crop',
  },
];

// Cart icon SVG
function CartIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function GradeCard({
  item,
  index,
  onOpenQuoteModal,
  onAddToCart,
}: {
  item: typeof CARDAMOM_GRADES[0];
  index: number;
  onOpenQuoteModal: (g?: string) => void;
  onAddToCart?: (item: CartItem) => void;
}) {
  const [qtyKg, setQtyKg] = useState(item.defaultQtyKg);
  const [addedToast, setAddedToast] = useState(false);

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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#C5A046]/25 bg-[#071309] transition-all duration-400 hover:border-[#C5A046]/60 hover:shadow-[0_16px_48px_rgba(197,160,70,0.1)]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#071309] via-[#071309]/20 to-transparent" />

        {/* Badges row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span
            className={`rounded-full px-2.5 py-1 label-caps text-[9px] sm:text-[10px] truncate max-w-[60%] shrink-0 ${
              item.badgePrimary
                ? 'gold-gradient-bg text-[#071309] font-semibold'
                : 'border border-[#C5A046]/40 bg-[#071309]/80 text-[#C5A046] backdrop-blur-md'
            }`}
          >
            {item.badge}
          </span>
          {/* Price */}
          <div className="rounded-xl border border-[#C5A046]/40 bg-[#071309]/90 px-2.5 py-1 backdrop-blur-md shrink-0">
            <span className="text-xs font-display text-[#C5A046] font-medium">${item.pricePerKg}/kg</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 gap-4">
        {/* Grade hero */}
        <div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-display text-4xl sm:text-5xl font-light gold-gradient-text leading-none">
              {item.gradeNum}
            </span>
            {item.gradeUnit && (
              <span className="font-display text-base text-[#C5A046]/70 font-light">{item.gradeUnit}</span>
            )}
          </div>
          <h3 className="font-display text-lg sm:text-xl font-light text-[#FAF8F5] leading-snug">
            {item.gradeName}
          </h3>
        </div>

        {/* Spec pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'MOQ', val: item.moq },
            { label: 'Oils', val: item.volatile },
            { label: 'Pack', val: item.packaging },
          ].map((spec) => (
            <div
              key={spec.label}
              className="flex items-center gap-1.5 rounded-lg border border-[#A18637]/25 bg-[#112D15]/80 px-2.5 py-1"
            >
              <span className="label-caps text-[#A18637]" style={{ fontSize: '0.48rem' }}>{spec.label}</span>
              <span className="text-[10px] text-stone-300 font-light">{spec.val}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-stone-400 font-light leading-relaxed">
          {item.origin} · Vacuum-sealed aroma retention.
        </p>

        {/* Quantity selector */}
        <div className="flex items-center justify-between rounded-xl bg-[#112D15]/80 px-4 py-2.5 border border-[#A18637]/30 mt-auto">
          <span className="text-xs text-stone-400 font-light">Qty:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQtyKg((q) => Math.max(1, q <= 5 ? q - 1 : q - 5))}
              className="w-7 h-7 rounded-lg border border-[#C5A046]/40 bg-[#071309] text-[#C5A046] hover:bg-[#C5A046] hover:text-[#071309] transition-colors cursor-pointer text-sm font-bold flex items-center justify-center"
              title="Decrease quantity (min 1 kg)"
            >
              −
            </button>
            <span className="font-mono text-sm text-[#FAF8F5] min-w-[52px] text-center font-medium">
              {qtyKg} kg
            </span>
            <button
              onClick={() => setQtyKg((q) => q + (q < 5 ? 1 : 5))}
              className="w-7 h-7 rounded-lg border border-[#C5A046]/40 bg-[#071309] text-[#C5A046] hover:bg-[#C5A046] hover:text-[#071309] transition-colors cursor-pointer text-sm font-bold flex items-center justify-center"
              title="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-full border border-[#C5A046]/60 bg-white/5 py-3 label-caps text-[#FAF8F5] hover:bg-[#C5A046] hover:text-[#071309] hover:border-[#C5A046] transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{ fontSize: '0.6rem' }}
          >
            <CartIcon className="w-3.5 h-3.5" />
            Add to Cart
          </button>

          <button
            onClick={() => onOpenQuoteModal(`${item.gradeNum}${item.gradeUnit} ${item.gradeName}`)}
            className="w-full rounded-full gold-gradient-bg py-3 label-caps text-[#071309] hover:brightness-110 transition-all cursor-pointer font-semibold"
            style={{ fontSize: '0.6rem' }}
          >
            Request RFQ →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function getGradeUsdPrice(name: string, sizeMm?: string, liveAvgInr: number = 3049): number {
  const str = `${name} ${sizeMm || ''}`.toLowerCase();
  let mult = 1.0;
  if (str.includes('8.5') || str.includes('extra bold')) mult = 1.15;
  else if (str.includes('8.0') || str.includes('8mm') || str.includes('premium')) mult = 1.05;
  else if (str.includes('7.5') || str.includes('export')) mult = 0.95;
  else if (str.includes('7.0') || str.includes('7mm') || str.includes('commercial')) mult = 0.85;
  else if (str.includes('6.5') || str.includes('mix') || str.includes('ageb')) mult = 0.70;
  else if (str.includes('rej') || str.includes('oil') || str.includes('extract')) mult = 0.50;

  const inrPrice = Math.round(liveAvgInr * mult);
  return Math.round(inrPrice / 83.5);
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
        const prods = await getProducts(true);
        if (prods && prods.length > 0) {
          const mapped = prods.map((p, idx) => {
            const sizeStr = p.grades?.[0]?.size_mm || '';
            return {
              id: p.id,
              gradeNum: sizeStr ? sizeStr.replace('mm', '') : String(8.5 - idx * 0.5),
              gradeUnit: sizeStr.includes('mm') ? 'mm' : '',
              gradeName: p.name,
              badge: p.featured ? 'Flagship Grade' : (p.category?.name ? p.category.name.toUpperCase() : 'Export Grade'),
              badgePrimary: p.featured,
              origin: p.short_description || p.specifications?.find((s) => s.label === 'Origin')?.value || 'Idukki, Kerala',
              packaging: p.packaging_info || '5 kg Multi-Layer Vacuum Packs',
              moq: '25 kg',
              volatile: p.specifications?.find((s) => s.label.toLowerCase().includes('oil'))?.value || '>8.0% V/W',
              pricePerKg: getGradeUsdPrice(p.name, sizeStr, liveAvg),
              defaultQtyKg: 25,
              image: p.main_image_url || p.images?.[0]?.url || CARDAMOM_GRADES[idx % CARDAMOM_GRADES.length].image,
            };
          });
          setCards(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section
      id="products"
      className="relative overflow-hidden bg-[#112D15] text-[#FAF8F5]"
      style={{ paddingTop: '6rem', paddingBottom: '6rem' }}
    >
      {/* Subtle glows */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C5A046, transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C5A046, transparent)' }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-14 gap-6">
          <div>
            <span className="label-caps text-[#C5A046]">Single-Origin B2B Sourcing</span>
            <h2
              className="font-display font-light text-[#FAF8F5] mt-3 leading-[0.95]"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
            >
              Premium Green Cardamom
              <br />
              <em className="animate-shimmer not-italic">Grade Selection</em>
            </h2>
            <div className="mt-4 luxury-divider w-24" />
          </div>

          <div className="lg:text-right shrink-0">
            <p className="text-xs text-stone-400 font-light max-w-xs lg:ml-auto mb-5">
              Select grade & quantity to add to your bulk cart or request a custom FOB/CIF quotation.
            </p>
            <MagneticButton
              as="button"
              onClick={onNavigateToProducts}
              cursorLabel="Catalogue"
              className="rounded-full border border-[#C5A046]/40 bg-transparent px-6 py-2.5 label-caps text-[#C5A046] hover:bg-[#C5A046]/10 hover:border-[#C5A046]/70 transition-all cursor-pointer"
            >
              View Full Specifications →
            </MagneticButton>
          </div>
        </div>

        {/* Grade Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {cards.map((item, i) => (
            <GradeCard
              key={item.id}
              item={item}
              index={i}
              onOpenQuoteModal={onOpenQuoteModal}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-14 text-center"
        >
          <button
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-3 rounded-full gold-gradient-bg px-7 sm:px-9 py-4 label-caps text-[#071309] hover:brightness-110 transition-all cursor-pointer shadow-2xl gold-glow font-semibold text-center"
          >
            Explore Complete Export Catalogue & Bulk Discounts →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
