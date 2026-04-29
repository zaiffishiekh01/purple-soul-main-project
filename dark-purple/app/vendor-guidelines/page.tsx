import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, FileText, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vendor Guidelines',
  description: 'Standards and requirements for artisans joining our sacred tools marketplace.',
};

export default function VendorGuidelinesPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
                Vendor Guidelines
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Standards and requirements for artisans joining our marketplace
              </p>
              <div className="ethereal-divider mt-8"></div>
            </div>

            <div className="prose prose-lg max-w-none mb-20">
              <div className="space-y-6 text-white/70 leading-relaxed">
                <p className="text-lg">
                  This marketplace exists to connect skilled artisans with practitioners seeking authentic, handmade spiritual tools. We welcome makers who understand that their work serves something larger than commerce.
                </p>
                <p className="text-lg">
                  These guidelines are not bureaucratic hurdles. They are agreements about quality, ethics, and respect for sacred traditions.
                </p>
              </div>
            </div>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white">
                Who Should Apply
              </h2>

              <div className="space-y-6 text-white/70 leading-relaxed">
                <p>
                  We work with artisans who:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4 items-start glass-card glass-card-hover p-6">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Create by Hand</h3>
                      <p className="text-sm text-white/60">
                        Your products are handmade or involve significant manual craftsmanship. Mass-produced or primarily machine-made items do not qualify.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start glass-card glass-card-hover p-6">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Understand the Context</h3>
                      <p className="text-sm text-white/60">
                        You understand the religious or spiritual significance of what you make. Cultural appropriation has no place here.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start glass-card glass-card-hover p-6">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Source Ethically</h3>
                      <p className="text-sm text-white/60">
                        Your materials are obtained through fair trade and sustainable practices. You can document your supply chain.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start glass-card glass-card-hover p-6">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Practice Transparency</h3>
                      <p className="text-sm text-white/60">
                        You are willing to share your process, materials, and labor practices openly with customers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start glass-card glass-card-hover p-6">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Maintain Quality</h3>
                      <p className="text-sm text-white/60">
                        Your work is durable, functional, and made to last. Spiritual tools are not disposable objects.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start glass-card glass-card-hover p-6">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Value Fair Labor</h3>
                      <p className="text-sm text-white/60">
                        If you employ others, they work in safe conditions for fair wages. Exploitation disqualifies you immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white">
                Product Standards
              </h2>

              <div className="space-y-8">
                <div className="glass-card p-8">
                  <h3 className="text-xl font-medium mb-4 text-white">Materials & Construction</h3>
                  <ul className="space-y-3 text-white/70">
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Primarily natural materials (wood, stone, metal, natural fibers, leather, etc.)</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>If synthetic materials are used, they must be disclosed and justified</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Construction methods must be documented and align with handmade standards</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Products must be functional and durable for their intended spiritual use</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-medium mb-4 text-white">Religious Accuracy</h3>
                  <ul className="space-y-3 text-white/70">
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Quranic verses, prayers, or sacred text must be verified by qualified scholars</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Sacred symbols must be used appropriately within their religious context</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Ritual objects must function correctly for their intended practice</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Cultural elements must be used respectfully, not decoratively</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-medium mb-4 text-white">Photography & Descriptions</h3>
                  <ul className="space-y-3 text-white/70">
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Clear, well-lit photos showing actual products, not stock images</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Honest descriptions of materials, dimensions, and construction</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Disclosure of any variations due to handmade nature</span>
                    </li>
                    <li className="flex gap-3">
                      <span style={{ color: '#d4af8a' }} className="font-bold">•</span>
                      <span>Care instructions and expected lifespan</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white">
                Required Documentation
              </h2>

              <div className="glass-card p-8">
                <div className="space-y-6">
                  <div className="flex gap-4 items-start pb-6 border-b border-white/10">
                    <FileText className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Maker Profile</h3>
                      <p className="text-white/60 text-sm">
                        Your story, location, training, and connection to the spiritual traditions you serve. This is visible to customers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start pb-6 border-b border-white/10">
                    <FileText className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Materials Sourcing</h3>
                      <p className="text-white/60 text-sm">
                        Documentation of where your materials come from, how they are obtained, and verification of ethical sourcing.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start pb-6 border-b border-white/10">
                    <FileText className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Production Process</h3>
                      <p className="text-white/60 text-sm">
                        Step-by-step description of how your products are made, including which steps are manual vs. assisted by tools.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start pb-6 border-b border-white/10">
                    <FileText className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Labor Practices</h3>
                      <p className="text-white/60 text-sm">
                        If you employ others: number of workers, wage structure, working conditions, and any relevant certifications.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <FileText className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="font-medium text-white mb-2">Religious Verification</h3>
                      <p className="text-white/60 text-sm">
                        For products with religious text or symbols: verification from qualified scholars or religious authorities when applicable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white">
                Prohibited Practices
              </h2>

              <div className="glass-card p-8 border-2" style={{ borderColor: '#d4af8a' }}>
                <div className="flex gap-4 mb-6">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#d4af8a' }} />
                  <p className="text-white font-medium">
                    The following practices will result in immediate removal from the platform:
                  </p>
                </div>

                <ul className="space-y-3 text-white/70 ml-10">
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>Misrepresenting machine-made products as handmade</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>Using sacred symbols or text decoratively or disrespectfully</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>Cultural appropriation or selling outside your cultural/religious context without proper authorization</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>Exploitation of workers or use of unfair labor practices</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>Environmentally harmful sourcing or production methods</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>Refusing to disclose materials, origins, or production methods</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>False claims about religious authenticity or endorsement</span>
                  </li>
                  <li className="flex gap-3">
                    <span style={{ color: '#d4af8a' }} className="font-bold">×</span>
                    <span>Producing low-quality or non-functional ritual objects</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white">
                Pricing & Commission
              </h2>

              <div className="glass-card p-8">
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">Set Your Own Prices:</strong> You determine the price of your work. We do not dictate pricing, though we may provide market guidance.
                  </p>
                  <p>
                    <strong className="text-white">Platform Commission:</strong> We charge a percentage commission on sales to maintain the platform, verify vendors, and support quality assurance.
                  </p>
                  <p>
                    <strong className="text-white">No Hidden Fees:</strong> Commission structure is transparent and disclosed during onboarding. No surprise charges or complex fee schedules.
                  </p>
                  <p>
                    <strong className="text-white">Fair Compensation:</strong> Your prices should reflect fair compensation for your time, skill, and materials. We do not encourage race-to-the-bottom pricing.
                  </p>
                </div>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-20">
              <h2 className="section-title font-serif mb-8 text-white">
                Ongoing Responsibilities
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-medium text-white mb-3">Quality Consistency</h3>
                  <p className="text-sm text-white/60">
                    Maintain the same quality standards over time. Variation is natural in handmade goods, but quality should not decline.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-medium text-white mb-3">Timely Fulfillment</h3>
                  <p className="text-sm text-white/60">
                    Ship orders within stated timeframes. Communicate proactively about any delays due to the handmade nature of your work.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-medium text-white mb-3">Customer Communication</h3>
                  <p className="text-sm text-white/60">
                    Respond to customer inquiries respectfully and in a timely manner. Help customers understand and care for your work.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-medium text-white mb-3">Continuous Compliance</h3>
                  <p className="text-sm text-white/60">
                    Maintain ethical sourcing, accurate descriptions, and quality standards throughout your time on the platform.
                  </p>
                </div>
              </div>
            </section>

            <div className="glass-card p-12 mb-16">
              <div className="flex gap-6 items-start">
                <Users className="h-12 w-12 flex-shrink-0" style={{ color: '#d4af8a' }} />
                <div className="space-y-4 text-white/80 leading-relaxed">
                  <p className="text-2xl font-serif text-white">
                    Join Our Community
                  </p>
                  <p>
                    We are building a marketplace that honors the dignity of makers and the sacred nature of their work. If these guidelines resonate with your practice, we welcome your application.
                  </p>
                  <p>
                    This is not a platform for maximizing sales at any cost. It is a platform for connecting meaningful work with people who will value it properly.
                  </p>
                  <p className="font-medium text-white">
                    Quality, integrity, and respect are not negotiable. Everything else, we can discuss.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-20 pt-12 border-t border-white/10">
              <Link href="/faith-integrity">
                <button className="px-10 py-3.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                  Read Faith Integrity
                </button>
              </Link>
              <Link href="/contact">
                <button className="celestial-button text-white">
                  Apply as a Vendor
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
