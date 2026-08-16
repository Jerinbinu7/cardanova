import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from './MagneticButton';
import { getAboutContent } from '../services/aboutService';

interface AboutPageProps {
  onOpenQuoteModal: (grade?: string) => void;
  onNavigateToProducts: () => void;
}

const FOUNDERS = [
  {
    name: 'Akhilkumar K A',
    position: 'Co-Founder',
    photo: '/images/founder-akhilkumar.jpg',
    intro:
      'A passionate entrepreneur dedicated to delivering premium-quality spices while building lasting relationships with customers and farmers. With a strong focus on quality, transparency, and innovation, he believes every shipment represents the trust of the Cardanova brand.',
    quote: '"Every shipment carries the trust of our brand and the hard work of Kerala\'s spice farmers."',
    social: {
      linkedin: 'https://linkedin.com',
      facebook: 'https://facebook.com',
      email: 'akhilkumar@cardanovaspices.com',
    },
  },
  {
    name: 'Amal Babu',
    position: 'Co-Founder',
    photo: '/images/founder-amal.jpg',
    intro:
      'Driven by a vision to connect the finest spices of Kerala with international markets, Amal focuses on customer relationships, business growth, and ensuring every buyer experiences the authenticity and reliability that define Cardanova.',
    quote: '"Building a global brand means ensuring every buyer experiences the pure authenticity of our origin."',
    social: {
      linkedin: 'https://linkedin.com',
      facebook: 'https://facebook.com',
      email: 'amal@cardanovaspices.com',
    },
  },
];

const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6 text-[#A18637]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 012-2h1.055M11 20a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    ),
    title: 'Authenticity',
    desc: 'Premium spices sourced responsibly from trusted plantations and farmers.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#A18637]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Trust',
    desc: 'Building long-term partnerships through honesty and transparency.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#A18637]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Quality',
    desc: 'Every batch is carefully selected, graded, and prepared to meet international standards.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#A18637]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: 'Global Reach',
    desc: "Connecting Kerala's finest spices with businesses around the world.",
  },
];


const JOURNEY_STAGES = [
  {
    step: '01',
    title: 'Dream',
    subtitle: 'Growing up surrounded by the rich spice heritage in the high ranges of Idukki.',
  },
  {
    step: '02',
    title: 'Building Relationships with Farmers',
    subtitle: 'Partnering directly with local smallholders to ensure fair trade and peak pod freshness.',
  },
  {
    step: '03',
    title: 'Establishing Cardanova',
    subtitle: 'Creating a modern, quality-first export brand built on transparency and precision grading.',
  },
  {
    step: '04',
    title: 'Serving Global Buyers',
    subtitle: 'Delivering containerized export shipments to importers, wholesalers, and manufacturers worldwide.',
  },
  {
    step: '05',
    title: 'Growing Together',
    subtitle: 'Expanding our international reach while honoring our roots and farmer partnerships.',
  },
];

export default function AboutPage({ onOpenQuoteModal, onNavigateToProducts: _onNavigateToProducts }: AboutPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [story, setStory] = useState('Cardanova was founded by two passionate entrepreneurs who grew up surrounded by the rich spice heritage of Idukki, Kerala. Inspired by the quality of locally grown cardamom and the dedication of hardworking farmers, they shared a vision of bringing authentic Indian spices to buyers across the world.');
  const [vision, setVision] = useState('Our vision is to become one of India\'s most trusted spice exporters by combining authentic sourcing, uncompromising quality, and exceptional customer relationships.');
  const [founders, setFounders] = useState(FOUNDERS);

  const [heroBg, setHeroBg] = useState('/images/about-hero.jpg');
  const [beginningImage, setBeginningImage] = useState('/images/cardamom-hero-1.jpg');

  useEffect(() => {
    getAboutContent().then((cms) => {
      if (cms) {
        if (cms.company_story) setStory(cms.company_story);
        if (cms.vision) setVision(cms.vision);
        if (cms.history && cms.history.startsWith('http')) setHeroBg(cms.history);
        if (cms.founders && cms.founders.length > 0) {
          setFounders(cms.founders.map((f: any, idx: number) => {
            const founderName = f.name?.trim() ? f.name : (idx === 0 ? 'Akhilkumar K A' : idx === 1 ? 'Amal Babu' : `Founder ${idx + 1}`);
            const defaultPhoto = idx === 0 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop';
            return {
              name: founderName,
              position: f.position || 'Co-Founder',
              photo: f.photo !== undefined ? f.photo : defaultPhoto,
              intro: f.intro || (idx === 0 ? FOUNDERS[0].intro : FOUNDERS[1].intro),
              quote: f.quote || (idx === 0 ? FOUNDERS[0].quote : FOUNDERS[1].quote),
              social: {
                linkedin: f.linkedin || 'https://linkedin.com',
                facebook: f.facebook || 'https://facebook.com',
                email: f.email || (idx === 0 ? 'akhilkumar@cardanovaspices.com' : 'amal@cardanovaspices.com'),
              },
            };
          }));
        }
      }
    }).catch((e) => {
      console.warn('Failed to fetch about CMS content', e);
    });

    import('../services/galleryService').then(({ getGalleryItems }) => {
      getGalleryItems('about_hero').then((items) => {
        if (items && items.length > 0 && items[0].image_url) {
          setHeroBg(items[0].image_url);
        }
      });
      getGalleryItems('about_beginning').then((items) => {
        if (items && items.length > 0 && items[0].image_url) {
          setBeginningImage(items[0].image_url);
        }
      });
    }).catch(() => {});
  }, []);



  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleContactClick = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenQuoteModal();
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#112D15] min-h-screen overflow-hidden">
      {/* ── 1. HERO SECTION ───────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden flex items-center justify-center text-center"
        style={{ height: '80vh', minHeight: '520px', paddingTop: '5rem' }}
      >
        {/* Slow Parallax Plantation Image */}
        <motion.img
          src={heroBg}
          alt="Misty cardamom plantation hills in Idukki, Kerala — the origin of Cardanova spices"
          width={2070}
          height={1380}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.32]"
          style={{ y: heroY }}
        />

        {/* Gradient overlays for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071309]/70 via-transparent to-[#071309]" />

        {/* Content with Fade-In Animation */}
        <motion.div
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 max-w-4xl px-6 mx-auto"
        >
          <span className="label-caps text-[#C5A046]">Authentic Indian Heritage · Global Export</span>

          <h1
            className="font-display font-light text-[#FAF8F5] mt-4 leading-[0.92]"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 7.5rem)' }}
          >
            Our <em className="animate-shimmer not-italic">Story</em>
          </h1>

          <div className="mx-auto mt-6 luxury-divider w-24" />

          <p className="font-display italic text-stone-200/90 text-lg sm:text-2xl mt-6 max-w-2xl mx-auto font-light leading-relaxed">
            "Rooted in the hills of Idukki. Built on passion. Driven by quality. Trusted across borders."
          </p>
        </motion.div>
      </section>

      {/* ── 2. THE BEGINNING ──────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <span className="label-caps text-[#A18637]">The Beginning</span>

            <h2
              className="font-display font-light text-[#112D15] mt-3 leading-[0.95]"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}
            >
              Born in the Hills of <em className="gold-gradient-text not-italic">Idukki</em>
            </h2>

            <div className="mt-5 luxury-divider w-20" />

            <div className="mt-8 text-stone-600 text-base sm:text-lg leading-relaxed font-light space-y-6">
              <p>{story}</p>
            </div>
          </motion.div>

          {/* Right Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-2xl border border-[#A18637]/25"
            style={{ height: '440px' }}
          >
            <img
              src={beginningImage}
              alt="Lush cardamom farm in Idukki high ranges, Kerala — Cardanova single-origin estate"
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071309]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="rounded-2xl glass-panel-dark p-5">
                <span className="label-caps text-[#C5A046]" style={{ fontSize: '0.55rem' }}>
                  Idukki High Ranges · Kerala, India
                </span>
                <p className="font-display italic text-stone-200 text-sm mt-1 font-light">
                  "Where mist, altitude, and rich soil yield the world's most fragrant green cardamom."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. MEET THE FOUNDERS ──────────────────────────────── */}
      <section className="py-24 px-6 lg:px-10 bg-[#112D15] text-[#FAF8F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="label-caps text-[#C5A046]">People Behind Cardanova</span>
            <h2
              className="font-display font-light text-[#FAF8F5] mt-3 leading-[0.95]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              Meet the <em className="animate-shimmer not-italic">Founders</em>
            </h2>
            <div className="mx-auto mt-5 luxury-divider w-24" />
            <p className="mt-4 text-stone-300/80 text-sm font-light max-w-md mx-auto">
              Driven by ambition, rooted in integrity, and dedicated to long-term international buyer trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
            {founders.map((founder, i) => (
              <motion.div
                key={founder.name || i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="group relative rounded-3xl overflow-hidden bg-[#0D2012]/90 border border-[#C5A046]/30 shadow-2xl flex flex-col justify-between"
              >
                {/* 1. Header Image Section */}
                <div className="relative overflow-hidden aspect-[3/4] max-h-[480px] w-full bg-[#071309]">
                  {founder.photo ? (
                    <img
                      src={founder.photo}
                      alt={`${founder.name} — ${founder.position} at Cardanova Spices LLP`}
                      width={800}
                      height={1067}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#071309] text-stone-500">
                      <span className="text-4xl">👤</span>
                      <span className="text-xs mt-2 font-mono text-stone-400">Photo Removed</span>
                    </div>
                  )}

                  {/* Gradient Overlay for bottom text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D2012] via-[#0D2012]/40 to-transparent pointer-events-none" />

                  {/* Co-Founder Badge */}
                  <div className="absolute top-5 left-5 rounded-full gold-gradient-bg px-4 py-1.5 label-caps text-[#071309] shadow-xl font-bold tracking-wider" style={{ fontSize: '0.6rem' }}>
                    {founder.position}
                  </div>

                  {/* Founder Name on Image Bottom */}
                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl font-light text-[#FAF8F5] drop-shadow-md">
                        {founder.name}
                      </h3>
                      <span className="label-caps text-[#C5A046] mt-0.5 block tracking-widest" style={{ fontSize: '0.58rem' }}>
                        {founder.position} · Cardanova Spices LLP
                      </span>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-2 shrink-0">
                      {founder.social?.linkedin && (
                        <a
                          href={founder.social.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${founder.name} LinkedIn`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C5A046]/40 bg-[#071309]/90 text-[#C5A046] text-xs hover:bg-[#C5A046] hover:text-[#071309] transition-all backdrop-blur-md"
                        >
                          in
                        </a>
                      )}
                      {founder.social?.facebook && (
                        <a
                          href={founder.social.facebook}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${founder.name} Facebook`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C5A046]/40 bg-[#071309]/90 text-[#C5A046] text-xs hover:bg-[#C5A046] hover:text-[#071309] transition-all backdrop-blur-md"
                        >
                          fb
                        </a>
                      )}
                      {founder.social?.email && (
                        <a
                          href={`mailto:${founder.social.email}`}
                          aria-label={`${founder.name} Email`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C5A046]/40 bg-[#071309]/90 text-[#C5A046] text-xs hover:bg-[#C5A046] hover:text-[#071309] transition-all backdrop-blur-md"
                        >
                          ✉
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Bio & Vision Section */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed font-light">
                    {founder.intro}
                  </p>

                  {founder.quote && (
                    <blockquote className="rounded-2xl bg-[#071309]/80 p-4 border-l-2 border-[#C5A046]">
                      <p className="font-display italic text-stone-200 text-xs sm:text-sm leading-relaxed font-light">
                        {founder.quote}
                      </p>
                    </blockquote>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ── 4. OUR VISION ────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 px-6 lg:px-10 bg-[#071309] text-[#FAF8F5] text-center">
        {/* Subtle background glow & texture */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #C5A046 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C5A046, transparent)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <span className="label-caps text-[#C5A046]">Our Core Purpose</span>

          <h2
            className="font-display font-light text-[#FAF8F5] mt-4 leading-[0.95]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
          >
            Building Long-Term Partnerships
            <br />
            Through <em className="animate-shimmer not-italic">Quality</em>
          </h2>

          <div className="mx-auto mt-6 luxury-divider w-24" />

          <blockquote
            className="font-display font-light text-[#FAF8F5] text-xl sm:text-3xl mt-8 leading-snug italic max-w-3xl mx-auto"
          >
            "{vision}"
          </blockquote>
        </motion.div>
      </section>

      {/* ── 5. OUR VALUES ────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="label-caps text-[#A18637]">Guiding Principles</span>
          <h2
            className="font-display font-light text-[#112D15] mt-3 leading-[0.95]"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}
          >
            Our <em className="gold-gradient-text not-italic">Values</em>
          </h2>
          <div className="mx-auto mt-5 luxury-divider w-20" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((val, i) => (
            <motion.div
              key={val.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group rounded-3xl bg-white border border-stone-200 p-8 shadow-sm hover:border-[#A18637]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#A18637]/30 bg-[#FAF8F5] text-2xl group-hover:border-[#C5A046] transition-colors">
                  {val.icon}
                </div>

                <h3 className="font-display text-2xl font-light text-[#112D15] group-hover:text-[#A18637] transition-colors">
                  {val.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
                  {val.desc}
                </p>
              </div>

              <div className="mt-6 h-[2px] w-0 bg-gradient-to-r from-[#C5A046] to-transparent transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 6. OUR JOURNEY (TIMELINE) ─────────────────────────── */}
      <section className="py-24 px-6 lg:px-10 bg-[#112D15] text-[#FAF8F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="label-caps text-[#C5A046]">Milestones of Progress</span>
            <h2
              className="font-display font-light text-[#FAF8F5] mt-3 leading-[0.95]"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)' }}
            >
              Our <em className="animate-shimmer not-italic">Journey</em>
            </h2>
            <div className="mx-auto mt-5 luxury-divider w-24" />
          </div>

          {/* Desktop Horizontal Timeline / Mobile Vertical Timeline */}
          <div className="relative">
            {/* Horizontal Line on Desktop */}
            <div
              className="absolute top-10 left-0 right-0 h-[1px] hidden lg:block"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(197,160,70,0.5), transparent)' }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {JOURNEY_STAGES.map((stage, i) => (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="group relative flex flex-col items-center lg:items-start text-center lg:text-left"
                >
                  {/* Step Node Dot */}
                  <div className="relative mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C5A046]/50 bg-[#071309] text-xs font-bold text-[#C5A046] shadow-lg group-hover:scale-110 group-hover:border-[#C5A046] transition-transform">
                      {stage.step}
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-light text-[#FAF8F5] leading-tight group-hover:text-[#C5A046] transition-colors">
                    {stage.title}
                  </h3>

                  <p className="mt-2 text-xs text-stone-400 font-light leading-relaxed">
                    {stage.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CALL TO ACTION ─────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-10 bg-[#FAF8F5] text-center">
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#A18637]/30 bg-white p-10 sm:p-16 shadow-2xl relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C5A046, transparent)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="label-caps text-[#A18637]">Let's Connect</span>

            <h2
              className="font-display font-light text-[#112D15] mt-4 leading-[0.95]"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
            >
              Let's Build Something <em className="gold-gradient-text not-italic">Together</em>
            </h2>

            <p className="mt-6 text-stone-600 text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed">
              "Whether you're an importer, wholesaler, retailer, or food manufacturer, we're ready to become your trusted sourcing partner for premium Indian spices."
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                as="button"
                onClick={() => onOpenQuoteModal()}
                cursorLabel="Quote"
                className="w-full sm:w-auto rounded-full gold-gradient-bg px-9 py-4 label-caps text-[#071309] shadow-xl hover:brightness-110 transition-all cursor-pointer gold-glow"
              >
                Get a Quote →
              </MagneticButton>

              <MagneticButton
                as="button"
                onClick={handleContactClick}
                cursorLabel="Contact"
                className="w-full sm:w-auto rounded-full border border-stone-300 bg-white px-9 py-4 label-caps text-stone-700 hover:border-[#A18637] hover:text-[#112D15] transition-all cursor-pointer"
              >
                Contact Our Team
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
