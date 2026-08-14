import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import MagneticButton from './MagneticButton';

interface HeaderProps {
  activeTab: 'home' | 'about' | 'products' | 'origin';
  setActiveTab: (tab: 'home' | 'about' | 'products' | 'origin') => void;
  onOpenQuoteModal: (grade?: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Header({ activeTab, setActiveTab, onOpenQuoteModal, cartCount = 0, onOpenCart }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [initialVisible, setInitialVisible] = useState(true);
  const [tabSwitchVisible, setTabSwitchVisible] = useState(false);
  const [scrollUpVisible, setScrollUpVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);

  const reducedMotion = useReducedMotion();
  const lastScrollY = useRef(0);
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Reveal header menu bar for 4s whenever switching active tabs
  useEffect(() => {
    setTabSwitchVisible(true);
    const timer = setTimeout(() => {
      setTabSwitchVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    // Show menu bar on site entrance for 4 seconds
    const entranceTimer = setTimeout(() => {
      setInitialVisible(false);
    }, 4000);

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const isScrolledNow = currentY > 60;
          setScrolled((prev) => (prev !== isScrolledNow ? isScrolledNow : prev));

          if (currentY < 100) {
            setAtTop((prev) => (!prev ? true : prev));
            setScrollUpVisible((prev) => (!prev ? true : prev));
          } else {
            setAtTop((prev) => (prev ? false : prev));
            const diff = currentY - lastScrollY.current;
            if (diff < -8) {
              setScrollUpVisible((prev) => (!prev ? true : prev));
            } else if (diff > 14) {
              setScrollUpVisible((prev) => (prev ? false : prev));
            }
          }
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 70) {
        setIsHovered(true);
      } else if (e.clientY > 110 && !mobileOpen) {
        setIsHovered(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    if (!isTouch) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    return () => {
      clearTimeout(entranceTimer);
      window.removeEventListener('scroll', onScroll);
      if (!isTouch) {
        window.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, [mobileOpen, isTouch]);

  const showHeader = initialVisible || tabSwitchVisible || isHovered || atTop || scrollUpVisible || mobileOpen || isTouch;

  const handleNavClick = (tab: 'home' | 'about' | 'products' | 'origin', hash?: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const NAV_LINKS = [
    { label: 'Home',       tab: 'home'     as const, hash: undefined },
    { label: 'Products',   tab: 'products' as const, hash: undefined },
    { label: 'About',      tab: 'about'    as const, hash: undefined },
    { label: 'Our Origin', tab: 'origin'   as const, hash: undefined },
    { label: 'Contact',    tab: 'home'     as const, hash: '#contact' },
  ];

  const isLinkActive = (tab: 'home' | 'about' | 'products' | 'origin', hash?: string) => {
    if (hash) return false;
    return activeTab === tab;
  };

  return (
    <motion.header
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
        className="fixed top-0 right-0 left-0 z-[100] transition-opacity duration-500"
        style={{ pointerEvents: showHeader ? 'auto' : 'none' }}
        animate={{
          opacity: showHeader ? 1 : 0,
          y: showHeader ? 0 : -8,
          backgroundColor: scrolled ? 'rgba(7, 19, 9, 0.97)' : 'rgba(7, 19, 9, 0.25)',
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(12px)',
          borderBottom: scrolled
            ? '1px solid rgba(197, 160, 70, 0.2)'
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.4)' : '0 0 0 transparent',
        }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeInOut' }}
      >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 lg:px-10">

        {/* Brand Logo — Official Emblem & Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 sm:gap-3.5 text-left group shrink-0 py-1 cursor-pointer"
          aria-label="Cardanova Spices LLP — Go to homepage"
          aria-current={activeTab === 'home' ? 'page' : undefined}
        >
          <div className="relative flex items-center justify-center shrink-0">
            <img
              src="/images/cardanova-emblem.png"
              alt="Cardanova Spices emblem"
              width={538}
              height={470}
              className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex items-center">
            <img
              src="/images/cardanova-wordmark-light.png"
              alt="Cardanova Spices — Exporting Nature's Finest"
              width={944}
              height={232}
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link.tab, link.hash);
            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.tab, link.hash)}
                aria-current={active ? 'page' : undefined}
                aria-label={`Navigate to ${link.label}`}
                className={`relative px-3.5 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  active
                    ? 'text-[#C5A046]'
                    : 'text-stone-200/80 hover:text-[#FAF8F5]'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] w-4 bg-[#C5A046]"
                    style={{ boxShadow: '0 0 8px rgba(197,160,70,0.8)' }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          {/* Cart Button */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              aria-label={`Open Cart${cartCount > 0 ? ` — ${cartCount} item${cartCount !== 1 ? 's' : ''}` : ''}`}
              className="ml-2 relative flex items-center gap-2 rounded-full border border-[#C5A046]/40 bg-[#112D15]/60 px-4 py-2 label-caps text-[#FAF8F5] hover:border-[#C5A046] hover:bg-[#112D15] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Cart</span>
              {cartCount > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full gold-gradient-bg text-[10px] font-bold text-[#071309]"
                  aria-hidden="true"
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* CTA */}
          <MagneticButton
            as="button"
            onClick={() => onOpenQuoteModal()}
            cursorLabel="Quote"
            aria-label="Request a trade quote"
            className="ml-2 rounded-full gold-gradient-bg px-5 py-2.5 label-caps text-[#071309] shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            Request Quote
          </MagneticButton>
        </nav>

        {/* Mobile right side: cart + hamburger */}
        <div className="flex items-center gap-2 xl:hidden">
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C5A046]/40 bg-[#112D15]/60 text-[#FAF8F5] hover:border-[#C5A046] transition-all cursor-pointer text-xs"
              aria-label={`Open Cart${cartCount > 0 ? ` — ${cartCount} item${cartCount !== 1 ? 's' : ''}` : ''}`}
            >
              <svg className="w-4 h-4 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline label-caps text-[10px]">Cart</span>
              {cartCount > 0 && (
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full gold-gradient-bg text-[9px] font-bold text-[#071309]"
                  aria-hidden="true"
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#A18637]/30 bg-[#112D15]/60 backdrop-blur-sm text-[#FAF8F5] transition-colors hover:border-[#C5A046]/60"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <motion.span
              animate={{ rotate: mobileOpen ? 45 : 0 }}
              className="block text-sm"
              aria-hidden="true"
            >
              {mobileOpen ? '✕' : '☰'}
            </motion.span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-modal="false"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[#A18637]/20 bg-[#071309]/97 backdrop-blur-2xl xl:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-6" aria-label="Mobile navigation">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(link.tab, link.hash)}
                  aria-current={isLinkActive(link.tab, link.hash) ? 'page' : undefined}
                  aria-label={`Navigate to ${link.label}`}
                  className={`text-left py-3 text-sm font-medium tracking-wider uppercase border-b border-stone-800/60 transition-colors ${
                    isLinkActive(link.tab, link.hash)
                      ? 'text-[#C5A046]'
                      : 'text-stone-300 hover:text-[#C5A046]'
                  }`}
                >
                  {link.label}
                </motion.button>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => { setMobileOpen(false); onOpenQuoteModal(); }}
                aria-label="Request a trade quote"
                className="mt-5 rounded-full gold-gradient-bg py-3.5 text-center label-caps text-[#071309] shadow-lg font-semibold"
              >
                Request a Quote
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
