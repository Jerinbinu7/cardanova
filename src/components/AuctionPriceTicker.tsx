/**
 * AuctionPriceTicker.tsx
 * ─────────────────────────────────────────────────────────────
 * Premium scrolling auction-price ticker for the Cardanova homepage.
 *
 * Features
 * ────────
 * • Fetches live data via auctionPriceService (allorigins proxy → Spices Board India)
 * • 3-state status indicator:  🟢 Live  🟡 Cached  🔴 Fallback
 * • Skeleton loading placeholder — no layout shift
 * • Infinite smooth marquee, pauses on hover
 * • Last-updated timestamp shown in the label pill
 * • Extensible: prop `spiceId` selects any registered spice
 */

import { useEffect, useRef, useState } from 'react';
import {
  type AuctionRecord,
  type DataStatus,
  type AuctionResult,
  getAuctionPrice,
} from '../services/auctionPriceService';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TickerProps {
  /** Which spice to show. Defaults to 'small_cardamom'. */
  spiceId?: string;
}

// ─── Status-dot config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DataStatus, { color: string; label: string; dotColor: string }> = {
  live:     { color: '#22c55e', dotColor: '#22c55e', label: 'Live Auction'   },
  cached:   { color: '#C5A046', dotColor: '#C5A046', label: 'Latest Auction' },
  fallback: { color: '#ef4444', dotColor: '#ef4444', label: 'Recent Auction' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Format a Date to a short "HH:MM" string in IST */
function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Animated pulsing status dot */
function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span
        className="absolute inline-flex h-full w-full rounded-full animate-ping"
        style={{ background: color, opacity: 0.55 }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: color }}
      />
    </span>
  );
}

/** Skeleton shimmer for the ticker text area while loading */
function TickerSkeleton() {
  return (
    <div className="flex items-center gap-6 py-2.5 px-6">
      {[80, 110, 90, 100, 85, 95].map((w, i) => (
        <span
          key={i}
          className="rounded animate-pulse"
          style={{
            width: w,
            height: 10,
            background: 'rgba(197,160,70,0.1)',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

/** One full "slide" of ticker data — rendered twice for seamless loop */
/** One full "slide" of ticker data — rendered multiple times for seamless loop */
function TickerSlide({ data, sourceUrl }: { data: AuctionRecord; sourceUrl: string }) {
  return (
    <span className="inline-flex items-center gap-6 text-[0.75rem] flex-shrink-0">

      {/* Spice + Date */}
      <span className="inline-flex items-center gap-2">
        <span className="font-semibold text-[#E2BF63]">{data.spiceName}</span>
        <span className="text-[#C5A046]/40">·</span>
        <span className="text-stone-300 font-medium">{data.date}</span>
      </span>

      {/* Divider */}
      <span className="text-[#C5A046]/30 text-sm select-none">│</span>

      {/* Max Price — gold highlight */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" className="text-stone-400 text-[0.62rem] uppercase tracking-wider font-medium">
          Max
        </span>
        <span translate="no" className="text-[#F3D785] font-bold text-[0.82rem]">
          ₹{data.maxPrice}/kg
        </span>
      </span>

      {/* Avg Price */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" className="text-stone-400 text-[0.62rem] uppercase tracking-wider font-medium">
          Avg
        </span>
        <span translate="no" className="text-[#E2BF63] font-semibold text-[0.82rem]">
          ₹{data.avgPrice}/kg
        </span>
      </span>

      {/* Divider */}
      <span className="text-[#C5A046]/30 text-sm select-none">│</span>

      {/* Lots */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" className="text-stone-400 text-[0.62rem] uppercase tracking-wider font-medium">
          Lots
        </span>
        <span translate="no" className="text-stone-200 font-medium">{data.lots}</span>
      </span>

      {/* Arrived */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" className="text-stone-400 text-[0.62rem] uppercase tracking-wider font-medium">
          Arrived
        </span>
        <span translate="no" className="text-stone-200 font-medium">{data.qtyArrived}</span>
      </span>

      {/* Sold */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" className="text-stone-400 text-[0.62rem] uppercase tracking-wider font-medium">
          Sold
        </span>
        <span translate="no" className="text-stone-200 font-medium">{data.qtySold}</span>
      </span>

      {/* Divider */}
      <span className="text-[#C5A046]/30 text-sm select-none">│</span>

      {/* Source link */}
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[#C5A046]/60 text-[0.65rem] tracking-wider hover:text-[#E2BF63] transition-colors"
      >
        Spices Board India ↗
      </a>

      {/* Spacer between slides */}
      <span className="inline-block w-12" />
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AuctionPriceTicker({ spiceId = 'small_cardamom' }: TickerProps) {
  const [result, setResult] = useState<AuctionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAuctionPrice(spiceId)
      .then((r) => { if (!cancelled) setResult(r); })
      .catch(() => { /* service already handles all fallbacks */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [spiceId]);

  // ── Pause on hover ─────────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    if (tickerRef.current) tickerRef.current.style.animationPlayState = 'paused';
  };
  const handleMouseLeave = () => {
    if (tickerRef.current) tickerRef.current.style.animationPlayState = 'running';
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const status = result?.status ?? 'fallback';
  const { color, dotColor, label } = STATUS_CONFIG[status];
  const updatedAt = result?.updatedAt;

  return (
    <>
      {/* Keyframe injected once via <style> */}
      <style>{`
        @keyframes cardanova-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cardanova-ticker-track {
          animation: cardanova-ticker 35s linear infinite;
          will-change: transform;
        }
        .cardanova-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        role="marquee"
        aria-label="Live cardamom auction prices from Spices Board India"
        className="relative flex items-stretch overflow-hidden select-none"
        style={{
          background: 'linear-gradient(90deg, #071309 0%, #0d2012 50%, #071309 100%)',
          borderBottom: '1px solid rgba(197,160,70,0.2)',
          minHeight: 40,
        }}
      >
        {/* ── Left pill: status + label ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex items-center gap-2.5 px-4 z-20 shadow-md"
          style={{
            borderRight: '1px solid rgba(197,160,70,0.25)',
            background: '#071309',
          }}
        >
          <StatusDot color={dotColor} />
          <div className="flex flex-col leading-none">
            <span
              style={{
                color,
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              {label}
            </span>
            {updatedAt && (
              <span
                style={{
                  color: 'rgba(212,212,216,0.6)',
                  fontSize: '0.52rem',
                  marginTop: 2,
                  letterSpacing: '0.04em',
                }}
              >
                Updated {formatTime(updatedAt)} IST
              </span>
            )}
          </div>
        </div>

        {/* ── Right: scrolling ticker ───────────────────────────────────── */}
        <div
          className="overflow-hidden flex-1 flex items-center relative z-10"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {loading ? (
            // Skeleton placeholder: fixed height prevents layout shift
            <TickerSkeleton />
          ) : result ? (
            /*
             * Rendered 4 times side-by-side.
             * The animation moves left by exactly 50% of the total track width,
             * creating a seamless, infinite wrap on all viewport sizes.
             */
            <div
              ref={tickerRef}
              className="cardanova-ticker-track inline-flex items-center dry-run whitespace-nowrap pl-4"
            >
              <TickerSlide data={result.data} sourceUrl={result.data.sourceUrl} />
              <TickerSlide data={result.data} sourceUrl={result.data.sourceUrl} />
              <TickerSlide data={result.data} sourceUrl={result.data.sourceUrl} />
              <TickerSlide data={result.data} sourceUrl={result.data.sourceUrl} />
            </div>
          ) : null}
        </div>

        {/* ── Fade-out right edge ────────────────────────────────────────────── */}
        <div
          className="absolute inset-y-0 right-0 w-16 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to left, #071309, transparent)',
          }}
        />
      </div>
    </>
  );
}
