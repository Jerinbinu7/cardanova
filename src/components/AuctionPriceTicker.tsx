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
function TickerSlide({ data, sourceUrl }: { data: AuctionRecord; sourceUrl: string }) {
  return (
    <span className="inline-flex items-center gap-8 text-[0.72rem] flex-shrink-0">

      {/* Spice + Date */}
      <span className="inline-flex items-center gap-2">
        <span style={{ color: '#C5A046', fontWeight: 500 }}>{data.spiceName}</span>
        <span style={{ color: 'rgba(197,160,70,0.3)' }}>·</span>
        <span style={{ color: '#9ca3af' }}>{data.date}</span>
      </span>

      {/* Divider */}
      <span style={{ color: 'rgba(197,160,70,0.18)', fontSize: '1rem' }}>│</span>

      {/* Max Price — gold highlight */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Max
        </span>
        <span translate="no" style={{ color: '#E2BF63', fontWeight: 600, fontSize: '0.8rem' }}>
          ₹{data.maxPrice}/kg
        </span>
      </span>

      {/* Avg Price */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Avg
        </span>
        <span translate="no" style={{ color: '#C5A046', fontWeight: 600, fontSize: '0.8rem' }}>
          ₹{data.avgPrice}/kg
        </span>
      </span>

      {/* Divider */}
      <span style={{ color: 'rgba(197,160,70,0.18)', fontSize: '1rem' }}>│</span>

      {/* Lots */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Lots
        </span>
        <span translate="no" style={{ color: '#d1d5db' }}>{data.lots}</span>
      </span>

      {/* Arrived */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Arrived
        </span>
        <span translate="no" style={{ color: '#d1d5db' }}>{data.qtyArrived}</span>
      </span>

      {/* Sold */}
      <span className="inline-flex items-center gap-1.5">
        <span translate="no" style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Sold
        </span>
        <span translate="no" style={{ color: '#d1d5db' }}>{data.qtySold}</span>
      </span>

      {/* Divider */}
      <span style={{ color: 'rgba(197,160,70,0.18)', fontSize: '1rem' }}>│</span>

      {/* Source link */}
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{
          color: 'rgba(197,160,70,0.45)',
          fontSize: '0.62rem',
          letterSpacing: '0.06em',
          textDecoration: 'none',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#C5A046')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(197,160,70,0.45)')}
      >
        Spices Board India ↗
      </a>

      {/* Wide spacer so the two copies don't visually merge */}
      <span style={{ display: 'inline-block', width: 80 }} />
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
          animation: cardanova-ticker 40s linear infinite;
          will-change: transform;
        }
        .cardanova-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        role="marquee"
        aria-label="Live cardamom auction prices from Spices Board India"
        className="relative flex items-stretch overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #060f08 0%, #0d1d0f 50%, #060f08 100%)',
          borderBottom: '1px solid rgba(197,160,70,0.18)',
          minHeight: 38,
        }}
      >
        {/* ── Left pill: status + label ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex items-center gap-2.5 px-4"
          style={{
            borderRight: '1px solid rgba(197,160,70,0.18)',
            background: 'rgba(197,160,70,0.055)',
            minWidth: 140,
          }}
        >
          <StatusDot color={dotColor} />
          <div className="flex flex-col leading-none">
            <span
              style={{
                color,
                fontSize: '0.55rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {label}
            </span>
            {updatedAt && (
              <span
                style={{
                  color: 'rgba(156,163,175,0.55)',
                  fontSize: '0.5rem',
                  marginTop: 2,
                  letterSpacing: '0.05em',
                }}
              >
                Updated {formatTime(updatedAt)} IST
              </span>
            )}
          </div>
        </div>

        {/* ── Right: scrolling ticker ───────────────────────────────────── */}
        <div
          className="overflow-hidden flex-1 flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {loading ? (
            // Skeleton placeholder: fixed height prevents layout shift
            <TickerSkeleton />
          ) : result ? (
            /*
             * Rendered TWICE side-by-side.
             * The animation moves left by exactly 50% of the total width,
             * which equals the width of one copy — creating a seamless loop.
             */
            <div
              ref={tickerRef}
              className="cardanova-ticker-track inline-flex items-center whitespace-nowrap"
            >
              <TickerSlide data={result.data} sourceUrl={result.data.sourceUrl} />
              {/* Duplicate for seamless wrap */}
              <TickerSlide data={result.data} sourceUrl={result.data.sourceUrl} />
            </div>
          ) : null}
        </div>

        {/* ── Fade-out edges ────────────────────────────────────────────── */}
        <div
          className="absolute inset-y-0 left-[140px] w-8 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #060f08, transparent)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-12 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, #060f08, transparent)',
          }}
        />
      </div>
    </>
  );
}
