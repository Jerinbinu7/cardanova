import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, SlidersHorizontal, Star, Plus, Minus } from 'lucide-react';
import { getProducts } from '../services/productsService';
import { getAuctionPrice } from '../services/auctionPriceService';
import { triggerGoogleTranslateSync, formatDisplayPrice } from '../utils/translation';
import type { CartItem } from './CartDrawer';

interface ProductsPageProps {
  onOpenQuoteModal: (grade?: string, pricePerKg?: number) => void;
  onAddToCart?: (item: CartItem) => void;
}

const PRODUCTS_CATALOGUE = [
  {
    id: '8.5mm-bold',
    category: 'flagship' as const,
    gradeNum: '8.5',
    gradeUnit: 'mm',
    gradeName: 'Extra Bold',
    size: '8.5 mm+',
    color: 'Deep Natural Emerald Green',
    origin: 'Idukki, Kerala, India',
    moisture: '< 9.5%',
    availability: 'Year-Round',
    packaging: '5kg Multi-Layer Vacuum Packs / 10kg Master Cartons',
    moq: '500 kg',
    hsCode: '0908.31.10',
    shelfLife: '24 Months',
    applications: 'Luxury Retail, High-End Gourmet, Middle East Coffee Blends, Premium Export',
    image: '/images/cardamom-8.5mm.jpg',
    badge: '8.5 mm',
    pricePerKg: 2850,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '8mm-premium',
    category: 'flagship' as const,
    gradeNum: '8.0',
    gradeUnit: 'mm',
    gradeName: 'Premium Bold',
    size: '8.0 mm – 8.4 mm',
    color: 'Vibrant Forest Green',
    origin: 'Idukki, Kerala, India',
    moisture: '< 10.0%',
    availability: 'In Stock',
    packaging: '10kg Vacuum Foil Bags / 25kg Cartons',
    moq: '1 Metric Ton',
    hsCode: '0908.31.10',
    shelfLife: '24 Months',
    applications: 'Premium Wholesale, Supermarket Labels, Confectionery & Beverage',
    image: '/images/cardamom-8.0mm.jpg',
    badge: '8.0 mm',
    pricePerKg: 2550,
    rating: 4.5,
    reviewCount: 98,
  },
  {
    id: '7.5mm-export',
    category: 'standard' as const,
    gradeNum: '7.5',
    gradeUnit: 'mm',
    gradeName: 'Export Grade',
    size: '7.5 mm – 7.9 mm',
    color: 'Rich Emerald Green',
    origin: 'Idukki, Kerala, India',
    moisture: '< 10.0%',
    availability: 'In Stock',
    packaging: '10kg / 25kg Jute Bags with Inner PE Liner',
    moq: '1 Metric Ton',
    hsCode: '0908.31.20',
    shelfLife: '24 Months',
    applications: 'Export Wholesalers, Culinary Repackers, Bakery & Spice Blenders',
    image: '/images/cardamom-7.5mm.jpg',
    badge: '7.5 mm',
    pricePerKg: 2250,
    rating: 4.4,
    reviewCount: 76,
  },
  {
    id: '7mm-commercial',
    category: 'standard' as const,
    gradeNum: '7.0',
    gradeUnit: 'mm',
    gradeName: 'Commercial Grade',
    size: '7.0 mm – 7.4 mm',
    color: 'Medium Light Green',
    origin: 'Idukki, Kerala, India',
    moisture: '< 11.0%',
    availability: 'In Stock',
    packaging: '25kg Bulk HDPE / Jute Bags',
    moq: '2 Metric Tons',
    hsCode: '0908.31.20',
    shelfLife: '24 Months',
    applications: 'Commercial Kitchens, Institutional Foodservice, Catering Supply',
    image: '/images/cardamom-7.0mm.jpg',
    badge: '7.0 mm',
    pricePerKg: 1950,
    rating: 4.2,
    reviewCount: 64,
  },
  {
    id: 'split-grade',
    category: 'industrial' as const,
    gradeNum: 'MIX',
    gradeUnit: '',
    gradeName: 'Mixed Pods (AGEB / LGB)',
    size: 'Assorted (6.5 mm – 8.0 mm)',
    color: 'Natural Mixed Green',
    origin: 'Idukki, Kerala, India',
    moisture: '< 11.5%',
    availability: 'In Stock',
    packaging: '25kg / 50kg Bulk Bags',
    moq: '1 Metric Ton',
    hsCode: '0908.31.90',
    shelfLife: '24 Months',
    applications: 'Grinding, Spice Powders, Extract Processing, Bulk Food Manufacture',
    image: '/images/cardamom-mixed.jpg',
    badge: 'Mixed Size',
    pricePerKg: 1650,
    rating: 4.0,
    reviewCount: 42,
  },
  {
    id: 'rejection-grade',
    category: 'industrial' as const,
    gradeNum: 'OIL',
    gradeUnit: '',
    gradeName: 'Extraction Grade',
    size: 'Pods, Seeds & Husks',
    color: 'Natural Pale / Yellowish Green',
    origin: 'Idukki, Kerala, India',
    moisture: '< 12.0%',
    availability: 'Contract Basis',
    packaging: '50kg Industrial HDPE Woven Bags',
    moq: '5 Metric Tons',
    hsCode: '0908.32.00',
    shelfLife: '18 Months',
    applications: 'Essential Oil Distillation, Oleoresin Extraction, Pharmaceutical Processing',
    image: '/images/cardamom-extraction.jpg',
    badge: 'Rej. Pieces',
    pricePerKg: 950,
    rating: 4.1,
    reviewCount: 36,
  },
];

type CatalogueItem = typeof PRODUCTS_CATALOGUE[0];

const FILTER_TABS = [
  { id: 'all', label: 'All Products' },
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
  { id: 'rating', label: 'Highest Rated' },
];

// ── Star Rating display ─────────────────────────────────────────
function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className="w-3 h-3"
            fill={s <= Math.round(rating) ? '#C5A046' : 'none'}
            stroke={s <= Math.round(rating) ? '#C5A046' : '#CBD5E1'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-[10px] text-stone-500 font-light">
        {rating.toFixed(1)} <span className="text-stone-400">({reviewCount})</span>
      </span>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────
function ProductCard({
  product,
  index,
  onQuote,
  onAddToCart,
}: {
  product: CatalogueItem;
  index: number;
  onQuote: () => void;
  onAddToCart?: (item: CartItem) => void;
}) {
  const [qtyKg, setQtyKg] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const priceInfo = formatDisplayPrice(product.pricePerKg);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        gradeName: product.gradeName,
        gradeNum: product.gradeNum,
        gradeUnit: product.gradeUnit,
        image: product.image,
        quantityKg: qtyKg,
        packaging: product.packaging,
        pricePerKg: product.pricePerKg,
      });
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group flex flex-col bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-400 relative"
    >
      <AnimatePresence>
        {addedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-3 left-3 right-3 z-10 rounded-xl bg-emerald-900 border border-emerald-500/30 px-3 py-2 text-center text-emerald-200 text-xs font-semibold shadow-md"
          >
            ✓ Added {qtyKg} kg to Cart!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <motion.img
          src={product.image}
          alt={`${product.gradeName} (${product.size}) — Cardanova Spices green cardamom`}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.45 }}
          loading="lazy"
          decoding="async"
        />
        {product.badge && (
          <div className="absolute top-3 left-3 rounded-full gold-gradient-bg px-3 py-1 label-caps text-[#071309] font-semibold text-[10px] shadow-sm">
            {product.badge}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="mb-3">
          <h2
            className="font-display font-light text-[#112D15] leading-snug"
            style={{ fontSize: '1.2rem' }}
          >
            {product.gradeName}
          </h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            {product.applications}
          </p>
        </div>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-4 mb-4 flex items-baseline justify-between">
          <div>
            <span translate="no" className="notranslate font-sans text-base sm:text-lg font-normal text-stone-700 leading-none">
              {priceInfo.amountStr}
            </span>
            <span className="text-xs text-stone-400 ml-1.5 font-light">/ kg</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-2.5 border border-stone-200 mb-4">
          <span className="text-xs text-stone-500 font-light">Quantity:</span>
          <div translate="no" className="notranslate flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQtyKg((q) => Math.max(1, q <= 5 ? q - 1 : q - 5))}
              className="w-7 h-7 rounded-lg border border-stone-200 bg-white text-stone-600 hover:border-[#C5A046] hover:text-[#071309] transition-colors cursor-pointer text-sm font-bold flex items-center justify-center active:scale-95 select-none"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 pointer-events-none" />
            </button>
            <span translate="no" className="notranslate font-mono text-xs text-[#112D15] min-w-[56px] text-center font-medium select-none">
              {qtyKg} kg
            </span>
            <button
              type="button"
              onClick={() => setQtyKg((q) => q + (q < 5 ? 1 : 5))}
              className="w-7 h-7 rounded-lg border border-stone-200 bg-white text-stone-600 hover:border-[#C5A046] hover:text-[#071309] transition-colors cursor-pointer text-sm font-bold flex items-center justify-center active:scale-95 select-none"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 pointer-events-none" />
            </button>
          </div>
        </div>

        <div className="luxury-divider mb-5" />

        <div className="mt-auto flex gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 rounded-full border border-[#C5A046] bg-white py-3 label-caps text-[#A18637] hover:bg-[#C5A046] hover:text-[#071309] transition-all cursor-pointer text-center font-semibold active:scale-95"
            style={{ fontSize: '0.58rem' }}
            aria-label={`Add ${product.gradeName} to cart`}
          >
            <span>Add to Cart</span>
          </button>
          <button
            type="button"
            onClick={onQuote}
            className="flex-1 rounded-full gold-gradient-bg py-3 label-caps text-[#071309] hover:brightness-110 transition-all cursor-pointer text-center shadow-md font-semibold active:scale-95"
            style={{ fontSize: '0.58rem' }}
            aria-label={`Get a quote for ${product.gradeName}`}
          >
            <span>Get Quote</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function getProductGradeMultiplier(name: string, sizeStr: string, idx: number): number {
  const str = `${name} ${sizeStr}`.toLowerCase();
  if (str.includes('8.5') || str.includes('extra bold')) return 1.15;
  if (str.includes('8.0') || str.includes('8mm') || str.includes('premium')) return 1.05;
  if (str.includes('7.5') || str.includes('export')) return 0.95;
  if (str.includes('7.0') || str.includes('7mm') || str.includes('commercial')) return 0.85;
  if (str.includes('6.5') || str.includes('mix') || str.includes('ageb')) return 0.70;
  if (str.includes('rej') || str.includes('oil') || str.includes('extract') || str.includes('spent')) return 0.50;

  const fallbackMults = [1.15, 1.05, 0.95, 0.85, 0.70, 0.50];
  return fallbackMults[idx % fallbackMults.length];
}

export default function ProductsPage({ onOpenQuoteModal, onAddToCart }: ProductsPageProps) {
  const [filter, setFilter] = useState<'all' | 'flagship' | 'standard' | 'industrial'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>(() =>
    PRODUCTS_CATALOGUE.map((item, idx) => ({
      ...item,
      pricePerKg: Math.round(3049 * getProductGradeMultiplier(item.gradeName, item.size, idx)),
    }))
  );
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    async function load() {
      let liveAvg = 3049;
      try {
        const auctionRes = await getAuctionPrice('small_cardamom');
        if (auctionRes?.data?.avgPrice) {
          const parsed = parseFloat(auctionRes.data.avgPrice.replace(/,/g, ''));
          if (!isNaN(parsed) && parsed > 0) liveAvg = parsed;
        }
      } catch (e) {
        console.error('Failed to fetch live auction rate:', e);
      }

      try {
        const prods = await getProducts(true);
        if (prods && prods.length > 0) {
          const mapped: CatalogueItem[] = prods.map((p, idx) => {
            const sizeStr = p.grades?.[0]?.size_mm || '';
            const sizeVal = p.specifications?.find((s) => s.label.toLowerCase().includes('size'))?.value || sizeStr || '8.5 mm+';
            const mult = getProductGradeMultiplier(p.name, `${sizeStr} ${sizeVal}`, idx);
            const liveInrPrice = Math.round(liveAvg * mult);

            // Admin-set price takes priority; auction-derived price is the fallback
            const finalPrice = (p.price_per_kg && p.price_per_kg > 0) ? p.price_per_kg : liveInrPrice;

            return {
              id: p.id,
              category: (p.category?.slug === 'flagship' ? 'flagship' : p.category?.slug === 'standard' ? 'standard' : 'industrial') as CatalogueItem['category'],
              gradeNum: sizeStr ? sizeStr.replace('mm', '').replace('+', '').trim() : String(8.5 - idx * 0.5),
              gradeUnit: sizeStr.includes('mm') ? 'mm' : '',
              gradeName: p.name,
              size: sizeVal,
              color: p.specifications?.find((s) => s.label.toLowerCase().includes('color'))?.value || 'Natural Emerald Green',
              origin: p.origin || p.specifications?.find((s) => s.label.toLowerCase().includes('origin'))?.value || 'Idukki, Kerala, India',
              moisture: p.specifications?.find((s) => s.label.toLowerCase().includes('moisture'))?.value || '< 10.0%',
              availability: p.availability?.replace('_', ' ') || 'In Stock',
              packaging: p.packaging_info || '5kg Multi-Layer Vacuum Packs',
              moq: '500 kg',
              hsCode: p.hs_code || '0908.31.10',
              shelfLife: '24 Months',
              applications: p.short_description || p.long_description || 'High-grade single origin green cardamom from Idukki, Kerala',
              image: p.main_image_url || p.images?.[0]?.url || PRODUCTS_CATALOGUE[idx % PRODUCTS_CATALOGUE.length].image,
              badge: p.export_grade || sizeStr || (p.featured ? 'Flagship Grade' : 'Export Standard'),
              pricePerKg: finalPrice,
              rating: 4.5 + (idx % 4) * 0.1,
              reviewCount: 80 + idx * 15,
            };
          });
          setCatalogue(mapped);
        } else {
          const mapped = PRODUCTS_CATALOGUE.map((item, idx) => ({
            ...item,
            pricePerKg: Math.round(liveAvg * getProductGradeMultiplier(item.gradeName, item.size, idx)),
          }));
          setCatalogue(mapped);
        }
        triggerGoogleTranslateSync(400);
      } catch (e) {
        console.error(e);
        const mapped = PRODUCTS_CATALOGUE.map((item, idx) => ({
          ...item,
          pricePerKg: Math.round(liveAvg * getProductGradeMultiplier(item.gradeName, item.size, idx)),
        }));
        setCatalogue(mapped);
        triggerGoogleTranslateSync(400);
      }
    }
    load();
  }, []);

  const filtered = catalogue
    .filter((p) => {
      const matchFilter = filter === 'all' || p.category === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.gradeName.toLowerCase().includes(q) ||
        p.applications.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.pricePerKg - b.pricePerKg;
      if (sort === 'price-desc') return b.pricePerKg - a.pricePerKg;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

  const [heroBg, setHeroBg] = useState('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop');

  useEffect(() => {
    import('../services/galleryService').then(({ getGalleryItems }) => {
      getGalleryItems('products_hero').then((items) => {
        if (items && items.length > 0 && items[0].image_url) {
          setHeroBg(items[0].image_url);
        }
      });
    }).catch(() => {});
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.id === sort)?.label ?? 'Featured';

  return (
    <div className="bg-[#FAF8F5] text-[#112D15] min-h-screen">
      <section
        className="relative overflow-hidden flex flex-col justify-end pt-28 sm:pt-36 pb-12 sm:pb-16 min-h-[420px] w-full"
        aria-labelledby="products-page-title"
      >
        <img
          src={heroBg}
          alt="Cardanova Spices premium green cardamom grades catalogue from Idukki, Kerala"
          width={2070}
          height={1380}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.28]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071309]/40 to-[#071309]/92" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85 }}
          className="relative z-10 w-full px-6 lg:px-10 max-w-7xl mx-auto"
        >
          <span className="label-caps text-[#C5A046]" style={{ fontSize: '0.6rem' }}>Export Grade Trade Catalogue</span>
          <h1
            id="products-page-title"
            className="font-display font-light text-[#FAF8F5] mt-3 leading-[0.92]"
            style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5.5rem)' }}
          >
            Green Cardamom
            <br />
            <em className="animate-shimmer not-italic">Grades & Specifications</em>
          </h1>
          <p className="mt-4 text-stone-300/60 text-sm font-light max-w-md leading-relaxed">
            Single-origin grades sorted by pod diameter, colour, and international market applications.
          </p>
        </motion.div>
      </section>

      <div className="sticky top-[72px] sm:top-[80px] z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
          <div className="hidden md:flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-full bg-white border border-stone-200 text-xs text-[#112D15] placeholder-stone-400 focus:outline-none focus:border-[#A18637]/60 w-56 shadow-sm"
                aria-label="Search products"
              />
            </div>

            <div className="flex items-center gap-2" role="tablist" aria-label="Filter cardamom grades">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as typeof filter)}
                  role="tab"
                  aria-selected={filter === tab.id}
                  className={`rounded-full px-4 py-2 label-caps transition-all cursor-pointer whitespace-nowrap ${
                    filter === tab.id
                      ? 'gold-gradient-bg text-[#071309] shadow-md font-semibold'
                      : 'bg-white border border-stone-200 text-stone-500 hover:border-[#A18637]/40 hover:text-[#112D15]'
                  }`}
                  style={{ fontSize: '0.58rem' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 rounded-full bg-white border border-stone-200 px-4 py-2 text-xs text-stone-600 hover:border-stone-300 cursor-pointer transition-colors whitespace-nowrap shadow-sm"
                aria-haspopup="listbox"
                aria-expanded={showSortMenu}
              >
                <span>{currentSortLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    role="listbox"
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-stone-100 shadow-xl overflow-hidden z-50"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <li key={opt.id}>
                        <button
                          onClick={() => { setSort(opt.id); setShowSortMenu(false); }}
                          role="option"
                          aria-selected={sort === opt.id}
                          className={`w-full text-left px-4 py-3 text-xs transition-colors cursor-pointer ${
                            sort === opt.id ? 'bg-[#FAF8F5] text-[#112D15] font-medium' : 'text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search grades…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2.5 rounded-full bg-white border border-stone-200 text-xs text-[#112D15] placeholder-stone-400 focus:outline-none focus:border-[#A18637]/60 w-full"
                aria-label="Search products"
              />
            </div>
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-4 py-2.5 text-xs text-stone-600 cursor-pointer whitespace-nowrap"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilterDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#112D15]/30 backdrop-blur-sm"
              onClick={() => setShowFilterDrawer(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-[110] bg-[#FAF8F5] rounded-t-3xl p-6 pb-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-light text-[#112D15]" style={{ fontSize: '1.4rem' }}>Filters</h3>
                <button onClick={() => setShowFilterDrawer(false)} className="p-2 rounded-full border border-stone-200 text-stone-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="label-caps text-stone-400 mb-3" style={{ fontSize: '0.55rem' }}>Grade Category</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setFilter(tab.id as typeof filter); setShowFilterDrawer(false); }}
                    className={`rounded-full px-4 py-2 label-caps transition-all cursor-pointer ${
                      filter === tab.id ? 'gold-gradient-bg text-[#071309]' : 'bg-white border border-stone-200 text-stone-500'
                    }`}
                    style={{ fontSize: '0.58rem' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="label-caps text-stone-400 mb-3" style={{ fontSize: '0.55rem' }}>Sort By</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSort(opt.id); setShowFilterDrawer(false); }}
                    className={`rounded-full px-4 py-2 label-caps transition-all cursor-pointer ${
                      sort === opt.id ? 'bg-[#112D15] text-[#FAF8F5]' : 'bg-white border border-stone-200 text-stone-500'
                    }`}
                    style={{ fontSize: '0.58rem' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="py-16 px-6 lg:px-10 max-w-7xl mx-auto" aria-label="Cardamom Grades Catalogue">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <p className="font-display font-light text-2xl mb-2">No products found</p>
            <p className="text-sm">Try adjusting your search term.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter + sort + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onQuote={() => onOpenQuoteModal(`${product.gradeNum}${product.gradeUnit} ${product.gradeName}`, product.pricePerKg)}
                  onAddToCart={onAddToCart}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
