import { Metadata } from 'next';
import { Shield, Lock, Eye, CheckCircle2, Sparkles, Database, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data & Privacy Integrity - Respect, Restraint, and Trust',
  description: 'How we handle your data with restraint, respect, and absolute refusal to exploit personal information.',
};

export default function DataPrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Shield className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Data Integrity</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
              Data & Privacy Integrity
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              Your data is not a commodity. We collect only what is necessary and treat it with the same respect we apply to sacred objects.
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
                <h2 className="section-title font-serif text-white mb-6">Our Position on Data</h2>
                <p>
                  Most e-commerce platforms treat user data as a revenue stream. They track, profile, sell, and exploit personal information under the guise of "personalization" or "improved experience."
                </p>
                <p>
                  We refuse this model entirely.
                </p>
                <p>
                  Purple Soul Collective operates on principles of restraint, transparency, and respect. Your privacy is not negotiable. Your data is not for sale.
                </p>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">What We Collect & Why</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Order Fulfillment Data</h3>
                      <p className="text-white/70">
                        <strong>What:</strong> Name, shipping address, email, phone number
                      </p>
                      <p className="text-white/70">
                        <strong>Why:</strong> To deliver your order and communicate about shipment status
                      </p>
                      <p className="text-white/70">
                        <strong>Retention:</strong> Kept only as long as legally required for transaction records
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Payment Information</h3>
                      <p className="text-white/70">
                        <strong>What:</strong> Payment details processed through secure, third-party processors
                      </p>
                      <p className="text-white/70">
                        <strong>Why:</strong> To complete transactions securely
                      </p>
                      <p className="text-white/70">
                        <strong>Retention:</strong> We do not store full payment credentials. Tokenized references only, managed by payment processors.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Account Preferences</h3>
                      <p className="text-white/70">
                        <strong>What:</strong> Wishlist items, saved addresses, order history
                      </p>
                      <p className="text-white/70">
                        <strong>Why:</strong> To provide account functionality you've requested
                      </p>
                      <p className="text-white/70">
                        <strong>Retention:</strong> Until you delete your account or remove specific data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Basic Analytics</h3>
                      <p className="text-white/70">
                        <strong>What:</strong> Page visits, product views, anonymized usage patterns
                      </p>
                      <p className="text-white/70">
                        <strong>Why:</strong> To understand how the site is used and improve functionality
                      </p>
                      <p className="text-white/70">
                        <strong>Retention:</strong> Anonymized and aggregated; not tied to individual profiles
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">What We Don't Do</h2>
                <div className="glass-card p-8 border-l-4 border-rose-400/50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-rose-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Data Selling</h3>
                        <p className="text-white/70">
                          We will never sell, rent, or share your data with third parties for marketing purposes. Ever.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-rose-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Invasive Tracking</h3>
                        <p className="text-white/70">
                          We do not use third-party advertising pixels, retargeting scripts, or behavioral profiling tools.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-rose-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Dark Patterns</h3>
                        <p className="text-white/70">
                          We do not use deceptive UI tricks to extract more data than necessary or manipulate consent.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-rose-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Hidden Data Harvesting</h3>
                        <p className="text-white/70">
                          We do not collect data beyond what is explicitly described here. No fingerprinting. No shadow profiles.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-rose-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">No AI Training on Personal Data</h3>
                        <p className="text-white/70">
                          Your orders, preferences, and communications are not fed into machine learning models for profiling or prediction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Security Practices</h2>
                <p>
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Encryption:</strong> All data transmitted between you and our servers is encrypted using TLS/SSL protocols.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Access Controls:</strong> Only essential personnel have access to customer data, and all access is logged and monitored.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Regular Audits:</strong> We conduct security reviews to identify and address vulnerabilities.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Secure Infrastructure:</strong> Hosted on trusted platforms with robust security certifications.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Your Rights</h2>
                <p className="text-white/70 mb-4">
                  You have full control over your data:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Access:</strong> Request a copy of all data we hold about you.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Correction:</strong> Update or correct any inaccurate information.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Deletion:</strong> Request full account and data deletion at any time.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Portability:</strong> Export your data in a machine-readable format.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#d4af8a' }} />
                    <span><strong className="text-white">Objection:</strong> Object to specific data processing activities.</span>
                  </li>
                </ul>
                <p className="text-white/70 mt-4">
                  To exercise any of these rights, contact us at <Link href="/contact" className="text-white underline">our support center</Link>. We respond within 48 hours.
                </p>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Technical Stewardship</h2>
                <p>
                  Prime Logic Solutions, USA serves as the technical steward of this platform. They are bound by the same privacy principles outlined here and operate under strict data handling agreements.
                </p>
                <p>
                  No data is transferred to third parties without your explicit consent, except where legally required (e.g., payment processing, shipping logistics).
                </p>
              </div>

              <div className="glass-card p-8 sacred-glow">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Our Commitment</h2>
                  <p className="text-white/80 text-lg">
                    We treat your data with the same restraint and respect we apply to the sacred items we sell. Collection is minimal. Use is transparent. Sale is forbidden.
                  </p>
                  <p className="text-white/80 text-lg">
                    If we fail to uphold these standards, we expect to be held accountable. Privacy is not a marketing claim—it is a structural principle.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="section-title font-serif text-white mb-6">Questions or Concerns?</h2>
                <p>
                  If you have questions about how we handle your data, or if you wish to exercise any of your rights, please contact us.
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
