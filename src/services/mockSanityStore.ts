// Local store for fallback content and immediate CRUD testing when Sanity environment is unconfigured

export interface ProductItem {
  id: string;
  name: string;
  category: 'cardamom' | 'pepper' | 'turmeric' | 'other';
  shortDescription: string;
  description: string;
  images: string[];
  specifications: { label: string; value: string }[];
  grades: { gradeName: string; sizeMm: string; density: string; description: string }[];
  packagingOptions: string[];
  isFeatured: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface GalleryItemData {
  id: string;
  title: string;
  category: 'cultivation' | 'processing' | 'quality' | 'export';
  image: string;
  displayOrder: number;
}

export interface QuoteRequestData {
  id: string;
  fullName: string;
  companyName: string;
  country: string;
  email: string;
  phone: string;
  selectedProducts: string;
  quantityKg: string;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  submittedAt: string;
}

export interface CertificationData {
  id: string;
  name: string;
  issuingBody: string;
  description: string;
  logo: string;
  validUntil: string;
  isVerified: boolean;
}

export interface TestimonialData {
  id: string;
  clientName: string;
  company: string;
  country: string;
  quote: string;
  rating: number;
  isFeatured: boolean;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Kerala Green Cardamom (AGEB Grade)',
    category: 'cardamom',
    shortDescription: 'Aleppey Green Extra Bold — 8mm+ pod diameter, vivid jade green, intense essential oil content.',
    description: 'Harvested from the lush high-altitude plantations of Idukki, Western Ghats. Sun-dried and machine-sorted to international export standards.',
    images: [
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Origin', value: 'Idukki, Kerala, India' },
      { label: 'Moisture', value: '< 10.5%' },
      { label: 'Volatile Oil', value: '> 7.5% v/w' },
      { label: 'Extraneous Matter', value: '< 0.5%' },
    ],
    grades: [
      { gradeName: 'AGEB (Aleppey Green Extra Bold)', sizeMm: '8.0mm+', density: '435 g/L', description: 'Premium grade for luxury re-packers & tea blending.' },
      { gradeName: 'AGB (Aleppey Green Bold)', sizeMm: '7.5mm - 8.0mm', density: '415 g/L', description: 'High demand for Middle Eastern wholesale markets.' },
      { gradeName: 'AGS (Aleppey Green Superior)', sizeMm: '7.0mm - 7.5mm', density: '385 g/L', description: 'Standard commercial export grade.' },
    ],
    packagingOptions: ['5kg Vacuum Foil Pack inside 25kg Master Carton', '10kg Jute Sack with PE Liner', 'Custom Private Label Packaging'],
    isFeatured: true,
    isPublished: true,
    seoTitle: 'Buy Premium AGEB Green Cardamom Wholesale | Cardanova Spices',
    seoDescription: 'Direct from Idukki, Kerala. Premium 8mm+ Extra Bold Green Cardamom for B2B global export.',
  },
  {
    id: 'prod-2',
    name: 'Malabar Black Pepper (Tellicherry Garbled Special)',
    category: 'pepper',
    shortDescription: 'TGSEB Grade — Extra Bold 4.75mm berries, deep black hue, pungent piperine richness.',
    description: 'Selected from native Malabar pepper vines. Retains high natural essential oils and characteristic warmth.',
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Origin', value: 'Wayanad & Idukki, Kerala' },
      { label: 'Piperine Content', value: '> 5.8%' },
      { label: 'Moisture', value: '< 11%' },
    ],
    grades: [
      { gradeName: 'TGSEB (Tellicherry Garbled Special Extra Bold)', sizeMm: '4.75mm+', density: '570 g/L', description: 'World-renowned spice trade grade.' },
      { gradeName: 'TGB (Tellicherry Garbled Bold)', sizeMm: '4.25mm', density: '550 g/L', description: 'Gourmet restaurant supply.' },
    ],
    packagingOptions: ['25kg Multi-layer Kraft Paper Bags', '50kg PP Bags with Liner'],
    isFeatured: true,
    isPublished: true,
    seoTitle: 'Tellicherry Black Pepper Bulk Exporter | Cardanova',
    seoDescription: 'Exporting premium Malabar Black Pepper worldwide.',
  },
  {
    id: 'prod-3',
    name: 'High-Curcumin Alleppey Turmeric',
    category: 'turmeric',
    shortDescription: '5.5%+ Curcumin content, deep orange core, aromatic and therapeutic quality.',
    description: 'Cleaned, polished, and steam-sterilized whole fingers sourced from sustainable Kerala farms.',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Curcumin', value: '5.2% - 6.0%' },
      { label: 'Moisture', value: '< 9%' },
    ],
    grades: [
      { gradeName: 'Finger Grade A1', sizeMm: 'Whole Fingers', density: 'N/A', description: 'Cleaned and polished.' },
    ],
    packagingOptions: ['25kg Jute Bag', 'Bulk Container Bags'],
    isFeatured: false,
    isPublished: true,
  },
];

const INITIAL_GALLERY: GalleryItemData[] = [
  {
    id: 'gal-1',
    title: 'High Altitude Plantation in Vandanmedu, Idukki',
    category: 'cultivation',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
  },
  {
    id: 'gal-2',
    title: 'Controlled Temperature Flue Drying Chambers',
    category: 'processing',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
  },
  {
    id: 'gal-3',
    title: 'Laser Sorting & Size Grading Machine',
    category: 'quality',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
  },
  {
    id: 'gal-4',
    title: 'Air-tight Nitrogen Flushed Vacuum Packaging',
    category: 'export',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
  },
];

const INITIAL_QUOTES: QuoteRequestData[] = [
  {
    id: 'q-101',
    fullName: 'Sheikh Al-Maktoum Trading',
    companyName: 'Emirates Spice Imports LLC',
    country: 'United Arab Emirates',
    email: 'trade@emiratespices.ae',
    phone: '+971 50 123 4567',
    selectedProducts: 'AGEB Green Cardamom (8.5mm Extra Bold)',
    quantityKg: '2,500 kg',
    message: 'Looking for CIF Dubai shipment quote for 2.5 Metric Tons of 8.5mm AGEB cardamom in 5kg vacuum packs.',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'q-102',
    fullName: 'Hans Mueller',
    companyName: 'Gewürze Europa GmbH',
    country: 'Germany',
    email: 'h.mueller@gewuerze-europa.de',
    phone: '+49 89 9876543',
    selectedProducts: 'Tellicherry Black Pepper TGSEB',
    quantityKg: '5,000 kg',
    message: 'Requesting COA and pesticide analysis report along with FOB Cochin pricing.',
    status: 'contacted',
    submittedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'q-103',
    fullName: 'Robert Chen',
    companyName: 'Pacific Rim Culinary Corp',
    country: 'United States',
    email: 'rchen@pacificrimspices.com',
    phone: '+1 415 555 0199',
    selectedProducts: 'Alleppey Turmeric Fingers',
    quantityKg: '1,000 kg',
    message: 'Required sample kit for FDA compliance inspection.',
    status: 'closed',
    submittedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

const INITIAL_CERTIFICATIONS: CertificationData[] = [
  {
    id: 'cert-1',
    name: 'Spices Board of India Registered Exporter',
    issuingBody: 'Ministry of Commerce & Industry, Govt of India',
    description: 'Authorized CRES (Certificate of Registration as Exporter of Spices) holder.',
    logo: '🌿',
    validUntil: 'Ref: CRES-KRL-2026/8942',
    isVerified: true,
  },
  {
    id: 'cert-2',
    name: 'FSSAI License (Food Safety Standard)',
    issuingBody: 'Food Safety and Standards Authority of India',
    description: 'Central License for spice processing, sorting & export packaging.',
    logo: '🛡️',
    validUntil: 'Lic No: 11324007000189',
    isVerified: true,
  },
  {
    id: 'cert-3',
    name: 'ISO 22000:2018 Food Safety Management',
    issuingBody: 'TÜV SÜD International',
    description: 'Certified processing facility hygiene and traceability standard.',
    logo: '🏅',
    validUntil: 'Valid thru 2028',
    isVerified: true,
  },
  {
    id: 'cert-4',
    name: 'USDA & EU Organic Certified Estate',
    issuingBody: 'Control Union Certifications',
    description: 'Pesticide-free chemical analysis certified for European & North American imports.',
    logo: '✨',
    validUntil: 'CU-892401',
    isVerified: true,
  },
];

const INITIAL_TESTIMONIALS: TestimonialData[] = [
  {
    id: 'test-1',
    clientName: 'Tariq Al-Mansoor',
    company: 'Al-Mansoor Commodity Traders',
    country: 'Saudi Arabia',
    quote: 'Cardanova provides the cleanest, greenest cardamom pods we have received from India in 15 years. Moisture level was perfectly controlled.',
    rating: 5,
    isFeatured: true,
  },
  {
    id: 'test-2',
    clientName: 'Elena Rostova',
    company: 'Baltic Spice Co.',
    country: 'Latvia',
    quote: 'Prompt shipment documentation, vacuum seal intact upon arrival in Riga port. Outstanding aroma.',
    rating: 5,
    isFeatured: true,
  },
];

export class MockSanityStore {
  private static getKey(key: string) {
    return `cardanova_cms_${key}`;
  }

  static getProducts(): ProductItem[] {
    const raw = localStorage.getItem(this.getKey('products'));
    if (!raw) {
      localStorage.setItem(this.getKey('products'), JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  }

  static saveProducts(products: ProductItem[]) {
    localStorage.setItem(this.getKey('products'), JSON.stringify(products));
  }

  static getGallery(): GalleryItemData[] {
    const raw = localStorage.getItem(this.getKey('gallery'));
    if (!raw) {
      localStorage.setItem(this.getKey('gallery'), JSON.stringify(INITIAL_GALLERY));
      return INITIAL_GALLERY;
    }
    return JSON.parse(raw);
  }

  static saveGallery(gallery: GalleryItemData[]) {
    localStorage.setItem(this.getKey('gallery'), JSON.stringify(gallery));
  }

  static getQuotes(): QuoteRequestData[] {
    const raw = localStorage.getItem(this.getKey('quotes'));
    if (!raw) {
      localStorage.setItem(this.getKey('quotes'), JSON.stringify(INITIAL_QUOTES));
      return INITIAL_QUOTES;
    }
    return JSON.parse(raw);
  }

  static saveQuotes(quotes: QuoteRequestData[]) {
    localStorage.setItem(this.getKey('quotes'), JSON.stringify(quotes));
  }

  static getCertifications(): CertificationData[] {
    const raw = localStorage.getItem(this.getKey('certs'));
    if (!raw) {
      localStorage.setItem(this.getKey('certs'), JSON.stringify(INITIAL_CERTIFICATIONS));
      return INITIAL_CERTIFICATIONS;
    }
    return JSON.parse(raw);
  }

  static saveCertifications(certs: CertificationData[]) {
    localStorage.setItem(this.getKey('certs'), JSON.stringify(certs));
  }

  static getTestimonials(): TestimonialData[] {
    const raw = localStorage.getItem(this.getKey('testimonials'));
    if (!raw) {
      localStorage.setItem(this.getKey('testimonials'), JSON.stringify(INITIAL_TESTIMONIALS));
      return INITIAL_TESTIMONIALS;
    }
    return JSON.parse(raw);
  }

  static saveTestimonials(items: TestimonialData[]) {
    localStorage.setItem(this.getKey('testimonials'), JSON.stringify(items));
  }
}
