import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import ScrollReveal from './ScrollReveal';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

const STATS: StatItem[] = [
  { value: 12, suffix: '+', label: 'Years Legacy', icon: '🏛️' },
  { value: 500, suffix: '+ MT', label: 'Annual Capacity', icon: '📦' },
  { value: 100, suffix: '%', label: 'Idukki Origin', icon: '🌿' },
  { value: 30, suffix: '+', label: 'Countries Exported', icon: '🌍' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (reducedMotion) {
      setCount(value);
      return;
    }

    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const currentValue = Math.round(eased * value);

      if (currentValue !== start) {
        start = currentValue;
        setCount(currentValue);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, reducedMotion]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function StatCounters() {
  return (
    <section
      id="stats"
      className="relative overflow-hidden bg-emerald-900 py-20 lg:py-28"
    >
      {/* Parallax BG decoration */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(110,231,183,0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Numbers That Speak
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-200/80">
            Over a decade of unwavering commitment to quality, traceability, and
            sustainable sourcing from the heart of India's spice country.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <motion.div
                className="group relative rounded-2xl border border-emerald-700/50 bg-emerald-800/30 p-6 text-center backdrop-blur-sm transition-colors duration-300 hover:border-emerald-500/50 hover:bg-emerald-800/50 lg:p-8"
              >
                <span className="mb-3 inline-block text-3xl">{stat.icon}</span>
                <div className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm font-medium tracking-wide text-emerald-300/80 uppercase">
                  {stat.label}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
