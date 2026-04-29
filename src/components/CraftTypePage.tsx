import React from 'react';
import { Heart, Scissors, Paintbrush, Hammer, BookOpen, Leaf } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';

interface CraftTypePageProps {
  craftType: string;
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const craftTypeData: Record<string, any> = {
  'handwoven': {
    title: 'Handwoven Textiles',
    subtitle: 'The Art of Thread & Loom',
    description: 'Experience the meditative craft of handweaving, where artisans interlace threads with precision and intention. From prayer rugs to wall hangings, each woven piece represents hours of skilled labor and centuries of textile tradition passed through generations.',
    badges: [
      { icon: 'craft' as const, label: 'Traditional Loom Work' },
      { icon: 'heritage' as const, label: 'Ancient Technique' },
    ],
    chips: [
      { label: 'Prayer Rugs' },
      { label: 'Wall Hangings' },
      { label: 'Table Textiles' },
      { label: 'Scarves & Shawls' },
    ],
    accentColor: 'blue',
    insightCard: {
      title: 'Weaving Tradition',
      content: 'Master weavers train for years to perfect tension, pattern, and rhythm. Each textile carries the unique signature of its maker\'s hands and cultural heritage.',
    },
  },
  'hand-carved': {
    title: 'Hand-Carved Works',
    subtitle: 'From Wood to Sacred Form',
    description: 'Witness the transformation of raw wood into intricate sacred art. Using techniques unchanged for centuries, master carvers create everything from ornate wall plaques to detailed religious figurines, each cut revealing deeper layers of meaning and beauty.',
    badges: [
      { icon: 'craft' as const, label: 'Traditional Carving' },
      { icon: 'art' as const, label: 'Sculptural Art' },
    ],
    chips: [
      { label: 'Walnut Carving' },
      { label: 'Olive Wood' },
      { label: 'Religious Motifs' },
      { label: 'Architectural Details' },
    ],
    accentColor: 'amber',
    insightCard: {
      title: 'Craftlore',
      content: 'Kashmir walnut wood carving dates back over 500 years. A single intricate panel can take a master artisan weeks to complete using only hand tools.',
    },
  },
  'hand-painted': {
    title: 'Hand-Painted Art',
    subtitle: 'Brush, Pigment & Devotion',
    description: 'From miniature Persian paintings to bold Islamic calligraphy, hand-painted works combine artistic skill with spiritual expression. Natural pigments and traditional techniques create vibrant pieces that honor both artistic and religious traditions.',
    badges: [
      { icon: 'art' as const, label: 'Traditional Painting' },
      { icon: 'tradition' as const, label: 'Sacred Art' },
    ],
    chips: [
      { label: 'Calligraphy' },
      { label: 'Miniature Art' },
      { label: 'Icon Painting' },
      { label: 'Ceramic Decoration' },
    ],
    accentColor: 'rose',
    insightCard: {
      title: 'Artist Note',
      content: 'Traditional Islamic calligraphy is considered the highest form of art, transforming divine words into visual beauty through disciplined practice and spiritual intention.',
    },
  },
  'hand-bound': {
    title: 'Hand-Bound Books',
    subtitle: 'The Sacred Craft of Binding',
    description: 'Discover journals, prayer books, and albums crafted using traditional bookbinding methods. From leather covers to hand-sewn signatures, these tactile treasures honor the written word and create lasting vessels for thoughts, prayers, and memories.',
    badges: [
      { icon: 'craft' as const, label: 'Traditional Binding' },
      { icon: 'heritage' as const, label: 'Artisan Paper' },
    ],
    chips: [
      { label: 'Leather Journals' },
      { label: 'Prayer Books' },
      { label: 'Guest Books' },
      { label: 'Photo Albums' },
    ],
    accentColor: 'slate',
    insightCard: {
      title: 'Binding History',
      content: 'Hand bookbinding techniques have remained largely unchanged since medieval monasteries, where monks preserved knowledge through careful craftsmanship.',
    },
  },
  'embroidered': {
    title: 'Embroidered Textiles',
    subtitle: 'Needle, Thread & Tradition',
    description: 'Explore textiles adorned with intricate embroidery, where needle and thread create raised patterns of stunning complexity. From Palestinian tatreez to Indian zardozi, embroidery transforms fabric into wearable art and decorative masterpieces.',
    badges: [
      { icon: 'craft' as const, label: 'Hand Embroidery' },
      { icon: 'location' as const, label: 'Regional Styles' },
    ],
    chips: [
      { label: 'Palestinian Tatreez' },
      { label: 'Kashmiri Embroidery' },
      { label: 'Gold Thread Work' },
      { label: 'Cross-Stitch Patterns' },
    ],
    accentColor: 'emerald',
    insightCard: {
      title: 'Cultural Significance',
      content: 'Traditional embroidery patterns often encode regional identity, family history, and cultural stories, with each stitch carrying meaning passed through generations.',
    },
  },
  'cast-forged': {
    title: 'Cast & Forged Metal',
    subtitle: 'Fire, Hammer & Form',
    description: 'Experience metalwork that combines ancient techniques with artistic vision. From hammered copper vessels to cast brass lanterns, these pieces showcase the mastery of fire and metal that has defined civilizations for millennia.',
    badges: [
      { icon: 'craft' as const, label: 'Traditional Metalwork' },
      { icon: 'heritage' as const, label: 'Ancient Methods' },
    ],
    chips: [
      { label: 'Copperware' },
      { label: 'Brass Lanterns' },
      { label: 'Forged Iron' },
      { label: 'Cast Vessels' },
    ],
    accentColor: 'amber',
    insightCard: {
      title: 'Metalwork Heritage',
      content: 'Middle Eastern copperwork and brass casting techniques date back thousands of years, with skills passed directly from master to apprentice in family workshops.',
    },
  },
  'paper-craft': {
    title: 'Paper Craft & Papier-mâché',
    subtitle: 'Layered Beauty',
    description: 'Discover the delicate art of papier-mâché, where layers of paper and natural adhesives create surprisingly strong and intricately painted objects. This traditional craft transforms humble materials into elegant boxes, ornaments, and decorative pieces.',
    badges: [
      { icon: 'craft' as const, label: 'Papier-mâché Art' },
      { icon: 'location' as const, label: 'Kashmir Specialty' },
    ],
    chips: [
      { label: 'Decorative Boxes' },
      { label: 'Ornaments' },
      { label: 'Wall Art' },
      { label: 'Vases & Vessels' },
    ],
    accentColor: 'blue',
    insightCard: {
      title: 'Kashmir Papier-mâché',
      content: 'Kashmiri papier-mâché dates to the 15th century, introduced by Persian artisans. The craft involves up to 12 stages, from paper pulp to final gold decoration.',
    },
  },
  'calligraphic': {
    title: 'Calligraphic Art',
    subtitle: 'Sacred Words Made Beautiful',
    description: 'Explore calligraphy as a spiritual practice and visual art form. From flowing Arabic script to Hebrew letters, skilled calligraphers transform sacred texts into works of profound beauty that inspire contemplation and reverence.',
    badges: [
      { icon: 'art' as const, label: 'Sacred Calligraphy' },
      { icon: 'tradition' as const, label: 'Multi-Faith' },
    ],
    chips: [
      { label: 'Arabic Calligraphy' },
      { label: 'Hebrew Script' },
      { label: 'Illuminated Texts' },
      { label: 'Modern Calligraphy' },
    ],
    accentColor: 'emerald',
    insightCard: {
      title: 'Art of Letters',
      content: 'Mastering calligraphy requires years of practice. In Islamic tradition, calligraphers are revered artists who beautify divine revelation through their craft.',
    },
  },
};

export default function CraftTypePage({
  craftType,
  products,
  onViewProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}: CraftTypePageProps) {
  const data = craftTypeData[craftType];

  if (!data) return null;

  return (
    <div>
      <DiscoveryHero
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Shop', href: '#' },
          { label: 'By Craft Type', href: '#' },
          { label: data.title },
        ]}
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        badges={data.badges}
        chips={data.chips}
        accentColor={data.accentColor}
        visualType="gradient"
        insightCard={data.insightCard}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-secondary">
            {products.length} {products.length === 1 ? 'product' : 'products'} featuring this craft
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
