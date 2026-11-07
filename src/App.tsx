import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
import ProductCards from './components/ProductCards';
import ExportExperience from './components/ExportExperience';
import GlobalStandards from './components/GlobalStandards';
import CTABanner from './components/CTABanner';
import ContactForm from './components/ContactForm';
import DomesticIndianSection from './components/DomesticIndianSection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import QuoteModal from './components/QuoteModal';
import CartDrawer from './components/CartDrawer';
import UpiCheckoutModal from './components/UpiCheckoutModal';
import { DomesticOrderItem, WeightOption } from './types/domestic';
import {
  getCartItems,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from './services/cartService';
import { ADMIN_BASE_PATH } from './admin/adminConstants';
import { triggerGoogleTranslateSync } from './utils/translation';

// Secondary views — lazy loaded for fast initial mobile page load & minimal bundle
const AboutPage     = lazy(() => import('./components/AboutPage'));
const OriginPage    = lazy(() => import('./components/OriginPage'));
const ProductsPage  = lazy(() => import('./components/ProductsPage'));
const DomesticStore = lazy(() => import('./components/DomesticStore'));

// Admin Routes — lazy-loaded so public visitors never download admin JS
const AdminPortal         = lazy(() => import('./admin/AdminPortal'));
const AdminLayout         = lazy(() => import('./admin/AdminLayout'));
const AdminLogin          = lazy(() => import('./admin/AdminLogin'));
const AdminForgotPassword = lazy(() => import('./admin/AdminForgotPassword'));
const AdminResetPassword  = lazy(() => import('./admin/AdminResetPassword'));

const SITE_URL = 'https://cardanovaspices.com';

// ── Per-page SEO configurations ───────────────────────────────────────────────
const PAGE_SEO = {
  home: {
    title: 'Cardanova Spices — Premium Cardamom from Idukki, Kerala | Domestic & B2B Export',
    description:
      'Cardanova Spices LLP — premium green cardamom from Idukki, Kerala. Sourcing, grading & packing for domestic buyers across India and international markets. FOB/CIF available.',
    canonical: `${SITE_URL}/`,
    ogImage: '/images/cardamom-hero-1.jpg',
    keywords:
      'green cardamom export, Kerala cardamom, Idukki cardamom, cardamom wholesaler, spice exporter India, B2B cardamom supplier, premium cardamom Kerala, cardamom FOB CIF',
    schema: buildSchemaGraph(organizationSchema, localBusinessSchema, websiteSchema, faqSchema),
  },
  about: {
    title: 'About Cardanova Spices — Our Story, Mission & Founders | Kerala Spice Exporters',
    description:
      'Learn about Cardanova Spices LLP — founded by Akhilkumar K A and Amal Babu in Idukki, Kerala. Discover our mission to deliver authentic premium spices to global buyers with trust and transparency.',
    canonical: `${SITE_URL}/#about`,
    ogImage: '/images/origin-hero-bg.jpg',
    keywords:
      'Cardanova Spices about, Kerala spice exporters, Idukki cardamom founders, premium spice company India, B2B spice exporter story',
    schema: buildSchemaGraph(organizationSchema, aboutPageSchema, aboutBreadcrumbSchema),
  },
  products: {
    title: 'Green Cardamom Grades & Catalogue — 8.5mm to 7.0mm Export Specifications | Cardanova',
    description:
      'Complete B2B trade catalogue of Idukki green cardamom: 8.5mm Extra Bold, 8.0mm Premium Bold, 7.5mm Export Grade, 7.0mm Commercial. Export MOQ from 100 kg. FOB/CIF quotations available.',
    canonical: `${SITE_URL}/#products`,
    ogImage: '/images/cardamom-hero-1.jpg',
    keywords:
      'green cardamom grades, 8.5mm cardamom, extra bold cardamom, cardamom specifications, cardamom export catalogue, Kerala cardamom wholesale, cardamom MOQ, cardamom HS code',
    schema: buildSchemaGraph(organizationSchema, productsListSchema, productsBreadcrumbSchema),
  },
  packets: {
    title: 'Buy Premium Idukki Cardamom Packets Online — 50g to 1kg | Cardanova India',
    description:
      'Order single-origin green cardamom pouches directly from Idukki estates. 50g, 100g, 250g, 500g, 1kg zipper packs with direct UPI payment and express delivery across India.',
    canonical: `${SITE_URL}/#packets`,
    ogImage: '/images/pouch-8.5mm-royal.jpg',
    keywords:
      'buy cardamom online India, cardamom 250g pouch, Idukki green cardamom packets, UPI payment cardamom, Cardanova retail packs',
    schema: buildSchemaGraph(organizationSchema, productsListSchema),
  },
  origin: {
    title: 'Our Origin — Farm to Freight Process | Idukki Cardamom Estates | Cardanova Spices',
    description:
      'Discover how Cardanova cardamom travels from mist-covered Idukki estates to global markets. Carefully managed stages from origin sourcing to export dispatch: temperature-controlled curing, automated colour sorting, advanced laboratory testing, and specialised processing.',
    canonical: `${SITE_URL}/#origin`,
    ogImage: '/images/origin-hero-bg.jpg',
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
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(197,160,70,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      <motion.div
        className="flex flex-col items-center gap-6 text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative flex h-24 items-center justify-center" aria-hidden="true">
          <img
            src="/images/cardanova-emblem.png"
            alt="Cardanova Spices Emblem"
            width={538}
            height={470}
            className="h-20 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(197,160,70,0.4)]"
          />
        </div>

        <div className="flex flex-col items-center">
          <img
            src="/images/cardanova-wordmark-light.png"
            alt="Cardanova Spices — Exporting Nature's Finest"
            width={944}
            height={232}
            className="h-10 w-auto object-contain"
          />
        </div>

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
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'products' | 'origin' | 'packets' | 'admin'>('home');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('8.5 mm Extra Bold');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // Shopping Cart & UPI Checkout state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<DomesticOrderItem[]>(() => getCartItems());
  const [isUpiCheckoutOpen, setIsUpiCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<DomesticOrderItem[]>([]);

  useEffect(() => {
    const handleCartSync = () => {
      setCartItems(getCartItems());
    };
    window.addEventListener('cardanova_cart_updated', handleCartSync);
    return () => window.removeEventListener('cardanova_cart_updated', handleCartSync);
  }, []);

  const reducedMotion = useReducedMotion();

  const navigate = useNavigate();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (window.location.hash === '#admin') {
      navigate(ADMIN_BASE_PATH);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate(ADMIN_BASE_PATH);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      window.scrollTo(0, 0);
    }, reducedMotion ? 200 : 1200);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    window.scrollTo(0, 0);
    triggerGoogleTranslateSync(350);
  }, [activeTab]);

  const handleSelectTab = (tab: string) => {
    if (tab === 'admin') {
      navigate(ADMIN_BASE_PATH);
      return;
    }
    setActiveTab(tab as any);
    window.scrollTo(0, 0);
  };

  const [isCartCheckout, setIsCartCheckout] = useState(false);
  const [selectedPricePerKg, setSelectedPricePerKg] = useState<number | undefined>(undefined);

  const handleOpenQuoteModal = (grade?: string, pricePerKg?: number, country?: string) => {
    if (grade) setSelectedGrade(grade);
    setSelectedPricePerKg(pricePerKg);
    setSelectedCountry(country || '');
    setIsCartCheckout(false);
    setIsQuoteOpen(true);
  };

  const handleOpenDomesticBulkModal = (grade?: string) => {
    handleOpenQuoteModal(grade || '8 mm+', undefined, 'India');
  };

  const handleNavigateToProducts = () => {
    handleSelectTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (item: DomesticOrderItem) => {
    addToCart(item);
    setIsCartOpen(true);
  };

  const handleBuyNow = (item: DomesticOrderItem) => {
    setCheckoutItems([item]);
    setIsUpiCheckoutOpen(true);
  };

  const handleCartCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutItems(cartItems);
    setIsCartOpen(false);
    setIsUpiCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, weight: WeightOption, delta: number) => {
    updateCartQuantity(productId, weight, delta);
  };

  const handleRemoveItem = (productId: string, weight: WeightOption) => {
    removeFromCart(productId, weight);
  };

  const handleOrderSuccess = () => {
    // Only clear the cart — do NOT close the modal here.
    // The success screen inside UpiCheckoutModal has a "Done" button
    // that calls onClose, letting the buyer read their confirmation first.
    clearCart();
  };

  const currentSEO = PAGE_SEO[activeTab as keyof typeof PAGE_SEO] ?? PAGE_SEO.home;

  return (
    <Routes>
      <Route path={`${ADMIN_BASE_PATH}/*`} element={
        <Suspense fallback={<PageLoader />}>
          <AdminPortal />
        </Suspense>
      }>
        <Route index element={
          <Suspense fallback={<PageLoader />}>
            <AdminLayout />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<PageLoader />}>
            <AdminLayout />
          </Suspense>
        } />
      </Route>
      <Route path={`${ADMIN_BASE_PATH}/login`} element={
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      } />
      <Route path={`${ADMIN_BASE_PATH}/forgot-password`} element={
        <Suspense fallback={<PageLoader />}>
          <AdminForgotPassword />
        </Suspense>
      } />
      <Route path={`${ADMIN_BASE_PATH}/reset-password`} element={
        <Suspense fallback={<PageLoader />}>
          <AdminResetPassword />
        </Suspense>
      } />

      {/* ── Convenient Aliases for /admin on Vercel ── */}
      <Route path="/admin" element={<Navigate to={`${ADMIN_BASE_PATH}`} replace />} />
      <Route path="/admin/login" element={<Navigate to={`${ADMIN_BASE_PATH}/login`} replace />} />
      <Route path="/admin/*" element={<Navigate to={`${ADMIN_BASE_PATH}`} replace />} />

      {/* ── Public Site — all other routes ── */}
      <Route path="*" element={<>
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
          setActiveTab={(tab) => handleSelectTab(tab as any)}
          onOpenQuoteModal={handleOpenQuoteModal}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
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
              <DomesticIndianSection
                onOpenQuoteModal={handleOpenQuoteModal}
                onOpenDomesticBulkModal={handleOpenDomesticBulkModal}
                onNavigateToPackets={() => handleSelectTab('packets')}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
              <WhyChooseCardanova />
              <ProductCards
                onOpenQuoteModal={handleOpenQuoteModal}
                onNavigateToProducts={handleNavigateToProducts}
                onNavigateToPackets={() => handleSelectTab('packets')}
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

          <Suspense
            fallback={
              <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#071309] text-[#FAF8F5]">
                <div className="w-10 h-10 rounded-full border-2 border-[#C5A046] border-t-transparent animate-spin" />
                <span className="text-xs font-mono tracking-wider text-stone-400">Loading Cardanova Experience...</span>
              </div>
            }
          >
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
                <ProductsPage
                  onOpenQuoteModal={handleOpenQuoteModal}
                />
              </motion.div>
            )}

            {activeTab === 'packets' && (
              <motion.div
                key="packets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DomesticStore
                  onSwitchToExport={handleNavigateToProducts}
                  onOpenDomesticBulkModal={handleOpenDomesticBulkModal}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onOpenCart={() => setIsCartOpen(true)}
                />
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
          </Suspense>
        </main>

        {/* Footer & Global Floating Elements */}
        <Footer
          setActiveTab={(tab) => handleSelectTab(tab)}
          onOpenQuoteModal={handleOpenQuoteModal}
        />
        <WhatsAppButton />

        {/* Unified B2B Wholesale & Export Trade Quote Modal */}
        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={() => {
            setIsQuoteOpen(false);
            setIsCartCheckout(false);
            setSelectedCountry('');
          }}
          defaultGrade={selectedGrade}
          defaultPricePerKg={selectedPricePerKg}
          defaultCountry={selectedCountry}
          cartItems={[]}
          onNavigateToPackets={() => handleSelectTab('packets')}
        />

        {/* Shopping Cart Drawer (Single Currency INR with direct Buy flow) */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCartCheckout}
        />

        {/* UPI Direct Checkout Modal */}
        <UpiCheckoutModal
          isOpen={isUpiCheckoutOpen}
          onClose={() => setIsUpiCheckoutOpen(false)}
          orderItems={checkoutItems}
          onOrderSuccess={handleOrderSuccess}
        />
      </motion.div>
      </>} />
    </Routes>
  );
}
