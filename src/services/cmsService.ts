import { sanityClient, getSanityConfig, urlFor } from './sanityClient';
import {
  MockSanityStore,
  ProductItem,
  GalleryItemData,
  QuoteRequestData,
  CertificationData,
  TestimonialData,
  GradeComparisonRow,
} from './mockSanityStore';

export type { GradeComparisonRow };

// GROQ Queries
export const GROQ_QUERIES = {
  products: `*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    category,
    shortDescription,
    description,
    images,
    specifications,
    grades,
    packagingOptions,
    isFeatured,
    isPublished,
    seoTitle,
    seoDescription
  }`,

  gallery: `*[_type == "galleryItem"] | order(displayOrder asc) {
    _id,
    title,
    category,
    image,
    displayOrder
  }`,

  quotes: `*[_type == "quoteRequest"] | order(submittedAt desc) {
    _id,
    fullName,
    companyName,
    country,
    email,
    phone,
    selectedProducts,
    quantityKg,
    message,
    status,
    submittedAt
  }`,

  certifications: `*[_type == "certification"] {
    _id,
    name,
    issuingBody,
    description,
    logo,
    validUntil,
    isVerified
  }`,

  testimonials: `*[_type == "testimonial"] {
    _id,
    clientName,
    company,
    country,
    quote,
    rating,
    isFeatured
  }`,
};

export const cmsService = {
  // Check if live Sanity project is connected
  isSanityLive: () => {
    return getSanityConfig().isConfigured && Boolean(sanityClient);
  },

  // PRODUCTS
  getProducts: async (): Promise<ProductItem[]> => {
    if (cmsService.isSanityLive()) {
      try {
        const raw = await sanityClient!.fetch(GROQ_QUERIES.products);
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((item: any) => ({
            id: item._id,
            name: item.name || '',
            category: item.category || 'cardamom',
            shortDescription: item.shortDescription || '',
            description: item.description || '',
            images: item.images?.map((img: any) => urlFor(img)) || [],
            specifications: item.specifications || [],
            grades: item.grades || [],
            packagingOptions: item.packagingOptions || [],
            isFeatured: Boolean(item.isFeatured),
            isPublished: Boolean(item.isPublished ?? true),
            seoTitle: item.seoTitle,
            seoDescription: item.seoDescription,
          }));
        }
      } catch (err) {
        console.warn('Sanity query error, using local store fallback:', err);
      }
    }
    return MockSanityStore.getProducts();
  },

  saveProduct: async (product: ProductItem): Promise<ProductItem> => {
    if (cmsService.isSanityLive()) {
      try {
        const doc = {
          _type: 'product',
          name: product.name,
          category: product.category,
          shortDescription: product.shortDescription,
          description: product.description,
          specifications: product.specifications,
          grades: product.grades,
          packagingOptions: product.packagingOptions,
          isFeatured: product.isFeatured,
          isPublished: product.isPublished,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
        };

        let result;
        if (product.id && !product.id.startsWith('prod-')) {
          result = await sanityClient!.patch(product.id).set(doc).commit();
        } else {
          result = await sanityClient!.create(doc);
        }
        return { ...product, id: result._id };
      } catch (err) {
        console.warn('Sanity save error, saving to local store:', err);
      }
    }

    const current = MockSanityStore.getProducts();
    const existingIdx = current.findIndex((p) => p.id === product.id);
    let updated: ProductItem[];
    if (existingIdx > -1) {
      updated = [...current];
      updated[existingIdx] = product;
    } else {
      const newProd = { ...product, id: 'prod-' + Date.now() };
      updated = [newProd, ...current];
      product = newProd;
    }
    MockSanityStore.saveProducts(updated);
    return product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    if (cmsService.isSanityLive() && !id.startsWith('prod-')) {
      try {
        await sanityClient!.delete(id);
      } catch (err) {
        console.warn('Sanity delete error:', err);
      }
    }
    const current = MockSanityStore.getProducts();
    MockSanityStore.saveProducts(current.filter((p) => p.id !== id));
  },

  // GALLERY
  getGallery: async (): Promise<GalleryItemData[]> => {
    if (cmsService.isSanityLive()) {
      try {
        const raw = await sanityClient!.fetch(GROQ_QUERIES.gallery);
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((item: any) => ({
            id: item._id,
            title: item.title || '',
            category: item.category || 'cultivation',
            image: urlFor(item.image),
            displayOrder: item.displayOrder || 0,
          }));
        }
      } catch (err) {
        console.warn('Sanity gallery query error:', err);
      }
    }
    return MockSanityStore.getGallery();
  },

  saveGalleryItem: async (item: GalleryItemData): Promise<GalleryItemData> => {
    const current = MockSanityStore.getGallery();
    const idx = current.findIndex((g) => g.id === item.id);
    let updated: GalleryItemData[];
    if (idx > -1) {
      updated = [...current];
      updated[idx] = item;
    } else {
      const newItem = { ...item, id: 'gal-' + Date.now() };
      updated = [...current, newItem];
      item = newItem;
    }
    MockSanityStore.saveGallery(updated);
    return item;
  },

  deleteGalleryItem: async (id: string): Promise<void> => {
    const current = MockSanityStore.getGallery();
    MockSanityStore.saveGallery(current.filter((g) => g.id !== id));
  },

  // QUOTE REQUESTS
  getQuotes: async (): Promise<QuoteRequestData[]> => {
    if (cmsService.isSanityLive()) {
      try {
        const raw = await sanityClient!.fetch(GROQ_QUERIES.quotes);
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((item: any) => ({
            id: item._id,
            fullName: item.fullName || '',
            companyName: item.companyName || '',
            country: item.country || '',
            email: item.email || '',
            phone: item.phone || '',
            selectedProducts: item.selectedProducts || '',
            quantityKg: item.quantityKg || '',
            message: item.message || '',
            status: item.status || 'pending',
            submittedAt: item.submittedAt || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('Sanity quotes error:', err);
      }
    }
    return MockSanityStore.getQuotes();
  },

  updateQuoteStatus: async (id: string, status: 'pending' | 'contacted' | 'closed'): Promise<void> => {
    if (cmsService.isSanityLive() && !id.startsWith('q-')) {
      try {
        await sanityClient!.patch(id).set({ status }).commit();
      } catch (err) {
        console.warn('Sanity quote patch error:', err);
      }
    }
    const current = MockSanityStore.getQuotes();
    const updated = current.map((q) => (q.id === id ? { ...q, status } : q));
    MockSanityStore.saveQuotes(updated);
  },

  addQuoteRequest: async (data: Omit<QuoteRequestData, 'id' | 'status' | 'submittedAt'>): Promise<QuoteRequestData> => {
    const submittedAt = new Date().toISOString();

    if (cmsService.isSanityLive()) {
      try {
        const doc = {
          _type: 'quoteRequest',
          fullName: data.fullName,
          companyName: data.companyName,
          country: data.country,
          email: data.email,
          phone: data.phone,
          selectedProducts: data.selectedProducts,
          quantityKg: data.quantityKg,
          message: data.message,
          status: 'pending',
          submittedAt,
        };
        const result = await sanityClient!.create(doc);
        const newQuote: QuoteRequestData = { ...data, id: result._id, status: 'pending', submittedAt };

        // Keep a local copy too, so the admin dashboard reads instantly without waiting on Sanity CDN
        const current = MockSanityStore.getQuotes();
        MockSanityStore.saveQuotes([newQuote, ...current]);
        return newQuote;
      } catch (err) {
        console.warn('Sanity quote save error, saving to local store:', err);
      }
    }

    const newQuote: QuoteRequestData = {
      ...data,
      id: 'q-' + Date.now(),
      status: 'pending',
      submittedAt,
    };
    const current = MockSanityStore.getQuotes();
    MockSanityStore.saveQuotes([newQuote, ...current]);
    return newQuote;
  },

  // CERTIFICATIONS
  getCertifications: async (): Promise<CertificationData[]> => {
    return MockSanityStore.getCertifications();
  },

  saveCertification: async (item: CertificationData): Promise<CertificationData> => {
    const current = MockSanityStore.getCertifications();
    const idx = current.findIndex((c) => c.id === item.id);
    let updated: CertificationData[];
    if (idx > -1) {
      updated = [...current];
      updated[idx] = item;
    } else {
      const newItem = { ...item, id: 'cert-' + Date.now() };
      updated = [...current, newItem];
      item = newItem;
    }
    MockSanityStore.saveCertifications(updated);
    return item;
  },

  deleteCertification: async (id: string): Promise<void> => {
    const current = MockSanityStore.getCertifications();
    MockSanityStore.saveCertifications(current.filter((c) => c.id !== id));
  },

  // TESTIMONIALS
  getTestimonials: async (): Promise<TestimonialData[]> => {
    return MockSanityStore.getTestimonials();
  },

  saveTestimonial: async (item: TestimonialData): Promise<TestimonialData> => {
    const current = MockSanityStore.getTestimonials();
    const idx = current.findIndex((t) => t.id === item.id);
    let updated: TestimonialData[];
    if (idx > -1) {
      updated = [...current];
      updated[idx] = item;
    } else {
      const newItem = { ...item, id: 'test-' + Date.now() };
      updated = [...current, newItem];
      item = newItem;
    }
    MockSanityStore.saveTestimonials(updated);
    return item;
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    const current = MockSanityStore.getTestimonials();
    MockSanityStore.saveTestimonials(current.filter((t) => t.id !== id));
  },

  // GRADE COMPARISON TABLE
  getGradeComparison: async (): Promise<GradeComparisonRow[]> => {
    return MockSanityStore.getGradeComparison();
  },

  saveGradeComparison: async (rows: GradeComparisonRow[]): Promise<void> => {
    MockSanityStore.saveGradeComparison(rows);
  },

  saveGradeComparisonRow: async (row: GradeComparisonRow): Promise<GradeComparisonRow> => {
    const current = MockSanityStore.getGradeComparison();
    const idx = current.findIndex((r) => r.id === row.id);
    let updated: GradeComparisonRow[];
    if (idx > -1) {
      updated = [...current];
      updated[idx] = row;
    } else {
      const newRow = { ...row, id: 'gc-' + Date.now(), displayOrder: current.length + 1 };
      updated = [...current, newRow];
      row = newRow;
    }
    MockSanityStore.saveGradeComparison(updated);
    return row;
  },

  deleteGradeComparisonRow: async (id: string): Promise<void> => {
    const current = MockSanityStore.getGradeComparison();
    MockSanityStore.saveGradeComparison(current.filter((r) => r.id !== id));
  },
};
