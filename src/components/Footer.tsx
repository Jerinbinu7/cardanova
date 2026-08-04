import { useEffect, useState } from 'react';
import MagneticButton from './MagneticButton';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'about' | 'products' | 'origin' | 'admin') => void;
  onOpenQuoteModal: (grade?: string) => void;
}

export default function Footer({ setActiveTab, onOpenQuoteModal }: FooterProps) {
  const [address, setAddress] = useState('Cardanova Spices LLP, Kattappana, Idukki District, Kerala — 685508, India');
  const [email, setEmail] = useState('trade@cardanovaspices.com');
  const [phone, setPhone] = useState('+91 96568 66090');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cardanova_contact_cms');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.emailSales) setEmail(parsed.emailSales);
        if (parsed.phonePrimary || parsed.whatsAppNumber) setPhone(parsed.phonePrimary || parsed.whatsAppNumber);
      }
    } catch (e) {
      console.warn('Failed to parse footer contact cms', e);
    }
  }, []);

  return (
    <footer
      className="relative bg-[#071309] text-[#FAF8F5] overflow-hidden"
      aria-label="Site footer"
    >
      {/* Subtle botanical watermark */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(197,160,70,0.8) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      <div
        className="absolute bottom-0 right-0 text-[20rem] opacity-[0.025] leading-none pointer-events-none select-none font-display font-light"
        style={{ color: '#C5A046' }}
        aria-hidden="true"
      >
        🌿
      </div>

      {/* Top CTA strip */}
      <div className="border-b border-[#A18637]/20 py-14 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <span className="label-caps text-[#C5A046]">Ready to Source?</span>
            <h2
              className="font-display font-light text-[#FAF8F5] mt-3 leading-[0.95]"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)' }}
            >
              Let's build a long-term
              <br />
              <em className="animate-shimmer not-italic">trade partnership.</em>
            </h2>
          </div>

          <MagneticButton
            as="button"
            onClick={() => onOpenQuoteModal()}
            cursorLabel="Quote"
            aria-label="Request a trade quote — open the B2B quote form"
            className="rounded-full gold-gradient-bg px-9 py-4 label-caps text-[#071309] shadow-2xl hover:brightness-110 transition-all cursor-pointer gold-glow whitespace-nowrap"
          >
            Request a Trade Quote →
          </MagneticButton>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-[#A18637]/15">

          {/* Brand column */}
          <div className="md:col-span-1">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3.5 mb-6 text-left group cursor-pointer"
              aria-label="Cardanova Spices LLP — Go to homepage"
            >
              <img
                src="/images/cardanova-emblem.png"
                alt="Cardanova Spices Emblem"
                width={538}
                height={470}
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <img
                src="/images/cardanova-wordmark-light.png"
                alt="Cardanova Spices — Exporting Nature's Finest"
                width={944}
                height={232}
                className="h-10 w-auto object-contain"
              />
            </button>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              Premier B2B green cardamom exporter. Single-origin luxury spices from Idukki, Kerala to global markets.
            </p>

            {/* Certifications */}
            <div className="mt-6 flex flex-wrap gap-1.5" aria-label="Export certifications">
              {['APEDA', 'Spices Board', 'FSSAI', 'IEC'].map((cert) => (
                <span
                  key={cert}
                  className="rounded-full border border-[#A18637]/25 px-2.5 py-1 text-[#A18637]"
                  style={{ fontSize: '0.55rem', letterSpacing: '0.08em' }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <h3 className="label-caps text-[#C5A046] mb-5">Navigation</h3>
            <ul className="space-y-3 text-xs text-stone-400">
              {[
                { label: 'Home', action: () => setActiveTab('home') },
                { label: 'Products & Catalogue', action: () => setActiveTab('products') },
                { label: 'About Us', action: () => setActiveTab('about') },
                { label: 'Our Origin', action: () => setActiveTab('origin') },
                { label: 'Request Trade Quote', action: () => onOpenQuoteModal() },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    aria-label={`Go to ${item.label}`}
                    className="hover:text-[#C5A046] transition-colors cursor-pointer font-light"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Grades */}
          <nav aria-label="Cardamom grades">
            <h3 className="label-caps text-[#C5A046] mb-5">Cardamom Grades</h3>
            <ul className="space-y-3 text-xs text-stone-400 font-light">
              {[
                '8.5 mm Extra Bold',
                '8.0 mm Premium Bold',
                '7.5 mm Export Grade',
                '7.0 mm Commercial Grade',
                'Mixed Grade (AGEB/LGB)',
                'Extraction Grade (Oil)',
              ].map((g) => (
                <li key={g}>
                  <button
                    onClick={() => setActiveTab('products')}
                    aria-label={`View ${g} cardamom grade`}
                    className="hover:text-[#C5A046] transition-colors cursor-pointer text-left"
                  >
                    {g}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <address className="not-italic">
            <h3 className="label-caps text-[#C5A046] mb-5">Export Operations</h3>
            <div className="space-y-4 text-xs text-stone-400 font-light leading-relaxed">
              <p>
                <span className="text-stone-500 block label-caps mb-1" style={{ fontSize: '0.5rem' }}>Registered Address</span>
                {address}
              </p>
              <p>
                <span className="text-stone-500 block label-caps mb-1" style={{ fontSize: '0.5rem' }}>Export Inquiry</span>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-[#C5A046] transition-colors"
                  aria-label={`Send email to ${email}`}
                >
                  {email}
                </a>
              </p>
              <p>
                <span className="text-stone-500 block label-caps mb-1" style={{ fontSize: '0.5rem' }}>Phone / WhatsApp</span>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="hover:text-[#C5A046] transition-colors"
                  aria-label={`Call ${phone}`}
                >
                  {phone}
                </a>
              </p>
            </div>
          </address>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600 font-light">
            <small>© {new Date().getFullYear()} Cardanova Spices LLP. All Rights Reserved.</small>
          </p>
          <nav aria-label="Legal navigation" className="flex items-center gap-6 text-xs text-stone-600">
            <span className="hover:text-[#C5A046] transition-colors cursor-pointer">Terms of Trade</span>
            <span className="hover:text-[#C5A046] transition-colors cursor-pointer">Privacy Policy</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-[#C5A046] transition-colors cursor-pointer font-medium text-[#C5A046]/80 flex items-center gap-1"
              aria-label="Access admin portal"
            >
              Admin Portal 🔒
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
