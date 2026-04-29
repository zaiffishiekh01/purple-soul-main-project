import { Metadata } from 'next';
import { Heart, Shield, Globe, Users, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import DynamicStats from '@/components/stats/dynamic-stats';
import { CreateAccountButton } from '@/components/auth/create-account-button';

export const metadata: Metadata = {
  title: 'About Us - Our Story & Mission',
  description: 'Discover our journey in uniting the Abrahamic traditions through authentic spiritual products, bridged by the wisdom of Sufism.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Established with Purpose</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
              Connecting Hearts Through
              <br />Authentic Abrahamic Treasures
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              We are more than a marketplace. We are a community uniting the Abrahamic traditions—Judaism, Christianity, and Islam—through the wisdom of Sufism, offering authentic spiritual products for seekers on every path.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/collections">
                <button className="celestial-button text-white">
                  Explore Our Collection
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-3.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                  Get in Touch
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="ethereal-divider mb-16"></div>
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="section-title font-serif text-white mb-6">Our Story</h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    Founded with a vision to bridge the Abrahamic traditions, our journey began with a profound belief:
                    the spiritual paths of Judaism, Christianity, and Islam share a common source, united through the
                    mystical wisdom of Sufism. Every seeker deserves access to authentic spiritual tools that honor
                    their tradition while recognizing our shared heritage.
                  </p>
                  <p>
                    What started as a small interfaith endeavor has grown into a trusted destination for seekers across
                    all three Abrahamic paths. We work directly with artisans, spiritual teachers, scholars, and verified
                    suppliers from diverse faith communities worldwide, bringing you products that meet the highest
                    standards of authenticity and spiritual integrity.
                  </p>
                  <p>
                    Every item in our collection is carefully selected, verified for authenticity, and chosen with the
                    intention of enriching your spiritual journey—whether you practice Jewish mysticism, Christian
                    contemplation, Islamic devotion, or walk the universal path of Sufi wisdom that unites them all.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="glass-card overflow-hidden aspect-[4/3]">
                  <img
                    src="https://images.pexels.com/photos/7249159/pexels-photo-7249159.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Islamic prayer items arranged beautifully"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 glass-card p-6 max-w-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-8 h-8" style={{ color: '#d4af8a' }} />
                    <div>
                      <div className="text-2xl font-bold text-white">100%</div>
                      <div className="text-sm text-white/60">Authentic Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="glass-card overflow-hidden aspect-[4/3]">
                  <img
                    src="https://images.pexels.com/photos/6786379/pexels-photo-6786379.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Hands holding Quran with prayer beads"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 glass-card p-6">
                  <div className="flex items-center gap-3">
                    <Globe className="w-8 h-8" style={{ color: '#d4af8a' }} />
                    <div>
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-sm text-white/60">Countries Served</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="section-title font-serif text-white mb-6">Our Mission</h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    Our mission is to serve seekers across the Abrahamic traditions by providing access to authentic,
                    high-quality spiritual products that honor each path while revealing our shared mystical heritage
                    through the universal wisdom of Sufism.
                  </p>
                  <p>
                    We are committed to:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                      <span>Ensuring 100% authenticity and spiritual integrity in every product we offer</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                      <span>Supporting artisans and spiritual teachers across Jewish, Christian, and Islamic traditions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                      <span>Building bridges between traditions through the unifying wisdom of Sufism</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                      <span>Creating an interfaith community marketplace rooted in shared sacred values</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="ethereal-divider mb-16"></div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
                <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
                <span className="text-sm font-semibold text-white/90">The Sufi Bridge</span>
              </div>
              <h2 className="section-title font-serif text-white mb-6">Unity Through Mystical Wisdom</h2>
            </div>

            <div className="prose prose-lg max-w-none text-white/70 leading-relaxed space-y-6">
              <p>
                At the heart of our mission lies the profound recognition that the Abrahamic traditions—Judaism,
                Christianity, and Islam—share not only a common patriarch but a universal mystical truth. Sufism,
                the mystical dimension of Islam, serves as a bridge connecting the esoteric wisdom found in Jewish
                Kabbalah, Christian mysticism, and Islamic spirituality.
              </p>
              <p>
                The Sufi path teaches us that divine love transcends religious boundaries, that the sacred names of
                God resonate across traditions, and that the journey of the soul toward the Divine is universal.
                Whether you recite the Shema, pray the Jesus Prayer, or chant the Names of Allah, you are drawing
                from the same eternal wellspring of divine truth.
              </p>
              <p>
                Our curated collection honors this unity-in-diversity. We offer prayer beads for dhikr, meditation,
                and contemplative prayer; sacred texts from Torah, Bible, and Quran; artistic expressions of divine
                beauty from all three traditions; and spiritual tools that support seekers wherever they are on their path.
              </p>
              <div className="glass-card p-8 mt-8">
                <p className="text-center text-lg font-medium text-white/90 italic mb-2">
                  "The lamps are different, but the Light is the same."
                </p>
                <p className="text-center text-sm text-white/50">
                  — Rumi, Sufi Mystic & Poet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="ethereal-divider mb-16"></div>
            <div className="text-center mb-16">
              <h2 className="section-title font-serif text-white mb-4">Our Core Values</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                These principles guide everything we do, from sourcing products to serving our community
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card glass-card-hover p-8">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Authenticity</h3>
                <p className="text-white/60 leading-relaxed">
                  Every product is verified for authenticity by Islamic scholars and experts. We never compromise on quality.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Compassion</h3>
                <p className="text-white/60 leading-relaxed">
                  We serve our community with care, understanding, and genuine commitment to their spiritual needs.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Unity</h3>
                <p className="text-white/60 leading-relaxed">
                  Bridging the Abrahamic traditions through shared values, mutual respect, and the mystical wisdom that connects us all.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Excellence</h3>
                <p className="text-white/60 leading-relaxed">
                  Pursuing the highest standards in everything we do, from product selection to customer service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="ethereal-divider mb-16"></div>
            <div className="text-center mb-16">
              <h2 className="section-title font-serif text-white mb-4">Why Choose Us</h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                We are committed to providing an exceptional experience for our community
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                  <Shield className="w-10 h-10" style={{ color: '#d4af8a' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Verified Authenticity</h3>
                <p className="text-white/60 leading-relaxed">
                  Every product undergoes rigorous authentication by scholars and spiritual teachers from across the Abrahamic traditions before reaching you.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                  <Globe className="w-10 h-10" style={{ color: '#d4af8a' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Interfaith Sourcing</h3>
                <p className="text-white/60 leading-relaxed">
                  We partner with artisans and spiritual communities across Jewish, Christian, and Islamic traditions worldwide to bring you authentic sacred items from their places of origin.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                  <Heart className="w-10 h-10" style={{ color: '#d4af8a' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Customer First</h3>
                <p className="text-white/60 leading-relaxed">
                  Your satisfaction and spiritual journey are our priority. We provide dedicated support every step of the way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="ethereal-divider mb-16"></div>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
                <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
                <span className="text-sm font-semibold text-white/90">Our Foundation</span>
              </div>
              <h2 className="section-title font-serif text-white mb-4">De Koshur Crafts & Allied Initiatives</h2>
              <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">
                Purple Soul Collective is an initiative of De Koshur Crafts, USA, and draws its ethical grounding, cultural discipline, and long-term vision from a broader ecosystem of craft-focused institutions. This ecosystem exists to protect dignity of labor, preserve cultural knowledge, and ensure that tradition is not diluted by scale, speed, or market pressure.
              </p>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold mb-4 text-white">De Koshur Crafts, USA</h3>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    De Koshur Crafts is a craft-first institution committed to the preservation, documentation, and ethical advancement of Kashmiri handicraft traditions. Its work centers on authenticity, traceability, and fair representation of artisan knowledge in global markets.
                  </p>
                  <p>
                    Rather than treating craft as a commodity, De Koshur Crafts approaches it as cultural infrastructure — something that must be protected, governed, and transmitted responsibly across generations.
                  </p>
                  <p>
                    Purple Soul Collective operates within this framework, extending its values into the domain of spiritual and contemplative tools.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-4 text-white">Hamadan Craft Revival Foundation (HCRF)</h3>
                  <p className="text-white/70 leading-relaxed">
                    Hamadan Craft Revival Foundation is the research and policy arm within the De Koshur Crafts ecosystem. It focuses on historical continuity, institutional reform, and long-term sustainability of craft communities. HCRF contributes scholarship, documentation, and structural thinking that inform how craft intersects with ethics, education, and public responsibility. Its work ensures that revival efforts are grounded in evidence rather than nostalgia.
                  </p>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-4 text-white">Craftlore</h3>
                  <p className="text-white/70 leading-relaxed">
                    Craftlore is a data-driven research and monitoring platform dedicated to understanding the socio-economic realities of craft sectors. It tracks risks such as counterfeiting, market dilution, and loss of design ownership, while highlighting patterns that affect artisan livelihoods. Craftlore's analytical approach supports transparency and accountability, reinforcing the idea that ethical craft must be measurable, not just aspirational.
                  </p>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-4 text-white">DKC B2B</h3>
                  <p className="text-white/70 leading-relaxed">
                    DKC B2B is the enterprise and trade interface of De Koshur Crafts, designed to engage institutional buyers, partners, and global markets responsibly. It prioritizes structured onboarding, compliance, and long-term relationships over transactional volume, ensuring that scale does not come at the cost of integrity.
                  </p>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-4 text-white">ArtStay</h3>
                  <p className="text-white/70 leading-relaxed">
                    ArtStay connects craft, place, and lived experience. It focuses on cultural immersion and tourism models that respect local knowledge systems rather than extracting from them. Through ArtStay, craft is experienced not only as an object, but as a way of life rooted in geography, memory, and human presence.
                  </p>
                </div>
              </div>

              <div className="glass-card p-8 sacred-glow">
                <p className="text-white/80 leading-relaxed text-center text-lg">
                  Together, these initiatives form a shared foundation from which Purple Soul Collective emerges — not as a standalone marketplace, but as a carefully placed extension of a larger commitment to ethical craft, spiritual responsibility, and cultural continuity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 relative">
          <div className="ethereal-divider mb-16"></div>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-title font-serif text-white mb-6">Join Our Community</h2>
            <p className="text-xl mb-8 text-white/70 leading-relaxed">
              Be part of a growing interfaith community of seekers across the Abrahamic traditions.
              Discover authentic spiritual products, connect with fellow travelers on the path, and enrich your journey through the wisdom that unites us all.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/collections">
                <button className="celestial-button text-white">
                  Start Shopping
                </button>
              </Link>
              <CreateAccountButton className="px-8 py-3.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                Create Account
              </CreateAccountButton>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <DynamicStats />
          </div>
        </div>
      </section>
    </div>
  );
}
