/**
 * Cardanova Spices — Cardamom Price Worker
 * ─────────────────────────────────────────
 * Deploy this to Cloudflare Workers (free tier).
 * It fetches the Spices Board India page server-side (no CORS issues),
 * parses the auction price data, and returns clean JSON.
 *
 * HOW TO DEPLOY (5 steps, ~10 minutes):
 * ──────────────────────────────────────
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this entire file into the online editor
 * 3. Click "Save and Deploy"
 * 4. Copy your worker URL (e.g. https://cardanova-prices.YOUR_NAME.workers.dev)
 * 5. Paste that URL into auctionPriceService.ts  (see WORKER_URL constant)
 *
 * WHAT IT RETURNS:
 * ────────────────
 * GET https://your-worker.workers.dev/cardamom-price
 *
 * {
 *   "ok": true,
 *   "date": "04-Aug-2026",
 *   "auctioneer": "IDUKKI Dist. TRADITIONAL CARDAMOM PRODUCER COMPANY Ltd",
 *   "lots": "221",
 *   "qtyArrived": "47069.4",
 *   "qtySold": "42511.7",
 *   "maxPrice": "4243.00",
 *   "avgPrice": "3049.49",
 *   "source": "https://www.indianspices.com/..."
 * }
 *
 * On error:
 * { "ok": false, "error": "reason" }
 */

const SOURCE_URL =
  'https://www.indianspices.com/price/daily-auction-price-small-cardamom';

// Label-based patterns (same as auctionPriceService.ts — keep in sync)
const PATTERNS = {
  date:       /Date\s+of\s+Auction:\s*([\d\-\w]+)/si,
  auctioneer: /Auctioneer:\s*([^,<]+?)(?:,|\n|<)/si,
  lots:       /No\.?\s*of\s+lots?:\s*([\d,]+)/si,
  qtyArrived: /Qty\s+Arrived\s*\(Kgs?\):\s*([\d,.]+)/si,
  qtySold:    /Qty\s+Sold\s*\(Kgs?\):\s*([\d,.]+)/si,
  maxPrice:   /Max\s+Price\s*\(Rs\.?\/Kg\):\s*([\d,.]+)/si,
  avgPrice:   /Avg\.?\s+Price\s*\(Rs\.?\/Kg\):\s*([\d,.]+)/si,
};

function extract(pattern, text) {
  const m = text.match(pattern);
  return m?.[1]?.trim() ?? null;
}

// CORS headers — allow your domain only in production
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',   // restrict to your domain in prod
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request) {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Only respond to /cardamom-price
    if (url.pathname !== '/cardamom-price') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Not found' }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    try {
      // Fetch Spices Board page — runs server-side, no CORS restriction
      const res = await fetch(SOURCE_URL, {
        headers: {
          // Mimic a real browser so the server doesn't block us
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        // Cloudflare caches this for 30 minutes automatically
        cf: { cacheTtl: 1800, cacheEverything: true },
      });

      if (!res.ok) {
        throw new Error(`Source returned HTTP ${res.status}`);
      }

      const html = await res.text();

      const maxPrice = extract(PATTERNS.maxPrice, html);
      const avgPrice = extract(PATTERNS.avgPrice, html);

      if (!maxPrice || !avgPrice) {
        throw new Error('Could not find price labels in source HTML');
      }

      const data = {
        ok: true,
        date:       extract(PATTERNS.date, html)       ?? '—',
        auctioneer: (extract(PATTERNS.auctioneer, html) ?? '—').substring(0, 60),
        lots:       extract(PATTERNS.lots, html)       ?? '—',
        qtyArrived: extract(PATTERNS.qtyArrived, html) ?? '—',
        qtySold:    extract(PATTERNS.qtySold, html)    ?? '—',
        maxPrice,
        avgPrice,
        source:     SOURCE_URL,
        fetchedAt:  new Date().toISOString(),
      };

      return new Response(JSON.stringify(data), {
        headers: {
          ...CORS_HEADERS,
          // Tell browsers to cache for 30 minutes
          'Cache-Control': 'public, max-age=1800',
        },
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: err.message }),
        { status: 502, headers: CORS_HEADERS }
      );
    }
  },
};
