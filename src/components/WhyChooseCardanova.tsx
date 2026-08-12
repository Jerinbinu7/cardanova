import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { getHomepageContent } from '../services/homepageService';

const WHY_ITEMS = [
  {
    id: 'plantations',
    svgIcon: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 012-2h1.055M11 20a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    ),
    tag: 'Single-Origin Idukki',
    title: 'High-Altitude Estates',
    stat: '1,100m',
    statLabel: 'Elevation',
    sub: 'Cultivated across 120+ acres in the high ranges of Idukki, Kerala — where altitude, mist, and mineral-rich soil produce cardamom with unrivalled aroma and volatile oil content.',
  },
  {
    id: 'farmer-network',
    svgIcon: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    tag: 'Direct Farmer Sourcing',
    title: 'Kerala Farmer Network',
    stat: '250+',
    statLabel: 'Farmer Families',
    sub: 'Direct partnerships with over 250 local smallholder farming families — ensuring ethical sourcing, fair pricing, and peak pod freshness at every harvest cycle.',
  },
  {
    id: 'export-grading',
    svgIcon: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    tag: 'Optical & Sieve Sorting',
    title: 'Precision Export Grading',
    stat: '<9.5%',
    statLabel: 'Moisture Max',
    sub: 'Every harvest batch is optically sorted, moisture-tested, and sieve-graded to exact mm dimensions (8.5mm, 8mm, 7.5mm, 7mm). Zero tolerance for sub-standard pods.',
  },
  {
    id: 'global-shipping',
    svgIcon: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
      </svg>
    ),
    tag: 'FOB / CIF Cochin',
    title: 'Global Port Logistics',
    stat: '30+',
    statLabel: 'Countries Served',
    sub: 'Containerized FCL & LCL delivery via Cochin Port to 30+ countries. Complete phytosanitary, origin certificates, and compliance documentation provided.',
  },
  {
    id: 'competitive-pricing',
    svgIcon: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    tag: 'No Intermediaries',
    title: 'Direct Origin Pricing',
    stat: '0',
    statLabel: 'Middlemen',
    sub: 'Plantation-direct sourcing eliminates middleman margins — delivering trade-competitive rates for B2B importers, wholesalers, and food manufacturers worldwide.',
  },
  {
    id: 'vacuum-seal',
    svgIcon: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    tag: 'Aroma Locking Foil',
    title: 'Vacuum Sealed Freshness',
    stat: '24mo',
    statLabel: 'Shelf Life',
    sub: 'Multi-layer food-grade vacuum aluminium foil sealing retains essential volatile oils (>7.5% V/W) for up to 24 months — maximising aroma and potency on arrival.',
  },
];

function WhyCard({ card, index }: { card: typeof WHY_ITEMS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      className="group relative flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm hover:border-[#A18637]/50 hover:shadow-xl transition-all duration-300"
    >
      {/* Top row: icon + stat */}
      <div className="flex items-start justify-between">
        {/* Icon badge */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#A18637]/30 bg-[#FAF8F5] group-hover:border-[#C5A046] group-hover:bg-[#FFF8E8] transition-all">
          {card.svgIcon}
        </div>

        {/* Stat pill */}
        <div className="text-right">
          <div className="font-display text-2xl font-light text-[#112D15] leading-none">{card.stat}</div>
          <div className="label-caps text-[#A18637] mt-0.5" style={{ fontSize: '0.52rem' }}>{card.statLabel}</div>
        </div>
      </div>

      {/* Tag */}
      <div className="inline-flex w-fit rounded-full border border-[#C5A046]/35 bg-[#FFF8E8] px-3 py-0.5 label-caps text-[#A18637]" style={{ fontSize: '0.52rem' }}>
        {card.tag}
      </div>

      {/* Title + Description */}
      <div>
        <h3 className="font-display text-lg font-light text-[#112D15] leading-snug group-hover:text-[#A18637] transition-colors">
          {card.title}
        </h3>
        <p className="mt-2 text-xs text-stone-500 leading-relaxed font-light">
          {card.sub}
        </p>
      </div>

      {/* Animated bottom bar */}
      <div className="h-[1.5px] w-0 rounded-full bg-gradient-to-r from-[#C5A046] to-transparent transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}

export default function WhyChooseCardanova() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: '-40px' });
  const [whyItems, setWhyItems] = useState(WHY_ITEMS);
  const [sectionTitle, setSectionTitle] = useState('Why Us');

  useEffect(() => {
    getHomepageContent().then((cms) => {
      if (cms) {
        if (cms.why_choose_us_title) setSectionTitle(cms.why_choose_us_title);
        if (cms.why_choose_us_features && cms.why_choose_us_features.length > 0) {
          // Always render 6 cards — merge CMS data with WHY_ITEMS defaults for any missing slots
          const totalCards = Math.max(cms.why_choose_us_features.length, WHY_ITEMS.length);
          const mapped = Array.from({ length: totalCards }, (_, idx) => {
            const f = cms.why_choose_us_features![idx];
            const def = WHY_ITEMS[idx % WHY_ITEMS.length];
            return {
              id: `feature-${idx}`,
              svgIcon: def?.svgIcon || WHY_ITEMS[0].svgIcon,
              tag: f?.tag || def?.tag || 'Cardanova Guarantee',
              title: f?.title || def?.title || `Feature ${idx + 1}`,
              stat: f?.stat || def?.stat || '',
              statLabel: f?.statLabel || def?.statLabel || '',
              sub: f?.description || def?.sub || '',
            };
          });
          setWhyItems(mapped);
        }
      }
    }).catch((e) => {
      console.warn('Failed to load Why Choose Us content from Supabase', e);
    });
  }, []);

  return (
    <section
      id="why-us"
      className="relative bg-[#FAF8F5] overflow-hidden"
      style={{ paddingTop: '6rem', paddingBottom: '6rem' }}
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, #112D15 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* ── Section Header — Left aligned ── */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, x: -24 }}
          animate={headingInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 sm:mb-16 max-w-xl"
        >
          <span className="label-caps text-[#A18637]">Origin Sourcing & Quality Standards</span>
          <h2
            className="font-display font-light text-[#112D15] mt-3 leading-[0.95]"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
          >
            {sectionTitle}
          </h2>
          <div className="mt-5 luxury-divider w-20" />
          <p className="mt-5 text-sm sm:text-base text-stone-500 leading-relaxed font-light max-w-md">
            From our highland estates in Idukki to buyers across 30+ countries — precision, purity, and partnership define everything we do.
          </p>
        </motion.div>

        {/* Cards Grid — 2 cols mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {whyItems.map((card, i) => (
            <WhyCard key={card.id} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

