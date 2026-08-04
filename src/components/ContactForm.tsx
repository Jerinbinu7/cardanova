import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsService } from '../services/cmsService';

interface ContactFormProps {
  onOpenQuoteModal: (grade?: string) => void;
}

const CONTACT_DETAILS = [
  {
    icon: '✉️',
    label: 'Export Inquiry',
    value: 'trade@cardanovaspices.com',
    href: 'mailto:trade@cardanovaspices.com',
  },
  {
    icon: '💬',
    label: 'WhatsApp Trade Desk',
    value: '+91 98765 43210',
    href: 'https://wa.me/919876543210',
  },
  {
    icon: '📍',
    label: 'Registered Office',
    value: 'Kattappana, Idukki District, Kerala — 685508, India',
    href: 'https://maps.google.com/?q=Kattappana+Idukki+Kerala+India',
  },
  {
    icon: '🏛️',
    label: 'Export Registrations',
    value: 'APEDA · Spices Board · FSSAI · IEC',
    href: undefined,
  },
];

export default function ContactForm({ onOpenQuoteModal }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [contactItems, setContactItems] = useState(CONTACT_DETAILS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cardanova_contact_cms');
      if (raw) {
        const parsed = JSON.parse(raw);
        setContactItems([
          { icon: '✉️', label: 'Export Inquiry', value: parsed.emailSales || CONTACT_DETAILS[0].value, href: `mailto:${parsed.emailSales || CONTACT_DETAILS[0].value}` },
          { icon: '💬', label: 'WhatsApp Trade Desk', value: parsed.whatsAppNumber || CONTACT_DETAILS[1].value, href: `https://wa.me/${(parsed.whatsAppNumber || '').replace(/\D/g, '')}` },
          { icon: '📍', label: 'Registered Office', value: parsed.address || CONTACT_DETAILS[2].value, href: CONTACT_DETAILS[2].href },
          CONTACT_DETAILS[3],
        ]);
      }
    } catch (e) {
      console.warn('Failed to load contact cms', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await cmsService.addQuoteRequest({
      fullName,
      companyName: 'Quick Inquiry',
      country,
      email,
      phone: 'N/A',
      selectedProducts: 'General Trade Inquiry',
      quantityKg: 'Inquiry',
      message,
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-[#FAF8F5] overflow-hidden"
      style={{ paddingTop: '7rem', paddingBottom: '7rem' }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="label-caps text-[#A18637]">Get In Touch With Trade Experts</span>
          <h2
            id="contact-heading"
            className="font-display font-light text-[#112D15] mt-4 leading-[0.95]"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}
          >
            Start Your
            <br />
            <em className="gold-gradient-text not-italic">Trade Inquiry</em>
          </h2>
          <div className="mx-auto mt-5 luxury-divider w-24" aria-hidden="true" />
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

          {/* Left — Contact details */}
          <address className="not-italic">
            <p className="text-sm text-stone-500 font-light leading-relaxed mb-10 max-w-md">
              Whether you need containerized FOB/CIF pricing, bulk supply contracts, or laboratory samples — our trade specialists respond within 24 hours.
            </p>

            <div className="space-y-4">
              {contactItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group flex items-start gap-4 rounded-2xl bg-white border border-stone-200 p-5 hover:border-[#A18637]/40 hover:shadow-md transition-all duration-300"
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#112D15] border border-[#A18637]/30 text-lg"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <div>
                    <span className="label-caps text-[#A18637]" style={{ fontSize: '0.55rem' }}>
                      {item.label}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-[#112D15] font-light mt-0.5 block hover:text-[#A18637] transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-[#112D15] font-light mt-0.5">{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </address>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-[#A18637]/25 bg-[#112D15] p-8 sm:p-10 text-[#FAF8F5] shadow-2xl relative overflow-hidden"
          >
            {/* Background glow */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
              aria-hidden="true"
              style={{ background: 'radial-gradient(circle, #C5A046, transparent)' }}
            />

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#C5A046]/50 bg-[#C5A046]/10 text-[#C5A046] text-3xl"
                    aria-hidden="true"
                  >
                    ✓
                  </div>
                  <h3 className="font-display text-2xl font-light text-[#FAF8F5]">Message Sent</h3>
                  <p className="mt-3 text-stone-400 text-sm font-light leading-relaxed">
                    Our export desk will respond with specifications and CIF pricing within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="relative space-y-5"
                  initial={{ opacity: 1 }}
                  aria-label="Quick trade inquiry form"
                  noValidate
                >
                  <div>
                    <h3 className="font-display text-2xl font-light text-[#FAF8F5]">Quick Trade Message</h3>
                    <p className="mt-1 text-xs text-stone-400 font-light" id="form-desc">
                      Or open the detailed B2B Quote form below.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="label-caps text-stone-400 mb-1.5 block"
                      style={{ fontSize: '0.55rem' }}
                    >
                      Your Name <span aria-label="required">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="fullName"
                      required
                      aria-required="true"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full rounded-xl border border-[#A18637]/25 bg-[#071309]/60 px-4 py-3 text-xs text-[#FAF8F5] placeholder-stone-600 focus:border-[#C5A046]/60 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="label-caps text-stone-400 mb-1.5 block"
                        style={{ fontSize: '0.55rem' }}
                      >
                        Email <span aria-label="required">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        aria-required="true"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="trade@company.com"
                        className="w-full rounded-xl border border-[#A18637]/25 bg-[#071309]/60 px-4 py-3 text-xs text-[#FAF8F5] placeholder-stone-600 focus:border-[#C5A046]/60 focus:outline-none transition-colors"
                      />
                    </div>
                    {/* Country */}
                    <div>
                      <label
                        htmlFor="contact-country"
                        className="label-caps text-stone-400 mb-1.5 block"
                        style={{ fontSize: '0.55rem' }}
                      >
                        Country / Port <span aria-label="required">*</span>
                      </label>
                      <input
                        id="contact-country"
                        type="text"
                        name="country"
                        required
                        aria-required="true"
                        autoComplete="country-name"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. Dubai / UAE"
                        className="w-full rounded-xl border border-[#A18637]/25 bg-[#071309]/60 px-4 py-3 text-xs text-[#FAF8F5] placeholder-stone-600 focus:border-[#C5A046]/60 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="label-caps text-stone-400 mb-1.5 block"
                      style={{ fontSize: '0.55rem' }}
                    >
                      Message / Volume Requirement
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Grade needed (8.5mm, 8mm...), tonnage, preferred port..."
                      className="w-full rounded-xl border border-[#A18637]/25 bg-[#071309]/60 px-4 py-3 text-xs text-[#FAF8F5] placeholder-stone-600 focus:border-[#C5A046]/60 focus:outline-none resize-none transition-colors"
                    />
                  </div>

                  <div className="pt-1 space-y-3">
                    <button
                      type="submit"
                      className="w-full rounded-xl gold-gradient-bg py-3.5 label-caps text-[#071309] hover:brightness-110 transition-all cursor-pointer"
                      style={{ fontSize: '0.6rem' }}
                    >
                      Send Quick Inquiry
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenQuoteModal()}
                      aria-label="Open the comprehensive B2B quote form"
                      className="w-full rounded-xl border border-[#A18637]/30 bg-transparent py-3.5 label-caps text-[#C5A046] hover:bg-[#A18637]/10 transition-all cursor-pointer"
                      style={{ fontSize: '0.6rem' }}
                    >
                      Open Comprehensive B2B Quote Form →
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
