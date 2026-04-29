'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Heart, Sparkles, TrendingUp, Users, Shield, ArrowRight, CircleCheck as CheckCircle2, Store, Globe, Zap, Award, Clock, DollarSign, FileText } from 'lucide-react';

const BENEFITS = [
  {
    icon: Users,
    title: 'Engaged Community',
    description: 'Connect with customers who value authentic, handcrafted products',
    color: 'text-blue-400'
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Access powerful tools and analytics to scale your artisan craft',
    color: 'text-green-400'
  },
  {
    icon: Shield,
    title: 'Trusted Platform',
    description: 'Secure payments, buyer protection, and dedicated support',
    color: 'text-rose-gold'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Ship worldwide and reach customers across multiple continents',
    color: 'text-purple-400'
  },
  {
    icon: Zap,
    title: 'Easy Setup',
    description: 'Simple 8-step onboarding process with auto-save functionality',
    color: 'text-yellow-400'
  },
  {
    icon: Award,
    title: 'Quality First',
    description: 'Join a curated marketplace celebrating craftsmanship and integrity',
    color: 'text-orange-400'
  }
];

const FEATURES = [
  'Professional vendor dashboard with real-time analytics',
  'Inventory management and product listing tools',
  'Order processing and fulfillment tracking',
  'Customer messaging and review management',
  'Flexible shipping options and rate calculators',
  'Automated payout processing',
  'Marketing tools and promotional campaigns',
  'Dedicated vendor support team'
];

const STEPS = [
  {
    number: 1,
    title: 'Apply',
    description: 'Complete our 8-step application with your business details',
    icon: FileText
  },
  {
    number: 2,
    title: 'Review',
    description: 'Our team reviews your application within 2-3 business days',
    icon: Clock
  },
  {
    number: 3,
    title: 'Setup',
    description: 'Once approved, set up your shop and list your products',
    icon: Store
  },
  {
    number: 4,
    title: 'Sell',
    description: 'Start receiving orders and grow your artisan business',
    icon: DollarSign
  }
];

const STATS = [
  { value: '1,000+', label: 'Active Vendors' },
  { value: '50,000+', label: 'Products Listed' },
  { value: '25+', label: 'Countries Served' },
  { value: '4.8/5', label: 'Vendor Rating' }
];

export default function BecomeVendorPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/vendor/onboarding');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-gold/10 via-transparent to-purple-500/10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-rose-gold/20 text-rose-gold border-rose-gold/30 px-6 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Curated Artisan Marketplace
            </Badge>

            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
              Sell Your
              <span className="block mt-2 bg-gradient-to-r from-rose-gold to-purple-400 bg-clip-text text-transparent">
                Handcrafted Creations
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 mb-8 leading-relaxed">
              Join our community of artisan vendors and share your authentic,
              handmade products with customers who value quality, craftsmanship, and meaning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="celestial-button text-lg px-8 py-6 h-auto"
              >
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={() => router.push('/vendor-guidelines')}
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
              >
                View Guidelines
              </Button>
            </div>

            <p className="text-white/40 text-sm mt-6">
              Free to join • No monthly fees • Commission-based pricing
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
              Why Sell With Us?
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Everything you need to succeed as an artisan vendor
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="glass-card p-8 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-7 w-7 ${benefit.color}`} />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Simple 4-step process to start selling
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    <div className="glass-card p-6 text-center h-full">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-gold/20 border-2 border-rose-gold mb-4">
                        <Icon className="h-7 w-7 text-rose-gold" />
                      </div>
                      <div className="text-3xl font-bold text-rose-gold mb-2">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-serif text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {step.description}
                      </p>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-rose-gold/30" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-white/60">
                Powerful tools designed for artisan businesses
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 glass-card p-6 hover:bg-white/10 transition-all"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-white/80 text-lg">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-rose-gold/5 to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="h-16 w-16 text-rose-gold mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Our Commitment to Artisans
            </h2>
            <p className="text-xl text-white/70 leading-relaxed mb-8">
              We believe in supporting authentic craftsmanship and ethical business practices.
              Every vendor is carefully reviewed to ensure our marketplace maintains the highest
              standards of quality and integrity.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="glass-card p-6">
                <Building2 className="h-8 w-8 text-rose-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Handmade Focus</h3>
                <p className="text-white/60 text-sm">
                  We prioritize authentic handcrafted products over mass-produced items
                </p>
              </div>
              <div className="glass-card p-6">
                <Shield className="h-8 w-8 text-rose-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Ethical Standards</h3>
                <p className="text-white/60 text-sm">
                  Fair trade, sustainable materials, and transparent sourcing
                </p>
              </div>
              <div className="glass-card p-6">
                <Heart className="h-8 w-8 text-rose-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Community First</h3>
                <p className="text-white/60 text-sm">
                  Supporting small businesses and preserving traditional crafts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center glass-card p-12">
            <Sparkles className="h-16 w-16 text-rose-gold mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Ready to Start Selling?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of artisans who have found success on our platform.
              Your craft deserves to be seen by the world.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="celestial-button text-lg px-12 py-6 h-auto"
            >
              Begin Your Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-white/40 text-sm mt-6">
              Questions? <Link href="/contact" className="text-rose-gold hover:underline">Contact our vendor support team</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
