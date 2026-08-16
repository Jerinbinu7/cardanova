import { useEffect, useState } from 'react';
import MagneticButton from './MagneticButton';
import { getContactInfo } from '../services/contactService';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'about' | 'products' | 'origin' | 'admin') => void;
  onOpenQuoteModal: (grade?: string) => void;
}

const DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=10%2F526%2C+Senapathy+PO%2C+Pallikunnu%2C+Rajakumary%2C+Idukki%2C+Kerala+685619';

export default function Footer({ setActiveTab, onOpenQuoteModal }: FooterProps) {
  const [address, setAddress] = useState('Cardanova Spices LLP, Kattappana, Idukki District, Kerala — 685508, India');
  const [email, setEmail] = useState('trade@cardanovaspices.com');
  const [phone, setPhone] = useState('+91 96568 66090');

  useEffect(() => {
    getContactInfo().then((cms) => {
      if (cms) {
        if (cms.address) setAddress(cms.address);
        if (cms.email || cms.inquiry_email) setEmail(cms.email || cms.inquiry_email || '');
        if (cms.phone || cms.whatsapp) setPhone(cms.phone || cms.whatsapp || '');
      }
    }).catch((e) => {
      console.warn('Failed to fetch contact info', e);
    });
  }, []);


  return (
    <footer
      className="relative bg-[#071309] text-[#FAF8F5] overflow-hidden"
      aria-label="Site footer"
    >
      {/* Dot pattern */}
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

      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-14 pb-10">

        {/* ── Top half: left brand + right contact+map ── */}
        <div className="flex flex-col lg:flex-row gap-12 pb-12 border-b border-[#A18637]/15">

          {/* Left: Brand + Nav + Grades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-8 sm:gap-10 lg:gap-16 flex-1 items-start">

            {/* Brand */}
            <div className="w-full sm:w-[200px] flex-shrink-0">
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-3 mb-5 text-left group cursor-pointer"
                aria-label="Cardanova Spices LLP — Go to homepage"
              >
                <img
                  src="/images/cardanova-emblem.png"
                  alt="Cardanova Spices Emblem"
                  width={538}
                  height={470}
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <img
                  src="/images/cardanova-wordmark-light.png"
                  alt="Cardanova Spices — Exporting Nature's Finest"
                  width={944}
                  height={232}
                  className="h-8 w-auto object-contain"
                />
              </button>
              <p className="text-xs text-stone-500 leading-relaxed font-light mb-5">
                Premier B2B green cardamom exporter. Single-origin luxury spices from Idukki, Kerala to global markets.
              </p>
              <div className="flex flex-wrap gap-1.5" aria-label="Export certifications">
                {['APEDA', 'Spices Board', 'FSSAI', 'IEC'].map((cert) => (
                  <span
                    key={cert}
                    translate="no"
                    className="rounded-full border border-[#A18637]/25 px-2.5 py-1 text-[#A18637] notranslate"
                    style={{ fontSize: '0.55rem', letterSpacing: '0.08em' }}
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <nav className="w-full sm:w-[150px] flex-shrink-0" aria-label="Footer navigation">
              <h3 className="label-caps text-[#C5A046] mb-4">Navigation</h3>
              <ul className="space-y-3 text-xs text-stone-400">
                {[
                  { label: 'Home', action: () => setActiveTab('home') },
                  { label: 'Products', action: () => setActiveTab('products') },
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
            <nav className="w-full sm:w-[170px] flex-shrink-0" aria-label="Cardamom grades">
              <h3 className="label-caps text-[#C5A046] mb-4">Cardamom Grades</h3>
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
          </div>

          {/* Right: Export Operations + Map */}
          <address className="lg:w-[320px] flex-shrink-0 not-italic mt-4 sm:mt-0">
            <h3 className="label-caps text-[#C5A046] mb-4">Export Operations</h3>

            {/* Contact details */}
            <div className="space-y-3 mb-5">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#C5A046' }}>
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8.25 8.25 0 00-16.5 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-stone-400 font-light leading-relaxed" translate="no">{address}</p>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                  className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#C5A046' }}>
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                <a href={`tel:${phone.replace(/\s/g, '')}`} translate="no" className="notranslate text-xs text-stone-400 font-light hover:text-[#C5A046] transition-colors">{phone}</a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                  className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#C5A046' }}>
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                <a href={`mailto:${email}`} translate="no" className="notranslate text-xs text-stone-400 font-light hover:text-[#C5A046] transition-colors">{email}</a>
              </div>
            </div>

            {/* Map */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                height: '170px',
                border: '1px solid rgba(197,160,70,0.18)',
              }}
            >
              <iframe
                title="Cardanova Store Location"
                src="https://maps.google.com/maps?q=10/526,+Senapathy+PO,+Pallikunnu,+Rajakumary,+Idukki,+Kerala+685619&output=embed&z=15"
                width="100%"
                height="100%"
                style={{ border: 'none', display: 'block', filter: 'grayscale(30%) contrast(1.05)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Directions link */}
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="footer-get-directions"
              className="mt-2 inline-flex items-center gap-1 text-stone-500 hover:text-[#C5A046] transition-colors"
              style={{ fontSize: '0.62rem', letterSpacing: '0.08em' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zM10 2.75a.75.75 0 01.75-.75h6.5a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0V4.56l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47H10.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Open in Google Maps
            </a>
          </address>
        </div>

        {/* Bottom bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600 font-light">
            <small>© {new Date().getFullYear()} Cardanova Spices LLP. All Rights Reserved.</small>
          </p>
          <nav aria-label="Legal navigation" className="flex items-center gap-6 text-xs text-stone-600">
            <span className="hover:text-[#C5A046] transition-colors cursor-pointer">Terms of Trade</span>
            <span className="hover:text-[#C5A046] transition-colors cursor-pointer">Privacy Policy</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
