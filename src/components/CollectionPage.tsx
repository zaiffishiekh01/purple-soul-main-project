import React from 'react';
import { Heart, Sparkles, Moon, Flame, Package, Star } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';

interface CollectionPageProps {
  collection: string;
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const collectionData: Record<string, any> = {
  'sacred-home': {
    title: 'Sacred Home Collection',
    subtitle: 'Transform Your Living Space',
    description: 'Create a sanctuary of peace and spiritual reflection in your home. This curated collection brings together handcrafted items that honor sacred traditions while complementing modern living. From blessing plaques to meditation spaces, each piece invites mindfulness into daily life.',
    badges: [
      { icon: 'tradition' as const, label: 'Multi-Faith Traditions' },
      { icon: 'craft' as const, label: 'Artisan Crafted' },
    ],
    chips: [
      { label: 'Wall Blessings' },
      { label: 'Sacred Lighting' },
      { label: 'Prayer Corners' },
      { label: 'Meditation Spaces' },
    ],
    accentColor: 'blue',
    insightCard: {
      title: 'Design Philosophy',
      content: 'The Sacred Home collection bridges traditional spiritual elements with contemporary aesthetics, allowing you to honor your faith while maintaining your personal style.',
    },
    icon: Heart,
  },
  'prayer-reflection': {
    title: 'Prayer & Reflection',
    subtitle: 'Deepen Your Spiritual Practice',
    description: 'Enhance your spiritual journey with tools and textiles crafted for contemplation. From prayer rugs woven with intention to meditation cushions and sacred journals, each item supports a deeper connection to the divine and to yourself.',
    badges: [
      { icon: 'tradition' as const, label: 'All Faith Traditions' },
      { icon: 'heritage' as const, label: 'Time-Honored Craft' },
    ],
    chips: [
      { label: 'Prayer Rugs' },
      { label: 'Meditation Tools' },
      { label: 'Sacred Journals' },
      { label: 'Devotional Items' },
    ],
    accentColor: 'emerald',
    insightCard: {
      title: 'Spiritual Insight',
      content: 'Quality prayer items are not mere accessories—they are companions in your spiritual practice, designed to inspire focus, reverence, and inner peace.',
    },
    icon: Sparkles,
  },
  'light-lantern': {
    title: 'Light & Lantern Collection',
    subtitle: 'Illuminate Sacred Spaces',
    description: 'Light has held sacred significance across all traditions for millennia. This collection celebrates the universal symbolism of light through handcrafted candle holders, lanterns, and luminaries that bring warmth, hope, and divine presence into any space.',
    badges: [
      { icon: 'global' as const, label: 'Universal Symbolism' },
      { icon: 'craft' as const, label: 'Hand-Forged Metal' },
    ],
    chips: [
      { label: 'Moroccan Lanterns' },
      { label: 'Menorah Designs' },
      { label: 'Candle Holders' },
      { label: 'Oil Lamps' },
    ],
    accentColor: 'amber',
    insightCard: {
      title: 'Light in Tradition',
      content: 'From Hanukkah to Diwali, Christmas to Ramadan, light transcends traditions as a symbol of hope, divine presence, and spiritual awakening.',
    },
    icon: Flame,
  },
  'artisan-heritage': {
    title: 'Artisan Heritage',
    subtitle: 'Preserving Ancient Crafts',
    description: 'Celebrate master artisans who preserve centuries-old techniques passed down through generations. This collection honors traditional crafts at risk of disappearing, supporting artisan communities while bringing authentic cultural treasures into your life.',
    badges: [
      { icon: 'heritage' as const, label: 'Master Craftspeople' },
      { icon: 'location' as const, label: '14 Origin Countries' },
    ],
    chips: [
      { label: 'Walnut Carving' },
      { label: 'Papier-mâché' },
      { label: 'Copperwork' },
      { label: 'Embroidery' },
    ],
    accentColor: 'rose',
    insightCard: {
      title: 'Cultural Impact',
      content: 'Your purchase directly supports artisan families and helps preserve traditional crafts for future generations. Each item carries the story of its maker.',
    },
    icon: Package,
  },
  'limited-editions': {
    title: 'Limited Editions',
    subtitle: 'Exclusive & Rare Treasures',
    description: 'Discover one-of-a-kind pieces and limited production runs from renowned master artisans. These exclusive items represent the pinnacle of craftsmanship, available only in small quantities and never to be replicated.',
    badges: [
      { icon: 'art' as const, label: 'Collector Pieces' },
      { icon: 'heritage' as const, label: 'Master Artisan' },
    ],
    chips: [
      { label: 'Signed Originals' },
      { label: 'Numbered Series' },
      { label: 'Museum Quality' },
      { label: 'Investment Pieces' },
    ],
    accentColor: 'slate',
    insightCard: {
      title: 'Collector Note',
      content: 'Limited edition pieces often appreciate in value over time and become family heirlooms, carrying both artistic and spiritual significance.',
    },
    icon: Star,
  },
  'new-arrivals': {
    title: 'New Arrivals',
    subtitle: 'Fresh Discoveries',
    description: 'Explore the latest handcrafted treasures to join our marketplace. From newly discovered artisan workshops to seasonal creations, find fresh perspectives on traditional crafts and contemporary spiritual design.',
    badges: [
      { icon: 'tradition' as const, label: 'Just Added' },
      { icon: 'global' as const, label: 'Global Sources' },
    ],
    chips: [
      { label: 'This Month' },
      { label: 'Featured Artisans' },
      { label: 'Seasonal' },
      { label: 'Trending' },
    ],
    accentColor: 'emerald',
    insightCard: {
      title: 'What\'s New',
      content: 'New arrivals are added weekly as we connect with artisans worldwide. Be the first to discover unique pieces before they become favorites.',
    },
    icon: Sparkles,
  },
};

export default function CollectionPage({
  collection,
  products,
  onViewProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}: CollectionPageProps) {
  const data = collectionData[collection];

  if (!data) return null;

  const Icon = data.icon;

  return (
    <div>
      <DiscoveryHero
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Collections', href: '#' },
          { label: data.title },
        ]}
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        badges={data.badges}
        chips={data.chips}
        accentColor={data.accentColor}
        visualType="pattern"
        visualContent={data.insightCard.title}
        insightCard={data.insightCard}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-secondary">
            {products.length} {products.length === 1 ? 'product' : 'products'} in this collection
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-surface rounded-xl overflow-hidden shadow-theme-md hover:shadow-theme-xl transition-all"
            >
              <div className="relative aspect-square overflow-hidden bg-surface-deep">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  onClick={() => onViewProduct(product)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full p-2 hover:bg-surface transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlist.includes(product.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  />
                </button>
              </div>
              <div className="p-4 cursor-pointer" onClick={() => onViewProduct(product)}>
                <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-secondary mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-${data.accentColor}-600 dark:text-${data.accentColor}-400 font-bold text-lg`}>
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted line-through text-sm">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
