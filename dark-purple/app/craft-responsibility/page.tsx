import { Metadata } from 'next';
import { Users, Heart, Shield, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Craft Responsibility - Our Commitment to Artisan Dignity',
  description: 'Learn about our commitment to fair practice, artisan dignity, and non-exploitative sourcing across all spiritual traditions.',
};

export default function CraftResponsibilityPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Users className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Artisan Dignity</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
              Craft Responsibility
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              We believe that every sacred object carries the dignity of its maker. Our commitment to artisan rights and fair practice is non-negotiable.
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
                <h2 className="section-title font-serif text-white mb-6">Our Foundation</h2>
                <p>
                  Craft is not a commodity. It is a cultural transmission, a form of knowledge held in hands, shaped by practice, and refined across generations. When we engage with craft, we engage with human dignity.
                </p>
                <p>
                  Purple Soul Collective exists within the ecosystem of De Koshur Crafts, an institution built on the principle that artisan labor must be visible, compensated fairly, and protected from exploitation.
                </p>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Core Principles</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Fair Compensation</h3>
                      <p className="text-white/70">
                        Artisans are paid directly and fairly for their work. We do not engage in bargaining practices that devalue labor or extract margin through negotiation pressure.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Transparent Sourcing</h3>
                      <p className="text-white/70">
                        We maintain direct relationships with artisan communities across Jewish, Christian, and Islamic traditions. Every product can be traced to its source.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Exploitative Timelines</h3>
                      <p className="text-white/70">
                        Rush orders and impossible deadlines compromise quality and respect. We plan inventory cycles that honor the time required for authentic craftsmanship.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Cultural Attribution</h3>
                      <p className="text-white/70">
                        We name the makers, acknowledge the traditions, and refuse to anonymize or genericize craft heritage.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Rejection of Counterfeit Markets</h3>
                      <p className="text-white/70">
                        We actively monitor and combat counterfeit versions of artisan work. When imitation products appear, we take action to protect maker rights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">The Ecosystem Behind Our Work</h2>
                <p>
                  Purple Soul Collective operates within a larger craft governance structure managed by De Koshur Crafts and its allied institutions:
                </p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Hamadan Craft Revival Foundation (HCRF)</strong> — Provides research, policy frameworks, and historical continuity for craft preservation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Craftlore</strong> — Monitors market risks, counterfeiting patterns, and artisan livelihood data to ensure informed decisions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">DKC B2B</strong> — Manages institutional partnerships with compliance structures that protect artisan interests at scale.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-8 sacred-glow">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Our Promise</h2>
                  <p className="text-white/80 text-lg">
                    Every product you purchase supports a maker who was compensated with dignity. Every spiritual tool you hold was created under conditions of respect, not exploitation.
                  </p>
                  <p className="text-white/80 text-lg">
                    We do not treat craft as content. We do not extract value through speed. We recognize that sacred objects require sacred labor conditions.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Questions or Concerns?</h2>
                <p>
                  If you have questions about sourcing practices, artisan partnerships, or how we ensure fair compensation, we welcome your inquiry.
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
