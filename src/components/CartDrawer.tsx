import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, X } from 'lucide-react';
import { DomesticOrderItem, WeightOption } from '../types/domestic';
import { UPI_CONFIG } from '../services/domesticService';

// Backwards-compatible alias so legacy imports do not break
export type CartItem = DomesticOrderItem;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: DomesticOrderItem[];
  onUpdateQuantity: (productId: string, weight: WeightOption, delta: number) => void;
  onRemoveItem: (productId: string, weight: WeightOption) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPriceInr, 0);
  const freeShippingThreshold = UPI_CONFIG.freeShippingAboveInr || 1000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping || subtotal === 0 ? 0 : (UPI_CONFIG.standardShippingFeeInr || 80);
  const finalTotal = subtotal + shippingFee;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[290] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Slide-Over */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-[300] w-full sm:max-w-md bg-[#FAF8F5] text-[#112D15] shadow-2xl flex flex-col justify-between border-l border-stone-200"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200/80 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F1EA] text-[#8B712A]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-normal text-[#112D15] leading-tight">
                    Shopping Cart
                  </h3>
                  <span className="text-xs text-stone-500 font-light">
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} • 100% Idukki Single Origin
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Hint */}
            <div className="px-6 py-2.5 bg-[#FFF9ED] border-b border-[#8B712A]/20 flex items-center justify-between text-xs">
              {isFreeShipping ? (
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>You've unlocked <strong>FREE Express Delivery</strong> across India!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#8B712A] font-medium">
                  <Truck className="w-4 h-4" />
                  <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE shipping</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#F4F1EA] flex items-center justify-center mb-4 text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-display text-lg text-[#112D15] font-normal">Your cart is empty</h4>
                  <p className="text-xs text-stone-500 font-light mt-1.5 max-w-xs leading-relaxed">
                    Choose from our single-origin Idukki cardamom packaging options to order with direct UPI checkout.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 rounded-full border border-stone-300 text-xs font-semibold uppercase tracking-wider text-[#112D15] hover:bg-white hover:border-[#8B712A] transition-all cursor-pointer shadow-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.weight}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative rounded-2xl bg-white border border-stone-200/80 p-3.5 sm:p-4 flex gap-3.5 items-center shadow-xs hover:border-[#8B712A]/40 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#F8F5F0] border border-stone-200/60 p-1 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display text-sm font-semibold text-[#112D15] leading-snug truncate">
                            {item.productName}
                          </h4>
                          <span className="text-[11px] text-stone-500 font-medium block">
                            Size: {item.weight}
                          </span>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.productId, item.weight)}
                          className="text-stone-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border border-stone-200 bg-[#FAF8F5] p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, item.weight, -1)}
                            className="w-7 h-7 flex items-center justify-center text-xs text-stone-600 hover:text-[#112D15] hover:bg-white rounded transition-colors cursor-pointer active:scale-95"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-[#112D15]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, item.weight, 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs text-stone-600 hover:text-[#112D15] hover:bg-white rounded transition-colors cursor-pointer active:scale-95"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#112D15]">
                            ₹{item.totalPriceInr.toLocaleString('en-IN')}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-stone-400">
                              (₹{item.unitPriceInr.toLocaleString('en-IN')} each)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {cartItems.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-stone-200 bg-white space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-500 font-light">
                    <span>Subtotal ({totalItemsCount} items):</span>
                    <span className="text-[#112D15] font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-stone-500 font-light">
                    <span>Shipping Fee:</span>
                    <span className={isFreeShipping ? 'text-emerald-700 font-semibold' : 'text-stone-700 font-medium'}>
                      {isFreeShipping ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-[#112D15]">Total Payable:</span>
                    <span className="text-xl font-bold text-[#112D15]">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Primary Buy / Checkout Button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full rounded-2xl gold-gradient-bg py-4 text-xs font-bold uppercase tracking-wider text-[#071309] hover:brightness-105 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>PROCEED TO BUY • ₹{finalTotal.toLocaleString('en-IN')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Direct UPI Payment • Fast Doorstep Delivery across India</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
