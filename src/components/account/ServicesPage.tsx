import {
  Sparkles,
  ArrowLeft,
  Palette,
  BookOpen,
  Users,
  Gift,
  Calendar,
  MessageCircle,
  Camera,
  Globe,
  Heart,
  Package,
  Crown,
  Star,
  ArrowRight,
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (section: string) => void;
  onBack?: () => void;
}

const services = [
  {
    id: 'custom-design',
    title: 'Custom Design Studio',
    description: 'Work with our artisans to create bespoke pieces tailored to your vision',
    icon: Palette,
    color: 'from-purple-600 to-purple-700',
    features: ['Personal consultations', '3D previews', 'Unlimited revisions'],
  },
  {
    id: 'gift-registry',
    title: 'Gift Registry Service',
    description: 'Create and manage personalized gift registries for weddings, celebrations, and special occasions',
    icon: Gift,
    color: 'from-pink-600 to-pink-700',
    features: ['Custom registries', 'Guest management', 'Thank-you notes'],
  },
  {
    id: 'event-planning',
    title: 'Event Planning Assistance',
    description: 'Get expert guidance for cultural and religious events with curated product selections',
    icon: Calendar,
    color: 'from-blue-600 to-blue-700',
    features: ['Event checklists', 'Product recommendations', 'Timeline planning'],
  },
  {
    id: 'artisan-consultation',
    title: 'Artisan Consultation',
    description: 'Connect directly with master craftspeople for insights into traditional techniques',
    icon: Users,
    color: 'from-teal-600 to-teal-700',
    features: ['Live sessions', 'Q&A support', 'Behind-the-scenes access'],
  },
  {
    id: 'tradition-guides',
    title: 'Cultural Tradition Guides',
    description: 'Access comprehensive guides for cultural practices and their meaningful significance',
    icon: BookOpen,
    color: 'from-amber-600 to-amber-700',
    features: ['Detailed guides', 'Video content', 'Expert insights'],
  },
  {
    id: 'concierge',
    title: 'Personal Concierge',
    description: 'Dedicated support for premium members with priority service and exclusive access',
    icon: Crown,
    color: 'from-rose-600 to-rose-700',
    features: ['Priority support', 'Early access', 'Exclusive offers'],
  },
];

export default function ServicesPage({ onNavigate, onBack }: ServicesPageProps) {
  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Account
            </button>
          )}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-3">Our Services</h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Discover personalized services designed to enhance your cultural and spiritual journey
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-surface border border-default rounded-2xl shadow-theme-md overflow-hidden hover:shadow-theme-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
              >
                <div className={`bg-gradient-to-br ${service.color} p-6 text-white`}>
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-white/80">{service.description}</p>
                </div>

                <div className="p-6">
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-secondary">
                        <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className="w-full gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Something Special?</h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Our team is here to help you find or create the perfect piece for your cultural and spiritual needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Us
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-default rounded-xl p-6 text-center">
            <Camera className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-primary mb-2">Virtual Previews</h3>
            <p className="text-sm text-secondary">See how custom pieces will look before they're crafted</p>
          </div>

          <div className="bg-surface border border-default rounded-xl p-6 text-center">
            <Globe className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-primary mb-2">Worldwide Shipping</h3>
            <p className="text-sm text-secondary">We deliver handcrafted items to your doorstep globally</p>
          </div>

          <div className="bg-surface border border-default rounded-xl p-6 text-center">
            <Heart className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-primary mb-2">Satisfaction Guarantee</h3>
            <p className="text-sm text-secondary">100% satisfaction guarantee with easy returns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
