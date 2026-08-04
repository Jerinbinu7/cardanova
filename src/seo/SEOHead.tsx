import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://cardanovaspices.com';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop';
const TWITTER_HANDLE = '@CardanovaSpices';
const SITE_NAME = 'Cardanova Spices LLP';

interface SEOHeadProps {
  /** Page title — will be suffixed with brand name unless it already contains it */
  title: string;
  /** Meta description — 120–160 characters recommended */
  description: string;
  /** Canonical URL for this page/view */
  canonical: string;
  /** robots meta content — defaults to "index, follow" */
  robots?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Open Graph type — defaults to "website" */
  ogType?: 'website' | 'article' | 'product';
  /** JSON-LD structured data string (use buildSchemaGraph from schemas.ts) */
  schema?: string;
  /** Meta keywords (use sparingly, comma-separated) */
  keywords?: string;
  /** Page-specific author override */
  author?: string;
}

/**
 * SEOHead — injects per-page SEO metadata via react-helmet-async.
 *
 * Place this as the FIRST child of each page component (or per activeTab in App).
 * It updates <title>, <meta>, <link rel="canonical">, Open Graph, Twitter Card,
 * and injects JSON-LD structured data.
 */
export default function SEOHead({
  title,
  description,
  canonical,
  robots = 'index, follow',
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  schema,
  keywords,
  author = 'Cardanova Spices LLP',
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      {/* ── Core ──────────────────────────────────────── */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="author" content={author} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* ── Geo / Local Business ─────────────────────── */}
      <meta name="geo.region" content="IN-KL" />
      <meta name="geo.placename" content="Idukki, Kerala, India" />
      <meta name="geo.position" content="9.7499;77.1243" />
      <meta name="ICBM" content="9.7499, 77.1243" />

      {/* ── Open Graph ───────────────────────────────── */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Cardanova Spices — Premium Kerala Cardamom" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="ar_AE" />

      {/* ── Twitter Card ─────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Cardanova Spices — Premium Kerala Cardamom" />

      {/* ── Business / B2B Meta ──────────────────────── */}
      <meta name="rating" content="general" />
      <meta name="category" content="Spices, Food Export, B2B Trade" />
      <meta name="classification" content="Business / Food & Beverage / Export" />
      <meta name="target" content="importers, wholesalers, food manufacturers, spice traders" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />

      {/* ── JSON-LD Structured Data ───────────────────── */}
      {schema && (
        <script type="application/ld+json">{schema}</script>
      )}
    </Helmet>
  );
}
