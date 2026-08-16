import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { getActiveLangCode } from '../utils/translation';

export type CurrencyCode = 'USD' | 'AED' | 'INR';

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; label: string; usdFactor: number }> = {
  USD: { symbol: '$', label: 'USD', usdFactor: 1.0 },
  AED: { symbol: 'AED ', label: 'AED', usdFactor: 3.67 },
  INR: { symbol: '₹', label: 'INR', usdFactor: 83.5 },
};

export interface CartItem {
  id: string;
  gradeName: string;
  gradeNum: string;
  gradeUnit: string;
  image: string;
  quantityKg: number;
  packaging: string;
  pricePerKg: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckoutRFQ: () => void;
}

function getItemUsdRate(pricePerKg: number): number {
  return pricePerKg > 200 ? pricePerKg / 83.5 : pricePerKg;
}

function formatItemPrice(pricePerKg: number, curr: CurrencyCode): string {
  const usdPrice = getItemUsdRate(pricePerKg);
  const cfg = CURRENCY_CONFIG[curr];
  const converted = usdPrice * cfg.usdFactor;
  return `${cfg.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
}

function formatTotalPrice(totalUsd: number, curr: CurrencyCode): string {
  const cfg = CURRENCY_CONFIG[curr];
  const converted = Math.round(totalUsd * cfg.usdFactor);
  return `Est. ${cfg.symbol}${converted.toLocaleString()} ${curr}`;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutRFQ,
}: CartDrawerProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return getActiveLangCode() === 'ar' ? 'AED' : 'USD';
  });

  const totalKg = cartItems.reduce((acc, item) => acc + item.quantityKg, 0);
  const totalUsdPrice = cartItems.reduce((acc, item) => {
    const usdPrice = getItemUsdRate(item.pricePerKg);
    return acc + item.quantityKg * usdPrice;
  }, 0);

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
            className="fixed inset-0 z-[290] bg-[#071309]/80 backdrop-blur-md"
          />

          {/* Drawer Slide-Over */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-[300] w-full sm:max-w-md bg-[#071309] border-l border-[#C5A046]/30 text-[#FAF8F5] shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#A18637]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C5A046]/40 bg-[#112D15]">
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-xl font-light text-[#FAF8F5]">Your Cart</h3>
                  <span className="label-caps text-[#C5A046]" style={{ fontSize: '0.55rem' }}>
                    {cartItems.length} {cartItems.length === 1 ? 'Grade' : 'Grades'} Selected · {totalKg} kg Total
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:text-white hover:border-[#C5A046] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Currency Switcher Bar */}
            <div className="px-6 py-2.5 bg-[#112D15]/80 border-b border-[#A18637]/20 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-light">Cart Currency Display:</span>
              <div className="flex items-center gap-1 bg-[#071309] p-1 rounded-lg border border-[#C5A046]/30">
                {(['USD', 'AED', 'INR'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                      currency === c
                        ? 'gold-gradient-bg text-[#071309] font-bold shadow-sm'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {c === 'USD' ? '$ USD' : c === 'AED' ? 'AED د.إ' : '₹ INR'}
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full border border-[#C5A046]/20 bg-[#112D15]/50 flex items-center justify-center mb-4 text-[#C5A046]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-display text-lg text-stone-300 font-light">Your cart is empty</h4>
                  <p className="text-xs text-stone-500 font-light mt-2 max-w-xs leading-relaxed">
                    Explore our green cardamom grades on the homepage or catalogue and add items to request a custom bulk quote.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const itemUsdRate = getItemUsdRate(item.pricePerKg);
                  const itemUsdTotal = item.quantityKg * itemUsdRate;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative rounded-2xl bg-[#112D15]/60 border border-[#A18637]/25 p-4 flex gap-4 items-center"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#C5A046]/30 relative">
                        <img src={item.image} alt={item.gradeName} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 rounded bg-[#071309]/90 px-1.5 py-0.5 font-display text-[10px] text-[#C5A046]">
                          {item.gradeNum}{item.gradeUnit}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-base font-light text-[#FAF8F5] truncate">
                            {item.gradeName}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-stone-500 hover:text-red-400 text-xs transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>

                        <p className="text-[11px] text-stone-400 font-light mt-0.5 truncate">
                          {item.packaging}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          {/* Quantity Buttons */}
                          <div translate="no" className="notranslate flex items-center rounded-lg border border-[#A18637]/30 bg-[#071309] p-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantityKg <= 5 ? item.quantityKg - 1 : item.quantityKg - 5))}
                              className="w-6 h-6 flex items-center justify-center text-xs text-[#C5A046] hover:bg-[#112D15] rounded transition-colors cursor-pointer active:scale-95 select-none"
                              title="Decrease quantity (min 1 kg)"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 pointer-events-none" />
                            </button>
                            <span translate="no" className="notranslate px-2 text-xs font-medium text-[#FAF8F5] select-none">
                              {item.quantityKg} kg
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantityKg + (item.quantityKg < 5 ? 1 : 5))}
                              className="w-6 h-6 flex items-center justify-center text-xs text-[#C5A046] hover:bg-[#112D15] rounded transition-colors cursor-pointer active:scale-95 select-none"
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3 pointer-events-none" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span translate="no" className="notranslate text-xs text-[#C5A046] font-medium">
                              {formatTotalPrice(itemUsdTotal, currency)}
                            </span>
                            <span translate="no" className="notranslate block text-[9px] text-stone-500">
                              ({formatItemPrice(item.pricePerKg, currency)}/kg)
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-[#A18637]/20 bg-[#071309] space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-400 font-light">
                    <span>Est. Shipment Weight:</span>
                    <span className="text-[#FAF8F5] font-medium">{totalKg} kg ({ (totalKg/1000).toFixed(2) } MT)</span>
                  </div>
                  <div className="flex justify-between text-stone-400 font-light">
                    <span>Estimated Bulk Trade Value:</span>
                    <span className="text-[#C5A046] font-medium">
                      {formatTotalPrice(totalUsdPrice, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500 text-[10px]">
                    <span>Terms & Port:</span>
                    <span>FOB / CIF Cochin Port (INCOTERMS 2020)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onCheckoutRFQ();
                  }}
                  className="w-full rounded-full gold-gradient-bg py-4 label-caps text-[#071309] font-semibold hover:brightness-110 transition-all cursor-pointer shadow-xl text-center flex items-center justify-center gap-2"
                >
                  <span>Submit Bulk Order RFQ ({cartItems.length} items)</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
