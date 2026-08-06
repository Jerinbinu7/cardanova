import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitQuoteRequest } from '../services/quoteService';
import { getAuctionPrice, type AuctionRecord } from '../services/auctionPriceService';
import { validateEmail } from '../utils/emailValidator';
import type { CartItem } from './CartDrawer';

export type CurrencyCode = 'USD' | 'AED' | 'INR';

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; label: string; toInrFactor: number }> = {
  USD: { symbol: '$', label: 'USD ($)', toInrFactor: 83.5 },
  AED: { symbol: 'AED ', label: 'AED (د.إ)', toInrFactor: 22.75 },
  INR: { symbol: '₹', label: 'INR (₹)', toInrFactor: 1.0 },
};

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  cartItems?: CartItem[];
  onSuccess?: () => void;
}

function getGradeMultiplier(gradeName: string): number {
  const g = gradeName.toLowerCase();
  if (g.includes('8.5') || g.includes('extra bold')) return 1.15;
  if (g.includes('8') || g.includes('premium')) return 1.05;
  if (g.includes('7.5') || g.includes('export')) return 0.95;
  if (g.includes('7') || g.includes('commercial')) return 0.85;
  if (g.includes('mix')) return 0.75;
  if (g.includes('rej') || g.includes('oil')) return 0.50;
  return 1.0;
}

function parseQuantityKg(qtyStr: string): number {
  const num = parseFloat(qtyStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) return 1000;
  if (qtyStr.toLowerCase().includes('mt') || qtyStr.toLowerCase().includes('ton')) {
    return num * 1000;
  }
  return num;
}

function formatCurrencyVal(amountInr: number, curr: CurrencyCode): string {
  const cfg = CURRENCY_CONFIG[curr];
  const converted = Math.round(amountInr / cfg.toInrFactor);
  return `${cfg.symbol}${converted.toLocaleString()}`;
}

export default function QuoteModal({
  isOpen,
  onClose,
  defaultGrade = '8.5 mm Extra Bold',
  cartItems = [],
  onSuccess,
}: QuoteModalProps) {
  const isBulkCart = cartItems.length > 0;
  const totalCartKg = cartItems.reduce((sum, item) => sum + item.quantityKg, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.quantityKg * item.pricePerKg, 0);

  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    country: '',
    destinationPort: '',
    grade: defaultGrade,
    quantity: '1 MT',
    packaging: 'Vacuum Pack (5kg / 10kg)',
    message: '',
  });

  const [emailError, setEmailError]           = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [submitted, setSubmitted]             = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [submitError, setSubmitError]         = useState<string | null>(null);

  // Spices Board India Auction price benchmark state
  const [auctionData, setAuctionData] = useState<AuctionRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      getAuctionPrice('small_cardamom')
        .then((res) => {
          setAuctionData(res.data);
        })
        .catch((err) => console.error('Failed to fetch auction benchmark:', err));

      if (isBulkCart) {
        const productSummary = cartItems
          .map((i) => `${i.gradeName} (${i.quantityKg}kg)`)
          .join(', ');
        setFormData((prev) => ({
          ...prev,
          grade: `Bulk Cart Order: ${productSummary}`,
          quantity: `${totalCartKg} kg (${(totalCartKg / 1000).toFixed(2)} MT)`,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          grade: defaultGrade,
          quantity: '1 MT',
        }));
      }
    }
  }, [isOpen, defaultGrade, isBulkCart, cartItems, totalCartKg]);

  const handleEmailChange = (val: string) => {
    setFormData((prev) => ({ ...prev, email: val }));
    if (!val) {
      setEmailError(null);
      setEmailSuggestion(null);
      return;
    }
    const res = validateEmail(val);
    if (!res.isValid) {
      setEmailError(res.error ?? 'Invalid email');
      setEmailSuggestion(null);
    } else {
      setEmailError(null);
      setEmailSuggestion(res.suggestion ?? null);
    }
  };

  // Indian Spice Market Auction calculations
  const rawAvgInr = auctionData ? parseFloat(auctionData.avgPrice.replace(/,/g, '')) || 3049 : 3049;
  const rawMaxInr = auctionData ? parseFloat(auctionData.maxPrice.replace(/,/g, '')) || 4243 : 4243;
  
  const parsedQtyKg = isBulkCart ? totalCartKg : parseQuantityKg(formData.quantity);
  const multiplier = isBulkCart ? 1.0 : getGradeMultiplier(formData.grade);
  const estRateInrPerKg = Math.round(rawAvgInr * multiplier);

  const estimatedTradeInr = Math.round(estRateInrPerKg * parsedQtyKg);

  const activeCfg = CURRENCY_CONFIG[currency];
  const rateInActiveCurrency = (rawAvgInr / activeCfg.toInrFactor).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid) {
      setEmailError(emailRes.error ?? 'Invalid email');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    let finalMessage = formData.message.trim();

    // Attach Spices Board India market price benchmark with selected currency
    const marketBenchmarkBlock = `--- SPICES BOARD INDIA MARKET BENCHMARK ---
• Preferred Trade Currency: ${currency}
• Daily Auction Date: ${auctionData?.date || 'Latest Available'}
• Official Auctioneer: ${auctionData?.auctioneer || 'Spices Board India'}
• Daily Avg Market Rate: ₹${rawAvgInr.toLocaleString('en-IN')}/kg (${activeCfg.symbol}${rateInActiveCurrency}/kg)
• Peak Max Auction Rate: ₹${rawMaxInr.toLocaleString('en-IN')}/kg
• Est. Market Sourcing Value (${parsedQtyKg} kg): ${formatCurrencyVal(estimatedTradeInr, currency)} (₹${estimatedTradeInr.toLocaleString('en-IN')} INR / ${formatCurrencyVal(estimatedTradeInr, 'USD')} USD / ${formatCurrencyVal(estimatedTradeInr, 'AED')} AED FOB)`;

    if (isBulkCart) {
      const breakdownLines = cartItems.map(
        (i) => `• ${i.gradeName} (${i.gradeNum}${i.gradeUnit}): ${i.quantityKg}kg @ ~${formatCurrencyVal(i.pricePerKg * 83.5, currency)}/kg (${i.packaging})`
      );
      const cartHeader = `--- BULK CART ORDER BREAKDOWN (${cartItems.length} ITEMS) ---\n${breakdownLines.join(
        '\n'
      )}\nEst. Catalogue Value: ~$${totalCartPrice.toLocaleString()} USD | Total Weight: ${totalCartKg} kg`;

      finalMessage = `${cartHeader}\n\n${marketBenchmarkBlock}${
        finalMessage ? `\n\nAdditional Requirements:\n${finalMessage}` : ''
      }`;
    } else {
      finalMessage = `${marketBenchmarkBlock}${
        finalMessage ? `\n\nAdditional Requirements:\n${finalMessage}` : ''
      }`;
    }

    if (formData.destinationPort) {
      finalMessage += `\nDestination Port: ${formData.destinationPort}`;
    }
    if (formData.packaging) {
      finalMessage += `\nPackaging Preference: ${formData.packaging}`;
    }

    try {
      await submitQuoteRequest({
        full_name: formData.fullName,
        company_name: formData.companyName,
        country: formData.country,
        email: formData.email,
        phone: formData.phone,
        selected_products: formData.grade,
        quantity_kg: formData.quantity,
        message: finalMessage,
      });

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2800);
    } catch (err: any) {
      console.error('Failed to submit quote:', err);
      setSubmitError(err.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#071309]/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 0 }}
          className="relative w-full max-w-2xl rounded-2xl border border-[#A18637]/30 bg-[#112D15] p-6 sm:p-8 text-[#FAF8F5] shadow-2xl z-10 my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-[#C5A046] transition-colors text-2xl font-light"
            aria-label="Close modal"
          >
            ✕
          </button>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A18637]/20 border border-[#C5A046] text-[#C5A046] text-3xl">
                ✓
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5]">Inquiry Received</h3>
              <p className="mt-2 text-stone-300 text-sm max-w-md mx-auto">
                Thank you for your interest in Cardanova Spices. Our international export team will review your specifications and market benchmark rate to contact you with a formal CIF/FOB quote in {currency} within 24 hours.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#C5A046]">
                    International B2B Export Quote
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF8F5] mt-1">
                    Request a Formal Trade Quote
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Direct export from Idukki, Kerala. Live Spices Board India auction rates.
                  </p>
                </div>

                {/* Currency Selection Toggle */}
                <div className="flex items-center gap-1 bg-[#071309] p-1.5 rounded-xl border border-[#C5A046]/40 shrink-0">
                  <span className="text-[10px] text-stone-400 px-2 uppercase tracking-wider font-semibold">Currency:</span>
                  {(['USD', 'AED', 'INR'] as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currency === c
                          ? 'gold-gradient-bg text-[#071309] shadow-md font-bold'
                          : 'text-stone-300 hover:text-white hover:bg-[#112D15]'
                      }`}
                    >
                      {c === 'USD' ? '$ USD' : c === 'AED' ? 'AED د.إ' : '₹ INR'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spices Board India Market Benchmark Card */}
              {auctionData && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#071309] border border-[#C5A046]/40 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-[#C5A046] uppercase tracking-wider text-[10px] block">
                          Spices Board India Market Benchmark ({auctionData.date})
                        </span>
                        <span className="text-stone-300 font-light text-[11px]">
                          Daily Avg: <strong className="text-white font-medium">₹{auctionData.avgPrice}/kg</strong> ({activeCfg.symbol}{rateInActiveCurrency}/kg) · Max: ₹{auctionData.maxPrice}/kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {estimatedTradeInr > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                      <span className="text-[11px] text-stone-400">Est. Sourcing Benchmark ({parsedQtyKg} kg):</span>
                      <span className="font-mono text-sm font-semibold text-[#C5A046]">
                        {formatCurrencyVal(estimatedTradeInr, currency)}
                        <span className="text-[10px] text-stone-400 ml-1.5 font-sans font-normal font-mono">
                          ({formatCurrencyVal(estimatedTradeInr, currency === 'USD' ? 'AED' : currency === 'AED' ? 'USD' : 'USD')})
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Bulk Cart Preview Banner */}
              {isBulkCart && (
                <div className="mb-5 p-4 rounded-xl bg-[#071309] border border-[#C5A046]/40 shadow-inner">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#A18637]/25">
                    <span className="text-xs font-semibold text-[#C5A046] uppercase tracking-wider flex items-center gap-2">
                      🛒 Bulk Cart Summary ({cartItems.length} {cartItems.length === 1 ? 'grade' : 'grades'})
                    </span>
                    <span className="text-xs font-mono text-stone-300">
                      Total Weight: <strong className="text-[#C5A046]">{totalCartKg} kg</strong>
                    </span>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs text-stone-300 bg-[#112D15]/60 p-2 rounded-lg border border-stone-800">
                        <div className="truncate max-w-[70%]">
                          <span className="font-medium text-white">{item.gradeName}</span>
                          <span className="text-[10px] text-stone-400 block">{item.packaging}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-[#C5A046] font-semibold">{item.quantityKg} kg</span>
                          <span className="text-[10px] text-stone-400 block">
                            ~{formatCurrencyVal(item.quantityKg * item.pricePerKg * 83.5, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alexander Wright"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Global Foods Trading Ltd."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="trade@company.com"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full rounded-lg border bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:outline-none ${
                        emailError ? 'border-red-500/80 focus:border-red-500' : 'border-[#A18637]/30 focus:border-[#C5A046]'
                      }`}
                    />
                    {emailError && (
                      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                        ⚠️ {emailError}
                      </p>
                    )}
                    {emailSuggestion && (
                      <button
                        type="button"
                        onClick={() => handleEmailChange(emailSuggestion)}
                        className="text-[11px] text-[#C5A046] mt-1 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        💡 Did you mean <span className="font-semibold">{emailSuggestion}</span>?
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Destination Country *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UAE, Saudi Arabia, Germany, USA"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Port of Discharge</label>
                    <input
                      type="text"
                      placeholder="e.g. Jebel Ali (Dubai), Rotterdam, New York"
                      value={formData.destinationPort}
                      onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-300 mb-1">Cardamom Grades / Products</label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Total Quantity</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 MT"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Additional Specifications / Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="Provide any target price, sample requests, or specific quality criteria..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-xs text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                  />
                </div>

                {submitError && (
                  <p className="text-xs text-red-400 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-center font-medium">
                    ⚠️ {submitError}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl gold-gradient-bg py-3 px-6 text-sm font-semibold text-[#112D15] shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-[#112D15] border-t-transparent animate-spin" />
                        <span>Submitting Official Quote Request...</span>
                      </>
                    ) : (
                      <span>
                        Submit Official Quote Request in {currency} {isBulkCart && `(${cartItems.length} items)`}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
