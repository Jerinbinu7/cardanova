import { motion, AnimatePresence } from 'framer-motion';

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

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutRFQ,
}: CartDrawerProps) {
  const totalKg = cartItems.reduce((acc, item) => acc + item.quantityKg, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.quantityKg * item.pricePerKg, 0);

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
            className="fixed top-0 right-0 bottom-0 z-[300] w-full max-w-md bg-[#071309] border-l border-[#C5A046]/30 text-[#FAF8F5] shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#A18637]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C5A046]/40 bg-[#112D15]">
                  <svg className="w-5 h-5 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-xl font-light text-[#FAF8F5]">Your Sourcing Cart</h3>
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

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full border border-[#C5A046]/20 bg-[#112D15]/50 flex items-center justify-center mb-4 text-[#C5A046]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h4 className="font-display text-lg text-stone-300 font-light">Your cart is empty</h4>
                  <p className="text-xs text-stone-500 font-light mt-2 max-w-xs leading-relaxed">
                    Explore our green cardamom grades on the homepage or catalogue and add items to request a custom bulk quote.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
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
                        <div className="flex items-center rounded-lg border border-[#A18637]/30 bg-[#071309] p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(5, item.quantityKg - 25))}
                            className="w-6 h-6 flex items-center justify-center text-xs text-[#C5A046] hover:bg-[#112D15] rounded transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-medium text-[#FAF8F5]">
                            {item.quantityKg} kg
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantityKg + 25)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-[#C5A046] hover:bg-[#112D15] rounded transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-[#C5A046] font-medium">
                            ~${(item.quantityKg * item.pricePerKg).toLocaleString()}
                          </span>
                          <span className="block text-[9px] text-stone-500">
                            (${(item.pricePerKg).toFixed(1)}/kg)
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
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
                    <span className="text-[#C5A046] font-medium">~${totalPrice.toLocaleString()} USD</span>
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
