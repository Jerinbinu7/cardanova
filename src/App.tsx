import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from './hooks/useReducedMotion';
import CustomCursor from './components/CustomCursor';
import Header from './components/Header';
import HeroSlideshow from './components/HeroSlideshow';
import WhyChooseCardanova from './components/WhyChooseCardanova';
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
import AdminPortal from './admin/AdminPortal';

function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#071309]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
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
        {/* Icon */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#C5A046]/40 animate-gentle-pulse" />
          <div className="absolute inset-2 rounded-full border border-[#C5A046]/20" />
          <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 12px rgba(197,160,70,0.5))' }}>🌿</span>
        </div>

        {/* Wordmark */}
        <div>
          <h2 className="font-display font-light tracking-[0.22em] text-[#FAF8F5] uppercase"
            style={{ fontSize: '1.6rem', letterSpacing: '0.22em' }}>
            Cardanova
          </h2>
          <p className="label-caps text-[#C5A046] mt-1" style={{ fontSize: '0.55rem' }}>
            Spices LLP · Kerala, India
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-40 h-[1px] overflow-hidden" style={{ background: 'rgba(197,160,70,0.2)' }}>
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

  useEffect(() => {
    // Check initial hash for #admin or /admin
    if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
      setActiveTab('admin');
    }

    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setActiveTab('admin');
      } else if (activeTab === 'admin' && window.location.hash !== '#admin') {
        setActiveTab('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(
      () => setLoading(false),
      reducedMotion ? 200 : 1200
    );
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const handleSelectTab = (tab: 'home' | 'about' | 'products' | 'origin' | 'admin') => {
    if (tab === 'admin') {
      window.location.hash = 'admin';
    } else if (window.location.hash === '#admin') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    setActiveTab(tab);
  };

  const handleReturnToSite = () => {
    if (window.location.hash === '#admin') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    setActiveTab('home');
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

  if (activeTab === 'admin') {
    return <AdminPortal onReturnToSite={handleReturnToSite} />;
  }

  return (
    <>
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
          activeTab={activeTab}
          setActiveTab={(tab) => handleSelectTab(tab as 'home' | 'about' | 'products' | 'origin' | 'admin')}
          onOpenQuoteModal={handleOpenQuoteModal}
          cartCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Dynamic Page Routing View */}
        <main>
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
    </>
  );
}
