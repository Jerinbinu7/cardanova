import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * TranslateHint
 * ─────────────────────────────────────────────────────────────────────────────
 * Language selector using the Google Translate Widget cookie method.
 *
 * How it works:
 *   1. index.html loads the Google Translate Element script (hidden widget).
 *   2. On language selection, we write the `googtrans=/en/{lang}` cookie.
 *   3. The page reloads — the widget reads the cookie and translates automatically.
 *   4. Selecting English clears the cookie and reloads to the clean original.
 *
 * This is the battle-tested approach used by thousands of production sites.
 * Works on localhost AND production. Zero API cost.
 */

interface Language {
  code: string;
  native: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en',    native: 'English',  flag: '🇬🇧' },
  { code: 'ar',    native: 'العربية', flag: '🇸🇦' },
  { code: 'de',    native: 'Deutsch',  flag: '🇩🇪' },
  { code: 'fr',    native: 'Français', flag: '🇫🇷' },
  { code: 'ml',    native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'zh-CN', native: '中文',    flag: '🇨🇳' },
  { code: 'ja',    native: '日本語',  flag: '🇯🇵' },
  { code: 'ko',    native: '한국어',  flag: '🇰🇷' },
  { code: 'ru',    native: 'Русский', flag: '🇷🇺' },
  { code: 'es',    native: 'Español',  flag: '🇪🇸' },
];

/** Read the active language from the googtrans cookie. */
function getActiveLangCode(): string {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? decodeURIComponent(match[1]) : 'en';
}

/** Write the googtrans cookie for both root path and current hostname. */
function setGoogtransCookie(value: string) {
  const host = window.location.hostname;
  const expire = value ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
  document.cookie = `googtrans=${value}; path=/${expire}`;
  document.cookie = `googtrans=${value}; path=/; domain=${host}${expire}`;
  // Also try with leading dot (some setups need it)
  if (!host.startsWith('localhost')) {
    document.cookie = `googtrans=${value}; path=/; domain=.${host}${expire}`;
  }
}

export default function TranslateHint() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Determine current language from cookie on mount
  const currentCode = getActiveLangCode();
  const currentLang = LANGUAGES.find((l) => l.code === currentCode) ?? LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleSelect = (lang: Language) => {
    setOpen(false);
    if (lang.code === currentCode) return; // already selected

    if (lang.code === 'en') {
      // Clear the cookie → reload to clean English
      setGoogtransCookie('');
      window.location.reload();
    } else {
      // Set translation cookie → reload → widget auto-translates
      setGoogtransCookie(`/en/${lang.code}`);
      window.location.reload();
    }
  };

  const displayCode =
    currentLang.code === 'zh-CN' ? 'ZH'
    : currentLang.code.toUpperCase().slice(0, 2);

  return (
    <div ref={ref} className="relative" translate="no">
      {/* Trigger button */}
      <button
        id="translate-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Select language to translate this page"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-full border border-[#C5A046]/40 bg-[#112D15]/60 px-3 py-2 text-[#FAF8F5] hover:border-[#C5A046] hover:bg-[#112D15] transition-all cursor-pointer"
      >
        <svg
          className="w-3.5 h-3.5 text-[#C5A046] shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9M3 12h18" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-widest hidden sm:inline text-[#C5A046]">
          {displayCode}
        </span>
        <svg
          className={`w-3 h-3 text-[#C5A046]/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2.5 z-[200] w-52 rounded-2xl border border-[#C5A046]/25 bg-[#0D2012]/98 backdrop-blur-2xl shadow-2xl overflow-hidden py-2"
          >
            {/* Header */}
            <li className="px-4 pt-1 pb-2.5 border-b border-[#C5A046]/10">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#C5A046]/60 font-semibold">
                Translate Page
              </p>
            </li>

            {/* Language list */}
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === currentCode;
              return (
                <li key={lang.code} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#C5A046]/12 text-[#C5A046]'
                        : 'text-stone-300 hover:bg-white/[0.04] hover:text-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-base leading-none shrink-0" aria-hidden="true">
                      {lang.flag}
                    </span>
                    <span className="text-xs font-medium">{lang.native}</span>
                    {isActive && (
                      <svg
                        className="w-3 h-3 ml-auto text-[#C5A046] shrink-0"
                        fill="currentColor" viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}

            {/* Footer */}
            <li className="px-4 pt-2.5 pb-1 border-t border-[#C5A046]/10 mt-1">
              <p className="text-[9px] text-stone-500 font-light leading-relaxed">
                Powered by Google Translate · Prices &amp; grades are protected.
              </p>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
