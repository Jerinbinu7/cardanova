import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MAP_DOTS } from './mapDots';

const VALUE_HIGHLIGHTS = [
  { value: 'Idukki', label: 'Origin Sourcing' },
  { value: 'Retail & Bulk', label: 'Packaging Options' },
  { value: 'Optical', label: 'Sieve Grading' },
  { value: 'Export-Ready', label: 'Trade Supply' },
  { value: 'Vacuum Sealed', label: 'Freshness Retention' },
];

const TIMELINE_STEPS = [
  {
    step: '01',
    svgLogo: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    title: 'Temperature-Controlled Curing',
    desc: 'Precision thermal flue-curing chambers (40–55°C) preserve natural chlorophyll color and volatile oil content.',
  },
  {
    step: '02',
    svgLogo: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
      </svg>
    ),
    title: 'Automated Colour Sorting',
    desc: 'Bichromatic optical sorters and mechanical sieves calibrate diameter (7.0–8.5mm+) and eliminate discoloration.',
  },
  {
    step: '03',
    svgLogo: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'Advanced Laboratory Testing',
    desc: 'Comprehensive analytical screening: volatile oil (>7.5% V/W), moisture (≤9.5%), and full regulatory purity CoAs.',
  },
  {
    step: '04',
    svgLogo: (
      <svg className="w-6 h-6 text-[#C5A046]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
      </svg>
    ),
    title: 'Other Specialised Processing',
    desc: 'De-dusting, husk polishing, and food-grade multi-layer aluminium foil vacuum sealing ready for export dispatch.',
  },
];

const EXPORT_REGIONS = [
  { label: 'Middle East', ports: 'Dubai · Jeddah · Kuwait', x: 580, y: 210 },
  { label: 'Europe', ports: 'Rotterdam · Hamburg', x: 460, y: 120 },
  { label: 'North America', ports: 'New York · Los Angeles', x: 220, y: 150 },
  { label: 'East Asia', ports: 'Singapore · Tokyo', x: 830, y: 200 },
  { label: 'Australia', ports: 'Sydney · Melbourne', x: 840, y: 330 },
];

function AnimatedCounter({ value, suffix, label, index }: {
  value: number; suffix: string; label: string; index: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = 60;
    const inc = () => {
      frame++;
      setCount(Math.min(value, Math.round((value * frame) / totalFrames)));
      if (frame < totalFrames) requestAnimationFrame(inc);
    };
    const timeout = setTimeout(inc, index * 120);
    return () => clearTimeout(timeout);
  }, [inView, value, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center px-4 py-6"
    >
      <div
        className="font-display font-light gold-gradient-text leading-none"
        style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)' }}
      >
        {count.toLocaleString()}
        <span className="text-2xl">{suffix}</span>
      </div>
      <p className="label-caps text-stone-400 mt-2" style={{ fontSize: '0.6rem' }}>{label}</p>
    </motion.div>
  );
}

export default function ExportExperience() {
  return (
    <section
      id="export-experience"
      className="relative bg-[#FAF8F5] overflow-hidden"
    >
      {/* Story Banner */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden flex items-center justify-center">
        <img
          src="/images/export-experience-bg.jpg"
          alt="Idukki Cardamom Estate"
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071309]/60 via-transparent to-[#071309]/70" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <span className="label-caps text-[#C5A046]">A Story of Idukki Heritage & Excellence</span>
          <blockquote
            className="font-display font-light text-[#FAF8F5] mt-6 leading-[1.1]"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3.8rem)' }}
          >
            From the mist-covered hills
            <br />
            of <em className="animate-shimmer not-italic">Idukki, Kerala</em> to tables worldwide.
          </blockquote>
          <p className="mt-5 text-stone-300/70 text-sm font-light max-w-md mx-auto leading-relaxed">
            Every pod carries the story of Kerala's land, its dedicated farmers, and our commitment to authentic spice trade.
          </p>
        </motion.div>
      </div>

      {/* Value Highlights Strip */}
      <div className="bg-[#112D15] py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-[#A18637]/20 text-center">
            {VALUE_HIGHLIGHTS.map((s, i) => (
              <div key={i} className="px-3 py-3">
                <div className="font-display font-light text-xl sm:text-2xl gold-gradient-text leading-tight">
                  {s.value}
                </div>
                <div className="label-caps text-stone-400 mt-1" style={{ fontSize: '0.55rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="luxury-divider" />
      </div>

      {/* Farm-to-Export Timeline */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <div className="text-center mb-16">
          <span className="label-caps text-[#A18637]">Quality Management Protocol</span>
          <h2
            className="font-display font-light text-[#112D15] mt-3 leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Farm to <em className="gold-gradient-text not-italic">Export Port Journey</em>
          </h2>
          <p className="text-sm text-stone-500 mt-3 font-light">
            Six carefully managed stages from origin sourcing to export dispatch.
          </p>
        </div>

        {/* Timeline steps with SVG Logos */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-8 left-0 right-0 h-[1px] hidden lg:block"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(197,160,70,0.3), transparent)' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIMELINE_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                {/* Step SVG Logo Container */}
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#A18637]/40 bg-[#071309] shadow-lg group-hover:border-[#C5A046] group-hover:shadow-[0_0_25px_rgba(197,160,70,0.25)] transition-all duration-300">
                    {step.svgLogo}
                  </div>
                  <span className="absolute -top-2 -right-2 font-display text-xs gold-gradient-text font-bold">
                    {step.step}
                  </span>
                </div>

                <h4 className="font-display text-lg font-light text-[#112D15] group-hover:text-[#A18637] transition-colors leading-tight">
                  {step.title}
                </h4>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed font-light">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* World Map / Shipping Routes */}
      <div className="bg-[#071309] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="label-caps text-[#C5A046]">Worldwide Trade Reach</span>
              <h3
                className="font-display font-light text-[#FAF8F5] mt-3 leading-[0.95]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
              >
                Global Shipping Connectivity
              </h3>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed font-light">
              Shipments can be arranged from Indian ports to major international destinations through established freight and logistics partners.
            </p>
          </div>

          {/* World Map SVG */}
          <div className="relative rounded-2xl overflow-hidden border border-[#A18637]/20"
            style={{ background: 'rgba(17,45,21,0.3)', aspectRatio: '16/7' }}>

            <svg
              viewBox="0 0 1000 440"
              className="w-full h-full"
              style={{ fill: 'none' }}
            >
              {/* Dotted World Map Matrix */}
              {MAP_DOTS.map((dot, idx) => (
                <circle
                  key={idx}
                  cx={dot.x}
                  cy={dot.y}
                  r="1.2"
                  fill="rgba(197, 160, 70, 0.16)"
                  style={{
                    opacity: 0.35 + (idx % 5) * 0.15,
                  }}
                />
              ))}

              {/* Grid lines */}
              {[100, 200, 300].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y}
                  stroke="rgba(197,160,70,0.04)" strokeWidth="1" strokeDasharray="4 8" />
              ))}
              {[200, 400, 600, 800].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="440"
                  stroke="rgba(197,160,70,0.04)" strokeWidth="1" strokeDasharray="4 8" />
              ))}

              {/* Origin marker (Idukki, India) */}
              <g>
                <circle cx="662" cy="230" r="10" fill="none" stroke="#C5A046" strokeWidth="1.5" opacity="0.5">
                  <animate attributeName="r" values="10;20;10" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="662" cy="230" r="5" fill="#C5A046" />
                <text x="672" y="225" fill="#FAF8F5" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="600">
                  Idukki, India (Origin)
                </text>
              </g>

              {/* Shipping routes & flowing cargo packets */}
              {EXPORT_REGIONS.map((region, i) => {
                const pathLength = 300;
                const pathD = `M662,230 Q${(662 + region.x) / 2},${Math.min(region.y, 230) - 50} ${region.x},${region.y}`;
                return (
                  <g key={i}>
                    {/* Underlying static route path */}
                    <path
                      d={pathD}
                      stroke="rgba(197,160,70,0.18)"
                      strokeWidth="1.2"
                      fill="none"
                    />
                    
                    {/* Flowing animated route dash line */}
                    <path
                      d={pathD}
                      stroke="#C5A046"
                      strokeWidth="1.5"
                      strokeDasharray={`${pathLength} ${pathLength}`}
                      strokeDashoffset={pathLength}
                      fill="none"
                      opacity="0.65"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values={`${pathLength};0;${pathLength}`}
                        dur={`${3.5 + i * 0.8}s`}
                        repeatCount="indefinite"
                        begin={`${i * 0.4}s`}
                      />
                    </path>

                    {/* Cargo light packet flowing smoothly along Bezier path */}
                    <circle r="2.2" fill="#FAF8F5" style={{ filter: 'drop-shadow(0 0 4px rgba(197,160,70,0.8))' }}>
                      <animateMotion
                        path={pathD}
                        dur={`${2.2 + i * 0.6}s`}
                        repeatCount="indefinite"
                        begin={`${i * 0.5}s`}
                      />
                    </circle>

                    {/* Destination hub pulsing marker */}
                    <circle cx={region.x} cy={region.y} r="6" fill="none" stroke="#C5A046" strokeWidth="1" opacity="0.6">
                      <animate attributeName="r" values="4;12;4" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={region.x} cy={region.y} r="3" fill="#C5A046" />

                    <text
                      x={region.x + 8}
                      y={region.y + 3}
                      fill="#C5A046"
                      fontSize="8.5"
                      fontFamily="Inter,sans-serif"
                      fontWeight="500"
                    >
                      {region.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Destination market tags */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Oman', gold: true },
              { label: 'UAE', gold: true },
              { label: 'GCC', gold: true },
              { label: 'International Markets', gold: true },
            ].map((tag, i) => (
              <span
                key={i}
                className={`rounded-full px-4 py-1.5 label-caps flex items-center gap-1.5 ${
                  tag.gold
                    ? 'gold-gradient-bg text-[#071309] font-medium'
                    : 'border border-[#A18637]/30 bg-[#112D15]/60 text-stone-300'
                }`}
                style={{ fontSize: '0.58rem' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A046]" />
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
