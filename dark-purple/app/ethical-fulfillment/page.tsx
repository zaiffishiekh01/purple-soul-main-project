import { Metadata } from 'next';
import { Package, Heart, Shield, CheckCircle2, Sparkles, Box } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ethical Fulfillment - Sacred Handling & Intentional Logistics',
  description: 'Our commitment to mindful packaging, respectful handling, and intention-centered fulfillment for every spiritual product.',
};

export default function EthicalFulfillmentPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Package className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Sacred Handling</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
              Ethical Fulfillment
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              From warehouse to doorstep, we treat every item with the reverence it deserves. Logistics is not transactional—it is ceremonial.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="ethereal-divider mb-16"></div>

            <div className="prose prose-lg max-w-none text-white/70 leading-relaxed space-y-8">
              <div>
                <h2 className="section-title font-serif text-white mb-6">Why Fulfillment Matters</h2>
                <p>
                  You are not ordering commodities. You are receiving prayer beads that will rest in your hands during contemplation, sacred texts that will guide your spiritual journey, and artisan-crafted tools meant to deepen your practice.
                </p>
                <p>
                  The way these items are handled, packaged, and delivered matters. It reflects our respect for their purpose and for you.
                </p>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Our Fulfillment Principles</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Intentional Packaging</h3>
                      <p className="text-white/70">
                        We use minimal, dignified packaging that protects without excess. Materials are chosen for quality and restraint, not branding or marketing spectacle.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Respectful Handling</h3>
                      <p className="text-white/70">
                        Our fulfillment team is trained to handle sacred items with care. Prayer beads are not tossed. Qurans, Bibles, and Torah scrolls are not stacked carelessly. Every item is treated as if it were our own.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Clean Workspace Standards</h3>
                      <p className="text-white/70">
                        Fulfillment areas are maintained with cleanliness and order. Sacred items are never placed on unclean surfaces or handled in environments that compromise their dignity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Rush Culture</h3>
                      <p className="text-white/70">
                        We do not create impossible timelines that force careless packing. Orders are fulfilled with care, not haste.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Transparent Communication</h3>
                      <p className="text-white/70">
                        You will receive clear updates on order status. If delays occur, we communicate honestly rather than hide behind automated messages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Packaging Philosophy</h2>
                <p>
                  We reject the excess of modern e-commerce packaging. You will not receive mountains of plastic, unnecessary cushioning, or branded filler material.
                </p>
                <p>
                  Instead, we use:
                </p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <Box className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Minimal, protective materials</strong> chosen for function rather than aesthetics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Box className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Recyclable or reusable components</strong> wherever possible</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Box className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Simple, clear labeling</strong> without branding overload</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Box className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Custom inserts for fragile items</strong> that protect without waste</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Shipping Partners</h2>
                <p className="text-white/70 mb-4">
                  We work with shipping carriers who have demonstrated reliability and care. However, we acknowledge that the final mile of delivery is beyond our direct control.
                </p>
                <p className="text-white/70">
                  If your package arrives damaged, we take full responsibility. Replacement or refund is immediate, no questions asked. The sacred nature of these items means we never compromise on arrival condition.
                </p>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">International Shipping</h2>
                <p>
                  We ship to seekers across the Abrahamic traditions worldwide. International orders receive the same care and attention as domestic shipments.
                </p>
                <p>
                  We navigate customs processes with transparency and assist with documentation when needed. Sacred texts and prayer items are clearly declared to avoid mishandling or delays.
                </p>
              </div>

              <div className="glass-card p-8 sacred-glow">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Our Commitment</h2>
                  <p className="text-white/80 text-lg">
                    When your order arrives, it should feel like it was prepared with intention. The packaging should reflect the dignity of what's inside. The condition should honor the purpose of the item.
                  </p>
                  <p className="text-white/80 text-lg">
                    We do not treat fulfillment as a race. We treat it as an extension of our sacred responsibility to you and to the makers who crafted these items.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Questions or Concerns?</h2>
                <p>
                  If you have specific needs regarding packaging, handling, or delivery, please let us know. We accommodate requests that align with your spiritual practice.
                </p>
                <Link href="/contact">
                  <button className="celestial-button text-white mt-6">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
