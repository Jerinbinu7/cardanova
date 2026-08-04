/**
 * auctionPriceService.ts
 * ─────────────────────────────────────────────────────────────
 * Fetches, parses, and caches cardamom auction price data from
 * the official Spices Board India website via the allorigins.win
 * CORS proxy (no public API is available).
 *
 * Architecture
 * ─────────────
 * • SpiceConfig      – per-spice configuration (URL, labels, cache key)
 * • AuctionRecord    – normalised data object returned to the UI
 * • DataStatus       – 'live' | 'cached' | 'fallback'
 * • AuctionResult    – { data, status, updatedAt }
 *
 * Adding a new spice
 * ─────────────────
 * 1. Add an entry to SPICE_CONFIGS.
 * 2. Add a matching entry to FALLBACK_DATA.
 * 3. The rest of the pipeline (fetch → parse → cache → UI) is automatic.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Normalised auction record for any spice */
export interface AuctionRecord {
  spiceId: string;       // e.g. 'small_cardamom'
  spiceName: string;     // Human-readable, e.g. 'Green Cardamom'
  date: string;          // Auction date string from source
  auctioneer: string;    // Auctioneer name (truncated)
  lots: string;          // Number of lots
  qtyArrived: string;    // Quantity arrived (formatted)
  qtySold: string;       // Quantity sold (formatted)
  maxPrice: string;      // Max price ₹/kg (formatted number string)
  avgPrice: string;      // Avg price ₹/kg (formatted number string)
  sourceUrl: string;     // Link to the source page
}

/** Where the returned data came from */
export type DataStatus = 'live' | 'cached' | 'fallback';

/** Full result returned to the UI layer */
export interface AuctionResult {
  data: AuctionRecord;
  status: DataStatus;
  updatedAt: Date | null;   // null when using baked-in fallback
}

// ─── Per-spice configuration ──────────────────────────────────────────────────

interface SpiceConfig {
  id: string;
  name: string;
  sourceUrl: string;
  cacheKey: string;
  /** Label-based regex patterns to locate each field in raw HTML.
   *  Each pattern should produce the value in capture group 1. */
  patterns: {
    date: RegExp;
    auctioneer: RegExp;
    lots: RegExp;
    qtyArrived: RegExp;
    qtySold: RegExp;
    maxPrice: RegExp;
    avgPrice: RegExp;
  };
}

/**
 * Central registry of supported spices.
 * To add Black Pepper, Clove, Nutmeg, Turmeric, etc.:
 *   1. Add an entry here.
 *   2. Add matching fallback data in FALLBACK_DATA below.
 */
const SPICE_CONFIGS: SpiceConfig[] = [
  {
    id: 'small_cardamom',
    name: 'Green Cardamom',
    sourceUrl: 'https://www.indianspices.com/price/daily-auction-price-small-cardamom',
    cacheKey: 'cardanova_auction_v2_small_cardamom',
    patterns: {
      /**
       * All patterns use the `s` (dotAll) flag so `\s*` matches newlines.
       * The Spices Board HTML places the value on the NEXT LINE after the label,
       * e.g.:  "Max Price (Rs./Kg):\n                      4243.00,"
       * Using [\s,]* after the colon makes them robust to that format.
       */
      date:       /Date\s+of\s+Auction:\s*([\d\-\w]+)/si,
      auctioneer: /Auctioneer:\s*([^,<]+?)(?:,|\n|<)/si,
      lots:       /No\.?\s*of\s+lots?:\s*([\d,]+)/si,
      qtyArrived: /Qty\s+Arrived\s*\(Kgs?\):\s*([\d,.]+)/si,
      qtySold:    /Qty\s+Sold\s*\(Kgs?\):\s*([\d,.]+)/si,
      maxPrice:   /Max\s+Price\s*\(Rs\.?\/Kg\):\s*([\d,.]+)/si,
      avgPrice:   /Avg\.?\s+Price\s*\(Rs\.?\/Kg\):\s*([\d,.]+)/si,
    },
  },
  // ── Example: uncomment and fill when ready ──────────────────────────────
  // {
  //   id: 'black_pepper',
  //   name: 'Black Pepper',
  //   sourceUrl: 'https://www.indianspices.com/price/daily-price-black-pepper',
  //   cacheKey: 'cardanova_auction_black_pepper',
  //   patterns: { date: /.../, auctioneer: /.../, ... }
  // },
];

// ─── Baked-in fallback values ─────────────────────────────────────────────────

/**
 * Hard-coded from the most recently known Spices Board data (04-Aug-2026).
 * These are only shown when both the network fetch AND the localStorage cache fail.
 */
const FALLBACK_DATA: Record<string, Omit<AuctionRecord, 'spiceId' | 'spiceName' | 'sourceUrl'>> = {
  small_cardamom: {
    date: '04-Aug-2026',
    auctioneer: 'IDUKKI Dist. Traditional Cardamom Producers Co. Ltd.',
    lots: '221',
    qtyArrived: '47,069 kg',
    qtySold: '42,511 kg',
    maxPrice: '4,243',
    avgPrice: '3,049',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cache TTL: 30 minutes — short enough to show live data regularly */
const CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Remove any old cache keys from previous versions of the service.
 * Called once at module load so stale cache never blocks the worker fetch.
 */
function purgeOldCaches(): void {
  const OLD_KEYS = [
    'cardanova_auction_price',          // very first version
    'cardanova_auction_small_cardamom', // v1 key
  ];
  try {
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}
purgeOldCaches();

/**
 * CORS proxy cascade — tried in order until one succeeds.
 * Each entry is a function that builds the full proxy URL for a given target.
 */
const CORS_PROXIES: Array<(target: string) => string> = [
  // 1. allorigins.win — returns { contents: '<html>...' }
  (t) => `https://api.allorigins.win/get?url=${encodeURIComponent(t)}`,
  // 2. corsproxy.io — returns raw HTML directly
  (t) => `https://corsproxy.io/?url=${encodeURIComponent(t)}`,
  // 3. thingproxy.freeboard.io — returns raw HTML directly
  (t) => `https://thingproxy.freeboard.io/fetch/${t}`,
];

/**
 * Normalise the fetch response to a plain HTML string,
 * handling both JSON-wrapped (allorigins) and raw-HTML proxies.
 */
async function extractHtml(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    return (json?.contents as string) ?? '';
  }
  return res.text();
}

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 9_000;

/**
 * ─── YOUR CLOUDFLARE WORKER URL ───────────────────────────────────────────
 *
 * After deploying cloudflare-worker/cardamom-price-worker.js, paste your
 * worker URL here. Example:
 *   'https://cardanova-prices.yourname.workers.dev'
 *
 * Leave as empty string ('') to skip the worker and use CORS proxies only.
 * ─────────────────────────────────────────────────────────────────────────
 */
const WORKER_URL = 'https://cardanova-prices.zentra-techofficial.workers.dev';

/** Strip trailing commas/spaces and format as Indian locale number */
function formatIndianNumber(raw: string): string {
  const cleaned = raw.replace(/[,\s]+$/, '').replace(/,/g, ''); // strip trailing commas
  const n = parseFloat(cleaned);
  if (isNaN(n)) return raw.replace(/,\s*$/, ''); // still strip trailing comma even if not a number
  return Math.round(n).toLocaleString('en-IN');
}

// ─── Cache layer ──────────────────────────────────────────────────────────────

interface CacheEntry {
  data: AuctionRecord;
  ts: number;
}

/** Write a successful fetch result to localStorage */
function writeCache(cacheKey: string, record: AuctionRecord): void {
  try {
    const entry: CacheEntry = { data: record, ts: Date.now() };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // Silently ignore (e.g. private/incognito storage full)
  }
}

/**
 * Read from localStorage.
 * Returns the cached record + its timestamp if within TTL, otherwise null.
 */
function readCache(cacheKey: string): { data: AuctionRecord; ts: number } | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const age = Date.now() - (entry.ts ?? 0);
    if (age < CACHE_TTL_MS && entry.data) {
      return { data: entry.data, ts: entry.ts };
    }
    return null;
  } catch {
    return null;
  }
}

/** Always return the most recently cached data regardless of TTL (stale fallback) */
function readStaleCache(cacheKey: string): { data: AuctionRecord; ts: number } | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    return entry.data ? { data: entry.data, ts: entry.ts } : null;
  } catch {
    return null;
  }
}

// ─── HTML parser ──────────────────────────────────────────────────────────────

/**
 * Parse raw HTML from the Spices Board page using label-based regex patterns.
 * This approach is resilient to changes in CSS classes or surrounding elements
 * because it anchors on the text labels ("Max Price", "Avg. Price", etc.).
 *
 * Returns null if the minimum required fields (maxPrice + avgPrice) are missing.
 */
function parseHtml(html: string, config: SpiceConfig): AuctionRecord | null {
  const { id, name, sourceUrl, patterns } = config;

  const extract = (re: RegExp, raw: string): string | null => {
    const m = raw.match(re);
    return m?.[1]?.trim() ?? null;
  };

  const maxPriceRaw = extract(patterns.maxPrice, html);
  const avgPriceRaw = extract(patterns.avgPrice, html);

  // Require at least the two price fields to consider a parse successful
  if (!maxPriceRaw || !avgPriceRaw) return null;

  const arrivedRaw = extract(patterns.qtyArrived, html);
  const soldRaw    = extract(patterns.qtySold, html);

  return {
    spiceId:    id,
    spiceName:  name,
    sourceUrl,
    date:       extract(patterns.date, html)      ?? FALLBACK_DATA[id]?.date        ?? '—',
    auctioneer: (extract(patterns.auctioneer, html) ?? FALLBACK_DATA[id]?.auctioneer ?? '—').substring(0, 55),
    lots:       extract(patterns.lots, html)      ?? FALLBACK_DATA[id]?.lots        ?? '—',
    qtyArrived: arrivedRaw ? formatIndianNumber(arrivedRaw) + ' kg' : FALLBACK_DATA[id]?.qtyArrived ?? '—',
    qtySold:    soldRaw    ? formatIndianNumber(soldRaw)    + ' kg' : FALLBACK_DATA[id]?.qtySold    ?? '—',
    maxPrice:   formatIndianNumber(maxPriceRaw),
    avgPrice:   formatIndianNumber(avgPriceRaw),
  };
}

// ─── Network fetch ────────────────────────────────────────────────────────────

/**
 * Fetch from the dedicated Cloudflare Worker (primary method).
 * The Worker returns clean pre-parsed JSON — no HTML parsing needed.
 * Returns null if WORKER_URL is not configured or the request fails.
 */
async function fetchFromWorker(config: SpiceConfig): Promise<AuctionRecord | null> {
  if (!WORKER_URL) return null; // Not configured yet

  try {
    const res = await fetch(`${WORKER_URL}/cardamom-price`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const json = await res.json() as Record<string, unknown>;
    if (!json.ok || !json.maxPrice || !json.avgPrice) return null;

    console.info('[AuctionPriceService] Fetched via Cloudflare Worker ✓');

    return {
      spiceId:    config.id,
      spiceName:  config.name,
      sourceUrl:  config.sourceUrl,
      date:       String(json.date       ?? FALLBACK_DATA[config.id]?.date       ?? '—'),
      auctioneer: String(json.auctioneer ?? FALLBACK_DATA[config.id]?.auctioneer ?? '—').substring(0, 55),
      lots:       String(json.lots       ?? FALLBACK_DATA[config.id]?.lots       ?? '—'),
      qtyArrived: json.qtyArrived ? formatIndianNumber(String(json.qtyArrived)) + ' kg' : FALLBACK_DATA[config.id]?.qtyArrived ?? '—',
      qtySold:    json.qtySold    ? formatIndianNumber(String(json.qtySold))    + ' kg' : FALLBACK_DATA[config.id]?.qtySold    ?? '—',
      maxPrice:   formatIndianNumber(String(json.maxPrice)),
      avgPrice:   formatIndianNumber(String(json.avgPrice)),
    };
  } catch {
    return null;
  }
}

/**
 * CORS proxy cascade — emergency backup when Worker is unavailable.
 * Tries each proxy in order, returning the first successful parse.
 * Throws only if ALL proxies fail.
 */
async function fetchViaCorsProxy(config: SpiceConfig): Promise<AuctionRecord> {
  const errors: string[] = [];

  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const buildUrl = CORS_PROXIES[i];
    const proxyUrl = buildUrl(config.sourceUrl);

    try {
      const res = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!res.ok) { errors.push(`Proxy ${i + 1} HTTP ${res.status}`); continue; }

      const html = await extractHtml(res);
      if (!html || html.length < 500) { errors.push(`Proxy ${i + 1} empty`); continue; }

      const parsed = parseHtml(html, config);
      if (!parsed) { errors.push(`Proxy ${i + 1} parse failed`); continue; }

      console.info(`[AuctionPriceService] Fetched via CORS proxy ${i + 1}`);
      return parsed;

    } catch (err: unknown) {
      errors.push(`Proxy ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(`All proxies failed: ${errors.join(' | ')}`);
}

/**
 * Main live-fetch orchestrator.
 * Tries: Worker → CORS proxies (in that order).
 */
async function fetchLive(config: SpiceConfig): Promise<AuctionRecord> {
  // 1. Try the Cloudflare Worker (most reliable)
  const workerResult = await fetchFromWorker(config);
  if (workerResult) return workerResult;

  // 2. Fall back to CORS proxy cascade
  return fetchViaCorsProxy(config);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Main entry point.
 *
 * Resolution order:
 *   1. Valid localStorage cache  → status: 'cached'
 *   2. Fresh network fetch       → status: 'live'   (and writes to cache)
 *   3. Stale localStorage cache  → status: 'cached' (expired but something > nothing)
 *   4. Baked-in fallback         → status: 'fallback'
 *
 * @param spiceId – must match a key in SPICE_CONFIGS (default: 'small_cardamom')
 */
export async function getAuctionPrice(
  spiceId = 'small_cardamom'
): Promise<AuctionResult> {
  const config = SPICE_CONFIGS.find((c) => c.id === spiceId);
  if (!config) throw new Error(`Unknown spice id: "${spiceId}"`);

  // ── Step 1: check localStorage cache ────────────────────────────────────────
  // Skip cache entirely when the Worker is configured:
  // Cloudflare caches the Worker response at the edge for 30 minutes,
  // so every fetch is still fast and the Spices Board server is not overloaded.
  // This ensures the ticker always shows 🟢 "Live Auction".
  const validCache = WORKER_URL ? null : readCache(config.cacheKey);
  if (validCache) {
    return {
      data: validCache.data,
      status: 'cached',
      updatedAt: new Date(validCache.ts),
    };
  }

  // ── Step 2: live fetch ─────────────────────────────────────────────────────
  try {
    const liveData = await fetchLive(config);
    writeCache(config.cacheKey, liveData);
    return { data: liveData, status: 'live', updatedAt: new Date() };
  } catch (err) {
    console.warn('[AuctionPriceService] Live fetch failed:', err);
  }

  // ── Step 3: stale cache ────────────────────────────────────────────────────
  const stale = readStaleCache(config.cacheKey);
  if (stale) {
    return {
      data: stale.data,
      status: 'cached',
      updatedAt: new Date(stale.ts),
    };
  }

  // ── Step 4: baked-in fallback ──────────────────────────────────────────────
  const fb = FALLBACK_DATA[config.id];
  const fallbackRecord: AuctionRecord = {
    spiceId:   config.id,
    spiceName: config.name,
    sourceUrl: config.sourceUrl,
    date:       fb?.date       ?? '—',
    auctioneer: fb?.auctioneer ?? '—',
    lots:       fb?.lots       ?? '—',
    qtyArrived: fb?.qtyArrived ?? '—',
    qtySold:    fb?.qtySold    ?? '—',
    maxPrice:   fb?.maxPrice   ?? '—',
    avgPrice:   fb?.avgPrice   ?? '—',
  };

  return { data: fallbackRecord, status: 'fallback', updatedAt: null };
}

/** Expose config list so the UI can know which spices are available */
export { SPICE_CONFIGS };
