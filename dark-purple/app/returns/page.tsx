import { Metadata } from 'next';
import Link from 'next/link';
import { Package, Clock, RefreshCw, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Our return policy for handmade spiritual items.',
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="hero-text font-serif text-white mb-6 soft-glow">
                Returns & Refunds
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Understanding our return policy for handmade sacred items
              </p>
              <div className="ethereal-divider"></div>
            </div>

            <div className="prose prose-lg max-w-none mb-16">
              <div className="space-y-6 text-white/70 leading-relaxed">
                <p className="text-lg">
                  Handmade spiritual items require different considerations than mass-produced goods. Each piece is crafted by hand, making exact replacements difficult or impossible. Our return policy balances customer satisfaction with respect for artisan labor.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">30-Day Window</h3>
                <p className="text-white/60">
                  Returns must be initiated within 30 days of delivery. Items must be unused and in original condition with all tags and packaging.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Condition Matters</h3>
                <p className="text-white/60">
                  Because these are handmade items, we cannot accept returns of used products. Sacred items that have been used in practice cannot be resold.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Defects & Damage</h3>
                <p className="text-white/60">
                  Items damaged in shipping or with manufacturing defects are fully returnable. Contact us immediately with photos for expedited processing.
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Contact First</h3>
                <p className="text-white/60">
                  Always contact us before returning an item. We may be able to resolve issues without requiring a return, saving time for everyone.
                </p>
              </div>
            </div>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-16">
              <h2 className="section-title font-serif mb-8 text-white">
                What Can Be Returned
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4 items-start glass-card p-6">
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>✓</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Unused Items in Original Condition</h3>
                    <p className="text-sm text-white/60">
                      Products that have not been used, worn, or otherwise altered, with all original tags and packaging intact.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start glass-card p-6">
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>✓</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Items with Manufacturing Defects</h3>
                    <p className="text-sm text-white/60">
                      Products with structural flaws, incorrect materials, or religious inaccuracies—distinct from natural handmade variations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start glass-card p-6">
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>✓</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Damaged During Shipping</h3>
                    <p className="text-sm text-white/60">
                      Items that arrived broken, torn, or otherwise damaged due to shipping. Photo documentation required.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start glass-card p-6">
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>✓</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Incorrect Items Received</h3>
                    <p className="text-sm text-white/60">
                      If you received a different product than what you ordered, we will arrange immediate exchange or refund.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="section-title font-serif mb-8 text-white">
                What Cannot Be Returned
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4 items-start glass-card p-6 border-2" style={{ borderColor: '#d4af8a' }}>
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>×</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Used Sacred Items</h3>
                    <p className="text-sm text-white/60">
                      Prayer mats that have been prayed on, tasbih that have been used in dhikr, or any item used in spiritual practice cannot be returned for hygiene and sacred reasons.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start glass-card p-6 border-2" style={{ borderColor: '#d4af8a' }}>
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>×</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Custom or Personalized Items</h3>
                    <p className="text-sm text-white/60">
                      Products made to order with specific customizations, engravings, or personalization cannot be returned unless defective.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start glass-card p-6 border-2" style={{ borderColor: '#d4af8a' }}>
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>×</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Natural Handmade Variations</h3>
                    <p className="text-sm text-white/60">
                      Slight color variations, wood grain differences, or minor size variations are inherent to handmade items and not grounds for return.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start glass-card p-6 border-2" style={{ borderColor: '#d4af8a' }}>
                  <span className="text-2xl" style={{ color: '#d4af8a' }}>×</span>
                  <div>
                    <h3 className="font-medium text-white mb-1">Items Beyond Return Window</h3>
                    <p className="text-sm text-white/60">
                      Products for which more than 30 days have passed since delivery cannot be returned except in cases of defect discovered within reasonable use period.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="ethereal-divider my-20"></div>

            <section className="mb-16">
              <h2 className="section-title font-serif mb-8 text-white">
                How to Initiate a Return
              </h2>

              <div className="glass-card p-8">
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-white" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.8), rgba(184, 160, 220, 0.8))' }}>
                      1
                    </span>
                    <div>
                      <h3 className="font-medium text-white mb-2">Contact Support</h3>
                      <p className="text-white/60">
                        Email us at return.ps@dekoshurcrafts.com or use the contact form. Include your order number and reason for return.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-white" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.8), rgba(184, 160, 220, 0.8))' }}>
                      2
                    </span>
                    <div>
                      <h3 className="font-medium text-white mb-2">Provide Documentation</h3>
                      <p className="text-white/60">
                        For damage or defects, include clear photos. Our team will review and respond within 24 hours.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-white" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.8), rgba(184, 160, 220, 0.8))' }}>
                      3
                    </span>
                    <div>
                      <h3 className="font-medium text-white mb-2">Receive Authorization</h3>
                      <p className="text-white/60">
                        If approved, you'll receive a return authorization number and shipping instructions. Do not ship without authorization.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-white" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.8), rgba(184, 160, 220, 0.8))' }}>
                      4
                    </span>
                    <div>
                      <h3 className="font-medium text-white mb-2">Ship the Item</h3>
                      <p className="text-white/60">
                        Pack securely in original packaging if possible. We provide prepaid labels for defective items; customer pays return shipping for other returns.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-white" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.8), rgba(184, 160, 220, 0.8))' }}>
                      5
                    </span>
                    <div>
                      <h3 className="font-medium text-white mb-2">Receive Refund</h3>
                      <p className="text-white/60">
                        Refunds are processed within 5-7 business days after we receive and inspect the returned item. Original payment method will be credited.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </section>

            <div className="glass-card p-12 mb-16 sacred-glow">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-serif text-white">
                  Questions About Returns?
                </h3>
                <p className="text-white/70 max-w-2xl mx-auto">
                  Our support team is here to help. We understand that handmade items can raise unique questions, and we're committed to finding fair solutions.
                </p>
                <div className="pt-6">
                  <Link href="/contact">
                    <button className="celestial-button text-white px-10">
                      Contact Support
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
