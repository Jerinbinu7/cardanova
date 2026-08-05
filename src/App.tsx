import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from './hooks/useReducedMotion';
import SEOHead from './seo/SEOHead';
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  faqSchema,
  productsListSchema,
  productsBreadcrumbSchema,
  aboutBreadcrumbSchema,
  aboutPageSchema,
  originBreadcrumbSchema,
  buildSchemaGraph,
} from './seo/schemas';
import CustomCursor from './components/CustomCursor';
import Header from './components/Header';
import HeroSlideshow from './components/HeroSlideshow';
import WhyChooseCardanova from './components/WhyChooseCardanova';
import AuctionPriceTicker from './components/AuctionPriceTicker';
import ProductCards from './components/ProductCards';
import ExportExperience from './components/ExportExperience';
import GlobalStandards from './components/GlobalStandards';
import CTABanner from './components/CTABanner';
import ContactForm from './components/ContactForm';
import AboutPage from './components/AboutPage';
import OriginPage from './components/OriginPage';
import ProductsPage from './components/ProductsPage';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import QuoteModal from './components/QuoteModal';
import CartDrawer, { CartItem } from './components/CartDrawer';
// Admin Routes (lazy-friendly imports)
import AdminPortal from './admin/AdminPortal';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminForgotPassword from './admin/AdminForgotPassword';
import AdminResetPassword from './admin/AdminResetPassword';

const SITE_URL = 'https://cardanovaspices.com';

// ── Per-page SEO configurations ───────────────────────────────────────────────
const PAGE_SEO = {
  home: {
    title: 'Cardanova Spices — Premium Cardamom from Idukki, Kerala | B2B Export & Wholesale',
    description:
      'Cardanova Spices LLP — single-origin premium green cardamom, pepper & turmeric from Idukki, Kerala. APEDA-certified B2B spice exporter to 30+ countries. FOB/CIF Cochin Port.',
    canonical: `${SITE_URL}/`,
    ogImage:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop',
    keywords:
      'green cardamom export, Kerala cardamom, Idukki cardamom, cardamom wholesaler, spice exporter India, B2B cardamom supplier, premium cardamom Kerala, cardamom FOB CIF Cochin',
    schema: buildSchemaGraph(organizationSchema, localBusinessSchema, websiteSchema, faqSchema),
  },
  about: {
    title: 'About Cardanova Spices — Our Story, Mission & Founders | Kerala Spice Exporters',
    description:
      'Learn about Cardanova Spices LLP — founded by Akhilkumar K A and Amal Babu in Idukki, Kerala. Discover our mission to deliver authentic premium spices to global buyers with trust and transparency.',
    canonical: `${SITE_URL}/#about`,
    ogImage:
      'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop',
    keywords:
      'Cardanova Spices about, Kerala spice exporters, Idukki cardamom founders, premium spice company India, B2B spice exporter story',
    schema: buildSchemaGraph(organizationSchema, aboutPageSchema, aboutBreadcrumbSchema),
  },
  products: {
    title: 'Green Cardamom Grades & Catalogue — 8.5mm to 7.0mm Export Specifications | Cardanova',
    description:
      'Complete B2B trade catalogue of single-origin Idukki green cardamom: 8.5mm Extra Bold, 8.0mm Premium Bold, 7.5mm Export Grade, 7.0mm Commercial. MOQ 500kg. FOB/CIF pricing available.',
    canonical: `${SITE_URL}/#products`,
    ogImage:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop',
    keywords:
      'green cardamom grades, 8.5mm cardamom, extra bold cardamom, cardamom specifications, cardamom export catalogue, Kerala cardamom wholesale, cardamom MOQ, cardamom HS code',
    schema: buildSchemaGraph(organizationSchema, productsListSchema, productsBreadcrumbSchema),
  },
  origin: {
    title: 'Our Origin — Farm to Freight Process | Idukki Cardamom Estates | Cardanova Spices',
    description:
      'Discover how Cardanova cardamom travels from mist-covered Idukki estates to global markets. Six transparent steps: cultivation, hand harvesting, flue curing, grading, vacuum sealing, and export to 30+ countries.',
    canonical: `${SITE_URL}/#origin`,
    ogImage:
      'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop',
    keywords:
      'Idukki cardamom origin, cardamom farming Kerala, flue cured cardamom, cardamom supply chain, farm to freight spice, Cardanova origin story, cardamom export process',
    schema: buildSchemaGraph(organizationSchema, originBreadcrumbSchema),
  },
} as const;

function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#071309]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      aria-hidden="true"
      role="presentation"
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(197,160,70,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      <motion.div
        className="flex flex-col items-center gap-6 text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Official Emblem Logo */}
        <div className="relative flex h-24 items-center justify-center" aria-hidden="true">
          <img
            src="/images/cardanova-emblem.png"
            alt="Cardanova Spices Emblem"
            width={538}
            height={470}
            className="h-20 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(197,160,70,0.4)]"
          />
        </div>

        {/* Official Wordmark */}
        <div className="flex flex-col items-center">
          <img
            src="/images/cardanova-wordmark-light.png"
            alt="Cardanova Spices — Exporting Nature's Finest"
            width={944}
            height={232}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Progress bar */}
        <div className="w-40 h-[1px] overflow-hidden" style={{ background: 'rgba(197,160,70,0.2)' }} role="progressbar" aria-label="Loading">
          <motion.div
            className="h-full gold-gradient-bg"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'products' | 'origin' | 'admin'>('home');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('8.5 mm Extra Bold');

  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const reducedMotion = useReducedMotion();

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect hash #admin or /admin to real router route
    if (window.location.hash === '#admin') {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(
      () => setLoading(false),
      reducedMotion ? 200 : 1200
    );
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const handleSelectTab = (tab: string) => {
    if (tab === 'admin') {
      navigate('/admin');
      return;
    }
    setActiveTab(tab as any);
  };

  const handleOpenQuoteModal = (grade?: string) => {
    if (grade) setSelectedGrade(grade);
    setIsQuoteOpen(true);
  };

  const handleNavigateToProducts = () => {
    handleSelectTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantityKg += item.quantityKg;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantityKg: newQty } : i))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCheckoutRFQ = () => {
    const itemsSummary = cartItems
      .map((i) => `${i.gradeName} (${i.quantityKg}kg)`)
      .join(', ');
    setSelectedGrade(`Bulk Cart Order: ${itemsSummary}`);
    setIsQuoteOpen(true);
  };

  // Admin routing handled below via React Router Routes

  // Determine current page SEO config
  const currentSEO = PAGE_SEO[activeTab as keyof typeof PAGE_SEO] ?? PAGE_SEO.home;

  return (
    <Routes>
      {/* ── Admin Routes — all under /admin ── */}
      <Route path="/admin/*" element={<AdminPortal />}>
        <Route index element={<AdminLayout />} />
        <Route path="*" element={<AdminLayout />} />
      </Route>
      <Route path="/admin/login"            element={<AdminLogin />} />
      <Route path="/admin/forgot-password"  element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password"   element={<AdminResetPassword />} />

      {/* ── Public Site — all other routes ── */}
      <Route path="*" element={<>
      {/* ── Per-Page SEO Head — updates <title>, meta, canonical, JSON-LD ── */}
      <SEOHead
        title={currentSEO.title}
        description={currentSEO.description}
        canonical={currentSEO.canonical}
        ogImage={currentSEO.ogImage}
        keywords={currentSEO.keywords}
        schema={currentSEO.schema}
      />

      <CustomCursor />

      <AnimatePresence mode="wait">
        {loading && <PageLoader key="loader" />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={loading ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#FAF8F5]"
      >
        {/* Header Navigation */}
        <Header
          activeTab={activeTab as any}
          setActiveTab={(tab) => handleSelectTab(tab as 'home' | 'about' | 'products' | 'origin' | 'admin')}
          onOpenQuoteModal={handleOpenQuoteModal}
          cartCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Dynamic Page Routing View */}
        <main id="main-content" tabIndex={-1}>
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSlideshow
                onOpenQuoteModal={handleOpenQuoteModal}
                onNavigateToProducts={handleNavigateToProducts}
              />
              <AuctionPriceTicker />
              <WhyChooseCardanova />
              <ProductCards
                onOpenQuoteModal={handleOpenQuoteModal}
                onNavigateToProducts={handleNavigateToProducts}
                onAddToCart={handleAddToCart}
              />
              <ExportExperience />
              <GlobalStandards />
              <CTABanner
                onOpenQuoteModal={handleOpenQuoteModal}
                onNavigateToProducts={handleNavigateToProducts}
              />
              <ContactForm onOpenQuoteModal={handleOpenQuoteModal} />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AboutPage
                onOpenQuoteModal={handleOpenQuoteModal}
                onNavigateToProducts={handleNavigateToProducts}
              />
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProductsPage onOpenQuoteModal={handleOpenQuoteModal} />
            </motion.div>
          )}

          {activeTab === 'origin' && (
            <motion.div
              key="origin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OriginPage onOpenQuoteModal={handleOpenQuoteModal} />
            </motion.div>
          )}
        </main>

        {/* Footer & Global Floating Elements */}
        <Footer
          setActiveTab={(tab) => handleSelectTab(tab)}
          onOpenQuoteModal={handleOpenQuoteModal}
        />
        <WhatsAppButton />

        {/* Interactive International B2B Quote Modal */}
        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          defaultGrade={selectedGrade}
        />

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckoutRFQ={handleCheckoutRFQ}
        />
      </motion.div>
      </>} />
    </Routes>
  );
}
