import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { getHomepageContent } from '../services/homepageService';

interface OriginPageProps {
  onOpenQuoteModal: (grade?: string) => void;
}

const PROCESS_STEPS = [
  {
    step: '01',
    phase: 'Cultivation',
    title: 'Grown in the Clouds',
    subtitle: 'Idukki High Ranges · 1,100m Elevation',
    body: `Cardanova's cardamom originates from the misty high-altitude estates of Idukki, Kerala — one of the world's most biodiverse spice-growing regions. At elevations exceeding 1,100 metres, cool temperatures, consistent rainfall, and mineral-rich volcanic soil create the perfect conditions for premium-grade green cardamom with naturally intense volatile oil content exceeding 8.5% V/W.`,
    detail: 'Our 120+ acres of estate land are intercropped with shade trees — maintaining soil health and natural biodiversity without synthetic inputs.',
    image: '/images/origin-hero-bg.jpg',
    accent: '#4A7C59',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 012-2h1.055M11 20a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    ),
  },
  {
    step: '02',
    phase: 'Hand Harvesting',
    title: 'Handpicked at Peak Ripeness',
    subtitle: 'September – December · Harvest Season',
    body: `Every cardamom pod is harvested by hand — individually plucked at the precise moment of peak maturity, when volatile oil concentration and pod colour are at their optimal. Our network of 250+ trusted smallholder farming families follows strict harvesting protocols: only pods that pass a visual ripeness check are collected per plant, preventing any premature or over-mature pods from entering the supply chain.`,
    detail: 'Harvesting by hand ensures zero mechanical damage to the pod skin — critical for preserving the essential oils locked within.',
    image: '/images/origin-harvesting.jpg',
    accent: '#C5A046',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
  },
  {
    step: '03',
    phase: 'Curing & Drying',
    title: 'Flue-Cured for Colour Retention',
    subtitle: 'Controlled Temperature · 40–55°C',
    body: `Immediately after harvest, pods undergo our proprietary flue-curing process — a temperature-controlled curing method that maintains the vibrant natural green colour characteristic of top-grade cardamom. Unlike sun-drying (which bleaches pods and degrades oils), flue-curing at 40–55°C preserves the natural chlorophyll pigment and locks in volatile oil concentrations above international export benchmarks.`,
    detail: 'Pods are spread on raised bamboo curing beds inside curing chambers — ensuring uniform airflow and consistent moisture reduction to under 9.5%.',
    image: '/images/cardamom-hero-1.jpg',
    accent: '#A18637',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    step: '04',
    phase: 'Grading & Sorting',
    title: 'Precision Optical Grading',
    subtitle: 'Sieve-Graded · 7.0mm – 8.5mm+',
    body: `Post-curing, every batch passes through our multi-stage grading facility. Pods are first mechanically sieved into size classifications (8.5mm, 8.0mm, 7.5mm, 7.0mm), then optically sorted to remove any discoloured, broken, or off-grade pods. Moisture content is independently verified to remain below 9.5% — meeting EU, US, and GCC food safety import standards. Each grade is batch-coded and traceable to its source farm.`,
    detail: 'Independent lab testing of volatile oil content (>7.5% V/W), moisture levels, and microbial counts is conducted on every export batch.',
    image: '/images/export-processing.jpg',
    accent: '#C5A046',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    step: '05',
    phase: 'Vacuum Packaging',
    title: 'Aroma-Locked & Sealed',
    subtitle: 'Multi-Layer Foil · 5kg – 25kg Packs',
    body: `Graded cardamom is immediately transferred to our food-grade vacuum packaging line — preventing any post-grade oxidation or moisture absorption. Each unit is sealed using multi-layer aluminium foil vacuum packs that maintain an airtight, oxygen-free environment, preserving volatile oil content (>7.5% V/W) and vibrant green colour for up to 24 months from the packing date. Pack sizes range from 5 kg retail-ready pouches to 25 kg bulk jute-lined bags.`,
    detail: 'All packaging materials are food-grade certified. Each pack is labelled with batch number, grade, weight, origin, and packing date for full traceability.',
    image: '/images/cardamom-8.5mm.jpg',
    accent: '#4A7C59',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
      </svg>
    ),
  },
  {
    step: '06',
    phase: 'Global Export',
    title: 'Shipped to 30+ Countries',
    subtitle: 'FCL / LCL · FOB & CIF · Cochin Port',
    body: `Cardanova exports containerized shipments via Cochin International Container Transshipment Terminal — one of India's busiest and most efficient ports for spice exports. We offer both FCL (Full Container Load) and LCL (Less than Container Load) options, with FOB and CIF pricing available. Every shipment is accompanied by a complete documentation package: Phytosanitary Certificate, Certificate of Origin, FSSAI compliance, Health Certificate, and all regulatory paperwork required for EU, US, GCC, and Asian import clearance.`,
    detail: 'Our in-house trade documentation team coordinates with freight forwarders, customs brokers, and inspection agencies to ensure zero shipment delays.',
    image: '/images/global-standards-bg.jpg',
    accent: '#C5A046',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 012-2h1.055M11 20a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: '120+', label: 'Acres of Estate', sub: 'Idukki, Kerala' },
  { value: '250+', label: 'Farmer Families', sub: 'Direct Partners' },
  { value: '30+', label: 'Countries Served', sub: 'Global Exports' },
  { value: '<9.5%', label: 'Moisture Max', sub: 'Export Standard' },
  { value: '24mo', label: 'Shelf Life', sub: 'Vacuum Sealed' },
];

function ProcessStep({ step, index }: { step: typeof PROCESS_STEPS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
    >
      {/* Image side */}
      <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ${!isEven ? 'lg:order-2' : ''}`} style={{ height: '320px', minHeight: '260px' }}>
        <motion.img
          src={step.image}
          alt={`Step ${step.step}: ${step.title} (${step.phase}) — Cardanova Spices cardamom sourcing process in Idukki, Kerala`}
          width={1400}
          height={800}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071309]/80 via-transparent to-transparent" aria-hidden="true" />

        {/* Step number overlay */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#C5A046]/60 bg-[#071309]/90 backdrop-blur-md">
            <span className="font-display text-xs sm:text-sm font-light text-[#C5A046]">{step.step}</span>
          </div>
          <span className="label-caps text-[#C5A046] bg-[#071309]/70 backdrop-blur-md px-3 py-1 rounded-full border border-[#C5A046]/30" style={{ fontSize: '0.52rem' }}>
            {step.phase}
          </span>
        </div>

        {/* Bottom detail chip */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
          <div className="rounded-xl sm:rounded-2xl bg-[#071309]/85 backdrop-blur-md p-3 sm:p-4 border border-[#C5A046]/20">
            <p className="text-xs text-stone-300/90 font-light leading-relaxed">{step.detail}</p>
          </div>
        </div>
      </div>

      {/* Content side */}
      <div className={`${!isEven ? 'lg:order-1' : ''}`}>
        {/* Icon + Phase */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#C5A046]/40 bg-[#112D15] text-[#C5A046] shrink-0">
            {step.icon}
          </div>
          <div>
            <span className="label-caps text-[#A18637]" style={{ fontSize: '0.6rem' }}>{step.phase}</span>
            <p className="text-xs text-stone-500 font-light mt-0.5">{step.subtitle}</p>
          </div>
        </div>

        <h3
          className="font-display font-light text-[#FAF8F5] leading-tight mb-4"
          style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}
        >
          {step.title}
        </h3>

        <div className="h-[1px] w-16 bg-gradient-to-r from-[#C5A046] to-transparent mb-5" />

        <p className="text-sm sm:text-base text-stone-400 font-light leading-relaxed">
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

export default function OriginPage({ onOpenQuoteModal }: OriginPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState(PROCESS_STEPS);
  const [heroBg, setHeroBg] = useState('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop');

  useEffect(() => {
    // Load homepage content first (text data for steps)
    getHomepageContent().then((data) => {
      if (data?.farm_to_export_steps && data.farm_to_export_steps.length > 0) {
        const mapped = data.farm_to_export_steps.map((st: any, idx: number) => {
          const def = PROCESS_STEPS[idx % PROCESS_STEPS.length];
          return {
            step: String(st.step || idx + 1).padStart(2, '0'),
            phase: st.phase || st.title || def.phase,
            title: st.title || def.title,
            subtitle: st.loc || def.subtitle,
            body: st.body || st.desc || def.body,
            detail: st.detail || def.detail,
            image: st.image || def.image,
            accent: def.accent,
            icon: def.icon,
          };
        });
        setSteps(mapped);
      }
    }).catch(() => {});

    // Load gallery images — these always override step images
    import('../services/galleryService').then(({ getGalleryItems }) => {
      getGalleryItems('origin_hero').then((items) => {
        if (items && items.length > 0 && items[0].image_url) {
          setHeroBg(items[0].image_url);
        }
      });

      const stepKeys = ['origin_step_1', 'origin_step_2', 'origin_step_3', 'origin_step_4', 'origin_step_5', 'origin_step_6'];
      Promise.all(stepKeys.map((key) => getGalleryItems(key))).then((results) => {
        const galleryImagesMap: Record<number, string> = {};
        results.forEach((res, idx) => {
          if (res && res.length > 0 && res[0].image_url) {
            galleryImagesMap[idx] = res[0].image_url;
          }
        });

        if (Object.keys(galleryImagesMap).length > 0) {
          setSteps((prev) =>
            prev.map((step, idx) => {
              if (galleryImagesMap[idx]) {
                return { ...step, image: galleryImagesMap[idx] };
              }
              return step;
            })
          );
        }
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-[#071309] text-[#FAF8F5] min-h-screen overflow-hidden">

      {/* ── 1. HERO ───────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden flex flex-col items-center justify-center text-center"
        style={{ height: '90vh', minHeight: '500px', paddingTop: '5rem' }}
        aria-labelledby="origin-page-title"
      >
        <motion.img
          src={heroBg}
          alt="High-altitude cardamom plantations in the mist-covered hills of Idukki, Kerala"
          width={2070}
          height={1380}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.28]"
          style={{ y: heroY }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071309]/60 via-transparent to-[#071309]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#071309] to-transparent" aria-hidden="true" />

        <motion.div
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 max-w-4xl px-5 sm:px-6 mx-auto"
        >
          <span className="label-caps text-[#C5A046]">Idukki, Kerala · Single Origin</span>

          <h1
            id="origin-page-title"
            className="font-display font-light text-[#FAF8F5] mt-4 leading-[0.9]"
            style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)' }}
          >
            Our{' '}
            <em className="animate-shimmer not-italic">Origin</em>
          </h1>

          <div className="mx-auto mt-5 luxury-divider w-24" />

          <p className="mt-6 font-display italic text-stone-300/90 text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            "From mist-covered mountain estates to buyers across 30+ countries — every pod carries the story of its land."
          </p>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-10 sm:mt-12 flex flex-col items-center gap-2"
          >
            <span className="label-caps text-stone-500" style={{ fontSize: '0.5rem' }}>Discover the Process</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                <rect x="1" y="1" width="14" height="22" rx="7" stroke="rgba(197,160,70,0.4)" strokeWidth="1"/>
                <motion.rect x="6.5" y="5" width="3" height="6" rx="1.5" fill="#C5A046"
                  animate={{ y: [5, 11, 5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. STATS STRIP ───────────────────────────────────── */}
      <section className="relative bg-[#112D15] border-y border-[#C5A046]/15 py-8 sm:py-10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #C5A046 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="text-center"
              >
                <div className="font-display font-light text-3xl sm:text-4xl gold-gradient-text leading-none mb-1">
                  {stat.value}
                </div>
                <div className="label-caps text-stone-300 mt-1" style={{ fontSize: '0.58rem' }}>{stat.label}</div>
                <div className="text-stone-500 text-[10px] mt-0.5 font-light">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. INTRO TEXT ─────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="label-caps text-[#A18637]">The Cardanova Standard</span>
          <h2
            className="font-display font-light text-[#FAF8F5] mt-4 leading-[0.95]"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
          >
            Six Steps from{' '}
            <em className="gold-gradient-text not-italic">Farm to Freight</em>
          </h2>
          <div className="mx-auto mt-5 luxury-divider w-20" />
          <p className="mt-6 text-stone-400 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
            Transparency is our foundation. Below is the exact journey every Cardanova cardamom pod takes — from our estates in Idukki to a buyer's warehouse anywhere in the world. No intermediaries. No shortcuts. Just the pure process that earns global trust.
          </p>
        </motion.div>
      </section>

      {/* ── 4. PROCESS STEPS ─────────────────────────────────── */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-16 sm:space-y-24 lg:space-y-32">
          {steps.map((step, i) => (
            <ProcessStep key={step.step} step={step} index={i} />
          ))}
        </div>
      </section>

      {/* ── 5. CREDIBILITY STRIP ─────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-10 bg-[#112D15] border-t border-[#C5A046]/15">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 sm:mb-12"
          >
            <span className="label-caps text-[#A18637]">Compliance & Certifications</span>
            <h2
              className="font-display font-light text-[#FAF8F5] mt-3 leading-tight"
              style={{ fontSize: 'clamp(1.6rem, 3.5vw, 3rem)' }}
            >
              Every Shipment is{' '}
              <em className="animate-shimmer not-italic">Fully Documented</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Phytosanitary Certificate',
                desc: 'Issued by the Government of India — confirming all cardamom is pest-free and safe for international import.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Certificate of Origin',
                desc: 'DGFT-issued origin certificate confirming Kerala, India provenance for duty and customs compliance.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'FSSAI Compliance',
                desc: 'Processed under FSSAI-registered facility conditions, meeting Indian food safety standards for export.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: 'Lab Quality Testing',
                desc: 'Independent third-party lab verification of volatile oil content, moisture, and microbial counts per batch.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                ),
                title: 'Batch Traceability',
                desc: 'Every export lot is batch-coded and traceable from source farm, curing date, grading date to packing date.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: 'Global Import Compliance',
                desc: 'Shipments are prepared to meet EU (EC 2073/2005), US FDA, GCC SFDA, and Asian import authority requirements.',
              },
            ].map((cert, i) => (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group flex gap-4 rounded-2xl border border-[#C5A046]/20 bg-[#071309]/60 p-5 sm:p-6 hover:border-[#C5A046]/50 transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C5A046]/30 bg-[#112D15] group-hover:border-[#C5A046] transition-colors">
                  {cert.icon}
                </div>
                <div>
                  <h4 className="font-display text-base font-light text-[#FAF8F5] mb-1">{cert.title}</h4>
                  <p className="text-xs text-stone-400 font-light leading-relaxed">{cert.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl rounded-2xl sm:rounded-3xl border border-[#C5A046]/25 bg-[#112D15] p-8 sm:p-14 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C5A046, transparent)' }}
          />
          <span className="label-caps text-[#A18637]">Partner with Cardanova</span>
          <h2
            className="font-display font-light text-[#FAF8F5] mt-4 leading-[0.95]"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
          >
            Ready to Source from{' '}
            <em className="animate-shimmer not-italic">Origin?</em>
          </h2>
          <p className="mt-5 text-stone-400 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
            Connect directly with our trade team for custom FOB/CIF quotations, sample requests, and bulk order discussions.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              as="button"
              onClick={() => onOpenQuoteModal()}
              cursorLabel="Quote"
              className="w-full sm:w-auto rounded-full gold-gradient-bg px-8 py-4 label-caps text-[#071309] shadow-xl hover:brightness-110 transition-all cursor-pointer gold-glow font-semibold"
            >
              Request Export Quote →
            </MagneticButton>
            <a
              href="https://wa.me/919656866090?text=Hello%20Cardanova%2C%20I%20want%20to%20know%20more%20about%20your%20origin%20and%20sourcing."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border border-[#C5A046]/40 bg-transparent px-8 py-4 label-caps text-[#C5A046] hover:bg-[#C5A046]/10 hover:border-[#C5A046]/70 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 32 32" width="16" height="16" fill="#C5A046">
                <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.651 4.799 1.785 6.809L2 30l7.383-1.752A13.924 13.924 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm6.318 19.91c-.346-.173-2.048-1.01-2.366-1.126-.317-.115-.548-.173-.779.173-.23.346-.895 1.126-1.097 1.357-.202.23-.404.26-.75.086-.347-.173-1.463-.54-2.787-1.718-1.03-.918-1.725-2.05-1.928-2.396-.202-.347-.021-.534.152-.707.155-.155.346-.404.52-.607.172-.202.23-.346.345-.577.115-.23.058-.433-.029-.607-.086-.173-.779-1.878-1.068-2.571-.281-.676-.567-.584-.779-.594-.202-.01-.433-.012-.664-.012-.23 0-.607.086-.924.433-.317.347-1.212 1.184-1.212 2.888s1.241 3.35 1.414 3.58c.173.23 2.443 3.73 5.917 5.233.827.357 1.472.57 1.975.73.83.264 1.586.227 2.182.138.666-.1 2.048-.837 2.337-1.645.288-.808.288-1.501.202-1.645-.087-.144-.317-.23-.664-.404z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
