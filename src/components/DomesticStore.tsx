import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  ChevronRight,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  CreditCard,
} from 'lucide-react';
import { RetailPacketProduct, WeightOption, DomesticOrderItem } from '../types/domestic';
import { domesticService, UPI_CONFIG, getPackagingLabel } from '../services/domesticService';
import { getCartItems, addToCart } from '../services/cartService';

interface DomesticStoreProps {
  onSwitchToExport?: () => void;
  onOpenDomesticBulkModal?: (grade?: string) => void;
  onAddToCart?: (item: DomesticOrderItem) => void;
  onBuyNow?: (item: DomesticOrderItem) => void;
  onOpenCart?: () => void;
}

export default function DomesticStore({
  onSwitchToExport,
  onOpenDomesticBulkModal,
  onAddToCart,
  onBuyNow,
  onOpenCart,
}: DomesticStoreProps) {
  const [products, setProducts] = useState<RetailPacketProduct[]>(() => domesticService.getProducts());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(() => {
    return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
  });
  const [cartTotal, setCartTotal] = useState<number>(() => {
    return getCartItems().reduce((sum, item) => sum + item.totalPriceInr, 0);
  });

  useEffect(() => {
    const handleUpdate = () => {
      setProducts(domesticService.getProducts());
    };
    const handleCartSync = () => {
      const items = getCartItems();
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      setCartTotal(items.reduce((sum, item) => sum + item.totalPriceInr, 0));
    };

    window.addEventListener('cardanova_retail_products_updated', handleUpdate);
    window.addEventListener('cardanova_cart_updated', handleCartSync);
    return () => {
      window.removeEventListener('cardanova_retail_products_updated', handleUpdate);
      window.removeEventListener('cardanova_cart_updated', handleCartSync);
    };
  }, []);

  const getProductQty = (productId: string) => quantities[productId] || 1;

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const createOrderItem = (product: RetailPacketProduct): DomesticOrderItem => {
    const variant = product.variants[0];
    const qty = getProductQty(product.id);
    return {
      productId: product.id,
      productName: product.name,
      gradeBadge: product.gradeBadge || 'Estate Reserve',
      weight: variant.weight,
      quantity: qty,
      unitPriceInr: variant.priceInr,
      totalPriceInr: variant.priceInr * qty,
      image: product.image,
    };
  };

  const handleAddToCart = (product: RetailPacketProduct) => {
    const item = createOrderItem(product);
    if (onAddToCart) {
      onAddToCart(item);
    } else {
      addToCart(item);
    }
    setAddedToast(`Added ${item.quantity}x ${item.productName} to Cart • ₹${item.totalPriceInr.toLocaleString('en-IN')}`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleBuyNow = (product: RetailPacketProduct) => {
    const item = createOrderItem(product);
    if (onBuyNow) {
      onBuyNow(item);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#112D15] relative">
      {/* Toast */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[800] bg-[#112D15] text-[#FAF8F5] px-5 py-3 rounded-full shadow-2xl border border-[#C5A046]/60 flex items-center gap-2.5 text-xs sm:text-sm font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-[#C5A046] text-[#071309] flex items-center justify-center font-bold">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{addedToast}</span>
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="ml-2 px-3 py-1 bg-[#C5A046] text-[#071309] rounded-full text-xs font-bold hover:brightness-105 transition-all cursor-pointer"
              >
                View Cart
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#071309] text-[#FAF8F5] pt-32 pb-16 px-4 sm:px-6 lg:px-10 border-b border-[#C5A046]/20">
        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-[#C5A046]/40 text-[#C5A046] text-[10px] font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#E2BF63]" />
            <span>Domestic Retail Store • Express Pan-India Delivery</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-light text-[#FAF8F5] leading-tight">
            Single-Origin Green Cardamom –
            <span className="font-serif italic text-[#E2BF63] font-normal block sm:inline sm:ml-2">
              Retail Collection
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Authentic green cardamom hand-harvested from high-altitude estates in Idukki, Kerala. Flue-cured at source and sealed into five specialized preservation formats with instant UPI payment.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-300 font-light">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A046]" />
              <span>100% Pure Idukki Single Origin</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C5A046]" />
              <span>Free Delivery Above ₹{UPI_CONFIG.freeShippingAboveInr}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C5A046]" />
              <span>Direct UPI QR & VPA Payment</span>
            </div>
          </div>

          {onSwitchToExport && (
            <div className="pt-2">
              <button
                onClick={onSwitchToExport}
                className="text-xs text-[#C5A046] hover:text-[#E2BF63] underline underline-offset-4 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Looking for International Bulk Export (MOQ 100 kg, FOB/CIF)? Click here</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {/* Section Header */}
        <div className="mb-8 pb-4 border-b border-stone-200">
          <span className="text-[10px] font-semibold text-[#8B712A] uppercase tracking-wider block mb-0.5">
            Available Formats
          </span>
          <h2 className="font-display text-2xl font-light text-[#112D15]">
            Packaging Options & Quantities
          </h2>
        </div>

        {/* Responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
          {products.map((product) => {
              const currentVariant = product.variants[0];
              const qty = getProductQty(product.id);
              const discountPercent = Math.round(
                ((currentVariant.originalPriceInr - currentVariant.priceInr) /
                  currentVariant.originalPriceInr) *
                  100
              );

              const formatLabel = getPackagingLabel(product, currentVariant);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-2xl border border-stone-200/90 hover:border-[#C5A046] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(17,45,21,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
                >
                  {/* Image Frame */}
                  <div className="relative aspect-square bg-gradient-to-b from-[#FAF8F5] to-[#F3EFE8] overflow-hidden flex items-center justify-center p-5 border-b border-stone-100 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Weight Badge */}
                    <div className="absolute top-3 right-3 bg-[#112D15] text-[#FAF8F5] text-[11px] font-bold tracking-wide px-3 py-1 rounded-full shadow-sm border border-[#C5A046]/30 font-sans">
                      {currentVariant.weight}
                    </div>

                    {/* Packaging Format Tag */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-stone-700 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border border-stone-200/80 shadow-xs font-sans">
                      {formatLabel}
                    </div>

                    {/* Discount */}
                    {discountPercent > 0 && (
                      <div className="absolute bottom-3 left-3 bg-emerald-800 text-emerald-50 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs border border-emerald-700/50 font-sans">
                        {discountPercent}% OFF
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-sans text-[15px] sm:text-[15.5px] font-semibold text-stone-900 leading-snug tracking-tight group-hover:text-[#112D15] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[12.5px] sm:text-xs text-stone-600 font-normal leading-relaxed mt-2 text-justify hyphens-auto">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Quantity */}
                    <div className="mt-4 pt-3 border-t border-stone-100 space-y-3">
                      {/* Price row */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans text-xl font-bold text-[#112D15] tracking-tight">
                          ₹{currentVariant.priceInr.toLocaleString('en-IN')}
                        </span>
                        <span className="font-sans text-xs text-stone-400 line-through">
                          ₹{currentVariant.originalPriceInr.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Quantity Counter row */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider font-sans">Quantity</span>
                        <div className="flex items-center rounded-lg border border-stone-200/90 bg-[#FAF8F5] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-[#112D15] hover:bg-white rounded-md transition-all cursor-pointer active:scale-95"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-sans text-xs font-semibold text-[#112D15]">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-[#112D15] hover:bg-white rounded-md transition-all cursor-pointer active:scale-95"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 py-2.5 text-xs font-semibold font-sans text-stone-800 hover:border-[#8B712A] hover:text-[#8B712A] transition-all cursor-pointer active:scale-[0.98]"
                          title="Add to shopping cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Cart</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBuyNow(product)}
                          className="flex items-center justify-center gap-1 rounded-xl gold-gradient-bg py-2.5 text-xs font-bold font-sans uppercase tracking-wider text-[#071309] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                          title="Buy immediately with UPI"
                        >
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Domestic Bulk Inquiry Banner */}
        <div className="mt-12 sm:mt-16 p-6 rounded-2xl bg-white border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-display text-lg font-semibold text-[#112D15]">
              Commercial Wholesale for Indian Buyers (MOQ 50 kg)
            </h4>
            <p className="text-xs text-stone-500 font-light mt-1">
              Direct estate supply for sweet makers, caterers, ayurvedic pharmacies, and spice traders across India.
            </p>
          </div>

          {onOpenDomesticBulkModal && (
            <button
              onClick={() => onOpenDomesticBulkModal('8 mm+ Domestic Wholesale')}
              className="rounded-full gold-gradient-bg px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071309] hover:brightness-105 transition-all cursor-pointer shadow-sm shrink-0"
            >
              Request Wholesale Rates →
            </button>
          )}
        </div>
      </section>

      {/* Floating Sticky Cart Button (Stacked safely above WhatsApp button) */}
      {cartCount > 0 && onOpenCart && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-24 right-4 sm:right-6 z-[600]"
        >
          <button
            onClick={onOpenCart}
            className="flex items-center gap-3 bg-[#112D15] text-[#FAF8F5] pl-4 pr-5 py-3 rounded-full shadow-2xl border border-[#C5A046]/70 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#C5A046] text-[#071309] flex items-center justify-center font-bold text-xs">
              {cartCount}
            </div>
            <div className="text-left">
              <div className="text-[10px] text-[#C5A046] uppercase tracking-wider font-semibold">
                Shopping Cart
              </div>
              <div className="text-xs font-bold">
                ₹{cartTotal.toLocaleString('en-IN')} • View
              </div>
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}
