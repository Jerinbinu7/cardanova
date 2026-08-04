import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsService } from '../services/cmsService';

interface ProductsPageProps {
  onOpenQuoteModal: (grade?: string) => void;
}

const PRODUCTS_CATALOGUE = [
  {
    id: '8.5mm-bold',
    category: 'flagship',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop',
    badge: 'Flagship Grade',
    badgeStyle: 'gold',
  },
  {
    id: '8mm-premium',
    category: 'flagship',
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
    image: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=1200&auto=format&fit=crop',
    badge: 'High Demand',
    badgeStyle: 'silver',
  },
  {
    id: '7.5mm-export',
    category: 'standard',
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
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1200&auto=format&fit=crop',
    badge: 'Export Standard',
    badgeStyle: 'silver',
  },
  {
    id: '7mm-commercial',
    category: 'standard',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop',
    badge: 'Commercial',
    badgeStyle: 'neutral',
  },
  {
    id: 'mixed-grade',
    category: 'industrial',
    gradeNum: 'MIX',
    gradeUnit: '',
    gradeName: 'AGEB / LGB Blend',
    size: 'Assorted 6.5 mm – 8.0 mm',
    color: 'Natural Harvest Green Blend',
    origin: 'Idukki, Kerala, India',
    moisture: '< 11.5%',
    availability: 'In Stock',
    packaging: '25kg / 50kg Bulk Cartons',
    moq: '3 Metric Tons',
    hsCode: '0908.31.90',
    shelfLife: '18 Months',
    applications: 'Spice Powder Milling, Garam Masala, Tea & Chai Premixes',
    image: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=1200&auto=format&fit=crop',
    badge: 'Milling Grade',
    badgeStyle: 'neutral',
  },
  {
    id: 'rejection-grade',
    category: 'industrial',
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
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1200&auto=format&fit=crop',
    badge: 'Oil & Extract',
    badgeStyle: 'neutral',
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'All Grades' },
  { id: 'flagship', label: 'Flagship & Premium' },
  { id: 'standard', label: 'Export & Commercial' },
  { id: 'industrial', label: 'Milling & Industrial' },
];

const BADGE_STYLES: Record<string, string> = {
  gold: 'gold-gradient-bg text-[#071309]',
  silver: 'border border-[#A18637]/40 bg-[#112D15]/80 text-[#C5A046] backdrop-blur-sm',
  neutral: 'border border-white/20 bg-white/10 text-stone-300 backdrop-blur-sm',
};

const SPEC_ICONS: Record<string, string> = {
  'Pod Diameter': '📐',
  'Color Profile': '🌿',
  'Moisture': '💧',
  'Packaging': '📦',
  'Min. Order': '⚖️',
  'Shelf Life': '🗓️',
  'HS Code': '📋',
  'Availability': '✓',
};

export default function ProductsPage({ onOpenQuoteModal }: ProductsPageProps) {
  const [filter, setFilter] = useState<'all' | 'flagship' | 'standard' | 'industrial'>('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [catalogue, setCatalogue] = useState(PRODUCTS_CATALOGUE);

  useEffect(() => {
    async function fetchProducts() {
      const cmsProds = await cmsService.getProducts();
      if (cmsProds && cmsProds.length > 0) {
        const published = cmsProds.filter((p) => p.isPublished ?? true);
        if (published.length > 0) {
          const mapped = published.map((p, idx) => ({
            id: p.id,
            category: (p.category === 'cardamom' ? 'flagship' : p.category === 'pepper' ? 'standard' : 'industrial') as any,
            gradeNum: p.grades?.[0]?.sizeMm ? p.grades[0].sizeMm.replace('mm', '') : String(8.5 - idx * 0.5),
            gradeUnit: p.grades?.[0]?.sizeMm?.includes('mm') ? 'mm' : '',
            gradeName: p.name,
            size: p.grades?.[0]?.sizeMm || '8.5 mm+',
            color: 'Natural Emerald Green',
            origin: p.specifications?.find((s) => s.label === 'Origin')?.value || 'Idukki, Kerala, India',
            moisture: p.specifications?.find((s) => s.label === 'Moisture')?.value || '< 10.0%',
            availability: 'In Stock',
            packaging: p.packagingOptions?.[0] || '5kg Multi-Layer Vacuum Packs',
            moq: '500 kg',
            hsCode: '0908.31.10',
            shelfLife: '24 Months',
            applications: p.shortDescription || p.description || 'Luxury Retail, High-End Gourmet, Export',
            image: p.images?.[0] || PRODUCTS_CATALOGUE[idx % PRODUCTS_CATALOGUE.length].image,
            badge: p.isFeatured ? 'Flagship Grade' : 'Export Standard',
            badgeStyle: p.isFeatured ? 'gold' : 'silver',
          }));
          setCatalogue(mapped);
        }
      }
    }
    fetchProducts();
  }, []);

  const filtered = catalogue.filter(
    (p) => filter === 'all' || p.category === filter
  );

  const handleDownloadSpec = (grade: string) => {
    setDownloadNotice(`Specification sheet for "${grade}" is ready.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div className="bg-[#FAF8F5] text-[#112D15] min-h-screen">

      {/* Toast notification */}
      <AnimatePresence>
        {downloadNotice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-[250] rounded-2xl bg-[#112D15] border border-[#C5A046]/40 px-5 py-4 text-[#FAF8F5] shadow-2xl flex items-center gap-3"
          >
            <span className="text-[#C5A046] text-lg">📄</span>
            <span className="text-xs font-light">{downloadNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Banner ─────────────────────────────── */}
      <section
        className="relative overflow-hidden flex items-end"
        style={{ height: '55vh', minHeight: '380px', paddingTop: '5rem' }}
        aria-labelledby="products-page-title"
      >
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop"
          alt="Cardanova Spices premium green cardamom grades catalogue from Idukki, Kerala"
          width={2070}
          height={1380}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071309]/50 to-[#071309]/90" aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 w-full px-6 lg:px-10 pb-16 max-w-7xl mx-auto"
        >
          <span className="label-caps text-[#C5A046]">Export Grade Trade Catalogue</span>
          <h1
            id="products-page-title"
            className="font-display font-light text-[#FAF8F5] mt-4 leading-[0.92]"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 6rem)' }}
          >
            Green Cardamom
            <br />
            <em className="animate-shimmer not-italic">Grades & Specifications</em>
          </h1>
          <p className="mt-4 text-stone-300/70 text-sm font-light max-w-lg leading-relaxed">
            Single-origin grades categorized by pod diameter, colour retention, and international market applications.
          </p>
        </motion.div>
      </section>

      {/* ── Catalogue Section ────────────────────────── */}
      <section className="py-20 px-6 lg:px-10 max-w-7xl mx-auto" aria-label="Cardamom Grades Catalogue">

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-14 justify-center" role="tablist" aria-label="Filter cardamom grades">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              role="tab"
              aria-selected={filter === tab.id}
              aria-label={`Filter by ${tab.label}`}
              className={`rounded-full px-6 py-2.5 label-caps transition-all cursor-pointer ${
                filter === tab.id
                  ? 'gold-gradient-bg text-[#071309] shadow-lg'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-[#A18637]/50'
              }`}
              style={{ fontSize: '0.6rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {filtered.map((product, i) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="group rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-2xl hover:border-[#A18637]/30 transition-all duration-500 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              >
                {/* Image column */}
                <div className="lg:col-span-5 relative overflow-hidden" style={{ minHeight: '280px' }}>
                  <motion.img
                    src={product.image}
                    alt={`${product.gradeName} (${product.size}) — Cardanova Spices green cardamom from Idukki, Kerala`}
                    width={1200}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.5 }}
                    style={{ minHeight: '280px' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 lg:bg-gradient-to-r lg:from-transparent lg:to-[#FAF8F5]/20" aria-hidden="true" />

                  {/* Badge overlay */}
                  <span className={`absolute top-5 left-5 rounded-full px-3 py-1.5 label-caps shadow-lg ${BADGE_STYLES[product.badgeStyle]}`}
                    style={{ fontSize: '0.55rem' }}>
                    {product.badge}
                  </span>

                  {/* Large grade number watermark */}
                  <div
                    className="absolute bottom-3 right-4 font-display font-light leading-none opacity-20"
                    style={{ fontSize: '5rem', color: '#C5A046' }}
                  >
                    {product.gradeNum}
                  </div>
                </div>

                {/* Specs column */}
                <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    {/* Grade display */}
                    <div className="flex items-end gap-2 mb-1">
                      <span
                        className="font-display font-light gold-gradient-text leading-none"
                        style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }}
                      >
                        {product.gradeNum}
                      </span>
                      {product.gradeUnit && (
                        <span className="font-display text-xl text-[#A18637]/60 mb-2 font-light">{product.gradeUnit}</span>
                      )}
                    </div>
                    <h2 className="font-display text-2xl font-light text-[#112D15]">{product.gradeName}</h2>

                    {/* Applications */}
                    <div className="mt-4 flex items-start gap-2">
                      <span className="text-[#A18637] text-sm mt-0.5">◈</span>
                      <p className="text-sm text-stone-600 font-light leading-relaxed">{product.applications}</p>
                    </div>

                    {/* Spec grid */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-2xl bg-[#FAF8F5] p-5 border border-stone-100">
                      {[
                        { label: 'Pod Diameter', value: product.size },
                        { label: 'Color Profile', value: product.color },
                        { label: 'Moisture', value: product.moisture },
                        { label: 'Packaging', value: product.packaging },
                        { label: 'Min. Order', value: product.moq },
                        { label: 'Shelf Life', value: product.shelfLife },
                        { label: 'HS Code', value: product.hsCode },
                        { label: 'Availability', value: product.availability },
                      ].map((spec) => (
                        <div key={spec.label}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs">{SPEC_ICONS[spec.label]}</span>
                            <span className="label-caps text-stone-400" style={{ fontSize: '0.52rem' }}>{spec.label}</span>
                          </div>
                          <span className={`text-xs font-medium ${
                            spec.label === 'Min. Order' ? 'text-[#A18637]'
                            : spec.label === 'Availability' ? 'text-emerald-700'
                            : 'text-[#112D15]'
                          }`}>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t border-stone-100">
                    <button
                      onClick={() => onOpenQuoteModal(`${product.gradeNum}${product.gradeUnit} ${product.gradeName}`)}
                      className="flex-1 rounded-full gold-gradient-bg py-3.5 label-caps text-[#071309] hover:brightness-110 transition-all cursor-pointer text-center shadow-lg"
                      style={{ fontSize: '0.58rem' }}
                    >
                      Request Quote for {product.size} →
                    </button>
                    <button
                      onClick={() => handleDownloadSpec(product.gradeName)}
                      className="rounded-full border border-stone-200 bg-white px-6 py-3.5 label-caps text-stone-600 hover:border-[#A18637]/50 hover:text-[#112D15] transition-all cursor-pointer"
                      style={{ fontSize: '0.58rem' }}
                    >
                      Spec Sheet 📄
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Grade Comparison Matrix ──────────────────── */}
      <section className="py-20 px-6 lg:px-10 bg-[#112D15]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-caps text-[#C5A046]">Technical Matrix</span>
            <h2
              className="font-display font-light text-[#FAF8F5] mt-4 leading-[0.95]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              Grade <em className="animate-shimmer not-italic">Comparison</em>
            </h2>
            <p className="text-xs text-stone-400 mt-3 font-light">
              Side-by-side evaluation for procurement managers & international buyers
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#A18637]/20 shadow-2xl">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Cardanova Spices Green Cardamom Grade Comparison Matrix</caption>
              <thead>
                <tr className="border-b border-[#A18637]/20">
                  {['Grade', 'Pod Size', 'Color', 'Applications', 'MOQ', 'Availability'].map((h) => (
                    <th key={h} scope="col" className="px-5 py-4 label-caps text-[#C5A046] font-normal bg-[#071309]"
                      style={{ fontSize: '0.55rem' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS_CATALOGUE.map((p, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[#A18637]/10 transition-colors hover:bg-[#112D15]/80 ${
                      i % 2 === 0 ? 'bg-[#071309]/60' : 'bg-[#0A1C0B]/60'
                    }`}
                  >
                    <th scope="row" className="px-5 py-4 font-normal text-left">
                      <span className="font-display text-base text-[#FAF8F5] font-light">
                        {p.gradeNum}{p.gradeUnit}
                      </span>
                      <br />
                      <span className="text-stone-500" style={{ fontSize: '0.65rem' }}>{p.gradeName}</span>
                    </th>
                    <td className="px-5 py-4 text-[#C5A046] font-medium">{p.size}</td>
                    <td className="px-5 py-4 text-stone-400 font-light">{p.color}</td>
                    <td className="px-5 py-4 text-stone-400 font-light max-w-[200px] truncate">{p.applications}</td>
                    <td className="px-5 py-4 text-stone-300 font-medium">{p.moq}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span>✓</span>
                        <span className="font-light">{p.availability}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
