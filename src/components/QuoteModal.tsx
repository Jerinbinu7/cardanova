import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitQuoteRequest } from '../services/quoteService';
import { validateEmail } from '../utils/emailValidator';
import { getActiveLangCode } from '../utils/translation';
import type { CartItem } from './CartDrawer';
import { Globe, Package, Check, Info, X } from 'lucide-react';

export type CurrencyCode = 'USD' | 'AED' | 'INR';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; label: string; toInrFactor: number }> = {
  USD: { symbol: '$', label: 'USD ($)', toInrFactor: 83.5 },
  AED: { symbol: 'AED ', label: 'AED (د.إ)', toInrFactor: 22.75 },
  INR: { symbol: '₹', label: 'INR (₹)', toInrFactor: 1.0 },
};

export function isCountryIndia(countryStr: string): boolean {
  if (!countryStr) return false;
  const clean = countryStr.trim().toLowerCase();
  return (
    clean === 'india' ||
    clean === 'in' ||
    clean === 'bharat' ||
    clean === 'ind' ||
    clean.startsWith('india')
  );
}

export function parseQuantityKg(qtyStr: string, isDomestic: boolean = false): {
  kg: number;
  formatted: string;
  isBelowMoq: boolean;
  moq: number;
} {
  const moq = isDomestic ? 50 : 100;
  if (!qtyStr || !qtyStr.trim()) {
    return { kg: moq, formatted: `${moq} kg`, isBelowMoq: false, moq };
  }

  const cleanStr = qtyStr.toLowerCase().replace(/,/g, '').trim();
  const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));

  if (isNaN(num) || num <= 0) {
    return { kg: 0, formatted: '0 kg', isBelowMoq: true, moq };
  }

  let kg = num;
  if (cleanStr.includes('mt') || cleanStr.includes('ton')) {
    kg = num * 1000;
  } else if (cleanStr.includes('g') && !cleanStr.includes('kg')) {
    kg = num / 1000;
  } else if (!cleanStr.includes('kg')) {
    if (isDomestic) {
      kg = num;
    } else {
      kg = num <= 20 ? num * 1000 : num;
    }
  }

  const isBelowMoq = kg < moq;
  const mt = kg / 1000;
  const formatted =
    mt >= 1
      ? `${Math.round(kg).toLocaleString('en-US')} kg (${mt % 1 === 0 ? mt : mt.toFixed(2)} MT)`
      : `${Math.round(kg).toLocaleString('en-US')} kg`;

  return { kg, formatted, isBelowMoq, moq };
}

export const EXPORT_GRADES_LIST = [
  { label: '6 to 7 mm', shortLabel: '6 to 7 mm' },
  { label: '7 – 8 mm', shortLabel: '7 – 8 mm' },
  { label: '8 mm+', shortLabel: '8 mm+' },
  { label: 'Mixed pods(bulk)', shortLabel: 'Mixed pods' },
  { label: 'Rejection', shortLabel: 'Rejection' },
];

const POPULAR_COUNTRIES = [
  { label: 'India', name: 'India', domestic: true, hint: '50 kg MOQ' },
  { label: 'UAE', name: 'United Arab Emirates' },
  { label: 'Saudi Arabia', name: 'Saudi Arabia' },
  { label: 'United States', name: 'United States' },
  { label: 'United Kingdom', name: 'United Kingdom' },
  { label: 'Germany', name: 'Germany' },
];

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  defaultPricePerKg?: number;
  defaultCountry?: string;
  cartItems?: CartItem[];
  onSuccess?: () => void;
  onNavigateToPackets?: () => void;
  onSwitchToDomestic?: () => void;
}

export default function QuoteModal({
  isOpen,
  onClose,
  defaultGrade = '8 mm+',
  defaultPricePerKg,
  defaultCountry = '',
  cartItems = [],
  onSuccess,
  onNavigateToPackets,
}: QuoteModalProps) {
  const isBulkCart = cartItems.length > 0;
  const totalCartKg = cartItems.reduce((sum, item) => sum + item.quantityKg, 0);

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (isCountryIndia(defaultCountry)) return 'INR';
    return getActiveLangCode() === 'ar' ? 'AED' : 'USD';
  });

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    country: defaultCountry || '',
    destinationPort: '',
    grade: defaultGrade,
    quantity: isCountryIndia(defaultCountry) ? '50 kg' : '1 MT',
    packaging: '25kg HDPE Multi-Ply Woven Sacks with Inner PE Liner',
    message: '',
  });

  const [emailError, setEmailError]           = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [submitted, setSubmitted]             = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [submitError, setSubmitError]         = useState<string | null>(null);

  const [selectedGrades, setSelectedGrades] = useState<string[]>(() => [defaultGrade || '8 mm+']);
  const [customGradeText, setCustomGradeText] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);

  // Dynamic country mode
  const isDomestic = isCountryIndia(formData.country);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setSubmitted(false);
      const initCountry = defaultCountry || '';
      const initIsIndia = isCountryIndia(initCountry);
      const initCurrency: CurrencyCode = initIsIndia
        ? 'INR'
        : getActiveLangCode() === 'ar'
        ? 'AED'
        : 'USD';
      setCurrency(initCurrency);

      if (isBulkCart) {
        const productSummary = cartItems
          .map((i) => `${i.gradeName} (${i.quantityKg}kg)`)
          .join(', ');
        setSelectedGrades(cartItems.map((i) => i.gradeName));
        setFormData({
          fullName: '',
          companyName: '',
          registrationNumber: '',
          email: '',
          phone: '',
          country: initCountry,
          destinationPort: '',
          grade: `Bulk Cart Order: ${productSummary}`,
          quantity: `${totalCartKg} kg (${(totalCartKg / 1000).toFixed(2)} MT)`,
          packaging: '5kg Multi-Layer Vacuum Foil Packs / 10kg Master Carton',
          message: '',
        });
      } else {
        const initial = defaultGrade || '8 mm+';
        setSelectedGrades([initial]);
        setIsCustomActive(false);
        setCustomGradeText('');
        setFormData({
          fullName: '',
          companyName: '',
          registrationNumber: '',
          email: '',
          phone: '',
          country: initCountry,
          destinationPort: '',
          grade: initial,
          quantity: initIsIndia ? '50 kg' : '1 MT',
          packaging: initIsIndia
            ? '25kg HDPE Multi-Ply Woven Sacks with Inner PE Liner'
            : '5kg Multi-Layer Vacuum Foil Packs / 10kg Master Carton',
          message: '',
        });
      }
    }
  }, [isOpen, defaultGrade, defaultPricePerKg, defaultCountry, isBulkCart, cartItems, totalCartKg]);

  const handleCountryChange = (val: string) => {
    const wasIndia = isCountryIndia(formData.country);
    const nowIndia = isCountryIndia(val);

    setFormData((prev) => {
      let updatedQty = prev.quantity;
      let updatedPackaging = prev.packaging;

      if (!wasIndia && nowIndia) {
        if (prev.quantity === '1 MT' || !prev.quantity.trim()) {
          updatedQty = '50 kg';
        }
        if (prev.packaging.includes('5kg Multi-Layer')) {
          updatedPackaging = '25kg HDPE Multi-Ply Woven Sacks with Inner PE Liner';
        }
      } else if (wasIndia && !nowIndia) {
        if (prev.quantity === '50 kg' || !prev.quantity.trim()) {
          updatedQty = '1 MT';
        }
      }

      return {
        ...prev,
        country: val,
        quantity: updatedQty,
        packaging: updatedPackaging,
      };
    });

    if (!wasIndia && nowIndia) {
      setCurrency('INR');
    } else if (wasIndia && !nowIndia && currency === 'INR') {
      setCurrency(getActiveLangCode() === 'ar' ? 'AED' : 'USD');
    }
  };

  const toggleGrade = (gradeLabel: string) => {
    setSelectedGrades((prev) => {
      const exists = prev.includes(gradeLabel);
      let updated: string[];
      if (exists) {
        updated = prev.filter((g) => g !== gradeLabel);
        if (updated.length === 0 && !isCustomActive) {
          updated = [gradeLabel];
        }
      } else {
        updated = [...prev, gradeLabel];
      }
      const customPart = isCustomActive && customGradeText.trim() ? [customGradeText.trim()] : [];
      const combined = [...updated, ...customPart].join(', ');
      setFormData((f) => ({ ...f, grade: combined || gradeLabel }));
      return updated;
    });
  };

  const handleCustomGradeChange = (text: string) => {
    setCustomGradeText(text);
    const customPart = text.trim() ? [text.trim()] : [];
    const combined = [...selectedGrades, ...customPart].join(', ');
    setFormData((f) => ({ ...f, grade: combined || 'Custom Specification' }));
  };

  const toggleCustomGrade = () => {
    setIsCustomActive((prev) => {
      const nextState = !prev;
      const customPart = nextState && customGradeText.trim() ? [customGradeText.trim()] : [];
      const combined = [...selectedGrades, ...customPart].join(', ');
      setFormData((f) => ({ ...f, grade: combined || (selectedGrades[0] || '8 mm+') }));
      return nextState;
    });
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
      setEmailError(res.error ?? 'Invalid email address');
      setEmailSuggestion(null);
    } else {
      setEmailError(null);
      setEmailSuggestion(res.suggestion ?? null);
    }
  };

  // Quantity evaluation
  const parsedQtyInfo = isBulkCart
    ? {
        kg: totalCartKg,
        formatted: `${totalCartKg} kg (${(totalCartKg / 1000).toFixed(2)} MT)`,
        isBelowMoq: totalCartKg < (isDomestic ? 50 : 100),
        moq: isDomestic ? 50 : 100,
      }
    : parseQuantityKg(formData.quantity, isDomestic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid) {
      setEmailError(emailRes.error ?? 'Invalid email address');
      return;
    }

    if (!formData.companyName.trim()) {
      setSubmitError(isDomestic ? 'Business name is required.' : 'Company name is required.');
      return;
    }

    if (!isDomestic && !formData.registrationNumber.trim()) {
      setSubmitError('Company registration / tax ID is required for export trade verification.');
      return;
    }

    if (isDomestic && parsedQtyInfo.isBelowMoq) {
      setSubmitError(
        `Minimum order quantity for domestic wholesale within India is 50 kg. Please update your order volume to 50 kg or more.`
      );
      return;
    }

    if (!isDomestic && parsedQtyInfo.isBelowMoq) {
      setSubmitError(
        `Minimum order quantity for international export is 100 kg. Please update your order volume to 100 kg or more.`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    let finalMessage = formData.message.trim();

    const headerTitle = isDomestic
      ? '--- INDIAN DOMESTIC WHOLESALE ORDER (MOQ 50 KG) ---'
      : '--- INTERNATIONAL BULK EXPORT INQUIRY ---';

    const exportDetailsHeader = `${headerTitle}
• Preferred Currency: ${currency}
• Business / Company: ${formData.companyName.trim()}
• ${isDomestic ? 'GSTIN / Business Reg' : 'Company Registration / Tax ID'}: ${formData.registrationNumber.trim() || (isDomestic ? 'Not provided (Domestic)' : 'N/A')}
• Destination Country: ${formData.country.trim() || (isDomestic ? 'India' : 'Not specified')}
• ${isDomestic ? 'Delivery Location' : 'Port of Discharge'}: ${formData.destinationPort.trim() || 'Not specified'}
• Grades Requested: ${formData.grade}
• Total Volume: ${parsedQtyInfo.formatted}
• Packaging Preference: ${formData.packaging}`;

    if (isBulkCart) {
      const breakdownLines = cartItems.map((i) => {
        return `• ${i.gradeName} (${i.gradeNum}${i.gradeUnit}): ${i.quantityKg}kg (${i.packaging})`;
      });
      finalMessage = `${exportDetailsHeader}\n\n--- CART ITEMS BREAKDOWN ---\n${breakdownLines.join(
        '\n'
      )}${finalMessage ? `\n\nAdditional Requirements:\n${finalMessage}` : ''}`;
    } else {
      finalMessage = `${exportDetailsHeader}${
        finalMessage ? `\n\nAdditional Requirements:\n${finalMessage}` : ''
      }`;
    }

    try {
      await submitQuoteRequest({
        full_name: formData.fullName,
        company_name: isDomestic
          ? `${formData.companyName.trim()}${formData.registrationNumber.trim() ? ` (GST: ${formData.registrationNumber.trim()})` : ''}`
          : `${formData.companyName.trim()} (Reg: ${formData.registrationNumber.trim()})`,
        country: formData.country.trim() || (isDomestic ? 'India' : 'Not specified'),
        email: formData.email,
        phone: formData.phone,
        selected_products: isDomestic ? `Domestic Bulk: ${formData.grade}` : formData.grade,
        quantity_kg: parsedQtyInfo.formatted,
        message: finalMessage,
      });

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2600);
    } catch (err: any) {
      console.error('Failed to submit quote:', err);
      setSubmitError(err.message || 'Unable to submit quote request. Please try again.');
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
          className="fixed inset-0 bg-[#050D06]/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-[#C5A046]/25 bg-[#08180B] text-[#FAF8F5] shadow-[0_32px_90px_rgba(0,0,0,0.85)] z-10 my-auto max-h-[92vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b border-white/10 shrink-0 bg-[#071509]">
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/cardanova-wordmark-light.png"
                  alt="Cardanova"
                  className="h-6 w-auto object-contain flex-shrink-0 opacity-90"
                />
              </div>

              {/* Dynamic minimal mode badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-white/5 border border-white/10 text-stone-300">
                {isDomestic ? (
                  <>
                    <Package className="w-3.5 h-3.5 text-[#C5A046]" />
                    <span>Domestic India · MOQ 50 kg</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-[#C5A046]" />
                    <span>International Export · MOQ 100 kg</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Currency toggle */}
                <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
                  {(['USD', 'AED', 'INR'] as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        currency === c
                          ? 'gold-gradient-bg text-[#071309] shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {c === 'USD' ? '$USD' : c === 'AED' ? 'AED' : '₹INR'}
                    </button>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-stone-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Heading */}
            <div>
              <h2
                className="font-serif font-normal text-[#FAF8F5] leading-tight text-xl sm:text-2xl"
              >
                {isDomestic ? 'Wholesale Domestic Quotation' : 'Formal Trade Quotation'}
              </h2>
              <p className="text-[11px] text-stone-400 mt-1 font-light tracking-wide">
                Cardanova Spices · Idukki, Kerala ·{' '}
                {isDomestic
                  ? 'Kerala Auction Gate Supply · Minimum Order 50 kg'
                  : 'B2B Trade & Containerized Export · Minimum Order 100 kg'}
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 sm:px-8 py-5 overflow-y-auto" style={{ background: '#08180B' }}>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#112D15] border border-[#C5A046]/40 text-[#C5A046]">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl text-[#FAF8F5]">
                  {isDomestic ? 'Inquiry Received' : 'Trade Inquiry Received'}
                </h3>
                <p className="mt-2 text-stone-400 text-xs sm:text-sm max-w-md mx-auto font-light leading-relaxed">
                  {isDomestic
                    ? 'Our wholesale desk will review your lot requirements and contact you with origin pricing in INR within 24 hours.'
                    : `Our export trade desk will review your specifications and contact you with a formal CIF/FOB quote in ${currency} within 24 hours.`}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Bulk Cart Preview */}
                {isBulkCart && (
                  <div className="mb-4 p-3.5 rounded-xl border border-[#C5A046]/20 bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                      <span className="text-[11px] font-semibold text-[#C5A046] uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        Bulk Cart Summary ({cartItems.length} {cartItems.length === 1 ? 'grade' : 'grades'})
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        Total Volume: <strong className="text-[#C5A046]">{totalCartKg} kg</strong>
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-xs text-stone-300 bg-white/[0.02] p-2 rounded-lg border border-white/5"
                        >
                          <div className="truncate max-w-[70%]">
                            <span className="font-medium text-white">{item.gradeName}</span>
                            <span className="text-[10px] text-stone-400 block">{item.packaging}</span>
                          </div>
                          <span className="font-mono text-[#C5A046] font-semibold shrink-0">
                            {item.quantityKg} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isDomestic ? 'e.g. Sunil Kumar' : 'e.g. Alexander Wright'}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C5A046]/60 focus:bg-black/40 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046] mb-1">
                        {isDomestic ? 'Business / Trade Name *' : 'Company / Organization *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isDomestic ? 'e.g. Royal Spices & Foods' : 'e.g. Global Foods Trading Ltd.'}
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C5A046]/60 focus:bg-black/40 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Registration & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046]">
                          {isDomestic ? 'GSTIN / Business Reg (Optional)' : 'Company Registration / Tax ID *'}
                        </label>
                      </div>
                      <input
                        type="text"
                        required={!isDomestic}
                        placeholder={isDomestic ? 'e.g. 32AAAAA0000A1Z5 (optional)' : 'e.g. IEC, CR No., Tax ID, VAT'}
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C5A046]/60 focus:bg-black/40 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046] mb-1">
                        Corporate / Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="trade@company.com"
                        value={formData.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`w-full rounded-lg border bg-black/25 px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none transition-colors ${
                          emailError
                            ? 'border-red-400/60 focus:border-red-400'
                            : 'border-white/10 focus:border-[#C5A046]/60 focus:bg-black/40'
                        }`}
                      />
                      {emailError && (
                        <p className="text-[10px] text-red-300 mt-1 font-light">
                          {emailError}
                        </p>
                      )}
                      {emailSuggestion && (
                        <button
                          type="button"
                          onClick={() => handleEmailChange(emailSuggestion)}
                          className="text-[10px] text-[#C5A046] mt-1 hover:underline block font-light cursor-pointer text-left"
                        >
                          Did you mean <span className="font-semibold text-white">{emailSuggestion}</span>?
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046] mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={isDomestic ? '+91 98765 43210' : '+1 (555) 000-0000'}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C5A046]/60 focus:bg-black/40 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046]">
                          Destination Country *
                        </label>
                        {isDomestic && (
                          <span className="text-[10px] text-emerald-400/90 font-mono">
                            50 kg MOQ
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. India, UAE, Saudi Arabia"
                        value={formData.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none transition-colors ${
                          isDomestic
                            ? 'border-[#C5A046]/50 bg-[#0e2712]/50 focus:border-[#C5A046]'
                            : 'border-white/10 bg-black/25 focus:border-[#C5A046]/60'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046] mb-1">
                        {isDomestic ? 'Delivery Location (City/State) *' : 'Port of Discharge'}
                      </label>
                      <input
                        type="text"
                        required={isDomestic}
                        placeholder={isDomestic ? 'e.g. Mumbai, Maharashtra' : 'e.g. Jebel Ali, Rotterdam, NY'}
                        value={formData.destinationPort}
                        onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C5A046]/60 focus:bg-black/40 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Clean minimal country pills (no emojis) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider mr-1">
                      Quick select:
                    </span>
                    {POPULAR_COUNTRIES.map((c) => {
                      const isSelected = isCountryIndia(formData.country) && c.domestic
                        ? true
                        : formData.country.trim().toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleCountryChange(c.name)}
                          className={`px-2.5 py-1 rounded-full text-[10px] transition-all cursor-pointer border ${
                            isSelected
                              ? 'gold-gradient-bg text-[#071309] border-[#C5A046] font-semibold shadow-sm'
                              : 'bg-white/[0.03] text-stone-300 border-white/10 hover:border-white/25 hover:text-white'
                          }`}
                        >
                          {c.label} {c.hint && `(${c.hint})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Grades Selection and Volume Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start pt-1.5">
                    <div className="sm:col-span-2 space-y-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046]">
                          Cardamom Grade *
                        </label>
                        {!isBulkCart && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            {selectedGrades.length + (isCustomActive && customGradeText.trim() ? 1 : 0)} selected
                          </span>
                        )}
                      </div>

                      {isBulkCart ? (
                        <input
                          type="text"
                          readOnly
                          value={formData.grade}
                          className="w-full rounded-lg border border-[#C5A046]/30 px-3 py-2 text-xs text-[#C5A046] font-medium bg-[#112D15]/80 cursor-not-allowed"
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {EXPORT_GRADES_LIST.map((g) => {
                              const isSelected = selectedGrades.includes(g.label);
                              return (
                                <button
                                  key={g.label}
                                  type="button"
                                  onClick={() => toggleGrade(g.label)}
                                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-left text-[11px] transition-all cursor-pointer border ${
                                    isSelected
                                      ? 'gold-gradient-bg text-[#071309] border-[#C5A046] font-semibold shadow-sm'
                                      : 'bg-white/[0.03] text-stone-300 border-white/10 hover:border-white/20 hover:text-white'
                                  }`}
                                >
                                  <span
                                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                                      isSelected
                                        ? 'bg-[#071309] text-[#C5A046] border-[#071309]'
                                        : 'border-white/20 bg-transparent'
                                    }`}
                                  >
                                    {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                                  </span>
                                  <span className="truncate">{g.shortLabel}</span>
                                </button>
                              );
                            })}

                            <button
                              type="button"
                              onClick={toggleCustomGrade}
                              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-left text-[11px] transition-all cursor-pointer border ${
                                isCustomActive
                                  ? 'gold-gradient-bg text-[#071309] border-[#C5A046] font-semibold shadow-sm'
                                  : 'bg-white/[0.03] text-stone-300 border-white/10 hover:border-white/20 hover:text-white'
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                                  isCustomActive
                                    ? 'bg-[#071309] text-[#C5A046] border-[#071309]'
                                    : 'border-white/20 bg-transparent'
                                }`}
                              >
                                {isCustomActive ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                              </span>
                              <span className="truncate">+ Custom / Other</span>
                            </button>
                          </div>

                          {isCustomActive && (
                            <input
                              type="text"
                              placeholder="Specify required sizing or moisture parameters..."
                              value={customGradeText}
                              onChange={(e) => handleCustomGradeChange(e.target.value)}
                              className="w-full rounded-lg border border-[#C5A046]/40 bg-black/30 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C5A046] focus:outline-none transition-colors"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046]">
                          {isDomestic ? 'Order Volume *' : 'Export Volume *'}
                        </label>
                        <span className="text-[10px] font-mono text-stone-400">
                          {isDomestic ? 'MOQ 50 kg' : 'MOQ 100 kg'}
                        </span>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder={isDomestic ? 'e.g. 50 kg, 100 kg, 500 kg' : 'e.g. 500 kg, 1 MT, 2 MT'}
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className={`w-full rounded-lg border px-3 py-2 text-xs transition-colors focus:outline-none ${
                          parsedQtyInfo.isBelowMoq
                            ? 'border-amber-500/60 bg-amber-950/20 text-white focus:border-amber-400'
                            : 'border-white/10 bg-black/25 text-white focus:border-[#C5A046]/60'
                        }`}
                      />

                      <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                        <span>Parsed: {parsedQtyInfo.formatted}</span>
                        <span>{isDomestic ? 'Unit: kg' : 'Unit: kg/MT'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Minimal Premium MOQ Constraint Notice ── */}
                  {parsedQtyInfo.isBelowMoq ? (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-[#140b08]/80 border border-amber-600/30 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold tracking-wide text-amber-200 uppercase">
                              {isDomestic
                                ? 'Domestic Wholesale Requirement: Minimum 50 kg'
                                : 'Export Shipment Requirement: Minimum 100 kg'}
                            </span>
                            <span className="text-[10px] font-mono text-stone-300">
                              Selected: {parsedQtyInfo.formatted}
                            </span>
                          </div>

                          <p className="text-stone-300 font-light text-[11px] leading-relaxed">
                            {isDomestic ? (
                              <>
                                Wholesale orders in India are dispatched in master sacks with a minimum of{' '}
                                <strong className="text-white font-medium">50 kg</strong>. For consumer quantities below 50 kg, please order through our Retail Packets store.
                              </>
                            ) : (
                              <>
                                International freight and customs phytosanitary clearance require a minimum order volume of{' '}
                                <strong className="text-white font-medium">100 kg</strong>.
                              </>
                            )}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  quantity: isDomestic ? '50 kg' : '100 kg',
                                }))
                              }
                              className="px-3 py-1 rounded-md border border-[#C5A046]/50 text-[#E2BF63] hover:bg-[#C5A046]/10 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              {isDomestic ? 'Set to 50 kg MOQ' : 'Set to 100 kg MOQ'}
                            </button>

                            {isDomestic && onNavigateToPackets && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onNavigateToPackets();
                                }}
                                className="text-[11px] text-stone-400 hover:text-white underline font-light cursor-pointer"
                              >
                                Buy retail pouches (50g – 1kg) →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400/90 font-mono bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {isDomestic
                          ? `Meets domestic wholesale minimum: ${parsedQtyInfo.formatted} (≥ 50 kg)`
                          : `Meets export shipment minimum: ${parsedQtyInfo.formatted} (≥ 100 kg)`}
                      </span>
                    </div>
                  )}

                  {/* Packaging Preference */}
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046] mb-1">
                      Packaging Format
                    </label>
                    <select
                      value={formData.packaging}
                      onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#C5A046]/60 focus:outline-none transition-colors"
                    >
                      <option value="25kg HDPE Multi-Ply Woven Sacks with Inner PE Liner">
                        25kg HDPE Multi-Ply Woven Sacks with Inner PE Liner (Wholesale Standard)
                      </option>
                      <option value="50kg Jute Bags with Hermetic Liner">
                        50kg Jute Bags with Hermetic Liner (Auction Lot Standard)
                      </option>
                      <option value="5kg Multi-Layer Vacuum Foil Packs / 10kg Master Carton">
                        5kg Multi-Layer Vacuum Foil Packs / 10kg Master Carton (Export Quality)
                      </option>
                      <option value="10kg Vacuum Bags / 25kg Cartons">
                        10kg Vacuum Bags / 25kg Cartons (Commercial Kitchens)
                      </option>
                      <option value="Custom Packing Format">
                        Custom Specification / Institutional Packing
                      </option>
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-wider text-[#C5A046] mb-1">
                      {isDomestic ? 'Lot Notes / Delivery Schedule' : 'Specifications / Incoterms / Notes'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        isDomestic
                          ? 'Pod color preference, target delivery date, GST billing requirements...'
                          : 'FOB/CIF port preference, laboratory analysis needs, target dispatch date...'
                      }
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-[#C5A046]/60 focus:bg-black/40 focus:outline-none resize-none transition-colors"
                    />
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-amber-200 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-center font-light"
                    >
                      {submitError}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting || parsedQtyInfo.isBelowMoq}
                      className={`w-full rounded-xl py-3.5 px-6 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                        parsedQtyInfo.isBelowMoq
                          ? 'bg-white/5 border border-white/10 text-stone-400 cursor-not-allowed'
                          : 'gold-gradient-bg text-[#071309] hover:brightness-105 cursor-pointer shadow-md'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          <span>Processing Request...</span>
                        </>
                      ) : parsedQtyInfo.isBelowMoq ? (
                        <span>
                          {isDomestic
                            ? `Minimum 50 kg required for India wholesale`
                            : `Minimum 100 kg required for export quote`}
                        </span>
                      ) : (
                        <span>
                          {isDomestic
                            ? `Request Domestic Wholesale Quote in ${currency}`
                            : `Request Formal Export Quote in ${currency}`}
                          {isBulkCart ? ` (${cartItems.length} items)` : ''}
                        </span>
                      )}
                    </button>

                    <p className="text-center text-[10px] text-stone-500 mt-2 tracking-wide font-light">
                      {isDomestic
                        ? 'Direct Kerala Farm-Gate Rates · FSSAI & Spices Board Registered · Pan-India Cargo'
                        : 'Confidential Trade Pricing · Response within 24 Hours · Spices Board India Compliant'}
                    </p>
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
