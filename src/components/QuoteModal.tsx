import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsService } from '../services/cmsService';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
}

export default function QuoteModal({ isOpen, onClose, defaultGrade = '8.5 mm Extra Bold' }: QuoteModalProps) {
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

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await cmsService.addQuoteRequest({
      fullName: formData.fullName,
      companyName: formData.companyName,
      country: formData.country,
      email: formData.email,
      phone: formData.phone,
      selectedProducts: formData.grade,
      quantityKg: formData.quantity,
      message: `${formData.message} ${formData.destinationPort ? `| Port: ${formData.destinationPort}` : ''} | Pack: ${formData.packaging}`,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2800);
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
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
                Thank you for your interest in Cardanova Spices. Our international export team will review your specifications and contact you with a formal CIF/FOB quote within 24 hours.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#C5A046]">
                  International B2B Export Quote
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF8F5] mt-1">
                  Request a Formal Trade Quote
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Direct export from Idukki, Kerala. Fill out the details below to receive competitive bulk pricing.
                </p>
              </div>

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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                    />
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
                      placeholder="e.g. Jebel Ali, Rotterdam, New York"
                      value={formData.destinationPort}
                      onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3.5 py-2 text-sm text-[#FAF8F5] placeholder-stone-500 focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Cardamom Grade</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309] px-3 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A046] focus:outline-none"
                    >
                      <option value="8.5 mm Extra Bold">8.5 mm Extra Bold</option>
                      <option value="8 mm Premium">8 mm Premium</option>
                      <option value="7.5 mm Export Grade">7.5 mm Export Grade</option>
                      <option value="7 mm Commercial Grade">7 mm Commercial Grade</option>
                      <option value="Mixed Grade">Mixed Grade</option>
                      <option value="Rejection Grade">Rejection Grade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Quantity (Metric Tons)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 MT"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309]/60 px-3 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A046] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Packaging Type</label>
                    <select
                      value={formData.packaging}
                      onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                      className="w-full rounded-lg border border-[#A18637]/30 bg-[#071309] px-3 py-2 text-xs text-[#FAF8F5] focus:border-[#C5A046] focus:outline-none"
                    >
                      <option value="Vacuum Pack (5kg / 10kg)">Vacuum Pack (5kg/10kg)</option>
                      <option value="Bulk Cartons (25kg)">Bulk Cartons (25kg)</option>
                      <option value="Jute Bags with Poly Liner">Jute Bags + Liner</option>
                      <option value="Custom Buyer Branding">Custom Branding</option>
                    </select>
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

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl gold-gradient-bg py-3 px-6 text-sm font-semibold text-[#112D15] shadow-lg hover:brightness-110 transition-all cursor-pointer"
                  >
                    Submit Official Quote Request
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
