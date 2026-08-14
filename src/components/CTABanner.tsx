import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { getContactInfo } from '../services/contactService';

interface CTABannerProps {
  onOpenQuoteModal: (grade?: string) => void;
  onNavigateToProducts: () => void;
}

export default function CTABanner({ onOpenQuoteModal, onNavigateToProducts }: CTABannerProps) {
  const [waNumber, setWaNumber] = useState('919656866090');

  useEffect(() => {
    getContactInfo().then((info) => {
      if (info?.whatsapp || info?.phone) {
        const clean = (info.whatsapp || info.phone || '').replace(/\D/g, '');
        if (clean) setWaNumber(clean);
      }
    }).catch(() => {});
  }, []);

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${waNumber}?text=Hello%20Cardanova%20Spices%2C%20I%20would%20like%20to%20inquire%20about%20cardamom%20export%20rates.`,
      '_blank'
    );
  };


  return (
    <section className="relative overflow-hidden" style={{ minHeight: '560px', height: 'auto' }}>
      {/* Full-bleed background */}
      <img
        src="/images/cardamom-hero-1.jpg"
        alt="Cardamom"
        className="absolute inset-0 h-full w-full object-cover animate-slow-zoom brightness-[0.3]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071309]/90 via-[#071309]/70 to-[#071309]/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071309]/80 via-transparent to-[#071309]/40" />

      {/* Floating gold particles */}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="animate-float-particle absolute rounded-full"
          style={{
            width: `${4 + (i % 4) * 3}px`,
            height: `${4 + (i % 4) * 3}px`,
            left: `${6 + i * 9}%`,
            bottom: `${10 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${8 + i * 1.3}s`,
            background: 'radial-gradient(circle, rgba(197,160,70,0.5), transparent)',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <span className="label-caps text-[#C5A046]">
              Start Your International Trade Partnership
            </span>

            <h2
              className="font-display font-light text-[#FAF8F5] mt-5 leading-[0.92]"
              style={{ fontSize: 'clamp(3rem, 7vw, 6.5rem)' }}
            >
              The World's Finest
              <br />
              <em className="animate-shimmer not-italic">Cardamom,</em>
              <br />
              Ready to Ship.
            </h2>

            <p className="mt-7 text-stone-300/80 text-sm font-light leading-relaxed max-w-md">
              Partner directly with Cardanova Spices LLP — guaranteed high-grade green cardamom, competitive FOB/CIF pricing, and on-time global delivery.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
              <MagneticButton
                as="button"
                onClick={() => onOpenQuoteModal()}
                cursorLabel="Quote"
                className="rounded-full gold-gradient-bg px-9 py-4 label-caps text-[#071309] shadow-2xl hover:brightness-110 transition-all cursor-pointer gold-glow"
              >
                Request Quote Now
              </MagneticButton>

              <MagneticButton
                as="button"
                onClick={handleWhatsApp}
                cursorLabel="WhatsApp"
                className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-8 py-4 label-caps text-emerald-300 hover:bg-emerald-900/70 hover:border-emerald-400/60 transition-all cursor-pointer backdrop-blur-sm"
              >
                💬 WhatsApp Us
              </MagneticButton>

              <MagneticButton
                as="button"
                onClick={onNavigateToProducts}
                cursorLabel="Catalogue"
                className="rounded-full border border-white/15 bg-white/5 px-8 py-4 label-caps text-[#FAF8F5] hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
              >
                Download Catalogue ↓
              </MagneticButton>
            </div>
          </motion.div>
          <div className="py-12 sm:py-0" />
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF8F5] to-transparent" />
    </section>
  );
}
