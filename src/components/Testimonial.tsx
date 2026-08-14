import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import ScrollReveal from './ScrollReveal';

export default function Testimonial() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const quoteMarkY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const quoteMarkY2 = useTransform(scrollYProgress, [0, 1], [-20, 60]);

  return (
    <section
      ref={sectionRef}
      id="testimonial"
      className="relative overflow-hidden bg-stone-900 py-24 lg:py-32"
    >
      {/* Decorative parallax quote marks */}
      <motion.span
        className="pointer-events-none absolute top-12 left-8 select-none text-[200px] font-serif leading-none text-emerald-400/[0.07] lg:left-16 lg:text-[300px]"
        style={reducedMotion ? {} : { y: quoteMarkY }}
      >
        "
      </motion.span>
      <motion.span
        className="pointer-events-none absolute right-8 bottom-0 select-none text-[200px] font-serif leading-none text-emerald-400/[0.07] lg:right-16 lg:text-[300px]"
        style={reducedMotion ? {} : { y: quoteMarkY2 }}
      >
        "
      </motion.span>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
        <ScrollReveal>
          <motion.blockquote
            initial={reducedMotion ? {} : { scale: 0.98, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-xl leading-relaxed font-light text-stone-200 italic sm:text-2xl lg:text-3xl lg:leading-relaxed">
              "We don't just sell cardamom — we share the story of every pod. My
              grandfather started this journey in Kumily, hand-picking pods from
              the same hills where our family still farms today. Our buyers trust
              us because they know exactly which hillside their shipment came
              from."
            </p>
          </motion.blockquote>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-emerald-800 ring-2 ring-emerald-500/30">
              <img
                src="/images/founder-rajeev.jpg"
                alt="Founder portrait"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Rajeev Menon
              </p>
              <p className="text-xs text-emerald-400">
                Founder &amp; Managing Director, Cardanova Spices
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
