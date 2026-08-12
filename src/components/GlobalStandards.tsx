import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Leaf, ShieldCheck, FileText, Award } from 'lucide-react';
import { getCertifications } from '../services/certificationsService';
import type { CertificationRow } from '../types/database';

const DEFAULT_CERTIFICATIONS = [
  {
    code: 'APEDA',
    fullName: 'Agricultural & Processed Food Export Authority',
    authority: 'Government of India',
    icon: <Building2 className="w-6 h-6" />,
    badge: 'Verified Exporter',
  },
  {
    code: 'Spices Board',
    fullName: 'Spices Board Registration',
    authority: 'Ministry of Commerce & Industry',
    icon: <Leaf className="w-6 h-6" />,
    badge: 'Govt. Authenticated',
  },
  {
    code: 'FSSAI',
    fullName: 'Food Safety Standards Authority',
    authority: 'FSSAI No. 11322007000342',
    icon: <ShieldCheck className="w-6 h-6" />,
    badge: 'Food Safety Passed',
  },
  {
    code: 'IEC',
    fullName: 'Import Export Code',
    authority: 'DGFT · Ministry of Commerce',
    icon: <FileText className="w-6 h-6" />,
    badge: 'Licensed Trader',
  },
  {
    code: 'ISO / HACCP',
    fullName: 'Hazard Analysis Critical Control Points',
    authority: 'International Standards',
    icon: <Award className="w-6 h-6" />,
    badge: 'ISO Compliant',
  },
];

export default function GlobalStandards() {
  const [certifications, setCertifications] = useState(DEFAULT_CERTIFICATIONS);

  useEffect(() => {
    getCertifications(true).then((dbCerts) => {
      if (dbCerts && dbCerts.length > 0) {
        const mapped = dbCerts.map((c, idx) => ({
          code: c.title,
          fullName: c.issuing_body || c.title,
          authority: c.description || 'Verified Certification',
          icon: DEFAULT_CERTIFICATIONS[idx % DEFAULT_CERTIFICATIONS.length].icon,
          badge: 'Verified Exporter',
        }));
        setCertifications(mapped);
      }
    }).catch((e) => {
      console.warn('Failed to load certifications from Supabase', e);
    });
  }, []);

  return (
    <section id="standards" className="relative bg-[#FAF8F5] overflow-hidden"
      style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>


      {/* Faint dot grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #112D15 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="label-caps text-[#A18637]">Regulatory Compliance & Quality Assured</span>
          <h2
            className="font-display font-light text-[#112D15] mt-3 leading-[0.95]"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}
          >
            Global Export
            <br />
            <em className="gold-gradient-text not-italic">Certifications</em>
          </h2>
          <div className="mx-auto mt-6 luxury-divider w-24" />
          <p className="mt-5 text-sm text-stone-500 font-light leading-relaxed">
            Every shipment includes certificates of origin, phytosanitary analysis, and lab test reports.
          </p>
        </motion.div>

        {/* Certification Cards — horizontal trust bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {certifications.map((cert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative rounded-2xl bg-white border border-stone-200 p-6 hover:border-[#C5A046]/40 hover:shadow-xl transition-all duration-400 flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#A18637]/30 bg-[#FAF8F5] text-[#A18637] group-hover:border-[#C5A046]/60 group-hover:bg-[#FDF9F0] group-hover:text-[#C5A046] transition-colors">
                {cert.icon}
              </div>

              {/* Code */}
              <span className="label-caps text-[#A18637] mb-1">{cert.code}</span>

              {/* Full name */}
              <h3 className="font-display text-base font-light text-[#112D15] leading-snug">
                {cert.fullName}
              </h3>

              {/* Authority */}
              <p className="mt-2 text-[10px] text-stone-400 font-light">{cert.authority}</p>

              {/* Verified badge */}
              <div className="mt-4 flex items-center gap-1.5 rounded-full border border-[#A18637]/30 bg-[#FAF8F5] px-3 py-1">
                <span className="text-[#A18637] text-xs">✓</span>
                <span className="label-caps text-[#A18637]" style={{ fontSize: '0.52rem' }}>Verified</span>
              </div>

              {/* Hover bottom bar */}
              <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full w-0 group-hover:w-[calc(100%-2rem)] transition-all duration-500"
                style={{ background: 'linear-gradient(90deg, #C5A046, #E2BF63)' }} />
            </motion.div>
          ))}
        </div>

        {/* Full-width brand proof image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 relative rounded-3xl overflow-hidden border border-[#A18637]/20 shadow-2xl"
          style={{ height: '340px' }}
        >
          <img
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop"
            alt="Cardanova Export Processing"
            className="h-full w-full object-cover brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071309]/80 via-transparent to-[#071309]/40" />

          <div className="absolute inset-0 flex items-center px-10 lg:px-16">
            <div className="max-w-lg">
              <span className="label-caps text-[#C5A046]">Our Commitment</span>
              <h3 className="font-display font-light text-[#FAF8F5] mt-3 leading-[1.05]"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)' }}>
                "Zero compromise on quality.
                <br />
                <em className="animate-shimmer not-italic">Every single shipment."</em>
              </h3>
              <p className="mt-4 text-xs text-stone-300/80 leading-relaxed font-light max-w-xs">
                Lab test reports, pesticide residue analysis, and moisture certificates available on request.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
