'use client';

import Link from 'next/link';
import { Shield, Heart, Eye, Scale } from 'lucide-react';

export default function FaithIntegrityPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
                Faith Integrity
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Our commitment to authentic spiritual practice, ethical sourcing, and respect for sacred traditions
              </p>
              <div className="ethereal-divider mt-8"></div>
            </div>

            <div className="prose prose-lg max-w-none mb-20">
              <div className="space-y-6 text-white/70 leading-relaxed">
                <p className="text-lg">
                  Sacred tools are not ordinary commerce. They exist at the intersection of craft, faith, and daily practice. This requires a different standard—one that honors both the maker and the user, the material and the spiritual.
                </p>
                <p className="text-lg">
                  We do not treat faith as a market segment. We treat it as what it is: the foundation of how people live, remember, and seek meaning.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-white">
                  Authenticity First
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Every product must align with the religious traditions it claims to serve. We verify materials, construction methods, and symbolic accuracy. Misrepresentation—whether intentional or careless—has no place here.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-white">
                  Respect for Tradition
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Sacred objects carry centuries of meaning. We work with scholars, practitioners, and communities to ensure products honor their origins. Innovation is welcome—disrespect is not.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-white">
                  Visible Labor
                </h3>
                <p className="text-white/70 leading-relaxed">
                  We believe users have the right to know who made their prayer tools and under what conditions. Every vendor discloses their location, materials, and labor practices. Anonymity hides exploitation.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-serif mb-4 text-white">
                  Ethical Standards
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Tools made for spiritual practice cannot be built through exploitation. We require fair wages, safe conditions, and sustainable sourcing. Faith and ethics are inseparable.
                </p>
              </div>
            </div>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white text-center">
                What We Verify
              </h2>

              <div className="space-y-8">
                <div className="glass-card p-8">
                  <h3 className="text-xl font-medium mb-3 text-white">Materials & Construction</h3>
                  <p className="text-white/70 leading-relaxed">
                    Prayer beads made from authentic gemstones or wood, not plastic imitations. Prayer rugs woven from natural fibers, not synthetic substitutes. Materials matter—both practically and symbolically.
                  </p>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-medium mb-3 text-white">Religious Accuracy</h3>
                  <p className="text-white/70 leading-relaxed">
                    Quranic verses must be correctly transcribed. Sacred symbols must be used appropriately. Ritual objects must function as intended. We consult with religious authorities and practitioners to ensure correctness.
                  </p>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-medium mb-3 text-white">Maker Transparency</h3>
                  <p className="text-white/70 leading-relaxed">
                    Who made this? Where? Under what conditions? We require vendors to answer these questions clearly. Users deserve to know the human story behind their spiritual tools.
                  </p>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-medium mb-3 text-white">Ethical Sourcing</h3>
                  <p className="text-white/70 leading-relaxed">
                    Materials obtained through exploitation, environmental harm, or unfair trade are prohibited. We trace supply chains and require documentation. Spiritual practice begins with how things are made.
                  </p>
                </div>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white text-center">
                What We Do Not Allow
              </h2>

              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#d4af8a' }}></div>
                  <p className="text-white/70 leading-relaxed">
                    <strong className="text-white">Cultural Appropriation:</strong> Sacred symbols used decoratively or outside their religious context
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#d4af8a' }}></div>
                  <p className="text-white/70 leading-relaxed">
                    <strong className="text-white">Misrepresentation:</strong> Products claiming to be handmade when machine-made, or authentic when imitation
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#d4af8a' }}></div>
                  <p className="text-white/70 leading-relaxed">
                    <strong className="text-white">Exploitation:</strong> Products made through unfair labor, unsafe conditions, or environmental harm
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#d4af8a' }}></div>
                  <p className="text-white/70 leading-relaxed">
                    <strong className="text-white">Religious Inaccuracy:</strong> Incorrect verses, improper use of sacred names, or ritual objects that don't function properly
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#d4af8a' }}></div>
                  <p className="text-white/70 leading-relaxed">
                    <strong className="text-white">Hidden Origins:</strong> Vendors who refuse to disclose materials, labor practices, or production locations
                  </p>
                </div>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white text-center">
                Continuous Accountability
              </h2>

              <div className="space-y-6 text-white/70 leading-relaxed max-w-3xl mx-auto">
                <p>
                  Faith integrity is not a one-time verification. It is an ongoing commitment.
                </p>
                <p>
                  We conduct regular reviews of vendor practices. We respond to community concerns. We update our standards as traditions evolve and as we learn better ways to serve practitioners.
                </p>
                <p>
                  Users can report concerns directly. Every report is reviewed by humans who understand religious context, not algorithms optimizing for profit.
                </p>
                <p>
                  When we make mistakes, we correct them transparently.
                </p>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white text-center">
                Aligned Institutions
              </h2>

              <div className="max-w-3xl mx-auto mb-12">
                <p className="text-white/70 leading-relaxed text-center">
                  Purple Soul Collective exists within a broader ecosystem of contemplative inquiry, spiritual science, and inner discipline. The following institutions represent alignment in values, intent, and long-term vision rather than commercial partnership.
                </p>
              </div>

              <div className="space-y-8">
                <a
                  href="https://sufisciencecenter.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-8 cursor-pointer transition-all duration-300 rounded-xl"
                  style={{
                    background: 'rgba(80, 50, 120, 0.6)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    border: '2px solid rgba(184, 160, 220, 0.4)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(100, 70, 150, 0.7)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(184, 160, 220, 0.6)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(100, 50, 200, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(80, 50, 120, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(184, 160, 220, 0.4)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3 text-white">Sufi Science Centre USA</h3>
                  <p className="text-white/90 leading-relaxed">
                    Sufi Science Centre USA explores the relationship between inner transformation, consciousness, and lived experience through a Sufi lens. Its work bridges spiritual tradition with reflective inquiry, emphasizing remembrance, ethical self-discipline, and the refinement of perception. The Centre provides a contemplative framework that informs how spiritual tools are understood as aids to inner work rather than objects of display.
                  </p>
                </a>

                <a
                  href="https://dkf.sufisciencecenter.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-8 cursor-pointer transition-all duration-300 rounded-xl"
                  style={{
                    background: 'rgba(80, 50, 120, 0.6)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    border: '2px solid rgba(184, 160, 220, 0.4)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(100, 70, 150, 0.7)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(184, 160, 220, 0.6)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(100, 50, 200, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(80, 50, 120, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(184, 160, 220, 0.4)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3 text-white">Dr Kumar Foundation USA</h3>
                  <p className="text-white/90 leading-relaxed">
                    Dr Kumar Foundation USA is dedicated to research, dialogue, and initiatives that connect spirituality, human development, and responsible knowledge systems. The Foundation supports interdisciplinary thinking that respects religious wisdom while engaging contemporary questions of meaning, care, and human dignity. Its presence reinforces a commitment to intellectual honesty and ethical grounding across traditions.
                  </p>
                </a>

                <a
                  href="https://www.sufipulse.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-8 cursor-pointer transition-all duration-300 rounded-xl"
                  style={{
                    background: 'rgba(80, 50, 120, 0.6)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    border: '2px solid rgba(184, 160, 220, 0.4)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(100, 70, 150, 0.7)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(184, 160, 220, 0.6)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(100, 50, 200, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(80, 50, 120, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(184, 160, 220, 0.4)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3 text-white">SufiPulse USA</h3>
                  <p className="text-white/90 leading-relaxed">
                    SufiPulse USA is a creative and reflective platform that communicates spiritual insight through music, narrative, and contemplative media. Rooted in Sufi thought yet open to universal experience, it emphasizes inner listening, humility, and remembrance. Its alignment reflects a shared belief that spiritual expression should deepen awareness rather than distract from it.
                  </p>
                </a>
              </div>

              <div className="mt-12 text-center max-w-2xl mx-auto">
                <p className="text-white/60 leading-relaxed italic">
                  These institutions do not define Purple Soul Collective. They reflect the intellectual, spiritual, and ethical environment within which it operates.
                </p>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <div className="glass-card p-12 mb-16">
              <div className="space-y-6 text-white/80 leading-relaxed text-center max-w-3xl mx-auto">
                <p className="text-2xl font-serif text-white">
                  A Sacred Trust
                </p>
                <p className="text-lg">
                  When someone purchases a prayer rug, they are not just buying fabric. They are trusting that the rug will serve their practice with dignity. They are trusting that it was made ethically. They are trusting that it respects their faith.
                </p>
                <p className="text-lg">
                  That trust is sacred. We do not take it lightly.
                </p>
                <p className="font-medium text-white text-lg">
                  Every product on this platform carries our commitment to faith integrity.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-20 pt-12 border-t border-white/10">
              <Link href="/vendor-guidelines">
                <button className="px-10 py-3.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                  Read Vendor Guidelines
                </button>
              </Link>
              <Link href="/about">
                <button className="celestial-button text-white">
                  About Our Mission
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
