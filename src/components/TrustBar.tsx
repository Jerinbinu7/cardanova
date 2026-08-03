import { useReducedMotion } from '../hooks/useReducedMotion';
import { motion } from 'framer-motion';

const TRUST_ITEMS = [
  'FSSAI Certified',
  'APEDA Registered',
  'Spices Board India',
  'ISO 22000:2018',
  'HACCP Compliant',
  'EIC Approved',
  'Organic India Certified',
  'GMP Facility',
];

export default function TrustBar() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="overflow-hidden border-y border-stone-200 bg-white py-5">
      <div className="relative">
        {reducedMotion ? (
          <div className="flex flex-wrap items-center justify-center gap-8 px-6">
            {TRUST_ITEMS.map((item) => (
              <span
                key={item}
                className="text-xs font-semibold tracking-widest text-stone-400 uppercase whitespace-nowrap"
              >
                ✦ {item}
              </span>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex items-center gap-12"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="text-xs font-semibold tracking-widest text-stone-400 uppercase whitespace-nowrap"
              >
                ✦ {item}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
