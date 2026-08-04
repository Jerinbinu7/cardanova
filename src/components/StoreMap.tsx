import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=10%2F526%2C+Senapathy+PO%2C+Pallikunnu%2C+Rajakumary%2C+Idukki%2C+Kerala+685619';

export default function StoreMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard
      .writeText('10/526, Senapathy PO, Pallikunnu, Rajakumary, Idukki, Kerala 685619, India')
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <section
      ref={sectionRef}
      id="store-location"
      className="relative overflow-hidden bg-[#071309]"
    >
      {/* Gold top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A046]/50 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Compact header row */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{ background: 'rgba(197,160,70,0.12)', border: '1px solid rgba(197,160,70,0.25)' }}>
            <span className="text-base">📍</span>
          </div>
          <div>
            <p className="text-[#C5A046] text-[0.6rem] tracking-[0.2em] uppercase leading-none mb-0.5">
              Find Us
            </p>
            <h2 className="font-serif font-light text-[#FAF8F5] text-lg leading-tight">
              Our <em className="not-italic text-[#C5A046]">Estate Location</em>
            </h2>
          </div>
        </motion.div>

        {/* Map + Info row */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">

          {/* Map */}
          <motion.div
            className="lg:w-[55%] relative rounded-xl overflow-hidden flex-shrink-0"
            style={{ height: '240px' }}
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            {/* Border overlay */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none z-10"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(197,160,70,0.22)' }}
            />
            {/* Loading state */}
            {!mapLoaded && (
              <div className="absolute inset-0 bg-[#112D15]/80 animate-pulse flex items-center justify-center z-20">
                <span className="text-[#C5A046]/50 text-xs tracking-widest uppercase">Loading map…</span>
              </div>
            )}
            <iframe
              title="Cardanova Spices Store Location"
              src="https://maps.google.com/maps?q=10/526,+Senapathy+PO,+Pallikunnu,+Rajakumary,+Idukki,+Kerala+685619&output=embed&z=15"
              className="w-full h-full"
              style={{ border: 'none', filter: 'saturate(0.8) contrast(1.08)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
              allowFullScreen
            />
          </motion.div>

          {/* Info panel */}
          <motion.div
            className="lg:flex-1 flex flex-col justify-between gap-4"
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            {/* Address block */}
            <div
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(197,160,70,0.16)',
              }}
            >
              {/* Address */}
              <div>
                <p className="text-[#C5A046] text-[0.58rem] tracking-[0.18em] uppercase mb-1">Address</p>
                <p className="text-[#FAF8F5]/85 text-sm leading-relaxed font-light">
                  10/526, Senapathy PO, Pallikunnu,<br />
                  Rajakumary, Idukki, Kerala — 685619
                </p>
              </div>

              <div className="h-px bg-[#C5A046]/10" />

              {/* Region + Hours in one row */}
              <div className="flex gap-6">
                <div>
                  <p className="text-[#C5A046] text-[0.58rem] tracking-[0.18em] uppercase mb-1">Region</p>
                  <p className="text-[#FAF8F5]/70 text-xs font-light leading-relaxed">
                    Idukki, Western Ghats<br />
                    <span className="text-[#FAF8F5]/40">~1,200 m elevation</span>
                  </p>
                </div>
                <div>
                  <p className="text-[#C5A046] text-[0.58rem] tracking-[0.18em] uppercase mb-1">Hours</p>
                  <p className="text-[#FAF8F5]/70 text-xs font-light leading-relaxed">
                    Mon – Sat, 9 AM – 6 PM<br />
                    <span className="text-[#FAF8F5]/40">IST (UTC +5:30)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="store-map-get-directions"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #C5A046, #E2BF63)',
                  color: '#071309',
                  letterSpacing: '0.04em',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8.25 8.25 0 00-16.5 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Get Directions
              </a>

              <button
                onClick={handleCopyAddress}
                id="store-map-copy-address"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-300"
                style={{
                  background: 'rgba(197,160,70,0.07)',
                  border: '1px solid rgba(197,160,70,0.28)',
                  color: '#C5A046',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(197,160,70,0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(197,160,70,0.07)';
                }}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 013.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0121 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 017.5 16.125V3.375z" />
                      <path d="M15 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0017.25 7.5h-1.875A.375.375 0 0115 7.125V5.25zM4.875 6H6v10.125A3.375 3.375 0 009.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V7.875C3 6.839 3.84 6 4.875 6z" />
                    </svg>
                    Copy Address
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gold bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A046]/40 to-transparent" />
    </section>
  );
}
