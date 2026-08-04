/**
 * JSON-LD Structured Data Schemas for Cardanova Spices LLP
 * Generated for Google Rich Results, Bing, and schema.org compliance
 */

const SITE_URL = 'https://cardanovaspices.com';
const BRAND_NAME = 'Cardanova Spices LLP';
const OG_IMAGE = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop';

// ── 1. Organization Schema (site-wide) ───────────────────────────────────────
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND_NAME,
  legalName: 'Cardanova Spices LLP',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/favicon.svg`,
    width: 64,
    height: 64,
  },
  image: OG_IMAGE,
  description:
    'Premium single-origin green cardamom, pepper and turmeric exporter from Idukki, Kerala, India. Trusted B2B spice exporter to 30+ countries.',
  foundingDate: '2022',
  foundingLocation: {
    '@type': 'Place',
    name: 'Idukki, Kerala, India',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kattappana',
    addressLocality: 'Idukki District',
    addressRegion: 'Kerala',
    postalCode: '685508',
    addressCountry: 'IN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-96568-66090',
      contactType: 'sales',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Hindi', 'Malayalam'],
      email: 'trade@cardanovaspices.com',
    },
    {
      '@type': 'ContactPoint',
      telephone: '+91-96568-66090',
      contactType: 'customer support',
      contactOption: 'TollFree',
    },
  ],
  sameAs: [
    'https://www.linkedin.com/company/cardanova-spices',
    'https://www.facebook.com/cardanovaspices',
    'https://wa.me/919656866090',
  ],
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 9.7499,
      longitude: 77.1243,
    },
    geoRadius: '20000000',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Green Cardamom Export Grades',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: '8.5mm Extra Bold Cardamom' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: '8.0mm Premium Bold Cardamom' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: '7.5mm Export Grade Cardamom' } },
    ],
  },
};

// ── 2. LocalBusiness Schema (home page) ──────────────────────────────────────
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'FoodEstablishment'],
  '@id': `${SITE_URL}/#localbusiness`,
  name: BRAND_NAME,
  image: OG_IMAGE,
  url: SITE_URL,
  telephone: '+91-96568-66090',
  email: 'trade@cardanovaspices.com',
  priceRange: '$$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kattappana',
    addressLocality: 'Idukki District',
    addressRegion: 'Kerala',
    postalCode: '685508',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 9.7499,
    longitude: 77.1243,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  paymentAccepted: 'Bank Transfer, Letter of Credit, T/T',
  currenciesAccepted: 'USD, EUR, AED, GBP, INR',
  hasMap: 'https://maps.google.com/?q=Kattappana+Idukki+Kerala+India',
};

// ── 3. WebSite Schema (home page) ────────────────────────────────────────────
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: BRAND_NAME,
  description: 'Premium cardamom and spice exporter from Idukki, Kerala to global B2B markets.',
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'en-IN',
};

// ── 4. ProductsPage — ItemList of Products ───────────────────────────────────
export const productsListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Green Cardamom Export Grades — Cardanova Spices',
  description:
    'Complete trade catalogue of single-origin green cardamom grades from Idukki, Kerala. Available for B2B export worldwide.',
  url: `${SITE_URL}/#products`,
  numberOfItems: 6,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Product',
        name: '8.5mm Extra Bold Green Cardamom',
        description:
          'Flagship export grade. Deep natural emerald green cardamom pods, 8.5mm+, moisture <9.5%. Ideal for luxury retail, high-end gourmet, Middle East coffee blends.',
        sku: 'CARD-8.5-EB',
        mpn: '0908.31.10',
        brand: { '@type': 'Brand', name: 'Cardanova Spices' },
        category: 'Green Cardamom / Spices / Export Grade',
        countryOfOrigin: 'IN',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop',
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/#products`,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE_URL}/#organization` },
        },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pod Size', value: '8.5mm+' },
          { '@type': 'PropertyValue', name: 'Moisture', value: '<9.5%' },
          { '@type': 'PropertyValue', name: 'MOQ', value: '500kg' },
          { '@type': 'PropertyValue', name: 'HS Code', value: '0908.31.10' },
          { '@type': 'PropertyValue', name: 'Origin', value: 'Idukki, Kerala, India' },
        ],
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Product',
        name: '8.0mm Premium Bold Green Cardamom',
        description:
          'Vibrant forest green cardamom pods, 8.0–8.4mm, moisture <10%. Suited for premium wholesale, supermarket labels, confectionery and beverage.',
        sku: 'CARD-8.0-PB',
        mpn: '0908.31.10',
        brand: { '@type': 'Brand', name: 'Cardanova Spices' },
        category: 'Green Cardamom / Spices / Export Grade',
        countryOfOrigin: 'IN',
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/#products`,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE_URL}/#organization` },
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Product',
        name: '7.5mm Export Grade Green Cardamom',
        description:
          'Rich emerald green cardamom pods, 7.5–7.9mm, moisture <10%. Ideal for export wholesalers, culinary repackers, bakery and spice blenders.',
        sku: 'CARD-7.5-EG',
        mpn: '0908.31.20',
        brand: { '@type': 'Brand', name: 'Cardanova Spices' },
        category: 'Green Cardamom / Spices / Export Grade',
        countryOfOrigin: 'IN',
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/#products`,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE_URL}/#organization` },
        },
      },
    },
  ],
};

// ── 5. BreadcrumbList — About Page ───────────────────────────────────────────
export const aboutBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'About Us',
      item: `${SITE_URL}/#about`,
    },
  ],
};

// ── 6. BreadcrumbList — Products Page ───────────────────────────────────────
export const productsBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Products & Catalogue',
      item: `${SITE_URL}/#products`,
    },
  ],
};

// ── 7. BreadcrumbList — Origin Page ─────────────────────────────────────────
export const originBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Our Origin',
      item: `${SITE_URL}/#origin`,
    },
  ],
};

// ── 8. FAQPage Schema (Home page contact section) ────────────────────────────
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What cardamom grades does Cardanova export?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cardanova exports six grades of green cardamom: 8.5mm Extra Bold, 8.0mm Premium Bold, 7.5mm Export Grade, 7.0mm Commercial Grade, Mixed Grade (AGEB/LGB), and Extraction Grade (Oil). All are single-origin from Idukki, Kerala, India.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum order quantity (MOQ) for cardamom export?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The minimum order quantity starts from 500kg for flagship grades (8.5mm Extra Bold) and 1 Metric Ton for premium and export grades. Extraction grade requires a minimum of 5 Metric Tons.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Cardanova offer FOB and CIF pricing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Cardanova offers both FOB (Free on Board) and CIF (Cost, Insurance, Freight) pricing via Cochin International Container Transshipment Terminal (ICTT). Both FCL and LCL container options are available.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications does Cardanova hold?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cardanova holds APEDA (Agricultural and Processed Food Products Export Development Authority) registration, Spices Board certification, FSSAI (Food Safety and Standards Authority of India) compliance, and IEC (Import Export Code). Every shipment includes a Phytosanitary Certificate and Certificate of Origin.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which countries does Cardanova export to?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cardanova exports green cardamom to 30+ countries including UAE, Saudi Arabia, Qatar, Kuwait, USA, UK, Germany, Netherlands, Singapore, Malaysia, Australia, and many more across the Middle East, Europe, North America, and Asia-Pacific.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the shelf life of Cardanova cardamom?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cardanova cardamom has a shelf life of 24 months from the packing date when stored in the original multi-layer vacuum aluminium foil sealed packaging at ambient temperature (below 25°C) away from direct sunlight.',
      },
    },
  ],
};

// ── 9. AboutPage Schema ──────────────────────────────────────────────────────
export const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/#about`,
  name: 'About Cardanova Spices LLP — Our Story & Mission',
  description:
    'Cardanova Spices LLP was founded by Akhilkumar K A and Amal Babu, two entrepreneurs passionate about connecting Kerala\'s finest spices with global markets. Learn about our story, values, and mission.',
  url: `${SITE_URL}/#about`,
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  breadcrumb: {
    '@id': `${SITE_URL}/#about-breadcrumb`,
  },
  mentions: [
    {
      '@type': 'Person',
      name: 'Akhilkumar K A',
      jobTitle: 'Co-Founder',
      worksFor: { '@id': `${SITE_URL}/#organization` },
      email: 'akhilkumar@cardanovaspices.com',
    },
    {
      '@type': 'Person',
      name: 'Amal Babu',
      jobTitle: 'Co-Founder',
      worksFor: { '@id': `${SITE_URL}/#organization` },
      email: 'amal@cardanovaspices.com',
    },
  ],
};

// ── Helper: merge multiple schemas into one @graph ───────────────────────────
export function buildSchemaGraph(...schemas: object[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemas.map((s) => {
      // Remove individual @context since we use @graph
      const { '@context': _ctx, ...rest } = s as Record<string, unknown>;
      return rest;
    }),
  });
}
