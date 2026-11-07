import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitQuoteRequest } from '../services/quoteService';
import { validateEmail } from '../utils/emailValidator';

export const DOMESTIC_GRADES_LIST = [
  { label: '6 to 7 mm', shortLabel: '6 to 7 mm' },
  { label: '7 – 8 mm', shortLabel: '7 – 8 mm' },
  { label: '8 mm+', shortLabel: '8 mm+' },
  { label: 'Mixed pods(bulk)', shortLabel: 'Mixed pods(bulk)' },
  { label: 'Rejection', shortLabel: 'Rejection' },
];

interface DomesticBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  onSwitchToExport?: () => void;
}

export default function DomesticBulkModal({
  isOpen,
  onClose,
  defaultGrade = '8 mm+',
  onSwitchToExport,
}: DomesticBulkModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    cityState: '',
    quantity: '50 kg',
    packaging: '25kg Food-Grade Sacks',
    message: '',
  });

  const [selectedGrades, setSelectedGrades] = useState<string[]>(() => [defaultGrade]);
  const [customGradeText, setCustomGradeText] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setSubmitted(false);
      const initial = defaultGrade || '8 mm+';
      setSelectedGrades([initial]);
      setIsCustomActive(false);
      setCustomGradeText('');
    }
  }, [isOpen, defaultGrade]);

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
      return updated;
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
      setEmailError(res.error ?? 'Invalid email');
      setEmailSuggestion(null);
    } else {
      setEmailError(null);
      setEmailSuggestion(res.suggestion ?? null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid) {
      setEmailError(emailRes.error ?? 'Invalid email');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const gradesCombined = [
      ...selectedGrades,
      ...(isCustomActive && customGradeText.trim() ? [customGradeText.trim()] : []),
    ].join(', ');

    let finalMessage = `--- INDIAN DOMESTIC WHOLESALE ORDER (MOQ 50 KG) ---
• Selected Grades: ${gradesCombined}
• Required Volume: ${formData.quantity}
• Delivery Destination (City/State): ${formData.cityState}
• Packaging Preference: ${formData.packaging}`;

    if (formData.message.trim()) {
      finalMessage += `\n\nAdditional Requirements / Delivery Schedule:\n${formData.message.trim()}`;
    }

    try {
      await submitQuoteRequest({
        full_name: formData.fullName,
        company_name: formData.companyName || 'Domestic Buyer',
        country: 'India',
        email: formData.email,
        phone: formData.phone,
        selected_products: `Domestic Bulk: ${gradesCombined}`,
        quantity_kg: formData.quantity,
        message: finalMessage,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2800);
    } catch (err: any) {
      console.error('Failed to submit domestic bulk order:', err);
      setSubmitError(err.message || 'Failed to submit order enquiry. Please try again.');
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
          className="relative w-full max-w-xl rounded-2xl overflow-hidden border border-[#C5A046]/30 bg-[#0D2410] text-[#FAF8F5] shadow-[0_32px_80px_rgba(0,0,0,0.7)] z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div
            className="relative px-6 sm:px-8 pt-6 pb-5 border-b border-[#C5A046]/20 shrink-0"
            style={{ background: 'linear-gradient(135deg, #0a1f0c 0%, #112D15 60%, #0f2512 100%)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <img
                  src="/images/cardanova-wordmark-light.png"
                  alt="Cardanova"
                  className="h-6 w-auto object-contain flex-shrink-0 opacity-90"
                />
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg font-bold gold-gradient-bg text-[#071309] shadow-sm">
                  🇮🇳 Indian Bulk (MOQ 50 kg)
                </span>
                {onSwitchToExport && (
                  <button
                    type="button"
                    onClick={onSwitchToExport}
                    className="px-2.5 py-1 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    Export B2B
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-[#C5A046]/30 text-[#C5A046]/60 hover:text-[#C5A046] hover:border-[#C5A046]/60 transition-colors text-base font-light cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="font-serif font-normal text-[#FAF8F5] leading-tight text-xl sm:text-2xl">
                Indian Wholesale Bulk Enquiry
              </h2>
              <p className="text-[11px] text-[#FAF8F5]/60 mt-1 font-light">
                Direct Kerala farm-gate wholesale rates · MOQ 50 kg · Fast Pan-India freight with GST invoice
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
                <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5]">Enquiry Received</h3>
                <p className="mt-2 text-[#FAF8F5]/60 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you for your bulk enquiry. Our domestic commodity desk will review your grade requirements and contact you with wholesale pricing within a few hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Contact Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                </div>

                {/* Company Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                      Company / Trading Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Swastik Spices / Hotel / Bakery"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contact@business.com"
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
                </div>

                {/* Delivery City/State & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                      Delivery City & State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Surat, Gujarat / Delhi NCR"
                      value={formData.cityState}
                      onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                      Order Quantity (MOQ 50 kg) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50 kg, 100 kg, 500 kg, 1 Ton"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-[#FAF8F5] placeholder-white/20 focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  </div>
                </div>

                {/* Grade Selection */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80">
                      Cardamom Grades Needed *
                    </label>
                    <span className="text-[10px] text-[#C5A046] font-medium font-mono">
                      {selectedGrades.length + (isCustomActive && customGradeText.trim() ? 1 : 0)} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {DOMESTIC_GRADES_LIST.map((g) => {
                      const isSelected = selectedGrades.includes(g.label);
                      return (
                        <button
                          key={g.label}
                          type="button"
                          onClick={() => toggleGrade(g.label)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'gold-gradient-bg text-[#071309] border-[#C5A046] font-semibold shadow-md'
                              : 'bg-white/5 text-[#FAF8F5]/80 border-white/10 hover:border-[#C5A046]/40 hover:text-[#FAF8F5]'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                            isSelected ? 'bg-[#071309] text-[#C5A046] border-[#071309]' : 'border-white/20 bg-transparent'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="truncate">{g.shortLabel}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setIsCustomActive(!isCustomActive)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                        isCustomActive
                          ? 'gold-gradient-bg text-[#071309] border-[#C5A046] font-semibold shadow-md'
                          : 'bg-white/5 text-[#FAF8F5]/80 border-white/10 hover:border-[#C5A046]/40 hover:text-[#FAF8F5]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 border ${
                        isCustomActive ? 'bg-[#071309] text-[#C5A046] border-[#071309]' : 'border-white/20 bg-transparent'
                      }`}>
                        {isCustomActive ? '✓' : ''}
                      </span>
                      <span className="truncate">+ Other / Special</span>
                    </button>
                  </div>

                  {isCustomActive && (
                    <input
                      type="text"
                      placeholder="Specify your custom size / grade requirement..."
                      value={customGradeText}
                      onChange={(e) => setCustomGradeText(e.target.value)}
                      className="w-full mt-2 rounded-lg border border-[#C5A046]/50 px-3 py-2 text-xs text-[#FAF8F5] placeholder-white/30 focus:border-[#C5A046] focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                  )}
                </div>

                {/* Packaging Preference */}
                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                    Packaging Preference
                  </label>
                  <select
                    value={formData.packaging}
                    onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                    className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A046]/50 focus:outline-none transition-colors"
                    style={{ background: '#112D15' }}
                  >
                    <option value="25kg Food-Grade HDPE Sacks">25kg Food-Grade HDPE Woven Sacks</option>
                    <option value="10kg Vacuum Foil Pack Master">10kg Vacuum Sealed Barrier Bags</option>
                    <option value="50kg Jute Bags with Poly Liner">50kg Traditional Jute Bags with Liner</option>
                    <option value="Custom Packing Format">Custom Bulk Packaging</option>
                  </select>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#C5A046]/80 mb-1">
                    Additional Instructions / Sample Requests
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific moisture requirement, monthly recurring volume, sample request..."
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl gold-gradient-bg py-3 px-6 text-sm font-bold text-[#071309] shadow-lg hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tracking-wide uppercase"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-[#071309] border-t-transparent animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <span>Submit Domestic Wholesale Enquiry</span>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-[#FAF8F5]/35 mt-1.5 tracking-wide">
                    Direct Kerala Sourcing · Insured Freight · Response in 2-4 Hours
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
