import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import ScrollReveal from './ScrollReveal';

export default function About() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden bg-stone-50 py-20 lg:py-28"
    >
      {/* Parallax Background Image */}
      <motion.div
        className="absolute inset-0 opacity-[0.06]"
        style={reducedMotion ? {} : { y: bgY }}
      >
        <img
          src="https://images.pexels.com/photos/32262495/pexels-photo-32262495.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600"
          alt=""
          className="h-[120%] w-full object-cover"
          loading="lazy"
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <ScrollReveal direction="left" distance={40}>
            <div className="gallery-image group relative overflow-hidden rounded-2xl shadow-2xl" data-cursor="View">
              <img
                src="https://images.pexels.com/photos/32313269/pexels-photo-32313269.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900"
                alt="Misty spice plantations in Idukki hills"
                className="h-[400px] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[500px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 rounded-lg bg-white/90 px-4 py-2 backdrop-blur-sm">
                <p className="text-xs font-semibold text-emerald-800">📍 Idukki, Kerala</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Text */}
          <div>
            <ScrollReveal>
              <span className="text-sm font-semibold tracking-widest text-emerald-600 uppercase">
                Our Origin
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Rooted in the{' '}
                <span className="text-emerald-700">Western Ghats</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-stone-600">
                Cardanova Spices was founded with a single mission: to bring the
                world the finest cardamom from Idukki — the undisputed
                "Cardamom Capital" of India. Nestled in Kerala's Western Ghats
                at 600–1500m elevation, our sourcing network spans 200+
                smallholder farms.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mt-4 text-lg leading-relaxed text-stone-600">
                Every lot is hand-sorted, graded to ASTA/ESA standards, and
                tested for moisture, oil content, and purity before export.
                We're not a trading desk — we're planters and processors who
                control the supply chain from field to freight.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  'FSSAI Certified',
                  'APEDA Registered',
                  'ISO 22000',
                  'Organic Options',
                ].map((cert) => (
                  <span
                    key={cert}
                    className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
