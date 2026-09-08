import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  ChevronRight,
  Info,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { RetailPacketProduct, WeightOption, DomesticOrderItem } from '../types/domestic';
import { DEFAULT_RETAIL_PRODUCTS, UPI_CONFIG } from '../services/domesticService';
import UpiCheckoutModal from './UpiCheckoutModal';

interface DomesticStoreProps {
  onSwitchToExport?: () => void;
}

export default function DomesticStore({ onSwitchToExport }: DomesticStoreProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, WeightOption>>({
    'cnd-pouch-85mm': '100g',
    'cnd-pouch-80mm': '100g',
    'cnd-pouch-75mm': '250g',
    'cnd-pouch-70mm': '250g',
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({
    'cnd-pouch-85mm': 1,
    'cnd-pouch-80mm': 1,
    'cnd-pouch-75mm': 1,
    'cnd-pouch-70mm': 1,
  });

  const [activeModalProduct, setActiveModalProduct] = useState<RetailPacketProduct | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<DomesticOrderItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Shopping Cart state
  const [cartItems, setCartItems] = useState<DomesticOrderItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const handleVariantChange = (productId: string, weight: WeightOption) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: weight }));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const showToast = (message: string) => {
    setAddedToast(message);
    setTimeout(() => {
      setAddedToast(null);
    }, 2800);
  };

  const handleAddToCart = (product: RetailPacketProduct) => {
    const selectedWeight = selectedVariants[product.id] || '100g';
    const variant = product.variants.find((v) => v.weight === selectedWeight) || product.variants[0];
    const qty = quantities[product.id] || 1;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.weight === variant.weight
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPriceInr: updated[existingIdx].unitPriceInr * newQty,
        };
        return updated;
      }

      const newItem: DomesticOrderItem = {
        productId: product.id,
        productName: product.name,
        gradeBadge: product.gradeBadge,
        weight: variant.weight,
        quantity: qty,
        unitPriceInr: variant.priceInr,
        totalPriceInr: variant.priceInr * qty,
        image: product.image,
      };

      return [...prev, newItem];
    });

    showToast(`Added ${qty}x ${product.name} (${variant.weight}) to Cart!`);
  };

  const handleUpdateCartQuantity = (productId: string, weight: WeightOption, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.weight === weight) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPriceInr: item.unitPriceInr * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as DomesticOrderItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, weight: WeightOption) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.weight === weight))
    );
  };

  const handleQuickBuy = (product: RetailPacketProduct) => {
    const selectedWeight = selectedVariants[product.id] || '100g';
    const variant = product.variants.find((v) => v.weight === selectedWeight) || product.variants[0];
    const qty = quantities[product.id] || 1;

    const item: DomesticOrderItem = {
      productId: product.id,
      productName: product.name,
      gradeBadge: product.gradeBadge,
      weight: variant.weight,
      quantity: qty,
      unitPriceInr: variant.priceInr,
      totalPriceInr: variant.priceInr * qty,
      image: product.image,
    };

    setCheckoutItems([item]);
    setIsCheckoutOpen(true);
  };

  const handleCartCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutItems(cartItems);
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.totalPriceInr, 0);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#112D15] relative">
      {/* ── Global Notification Toast ── */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[700] bg-[#112D15] text-[#FAF8F5] px-5 py-3 rounded-full shadow-2xl border border-[#C5A046]/60 flex items-center gap-2.5 text-xs sm:text-sm font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-[#C5A046] text-[#112D15] flex items-center justify-center font-bold">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{addedToast}</span>
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="ml-2 px-2.5 py-1 bg-[#C5A046] text-[#112D15] rounded-full text-xs font-semibold hover:bg-[#E2BF63] transition-colors cursor-pointer"
            >
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Hero / Context Header ── */}
      <section className="relative overflow-hidden bg-[#112D15] text-[#FAF8F5] pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#C5A046]/30">
        {/* Subtle background decorative glow */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(197,160,70,0.8) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#C5A046]/40 text-[#C5A046] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Consumer Store • Pan-India Delivery</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#FAF8F5] leading-tight">
            Single-Origin <span className="italic text-[#E2BF63]">Idukki Cardamom</span> Packets
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base font-light">
            Enjoy the authentic flavor and royal aroma of whole green cardamom directly from our high-altitude estates in Kerala. Packed in freshness-preserving zipper pouches and delivered to your doorstep.
          </p>

          {/* Quick Perks Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-stone-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A046]" />
              <span>100% Pure GI-Tagged Alleppey Green</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C5A046]" />
              <span>Free Shipping on Orders Above ₹{UPI_CONFIG.freeShippingAboveInr}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C5A046]" />
              <span>Instant 1-Tap UPI Payment (GPay, PhonePe, Paytm)</span>
            </div>
          </div>

          {/* Switch to B2B banner button */}
          {onSwitchToExport && (
            <div className="pt-2">
              <button
                onClick={onSwitchToExport}
                className="text-xs text-[#C5A046] hover:text-[#E2BF63] underline underline-offset-4 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Looking for Commercial Bulk B2B Export (500 kg+ FOB/CIF)? Click here</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Product Catalog Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {DEFAULT_RETAIL_PRODUCTS.map((product) => {
            const selectedWeight = selectedVariants[product.id] || '100g';
            const currentVariant =
              product.variants.find((v) => v.weight === selectedWeight) || product.variants[0];
            const qty = quantities[product.id] || 1;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="group relative bg-white rounded-2xl border border-stone-200 hover:border-[#C5A046]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Grade Pod Diameter Badge */}
                <div className="absolute top-3 right-3 z-10 bg-[#FAF8F5]/90 backdrop-blur-md text-[#112D15] text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md shadow-sm border border-stone-300">
                  {product.podDiameter}
                </div>

                {/* Top Image Section */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setActiveModalProduct(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Product Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Grade Title */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-[#8B712A] uppercase tracking-wider">
                        {product.gradeBadge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg text-[#112D15] font-semibold leading-snug mt-1 group-hover:text-[#8B712A] transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Weight Selector Buttons */}
                  <div>
                    <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                      Select Net Weight:
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {product.variants.map((v) => {
                        const isSelected = v.weight === selectedWeight;
                        return (
                          <button
                            key={v.weight}
                            type="button"
                            onClick={() => handleVariantChange(product.id, v.weight)}
                            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#112D15] text-[#FAF8F5] shadow-sm'
                                : 'bg-[#F3EFEA] text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {v.weight}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing Bar */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-display font-semibold text-[#112D15]">
                          ₹{(currentVariant.priceInr * qty).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          ₹{(currentVariant.originalPriceInr * qty).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        className="p-1 text-stone-600 hover:text-black rounded hover:bg-stone-100 transition-colors cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold font-mono text-[#112D15]">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        className="p-1 text-stone-600 hover:text-black rounded hover:bg-stone-100 transition-colors cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickBuy(product)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] text-xs font-medium flex items-center justify-center gap-2 shadow transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <span>Buy Now • ₹{(currentVariant.priceInr * qty).toLocaleString('en-IN')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-stone-300 hover:border-[#C5A046] text-[#112D15] hover:bg-stone-50 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-[#C5A046]" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalProduct(product)}
                      className="w-full py-2 px-3 text-[11px] font-medium text-stone-600 hover:text-[#112D15] hover:bg-stone-100 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-[#C5A046]" />
                      <span>View Specifications & Origin</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Floating Sticky Cart Button (when items are in cart) ── */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[500]"
          >
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="px-5 py-3.5 rounded-full bg-[#112D15] text-[#FAF8F5] border-2 border-[#C5A046] shadow-2xl flex items-center gap-3 hover:bg-[#1A3E1F] transition-all cursor-pointer group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#C5A046]" />
                <span className="absolute -top-2 -right-2 bg-[#C5A046] text-[#112D15] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block text-[#FAF8F5]">
                  Cart ({totalCartCount}) • ₹{totalCartPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#C5A046] block font-medium">
                  {totalCartPrice >= UPI_CONFIG.freeShippingAboveInr
                    ? 'Free Shipping'
                    : `Add ₹${(UPI_CONFIG.freeShippingAboveInr - totalCartPrice).toLocaleString('en-IN')} for Free Delivery`}
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Domestic Store Cart Drawer ── */}
      <AnimatePresence>
        {isCartDrawerOpen && (
          <div className="fixed inset-0 z-[650] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col z-10 text-[#112D15]"
            >
              {/* Drawer Header */}
              <div className="bg-[#112D15] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#C5A046]/30">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-5 h-5 text-[#C5A046]" />
                  <h3 className="font-display text-lg text-[#FAF8F5]">Your Shopping Cart</h3>
                  <span className="text-xs bg-[#C5A046] text-[#112D15] px-2 py-0.5 rounded-full font-bold">
                    {totalCartCount}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-1.5 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free shipping progress indicator */}
              <div className="bg-[#F3EFEA] px-5 py-2.5 border-b border-stone-200 text-xs flex items-center justify-between">
                <span className="text-stone-600">
                  {totalCartPrice >= UPI_CONFIG.freeShippingAboveInr ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Eligible for FREE Express Shipping!
                    </span>
                  ) : (
                    <span>
                      Add <strong>₹{(UPI_CONFIG.freeShippingAboveInr - totalCartPrice).toLocaleString('en-IN')}</strong> more for Free Shipping
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  Min ₹{UPI_CONFIG.freeShippingAboveInr}
                </span>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                    <ShoppingCart className="w-12 h-12 text-stone-300 mb-3" />
                    <p className="font-medium text-sm text-[#112D15]">Your cart is empty</p>
                    <p className="text-xs text-stone-500 mt-1">Select your favorite cardamom packets to add them here.</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.weight}`}
                      className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-sm flex items-center gap-3.5"
                    >
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-medium text-xs text-[#112D15] truncate">
                            {item.productName}
                          </h4>
                          <button
                            onClick={() => handleRemoveFromCart(item.productId, item.weight)}
                            className="text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#8B712A] border border-stone-200">
                            {item.weight}
                          </span>
                          <span className="text-xs font-semibold text-[#112D15]">
                            ₹{item.totalPriceInr.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            (₹{item.unitPriceInr} each)
                          </span>
                        </div>

                        {/* Quantity adjust */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-stone-200 rounded-md bg-[#FAF8F5]">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, item.weight, -1)}
                              className="px-2 py-0.5 text-stone-600 hover:text-black transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold font-mono text-[#112D15]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, item.weight, 1)}
                              className="px-2 py-0.5 text-stone-600 hover:text-black transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="p-5 bg-white border-t border-stone-200 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal ({totalCartCount} items):</span>
                      <span className="font-semibold text-[#112D15]">
                        ₹{totalCartPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Shipping:</span>
                      <span className="font-semibold text-emerald-700">
                        {totalCartPrice >= UPI_CONFIG.freeShippingAboveInr
                          ? 'FREE'
                          : `₹${UPI_CONFIG.standardShippingFeeInr}`}
                      </span>
                    </div>
                    <div className="border-t border-stone-200 pt-2 flex justify-between font-display text-base text-[#112D15]">
                      <span>Estimated Total:</span>
                      <span className="font-bold">
                        ₹
                        {(
                          totalCartPrice +
                          (totalCartPrice >= UPI_CONFIG.freeShippingAboveInr
                            ? 0
                            : UPI_CONFIG.standardShippingFeeInr)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCartCheckout}
                    className="w-full py-3 px-4 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout • ₹{(
                      totalCartPrice +
                      (totalCartPrice >= UPI_CONFIG.freeShippingAboveInr
                        ? 0
                        : UPI_CONFIG.standardShippingFeeInr)
                    ).toLocaleString('en-IN')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="w-full py-1.5 text-center text-[11px] text-stone-500 hover:text-[#112D15] transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Product Details Modal ── */}
      <AnimatePresence>
        {activeModalProduct && (
          <div
            className="fixed inset-0 z-[600] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(7, 19, 9, 0.85)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#C5A046]/30 overflow-hidden"
            >
              <div className="bg-[#112D15] text-[#FAF8F5] px-6 py-4 flex items-center justify-between border-b border-[#C5A046]/20">
                <div>
                  <span className="label-caps text-[#C5A046] text-[0.6rem] tracking-[0.2em] block">
                    Product Specification Sheet
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl text-[#FAF8F5]">
                    {activeModalProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalProduct(null)}
                  className="p-1.5 text-[#C5A046] hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
                <div className="space-y-4">
                  <img
                    src={activeModalProduct.image}
                    alt={activeModalProduct.name}
                    className="w-full aspect-[4/3] object-cover rounded-xl border border-stone-200 shadow-sm"
                  />
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {activeModalProduct.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-stone-200 divide-y divide-stone-100 text-xs">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Origin:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.origin}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Speciality:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.speciality}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Pod Grade:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.grade}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Essential Oil:</span>
                      <span className="font-medium text-emerald-800 text-right">{activeModalProduct.specs.essentialOil}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Moisture Content:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.moisture}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Packaging:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.packaging}</span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-stone-500">Shelf Life:</span>
                      <span className="font-medium text-[#112D15] text-right">{activeModalProduct.specs.shelfLife}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const prod = activeModalProduct;
                        setActiveModalProduct(null);
                        handleQuickBuy(prod);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 shadow cursor-pointer"
                    >
                      <span>Proceed to Order Packets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const prod = activeModalProduct;
                        handleAddToCart(prod);
                        setActiveModalProduct(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-stone-300 hover:border-[#C5A046] text-[#112D15] text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#C5A046]" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Direct UPI Checkout Modal ── */}
      <UpiCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderItems={checkoutItems}
      />
    </div>
  );
}

