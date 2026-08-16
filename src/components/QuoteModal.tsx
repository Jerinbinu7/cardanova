import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitQuoteRequest } from '../services/quoteService';
import { getAuctionPrice, type AuctionRecord } from '../services/auctionPriceService';
import { validateEmail } from '../utils/emailValidator';
import { getActiveLangCode } from '../utils/translation';
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
  defaultPricePerKg?: number;
  cartItems?: CartItem[];
  onSuccess?: () => void;
}

function getGradeMultiplier(gradeName: string): number {
  const g = gradeName.toLowerCase();
  if (g.includes('8.5') || g.includes('extra bold') || g.includes('ageb')) return 1.15;
  if (g.includes('8.0') || g.includes('8 mm') || g.includes('8mm') || g.includes('bold') || g.includes('agb')) return 1.05;
  if (g.includes('7.5') || g.includes('export')) return 0.95;
  if (g.includes('7.0') || g.includes('7 mm') || g.includes('7mm') || g.includes('commercial')) return 0.85;
  if (g.includes('mix')) return 0.75;
  if (g.includes('rej') || g.includes('oil') || g.includes('split')) return 0.50;
  return 1.0;
}

function parseQuantityKg(qtyStr: string): { kg: number; formatted: string } {
  if (!qtyStr || !qtyStr.trim()) return { kg: 1000, formatted: '1,000 kg (1 MT)' };

  const cleanStr = qtyStr.toLowerCase().replace(/,/g, '');
  const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));

  if (isNaN(num) || num <= 0) {
    return { kg: 1000, formatted: '1,000 kg (1 MT)' };
  }

  let kg = num;
  if (cleanStr.includes('mt') || cleanStr.includes('ton')) {
    kg = num * 1000;
  } else if (cleanStr.includes('g') && !cleanStr.includes('kg')) {
    kg = num / 1000;
  } else if (!cleanStr.includes('kg') && num <= 20) {
    // If user enters a small number like 1, 2, 5 without unit, treat as MT for B2B export
    kg = num * 1000;
  }

  const mt = kg / 1000;
  const formatted = mt >= 1
    ? `${Math.round(kg).toLocaleString('en-US')} kg (${mt % 1 === 0 ? mt : mt.toFixed(2)} MT)`
    : `${Math.round(kg).toLocaleString('en-US')} kg`;

  return { kg, formatted };
}

function formatCurrencyVal(amountInr: number, curr: CurrencyCode): string {
  const cfg = CURRENCY_CONFIG[curr];
  const converted = Math.round(amountInr / cfg.toInrFactor);
  return `${cfg.symbol}${converted.toLocaleString()}`;
}

export const EXPORT_GRADES_LIST = [
  { label: '8.5 mm Extra Bold Green (AGEB)', shortLabel: '8.5mm Extra Bold' },
  { label: '8.0 mm Premium Bold Green (AGB)', shortLabel: '8.0mm Premium Bold' },
  { label: '7.5 mm Export Standard Green (AGS)', shortLabel: '7.5mm Export Grade' },
  { label: '7.0 mm Commercial Green (AGS-1)', shortLabel: '7.0mm Commercial' },
  { label: 'Mixed Export Grades / Split Green', shortLabel: 'Mixed Grades' },
  { label: 'Cardamom Seeds / Volatile Oil Extract Grade', shortLabel: 'Seeds / Oil Extract' },
];

export default function QuoteModal({
  isOpen,
  onClose,
  defaultGrade = '8.5 mm Extra Bold Green (AGEB)',
  defaultPricePerKg,
  cartItems = [],
  onSuccess,
}: QuoteModalProps) {
  const isBulkCart = cartItems.length > 0;
  const totalCartKg = cartItems.reduce((sum, item) => sum + item.quantityKg, 0);

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return getActiveLangCode() === 'ar' ? 'AED' : 'USD';
  });
  const [overridePricePerKg, setOverridePricePerKg] = useState<number | undefined>(defaultPricePerKg);

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
      setOverridePricePerKg(defaultPricePerKg);
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
  }, [isOpen, defaultGrade, defaultPricePerKg, isBulkCart, cartItems, totalCartKg]);

  const handleSelectGrade = (gradeName: string) => {
    setFormData((prev) => ({ ...prev, grade: gradeName }));
    setOverridePricePerKg(undefined);
  };

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

  // Indian Spice Market Auction calculations & product pricing
  const rawAvgInr = auctionData ? parseFloat(auctionData.avgPrice.replace(/,/g, '')) || 3049 : 3049;
  const rawMaxInr = auctionData ? parseFloat(auctionData.maxPrice.replace(/,/g, '')) || 4243 : 4243;
  
  // Determine base INR rate for single grade:
  // If an explicit defaultPricePerKg was passed (e.g. $32/kg or ₹2850/kg), use it as baseline
  let baseInrRate = rawAvgInr;
  if (overridePricePerKg && overridePricePerKg > 0) {
    baseInrRate = overridePricePerKg > 200 ? overridePricePerKg : Math.round(overridePricePerKg * 83.5);
  }

  const parsedQtyInfo = isBulkCart
    ? { kg: totalCartKg, formatted: `${totalCartKg} kg (${(totalCartKg / 1000).toFixed(2)} MT)` }
    : parseQuantityKg(formData.quantity);
  
  const parsedQtyKg = parsedQtyInfo.kg;
  const multiplier = isBulkCart ? 1.0 : getGradeMultiplier(formData.grade);
  const estRateInrPerKg = Math.round(baseInrRate * (overridePricePerKg ? 1.0 : multiplier));

  // Bulk cart total in INR calculated directly from individual cart item rates
  const totalCartInr = cartItems.reduce((sum, item) => {
    const itemInrRate = item.pricePerKg > 200 ? item.pricePerKg : Math.round(item.pricePerKg * 83.5);
    return sum + item.quantityKg * itemInrRate;
  }, 0);

  const estimatedTradeInr = isBulkCart ? totalCartInr : Math.round(estRateInrPerKg * parsedQtyKg);

  const activeCfg = CURRENCY_CONFIG[currency];
  const unitRateInActiveCurrency = (estRateInrPerKg / activeCfg.toInrFactor).toFixed(2);
  const rawAuctionAvgInActiveCurrency = (rawAvgInr / activeCfg.toInrFactor).toFixed(2);

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
• Daily Avg Market Rate: ₹${rawAvgInr.toLocaleString('en-IN')}/kg (${activeCfg.symbol}${rawAuctionAvgInActiveCurrency}/kg)
• Selected Grade Rate: ₹${estRateInrPerKg.toLocaleString('en-IN')}/kg (${activeCfg.symbol}${unitRateInActiveCurrency}/kg)
• Peak Max Auction Rate: ₹${rawMaxInr.toLocaleString('en-IN')}/kg
• Est. Market Sourcing Value (${parsedQtyInfo.formatted}): ${formatCurrencyVal(estimatedTradeInr, currency)} (₹${estimatedTradeInr.toLocaleString('en-IN')} INR / ${formatCurrencyVal(estimatedTradeInr, 'USD')} USD / ${formatCurrencyVal(estimatedTradeInr, 'AED')} AED FOB)`;

    if (isBulkCart) {
      const breakdownLines = cartItems.map((i) => {
        const itemInr = i.pricePerKg > 200 ? i.pricePerKg : Math.round(i.pricePerKg * 83.5);
        return `• ${i.gradeName} (${i.gradeNum}${i.gradeUnit}): ${i.quantityKg}kg @ ~${formatCurrencyVal(itemInr, currency)}/kg (${i.packaging})`;
      });
      const cartHeader = `--- BULK CART ORDER BREAKDOWN (${cartItems.length} ITEMS) ---\n${breakdownLines.join(
        '\n'
      )}\nEst. Order Value: ${formatCurrencyVal(totalCartInr, currency)} (${currency}) | Total Weight: ${totalCartKg} kg`;

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
      <div className="fixed inset-0 z-[300] flex items-center justify-center py-6 px-3 sm:px-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#071309]/75 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 0 }}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-[#C5A046]/30 bg-[#0D2410] text-[#FAF8F5] shadow-[0_32px_80px_rgba(0,0,0,0.7)] z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Premium header band */}
          <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b border-[#C5A046]/20 shrink-0"
            style={{ background: 'linear-gradient(135deg, #0a1f0c 0%, #112D15 60%, #0f2512 100%)' }}>
            {/* Subtle corner ornament */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top right, #C5A046 0%, transparent 70%)' }} />

            {/* Top row: logo + currency + close */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/images/cardanova-wordmark-light.png"
                  alt="Cardanova"
                  className="h-6 w-auto object-contain flex-shrink-0 opacity-90"
                />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C5A046]/80 hidden sm:block">
                  International B2B Export Quote
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Currency toggle */}
                <div className="flex items-center gap-0.5 bg-black/30 p-0.5 rounded-lg border border-[#C5A046]/20">
                  {(['USD', 'AED', 'INR'] as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        currency === c
                          ? 'gold-gradient-bg text-[#071309] shadow-sm'
                          : 'text-[#FAF8F5]/45 hover:text-[#FAF8F5]/80'
                      }`}
                    >
                      {c === 'USD' ? '$USD' : c === 'AED' ? 'AED' : '₹INR'}
                    </button>
                  ))}
                </div>
                {/* Close */}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#C5A046]/30 text-[#C5A046]/60 hover:text-[#C5A046] hover:border-[#C5A046]/60 transition-colors text-base font-light"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Heading block */}
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C5A046]/70 sm:hidden block mb-1">
                International B2B Export Quote
              </span>
              <h2 className="font-serif font-normal text-[#FAF8F5] leading-tight" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.65rem)' }}>
                Request a Formal Trade Quote
              </h2>
              <p className="text-[11px] text-[#FAF8F5]/40 mt-1 font-light">
                Cardanova Spices · Idukki, Kerala · Live Spices Board India auction rates
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="px-5 sm:px-7 py-5 overflow-y-auto" style={{ background: '#0D2410' }}>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a3d1e] border border-[#C5A046]/40 text-[#C5A046] text-3xl">
                ✓
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5]">Inquiry Received</h3>
              <p className="mt-2 text-[#FAF8F5]/50 text-sm max-w-md mx-auto">
                Thank you for your interest in Cardanova Spices. Our international export team will review your specifications and market benchmark rate to contact you with a formal CIF/FOB quote in {currency} within 24 hours.
              </p>
            </motion.div>
          ) : (
            <>

              {/* Spices Board India Market Benchmark Card */}
              {auctionData && (
                <div className="mb-5 p-3.5 rounded-xl border border-[#C5A046]/20 space-y-2.5" style={{ background: 'rgba(197,160,70,0.07)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-[#C5A046] uppercase tracking-wider text-[10px] block">
                          Spices Board India Market Benchmark ({auctionData.date})
                        </span>
                        <span className="text-[#FAF8F5]/50 font-light text-[11px]">
                          Daily Avg: <strong className="text-[#FAF8F5]/80 font-medium">₹{auctionData.avgPrice}/kg</strong> ({activeCfg.symbol}{rawAuctionAvgInActiveCurrency}/kg)
                          {!isBulkCart && (
                            <> · Selected Grade Rate: <strong className="text-[#C5A046] font-semibold">{activeCfg.symbol}{unitRateInActiveCurrency}/kg</strong></>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {estimatedTradeInr > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#C5A046]/15 text-xs gap-1">
                      <span className="text-[11px] text-[#FAF8F5]/50 flex items-center gap-1.5">
                        <span>Est. Sourcing Benchmark:</span>
                        <strong className="text-[#FAF8F5]/80 font-mono font-normal">({parsedQtyInfo.formatted})</strong>
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#C5A046]">
                        {formatCurrencyVal(estimatedTradeInr, currency)}
                        <span className="text-[10px] text-[#FAF8F5]/30 ml-1.5 font-sans font-normal font-mono">
                          ({formatCurrencyVal(estimatedTradeInr, currency === 'USD' ? 'AED' : currency === 'AED' ? 'USD' : 'USD')})
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Bulk Cart Preview Banner */}
              {isBulkCart && (
                <div className="mb-5 p-4 rounded-xl border border-[#C5A046]/20" style={{ background: 'rgba(197,160,70,0.07)' }}>
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#C5A046]/15">
                    <span className="text-xs font-semibold text-[#C5A046] uppercase tracking-wider flex items-center gap-2">
                      🛒 Bulk Cart Summary ({cartItems.length} {cartItems.length === 1 ? 'grade' : 'grades'})
                    </span>
                    <span className="text-xs font-mono text-[#FAF8F5]/50">
                      Total Weight: <strong className="text-[#C5A046]">{totalCartKg} kg</strong>
                    </span>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {cartItems.map((item) => {
                      const itemInrRate = item.pricePerKg > 200 ? item.pricePerKg : Math.round(item.pricePerKg * 83.5);
                      const itemTotalInr = item.quantityKg * itemInrRate;
                      return (
                        <div key={item.id} className="flex justify-between items-center text-xs text-[#FAF8F5]/60 bg-white/5 p-2 rounded-lg border border-white/8">
                          <div className="truncate max-w-[65%]">
                            <span className="font-medium text-[#FAF8F5]/85">{item.gradeName}</span>
                            <span className="text-[10px] text-[#FAF8F5]/35 block">{item.packaging}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-[#C5A046] font-semibold">{item.quantityKg} kg</span>
                            <span className="text-[10px] text-[#FAF8F5]/50 block font-mono">
                              ~{formatCurrencyVal(itemTotalInr, currency)} ({formatCurrencyVal(itemInrRate, currency)}/kg)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alexander Wright"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Global Foods Trading Ltd."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="trade@company.com"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:outline-none transition-colors ${
                        emailError
                          ? 'border-red-500/60 focus:border-red-400'
                          : 'border-white/10 focus:border-[#C5A046]/50'
                      }`}
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                    {emailError && (
                      <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                        ⚠️ {emailError}
                      </p>
                    )}
                    {emailSuggestion && (
                      <button
                        type="button"
                        onClick={() => handleEmailChange(emailSuggestion)}
                        className="text-[10px] text-[#C5A046] mt-0.5 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        💡 Did you mean <span className="font-semibold">{emailSuggestion}</span>?
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">Destination Country *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UAE, Saudi Arabia, Germany"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">Port of Discharge</label>
                    <input
                      type="text"
                      placeholder="e.g. Jebel Ali, Rotterdam, NY"
                      value={formData.destinationPort}
                      onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70">
                      Cardamom Grade / Product *
                    </label>

                    {isBulkCart ? (
                      <input
                        type="text"
                        readOnly
                        value={formData.grade}
                        className="w-full rounded-lg border border-[#C5A046]/30 px-3 py-2 text-xs text-[#C5A046] font-medium bg-[#112D15]/80 cursor-not-allowed"
                      />
                    ) : (
                      <>
                        <select
                          value={
                            EXPORT_GRADES_LIST.some((g) => g.label === formData.grade)
                              ? formData.grade
                              : 'Custom Specification'
                          }
                          onChange={(e) => {
                            if (e.target.value !== 'Custom Specification') {
                              handleSelectGrade(e.target.value);
                            } else {
                              handleSelectGrade('Custom Specification');
                            }
                          }}
                          className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A046]/70 focus:outline-none transition-colors cursor-pointer"
                          style={{ background: '#112D15' }}
                        >
                          {EXPORT_GRADES_LIST.map((g) => (
                            <option key={g.label} value={g.label} style={{ background: '#0D2410', color: '#FAF8F5' }}>
                              {g.label}
                            </option>
                          ))}
                          <option value="Custom Specification" style={{ background: '#0D2410', color: '#FAF8F5' }}>
                            ✏️ Custom Grade / Specification...
                          </option>
                        </select>

                        {/* Quick Selection Pills */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[9px] text-[#FAF8F5]/35 font-medium mr-0.5">Quick Pick:</span>
                          {EXPORT_GRADES_LIST.map((g) => {
                            const isSelected = formData.grade === g.label;
                            return (
                              <button
                                key={g.label}
                                type="button"
                                onClick={() => handleSelectGrade(g.label)}
                                className={`px-2 py-0.5 rounded text-[9px] font-semibold transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'gold-gradient-bg text-[#071309] border-[#C5A046]'
                                    : 'bg-white/5 text-[#FAF8F5]/50 border-white/10 hover:border-[#C5A046]/40 hover:text-[#FAF8F5]'
                                }`}
                              >
                                {g.shortLabel}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Grade input field if custom specification selected */}
                        {(!EXPORT_GRADES_LIST.some((g) => g.label === formData.grade) || formData.grade === 'Custom Specification') && (
                          <input
                            type="text"
                            placeholder="Type custom grade name (e.g. 8.5mm AGEB, Black Pepper...)"
                            value={formData.grade}
                            onChange={(e) => handleSelectGrade(e.target.value)}
                            className="w-full mt-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-[#FAF8F5] placeholder-white/30 focus:border-[#C5A046] focus:outline-none transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                          />
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">
                      Total Quantity *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 MT or 500 kg"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                    <span className="text-[9px] text-[#FAF8F5]/35 mt-1 block font-mono">
                      Parsed: {parsedQtyInfo.formatted}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/70 mb-1">Additional Specifications / Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="Target price, sample requests, or specific quality criteria..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none resize-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                </div>

                {submitError && (
                  <p className="text-xs text-red-400 p-2.5 rounded-lg bg-red-900/30 border border-red-500/30 text-center font-medium">
                    ⚠️ {submitError}
                  </p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl gold-gradient-bg py-3 px-6 text-sm font-bold text-[#071309] shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tracking-wide"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-[#071309] border-t-transparent animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>
                        Submit Quote Request in {currency} {isBulkCart && `(${cartItems.length} items)`}
                      </span>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-[#FAF8F5]/25 mt-1.5 tracking-wide">Secured · Confidential · Response within 24 hrs</p>
                </div>
              </form>
            </>
          )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
