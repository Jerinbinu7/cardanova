import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import MagneticButton from './MagneticButton';
import { getHomepageContent } from '../services/homepageService';
import { getGalleryItems } from '../services/galleryService';

interface HeroProps {
  onOpenQuoteModal: (grade?: string) => void;
  onNavigateToProducts: () => void;
}

const HERO_SLIDES = [
  {
    image: '/images/cardamom-hero-1.jpg',
    alt: 'Premium green cardamom pods from Idukki, Kerala — Cardanova Spices flagship grade',
    headline: 'Premium Green Cardamom',
    accent: 'from Idukki, Kerala',
    sub: 'Carefully sourced, graded and packed green cardamom for wholesalers, importers, food businesses and retail partners.',
  },
  {
    image: '/images/cardamom-hero-2.jpg',
    alt: 'Macro close-up of 8.5mm extra bold green cardamom pods from Idukki Kerala',
    headline: 'From the Hills of Idukki',
    accent: 'to Global Markets',
    sub: 'Origin: Idukki, Kerala, India · Precision Optically Graded & Vacuum Sealed',
  },
  {
    image: '/images/cardamom-hero-3.jpg',
    alt: 'Misty lush cardamom plantation in high-altitude Western Ghats Idukki Kerala',
    headline: 'Peak Aroma & Freshness',
    accent: 'Domestic & Global Supply',
    sub: 'Flue-Cured & Vacuum Sealed · Sourced Direct from Kerala Estates',
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
  const [primaryCtaText, setPrimaryCtaText] = useState('REQUEST A TRADE QUOTE');
  const [secondaryCtaText, setSecondaryCtaText] = useState('VIEW CARDAMOM GRADES');

  const reducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const SLIDE_DURATION = 6000;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 45) {
      // Swiped left -> next slide
      setSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
    } else if (diff < -45) {
      // Swiped right -> prev slide
      setSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setProgress(0);
    }
    touchStartXRef.current = null;
  };

  // When Google Translate is active, freeze the hero on slide 0.
  // AnimatePresence unmount/remount cycles replace translated DOM nodes with
  // fresh English text — freezing prevents the translation from being lost.
  const isTranslationActive = typeof document !== 'undefined' &&
    document.cookie.includes('googtrans=/en/');

  useEffect(() => {
    // Fetch CMS CTA text overrides if set
    getHomepageContent().then((cms) => {
      if (cms) {
        if (cms.hero_cta_primary_text) setPrimaryCtaText(cms.hero_cta_primary_text);
        if (cms.hero_cta_secondary_text) setSecondaryCtaText(cms.hero_cta_secondary_text);
      }
    }).catch((e) => {
      console.warn('Failed to fetch homepage CMS content', e);
    });

    // Fetch dynamic hero images from gallery while preserving design copy
    getGalleryItems('homepage_hero').then((galleryData) => {
      if (galleryData && galleryData.length > 0) {
        const dynamicSlides = galleryData.map((item, index) => {
          const originalSlide = HERO_SLIDES[index % HERO_SLIDES.length];
          return {
            image: item.image_url,
            alt: item.title || originalSlide.alt,
            headline: originalSlide.headline,
            accent: originalSlide.accent,
            sub: originalSlide.sub,
          };
        });
        setSlides(dynamicSlides);
      }
    }).catch((e) => {
      console.warn('Failed to fetch hero images', e);
    });
  }, []);


  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const { scrollY } = useScroll();
  const rawImgY = useTransform(scrollY, [0, 600], [0, 80]);
  const rawContentY = useTransform(scrollY, [0, 500], [0, -50]);
  const rawOpacity = useTransform(scrollY, [0, 500], [1, 0.2]);

  const imgY = isTouch ? 0 : rawImgY;
  const contentY = isTouch ? 0 : rawContentY;
  const opacity = isTouch ? 1 : rawOpacity;

  useEffect(() => {
    // Don't cycle slides when: reduced motion OR translation is active
    // (cycling unmounts/remounts nodes, losing Google Translate mutations)
    if (reducedMotion || isTranslationActive) return;

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
      setSlide((prev) => (prev + 1) % slides.length);
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
  }, [reducedMotion, isTranslationActive]);

  useEffect(() => {
    setProgress(0);
  }, [slide]);

  return (
    <section
      ref={heroRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen w-full overflow-hidden bg-[#071309] text-[#FAF8F5] flex flex-col justify-center pt-24 sm:pt-28 pb-16 sm:pb-20 select-none sm:select-auto"
      aria-label="Hero slideshow — Premium Cardanova Spices"
    >
      {/* ── Background Slideshow ─────────────────────────── */}

      <div className="absolute inset-0 z-0" aria-hidden="true">
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
              alt={slides[slide]?.alt || HERO_SLIDES[0].alt}
              width={2070}
              height={1380}
              className="h-full w-full object-cover object-center"
              style={{ y: imgY, scale: 1.08 }}
              /* First slide: eager + high priority (LCP). Subsequent: lazy */
              loading={slide === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={slide === 0 ? 'high' : 'auto'}
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
        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden" aria-hidden="true">
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
        <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden" aria-hidden="true">
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
        className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10"
        style={{ y: contentY, opacity }}
      >
        {/* Headline */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1
                className="font-display font-light text-[#FAF8F5] tracking-tight leading-[1.04] text-left max-w-4xl"
                style={{ fontSize: 'clamp(2.4rem, 5.8vw, 5.6rem)' }}
              >
                <span>{slides[slide]?.headline || HERO_SLIDES[0].headline}</span>
                <span className="block animate-shimmer italic font-serif text-[#E2BF63] mt-1 sm:mt-2">
                  {slides[slide]?.accent || HERO_SLIDES[0].accent}
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 sm:mt-6 text-xs sm:text-sm text-stone-300/90 tracking-wide font-light max-w-2xl leading-relaxed"
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
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-start gap-3.5 sm:gap-4"
        >
          <MagneticButton
            as="button"
            onClick={() => onOpenQuoteModal()}
            cursorLabel="Quote"
            aria-label="Request a cardamom trade quote"
            className="rounded-full gold-gradient-bg px-7 py-3.5 sm:px-8 sm:py-4 label-caps text-[#071309] shadow-2xl hover:brightness-110 transition-all cursor-pointer gold-glow text-center text-xs font-semibold"
          >
            {primaryCtaText}
          </MagneticButton>

          <MagneticButton
            as="button"
            onClick={onNavigateToProducts}
            cursorLabel="Catalogue"
            aria-label="View our cardamom product catalogue"
            className="rounded-full border border-[#FAF8F5]/25 bg-white/5 backdrop-blur-md px-7 py-3.5 sm:px-8 sm:py-4 label-caps text-[#FAF8F5] hover:border-[#C5A046]/60 hover:bg-white/10 transition-all cursor-pointer text-center text-xs font-semibold"
          >
            {secondaryCtaText}
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Mobile Slide Dots ───────────────────────────── */}
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex lg:hidden items-center gap-1"
        role="tablist"
        aria-label="Mobile slideshow navigation"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setSlide(i);
              setProgress(0);
            }}
            className="p-2.5 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={slide === i}
            role="tab"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                slide === i ? 'w-8 bg-[#C5A046]' : 'w-2 bg-white/40'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── Slide Progress — vertical right side ────────── */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col items-center gap-4"
        role="tablist"
        aria-label="Slideshow navigation"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className="relative flex flex-col items-center cursor-pointer group"
            aria-label={`Go to slide ${i + 1} of ${slides.length}`}
            aria-selected={slide === i}
            role="tab"
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
                  aria-hidden="true"
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
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="label-caps text-stone-400/60" style={{ fontSize: '0.55rem' }}>
          Scroll to Discover
        </span>
        <div className="animate-scroll-bounce">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" aria-hidden="true">
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
