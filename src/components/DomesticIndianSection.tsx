import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  ArrowRight,
  Truck,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react';
import { domesticService, UPI_CONFIG } from '../services/domesticService';
import { PackagingOption, DomesticOrderItem } from '../types/domestic';

interface DomesticIndianSectionProps {
  onOpenQuoteModal: (grade?: string, pricePerKg?: number, country?: string) => void;
  onOpenDomesticBulkModal?: (grade?: string) => void;
  onNavigateToPackets: () => void;
  onAddToCart?: (item: DomesticOrderItem) => void;
  onBuyNow?: (item: DomesticOrderItem) => void;
}

export default function DomesticIndianSection({
  onOpenQuoteModal,
  onNavigateToPackets,
  onAddToCart,
  onBuyNow,
}: DomesticIndianSectionProps) {
  const packagingOptions = domesticService.getPackagingOptions();
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const createOrderItem = (pack: PackagingOption): DomesticOrderItem => ({
    productId: pack.id,
    productName: pack.title,
    gradeBadge: pack.badge || 'Nature’s Finest',
    weight: pack.weight,
    quantity: 1,
    unitPriceInr: pack.priceInr,
    totalPriceInr: pack.priceInr,
    image: pack.image,
  });

  const handleAddToCart = (pack: PackagingOption) => {
    const item = createOrderItem(pack);
    if (onAddToCart) {
      onAddToCart(item);
      setAddedToast(`Added ${pack.title} to Cart • ₹${pack.priceInr.toLocaleString('en-IN')}`);
      setTimeout(() => setAddedToast(null), 3200);
    }
  };

  const handleBuyNow = (pack: PackagingOption) => {
    const item = createOrderItem(pack);
    if (onBuyNow) {
      onBuyNow(item);
    }
  };

  const handleOpenDomesticWholesale = () => {
    onOpenQuoteModal('8 mm+ Domestic Wholesale', undefined, 'India');
  };

  return (
    <section
      id="domestic-india"
      className="relative overflow-hidden bg-[#FBF9F5] text-[#112D15] py-16 sm:py-24 border-b border-stone-200"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[800] bg-[#112D15] text-[#FAF8F5] px-5 py-3 rounded-full shadow-2xl border border-[#C5A046]/70 flex items-center gap-3 text-xs sm:text-sm font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-[#C5A046] text-[#071309] flex items-center justify-center font-bold">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{addedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-stone-200/80">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8B712A]/30 bg-[#FFF9ED] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#8B712A] mb-3.5">
              <Sparkles className="w-3 h-3" />
              <span>Domestic Retail • 100% Single Origin Idukki</span>
            </div>

            <h2 className="font-display font-light text-[#112D15] text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight">
              <span>Nature’s Finest –</span>
              <span className="block font-serif italic text-[#8B712A] font-normal mt-1 sm:mt-1.5">
                Premium Green Cardamom
              </span>
            </h2>

            <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
              Single-origin green cardamom handpicked from Idukki, Kerala and flue-cured at origin. Offered in five specialized preservation formats with express doorstep delivery across India.
            </p>
          </div>

          {/* Minimal Key Indicators */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 font-medium shrink-0">
            <div className="flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-3.5 py-2 shadow-xs">
              <Truck className="w-4 h-4 text-[#8B712A]" />
              <span>Pan-India Delivery</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-3.5 py-2 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#8B712A]" />
              <span>Direct UPI Checkout</span>
            </div>
          </div>
        </div>

        {/* Minimal 5 Packaging Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
          {packagingOptions.map((pack, index) => {
            const discountPercent = Math.round(
              ((pack.originalPriceInr - pack.priceInr) / pack.originalPriceInr) * 100
            );

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group bg-white rounded-2xl border border-stone-200 hover:border-[#8B712A]/50 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-[#F8F5F0] overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={pack.image}
                    alt={pack.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Weight Tag */}
                  <div className="absolute top-3 right-3 bg-[#112D15] text-[#FAF8F5] text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {pack.weight}
                  </div>

                  {/* Format Tag */}
                  <div className="absolute top-3 left-3 bg-white/95 text-stone-600 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md border border-stone-200">
                    {pack.packagingType === 'Bottle' ? 'Glass Bottle' : pack.packagingType === 'Square Box' ? 'Gift Box' : 'Zipper Pouch'}
                  </div>

                  {/* Discount Tag */}
                  {discountPercent > 0 && (
                    <div className="absolute bottom-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display text-base font-semibold text-[#112D15] leading-snug">
                      {pack.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-light mt-1 line-clamp-2">
                      {pack.description}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 border-t border-stone-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-medium text-[#112D15]">
                        ₹{pack.priceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        ₹{pack.originalPriceInr.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Dual Action Buttons: Add to Cart & Buy Now */}
                    <div className="grid grid-cols-2 gap-2 mt-3.5">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(pack)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white py-2.5 text-xs font-semibold text-stone-800 hover:border-[#8B712A] hover:text-[#8B712A] transition-colors cursor-pointer"
                        title="Add to shopping cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBuyNow(pack)}
                        className="flex items-center justify-center gap-1 rounded-xl gold-gradient-bg py-2.5 text-xs font-bold uppercase tracking-wider text-[#071309] hover:brightness-105 transition-all cursor-pointer shadow-sm active:scale-98"
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

        {/* Minimal Bottom Bar */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-[#112D15]">
              Looking for Domestic Wholesale? (MOQ 50 kg)
            </h4>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Direct auction-gate bulk supply for confectioners, spice traders, and caterers across India.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenDomesticWholesale}
              className="text-xs font-semibold text-[#8B712A] hover:underline cursor-pointer"
            >
              Wholesale Rates →
            </button>
            <button
              onClick={onNavigateToPackets}
              className="inline-flex items-center gap-2 rounded-full gold-gradient-bg px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#071309] hover:brightness-105 transition-all cursor-pointer shadow-sm"
            >
              <span>Explore Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
