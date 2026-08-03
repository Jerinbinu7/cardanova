import ScrollReveal, { StaggerContainer, StaggerChild } from './ScrollReveal';

const FEATURES = [
  {
    icon: '🌱',
    title: 'Farm-to-Freight Control',
    description:
      'We manage the entire supply chain — from harvesting at partner farms to processing, grading, and export logistics. No middlemen.',
  },
  {
    icon: '🔬',
    title: 'Lab-Tested Quality',
    description:
      'Every shipment includes a Certificate of Analysis with moisture, oil content, aflatoxin, and pesticide residue reports.',
  },
  {
    icon: '📦',
    title: 'Flexible Packaging',
    description:
      'Available in 25kg/50kg jute bags, vacuum-sealed pouches, or private-label retail packs. Custom packaging on request.',
  },
  {
    icon: '🚢',
    title: 'Global Shipping',
    description:
      'CIF/FOB from Kochi & Tuticorin ports. We handle phytosanitary, fumigation, and all export documentation.',
  },
  {
    icon: '🤝',
    title: 'Dedicated Account Manager',
    description:
      'Every buyer gets a single point of contact for pricing, samples, shipment tracking, and post-delivery support.',
  },
  {
    icon: '♻️',
    title: 'Sustainable Sourcing',
    description:
      'Supporting 200+ smallholder farmers with fair-price procurement, organic transitions, and sustainable farming practices.',
  },
];

export default function Features() {
  return (
    <section className="bg-stone-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal className="text-center">
          <span className="text-sm font-semibold tracking-widest text-emerald-600 uppercase">
            Why Cardanova
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            The Export Partner Advantage
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-500">
            We combine heritage farming knowledge with modern export
            infrastructure to deliver a seamless procurement experience.
          </p>
        </ScrollReveal>

        <StaggerContainer
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          staggerDelay={0.08}
        >
          {FEATURES.map((feature) => (
            <StaggerChild key={feature.title}>
              <div className="group rounded-2xl border border-stone-200 bg-white p-7 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg">
                <span className="mb-4 inline-block text-3xl transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  {feature.description}
                </p>
              </div>
            </StaggerChild>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
