import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why Not Machine-Made',
  description: 'A contemplative reflection on the role of machine-made objects in spiritual practice and why handmade tools better serve the inner life.',
};

export default function WhyNotMachineMadePage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="hero-text font-serif text-white mb-6 leading-tight soft-glow">
                Why Not Machine-Made
              </h1>
              <div className="ethereal-divider"></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="space-y-6 text-white/70 leading-relaxed mb-16">
                <p className="text-center text-xl text-white/90 italic">
                  This is not a rejection of technology.
                  <br />
                  It is a question of appropriateness.
                </p>
              </div>

              <div className="space-y-6 text-white/70 leading-relaxed mb-16">
                <p>
                  Machines are powerful tools. They excel at speed, precision, and repetition. These qualities are essential in many areas of life. But spiritual practice asks for something different.
                </p>
                <p>
                  It asks for presence.
                </p>
              </div>

              <div className="ethereal-divider my-20"></div>

              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 text-white">
                  Speed Shapes the Body
                </h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p>
                    Machine-made objects are designed for efficiency. They are produced quickly, uniformly, and at scale. That speed does not disappear when the object is finished.
                  </p>
                  <p>
                    It carries forward into how the object is handled, replaced, and forgotten.
                  </p>
                  <p>
                    Spiritual practice moves in the opposite direction. It slows the breath. It steadies the body. It returns again and again to the same actions with awareness.
                  </p>
                  <p>
                    When the tools of practice are shaped by speed, they subtly train the body toward speed as well.
                  </p>
                </div>
              </section>

              <div className="ethereal-divider my-20"></div>

              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 text-white">
                  Uniformity Flattens Attention
                </h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p>
                    Machine-made objects are identical by design. Uniformity is their success.
                  </p>
                  <p>
                    But attention is sharpened by difference. Slight variation invites noticing. It keeps the mind present rather than automatic.
                  </p>
                  <p>
                    Handmade objects carry small differences that interrupt autopilot. They ask the hands and eyes to stay awake. This supports remembrance rather than routine.
                  </p>
                </div>
              </section>

              <div className="ethereal-divider my-20"></div>

              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 text-white">
                  Noise Without Sound
                </h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p>
                    Many machine-made spiritual products are not loud in volume, but loud in effect. They introduce novelty, features, and stimulation that pull awareness outward.
                  </p>
                  <p>
                    The soul does not need more signals.
                    <br />
                    It needs fewer interruptions.
                  </p>
                  <p>
                    A tool meant for prayer, reflection, or study should recede into the background, not compete for attention.
                  </p>
                </div>
              </section>

              <div className="ethereal-divider my-20"></div>

              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 text-white">
                  Disposability Weakens Commitment
                </h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p>
                    Machine-made objects are easy to replace. When something is easily replaced, it is rarely cared for deeply.
                  </p>
                  <p>
                    Spiritual practice depends on continuity. The same mat. The same beads. The same worn pages. Over time, these objects absorb routine and memory.
                  </p>
                  <p>
                    Disposability breaks that relationship.
                  </p>
                </div>
              </section>

              <div className="ethereal-divider my-20"></div>

              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 text-white">
                  Separation From Human Labor
                </h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p>
                    Machine-made objects often hide the human entirely. The hands that made them are invisible. The conditions of their making are distant or unknown.
                  </p>
                  <p>
                    Spiritual life is inseparable from ethical awareness. Tools used for inner work should not require the user to look away from how they came into being.
                  </p>
                  <p>
                    Visibility of labor encourages gratitude. Anonymity encourages neglect.
                  </p>
                </div>
              </section>

              <div className="ethereal-divider my-20"></div>

              <section className="mb-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 text-white">
                  Technology Is Not the Enemy
                </h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p>
                    This page is not an argument against machines.
                  </p>
                  <p>
                    Technology serves many purposes well. But not every tool belongs in every space.
                  </p>
                  <p>
                    Just as silence belongs in certain moments, slowness belongs in spiritual practice.
                  </p>
                  <p>
                    Choosing handmade is not nostalgia. It is discernment.
                  </p>
                </div>
              </section>

              <div className="ethereal-divider my-20"></div>

              <div className="glass-card p-12 mb-16">
                <div className="space-y-6 text-white/80 leading-relaxed text-center">
                  <p className="text-xl text-white">
                    A Simple Principle
                  </p>
                  <div className="space-y-2">
                    <p>Tools shape habits.</p>
                    <p>Habits shape attention.</p>
                    <p>Attention shapes the soul.</p>
                  </div>
                  <p className="pt-6">
                    For practices that ask for humility, patience, and presence, tools made with those same qualities are not optional. They are aligned.
                  </p>
                  <p className="font-medium text-white">
                    That is why we choose handmade.
                  </p>
                </div>
              </div>

              <div className="space-y-6 text-white/70 leading-relaxed mb-16 text-center italic">
                <p>
                  We do not reject machines.
                  <br />
                  We simply refuse to let them shape our inner life.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-20 pt-12 border-t border-white/10">
              <Link href="/why-handmade">
                <button className="px-10 py-3.5 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                  Read: Why Handmade
                </button>
              </Link>
              <Link href="/collections">
                <button className="celestial-button text-white">
                  Explore Handmade Collections
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
