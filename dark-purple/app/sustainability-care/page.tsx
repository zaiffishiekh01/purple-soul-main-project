import { Metadata } from 'next';
import { Leaf, RefreshCw, Wrench, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sustainability & Care - Longevity, Repair, and Restraint',
  description: 'Our approach to sustainability through quality, repair culture, and mindful consumption—not greenwashing.',
};

export default function SustainabilityCarePage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Leaf className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Longevity & Restraint</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
              Sustainability & Care
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              True sustainability is not branding. It is building things to last, honoring repair, and practicing restraint in consumption.
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
                <h2 className="section-title font-serif text-white mb-6">Our Position on Sustainability</h2>
                <p>
                  We do not engage in greenwashing. We do not claim carbon neutrality while operating extractive systems. We do not market sustainability as a brand aesthetic.
                </p>
                <p>
                  Instead, we practice restraint, prioritize longevity, and support repair culture. These principles are embedded in how we source, what we sell, and how we engage with consumption itself.
                </p>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Core Practices</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Quality Over Quantity</h3>
                      <p className="text-white/70">
                        We curate products that are made to last. Prayer beads that can be passed down. Textiles woven to withstand decades of use. Sacred texts bound with care.
                      </p>
                      <p className="text-white/70 mt-2">
                        We refuse to participate in fast consumption cycles where spiritual items are treated as disposable.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Repair Culture</h3>
                      <p className="text-white/70">
                        When items break, we encourage repair, not replacement. We provide guidance on maintaining prayer beads, caring for textiles, and preserving sacred books.
                      </p>
                      <p className="text-white/70 mt-2">
                        In the future, we plan to connect customers with artisan repair services to extend product lifespan rather than discard and replace.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Planned Obsolescence</h3>
                      <p className="text-white/70">
                        We do not introduce artificial product cycles, seasonal trends, or "limited editions" designed to create unnecessary replacement demand. Spiritual tools should not follow fashion logic.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Minimal Packaging Waste</h3>
                      <p className="text-white/70">
                        As outlined in our <Link href="/ethical-fulfillment" className="text-white underline">Ethical Fulfillment</Link> practices, we use only what is necessary to protect items in transit. No excess. No filler. No branding waste.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Honest Material Sourcing</h3>
                      <p className="text-white/70">
                        We work with materials that artisans can source responsibly. We do not demand rare or endangered materials for aesthetic purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Longevity as a Spiritual Practice</h2>
                <p>
                  In both Jewish, Christian, and Islamic traditions, there is deep reverence for objects that carry memory and time. A family Quran passed through generations. A rosary that has prayed thousands of times. A tallit worn by father and son.
                </p>
                <p>
                  These are not just products. They are companions on a spiritual path. They should last.
                </p>
                <p>
                  When you care for an object, you honor its purpose. When you repair rather than replace, you participate in a tradition older than industrial consumption.
                </p>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Care Instructions & Guidance</h2>
                <p className="text-white/70 mb-4">
                  We provide care instructions for every product type:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Prayer Beads:</strong> How to re-string, clean, and store properly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Textiles & Prayer Rugs:</strong> Washing, folding, and preservation techniques</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Sacred Texts:</strong> Proper storage to prevent wear, humidity control, and binding care</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Incense & Aromatics:</strong> Storage tips to maintain potency and fragrance</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">What We Don't Do</h2>
                <p>
                  We do not participate in:
                </p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-white/40" />
                    <span><strong className="text-white">Flash Sales or Artificial Urgency:</strong> These tactics encourage impulsive buying and undermine thoughtful consumption.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-white/40" />
                    <span><strong className="text-white">Greenwashing Claims:</strong> We will not claim environmental benefits we cannot verify or sustain.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-white/40" />
                    <span><strong className="text-white">Volume-Based Growth Models:</strong> We do not measure success by how much we sell, but by the integrity of what we offer.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-white/40" />
                    <span><strong className="text-white">Disposability Culture:</strong> We refuse to normalize replacing spiritual items as if they were trend-driven consumer goods.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-8 sacred-glow">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Our Commitment</h2>
                  <p className="text-white/80 text-lg">
                    We will prioritize longevity over novelty. We will support repair over replacement. We will practice restraint in sourcing, packaging, and consumption patterns.
                  </p>
                  <p className="text-white/80 text-lg">
                    This is not marketing. This is how we operate. If we fail to uphold these principles, we expect to be held accountable.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Questions or Feedback?</h2>
                <p>
                  If you have suggestions on how we can improve our sustainability practices, or if you need guidance on caring for your items, please reach out.
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
