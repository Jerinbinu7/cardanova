import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import MagneticButton from './MagneticButton';

interface HeroProps {
  onOpenQuoteModal: (grade?: string) => void;
  onNavigateToProducts: () => void;
}

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop',
    headline: "The World's Finest",
    accent: 'Idukki Green Cardamom',
    sub: 'Single-Origin · High Elevation Estates (1,100m) · Kerala, India',
  },
  {
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=2070&auto=format&fit=crop',
    headline: 'Handpicked by Local Farmers.',
    accent: 'Graded for Excellence.',
    sub: 'Direct partnership with 250+ smallholder farming families',
  },
  {
    image: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=2070&auto=format&fit=crop',
    headline: 'Peak Pod Freshness',
    accent: 'Exported to 30+ Countries',
    sub: 'Flue-cured & Vacuum Sealed · FOB/CIF Cochin Port',
  },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 4 + (i % 5) * 3,
  left: 5 + i * 8,
  bottom: 8 + (i % 4) * 18,
  delay: i * 0.7,
  duration: 9 + i * 1.2,
}));

export default function HeroSlideshow({ onOpenQuoteModal, onNavigateToProducts }: HeroProps) {
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slides, setSlides] = useState(HERO_SLIDES);
  const [primaryCtaText, setPrimaryCtaText] = useState('Request a Quote →');
  const [secondaryCtaText, setSecondaryCtaText] = useState('View Catalogue ↓');

  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const SLIDE_DURATION = 6000;

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cardanova_homepage_cms');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.heroHeadline) {
          setSlides([
            {
              image: HERO_SLIDES[0].image,
              headline: parsed.heroHeadline,
              accent: 'Single-Origin Kerala Spices',
              sub: parsed.heroSubtext || HERO_SLIDES[0].sub,
            },
            HERO_SLIDES[1],
            HERO_SLIDES[2],
          ]);
        }
        if (parsed.primaryCta) setPrimaryCtaText(parsed.primaryCta);
        if (parsed.secondaryCta) setSecondaryCtaText(parsed.secondaryCta);
      }
    } catch (e) {
      console.warn('Failed to parse homepage cms settings', e);
    }
  }, []);

  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 600], [0, 80]);
  const contentY = useTransform(scrollY, [0, 400], [0, -60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    if (reducedMotion) return;

    let startTime: number;
    let raf: number;

    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) % SLIDE_DURATION;
      setProgress((elapsed / SLIDE_DURATION) * 100);

      if (elapsed < 16) {
        setSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        startTime = ts;
      }
      raf = requestAnimationFrame(tick);
    };

    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      setProgress(0);
    }, SLIDE_DURATION);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + (100 / (SLIDE_DURATION / 50)), 100));
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  useEffect(() => {
    setProgress(0);
  }, [slide]);

  return (
    <section
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden bg-[#071309] text-[#FAF8F5] flex flex-col justify-end"
      style={{ minHeight: '100svh' }}
    >
      {/* ── Background Slideshow ─────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <motion.img
              src={slides[slide]?.image || HERO_SLIDES[0].image}
              alt="Cardanova Plantation"
              className="h-full w-full object-cover object-center"
              style={{ y: imgY, scale: 1.08 }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071309] via-[#071309]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071309]/60 via-transparent to-[#071309]/30" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#071309]/80 to-transparent" />
      </div>

      {/* ── Scanning Line ───────────────────────────────── */}
      {!reducedMotion && (
        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute left-0 right-0 h-[1px] opacity-10"
            style={{
              background: 'linear-gradient(90deg, transparent, #C5A046, transparent)',
            }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 8, ease: 'linear', repeat: Infinity, repeatDelay: 2 }}
          />
        </div>
      )}

      {/* ── Floating Particles ───────────────────────────── */}
      {!reducedMotion && (
        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="animate-float-particle absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left}%`,
                bottom: `${p.bottom}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                background: `radial-gradient(circle, rgba(197,160,70,0.5), rgba(197,160,70,0.1))`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Main Hero Content ────────────────────────────── */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10 pb-32 sm:pb-40"
        style={{ y: contentY, opacity }}
      >
        {/* Headline */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="font-display font-light leading-[0.92] tracking-[-0.02em] text-[#FAF8F5]"
                style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}>
                {slides[slide]?.headline || HERO_SLIDES[0].headline}
                <br />
                <span className="animate-shimmer italic">
                  {slides[slide]?.accent || HERO_SLIDES[0].accent}
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-5 label-caps text-stone-300/80"
              >
                {slides[slide]?.sub || HERO_SLIDES[0].sub}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-start gap-4"
        >
          <MagneticButton
            as="button"
            onClick={() => onOpenQuoteModal()}
            cursorLabel="Quote"
            className="rounded-full gold-gradient-bg px-8 py-4 label-caps text-[#071309] shadow-2xl hover:brightness-110 transition-all cursor-pointer gold-glow"
          >
            {primaryCtaText}
          </MagneticButton>

          <MagneticButton
            as="button"
            onClick={onNavigateToProducts}
            cursorLabel="Catalogue"
            className="rounded-full border border-[#FAF8F5]/20 bg-white/5 backdrop-blur-md px-8 py-4 label-caps text-[#FAF8F5] hover:border-[#C5A046]/50 hover:bg-white/10 transition-all cursor-pointer"
          >
            {secondaryCtaText}
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Slide Progress — vertical right side ────────── */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col items-center gap-4">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className="relative flex flex-col items-center cursor-pointer group"
            aria-label={`Slide ${i + 1}`}
          >
            <div
              className={`rounded-full transition-all duration-500 ${
                slide === i
                  ? 'w-[2px] h-12 bg-[#C5A046]'
                  : 'w-[1px] h-6 bg-white/25 group-hover:bg-white/50'
              }`}
            >
              {slide === i && (
                <motion.div
                  className="w-full bg-white/30 rounded-full"
                  initial={{ height: '0%' }}
                  animate={{ height: `${progress}%` }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Scroll Indicator ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="label-caps text-stone-400/60" style={{ fontSize: '0.55rem' }}>
          Scroll to Discover
        </span>
        <div className="animate-scroll-bounce">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="rgba(197,160,70,0.4)" strokeWidth="1"/>
            <motion.rect
              x="6.5" y="5" width="3" height="6" rx="1.5" fill="#C5A046"
              animate={{ y: [5, 11, 5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
