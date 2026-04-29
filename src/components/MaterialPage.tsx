import React from 'react';
import { Heart, TreePine, Flame, Sparkles, Droplet, Mountain } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';

interface MaterialPageProps {
  material: string;
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const materialData: Record<string, any> = {
  'wood': {
    title: 'Wood Crafts',
    subtitle: 'Nature Transformed by Hand',
    description: 'From ancient olive groves to Himalayan walnut forests, sacred woods carry the essence of nature and time. Artisans transform these precious materials into objects of beauty and devotion, honoring both the tree and the tradition.',
    badges: [
      { icon: 'craft' as const, label: 'Natural Material' },
      { icon: 'heritage' as const, label: 'Sustainable Sourcing' },
    ],
    chips: [
      { label: 'Walnut Wood' },
      { label: 'Olive Wood' },
      { label: 'Cedar Wood' },
      { label: 'Sandalwood' },
    ],
    accentColor: 'amber',
    insightCard: {
      title: 'Wood as Sacred Material',
      content: 'Olive wood from the Holy Land and walnut from Kashmir carry spiritual significance in their origins. Each grain pattern tells the story of decades of growth.',
    },
  },
  'ceramic': {
    title: 'Ceramic Works',
    subtitle: 'Earth, Fire & Glaze',
    description: 'Explore the ancient alchemy of ceramic arts, where earth becomes vessel through the transformative power of fire. From hand-thrown pottery to intricately painted tiles, ceramic works blend function with timeless beauty.',
    badges: [
      { icon: 'craft' as const, label: 'Traditional Pottery' },
      { icon: 'art' as const, label: 'Hand-Painted Designs' },
    ],
    chips: [
      { label: 'Turkish Ceramics' },
      { label: 'Moroccan Tiles' },
      { label: 'Persian Pottery' },
      { label: 'Hand-Thrown Vessels' },
    ],
    accentColor: 'blue',
    insightCard: {
      title: 'Ceramic Heritage',
      content: 'Turkish Iznik ceramics and Persian pottery traditions date back centuries, with signature blue and turquoise glazes created from closely guarded recipes passed through generations.',
    },
  },
  'brass': {
    title: 'Brass Crafts',
    subtitle: 'Golden Metal Artistry',
    description: 'Discover the warm glow of brass, a copper-zinc alloy prized for centuries in sacred objects and decorative arts. Skilled metalworkers hammer, cast, and engrave brass into lanterns, vessels, and ornamental pieces that reflect light and tradition.',
    badges: [
      { icon: 'craft' as const, label: 'Traditional Metalwork' },
      { icon: 'location' as const, label: 'Middle Eastern Craft' },
    ],
    chips: [
      { label: 'Brass Lanterns' },
      { label: 'Incense Burners' },
      { label: 'Decorative Trays' },
      { label: 'Candleholders' },
    ],
    accentColor: 'amber',
    insightCard: {
      title: 'Working with Brass',
      content: 'Traditional brass casting and engraving requires years of apprenticeship. The metal\'s durability and luster make it ideal for sacred objects meant to last generations.',
    },
  },
  'copper': {
    title: 'Copper Works',
    subtitle: 'The Ancient Metal',
    description: 'Experience copperwork, one of humanity\'s oldest metalcrafts. Artisans hammer, chase, and polish copper into functional art—from gleaming serving vessels to decorative wall pieces that develop a beautiful patina over time.',
    badges: [
      { icon: 'craft' as const, label: 'Hand-Hammered' },
      { icon: 'heritage' as const, label: 'Ancient Technique' },
    ],
    chips: [
      { label: 'Hammered Vessels' },
      { label: 'Serving Ware' },
      { label: 'Wall Décor' },
      { label: 'Traditional Cookware' },
    ],
    accentColor: 'rose',
    insightCard: {
      title: 'Copper Tradition',
      content: 'Middle Eastern coppersmithing dates back millennia. Master craftspeople can shape a single sheet of copper into complex forms using only hammers and traditional techniques.',
    },
  },
  'textile': {
    title: 'Sacred Textiles',
    subtitle: 'Woven Stories & Traditions',
    description: 'Textiles carry culture in every thread. From prayer rugs to ceremonial cloths, handwoven and embroidered textiles represent some of humanity\'s most ancient and universal crafts, creating portable beauty and spiritual connection.',
    badges: [
      { icon: 'craft' as const, label: 'Handwoven & Embroidered' },
      { icon: 'tradition' as const, label: 'Multi-Cultural' },
    ],
    chips: [
      { label: 'Prayer Rugs' },
      { label: 'Embroidered Textiles' },
      { label: 'Woven Wall Art' },
      { label: 'Ceremonial Cloths' },
    ],
    accentColor: 'blue',
    insightCard: {
      title: 'Textile Traditions',
      content: 'Textile arts are found in every culture, from Persian carpet weaving to Palestinian embroidery. Each region develops distinctive patterns and techniques over centuries.',
    },
  },
  'leather': {
    title: 'Leather Goods',
    subtitle: 'Timeless Durability',
    description: 'Leather craftsmanship creates objects that improve with age and use. From hand-bound journals to decorative boxes, artisan leatherwork combines functionality with beauty, developing character through time and touch.',
    badges: [
      { icon: 'craft' as const, label: 'Hand-Tooled' },
      { icon: 'heritage' as const, label: 'Traditional Tanning' },
    ],
    chips: [
      { label: 'Bound Journals' },
      { label: 'Moroccan Leather' },
      { label: 'Tooled Designs' },
      { label: 'Prayer Book Covers' },
    ],
    accentColor: 'amber',
    insightCard: {
      title: 'Leather Heritage',
      content: 'Moroccan leather tanning and tooling techniques remain largely unchanged for centuries, with natural dyes and traditional embossing creating distinctive regional styles.',
    },
  },
  'paper': {
    title: 'Paper Arts',
    subtitle: 'From Pulp to Beauty',
    description: 'Paper becomes art through layering, cutting, folding, and painting. From Kashmiri papier-mâché to handmade prayer cards, paper arts demonstrate how simple materials can be transformed into objects of stunning complexity and beauty.',
    badges: [
      { icon: 'craft' as const, label: 'Handmade Paper' },
      { icon: 'art' as const, label: 'Decorative Arts' },
    ],
    chips: [
      { label: 'Papier-mâché' },
      { label: 'Handmade Paper' },
      { label: 'Paper Cutting' },
      { label: 'Calligraphy' },
    ],
    accentColor: 'blue',
    insightCard: {
      title: 'Paper Craft History',
      content: 'Islamic world preserved and advanced papermaking techniques from China, creating centers of paper production that enabled the spread of knowledge and artistic expression.',
    },
  },
  'glass': {
    title: 'Glass Artistry',
    subtitle: 'Light Through Color',
    description: 'Molten glass takes shape through breath and skill, creating vessels and art that capture and transform light. From traditional blown glass to painted and etched pieces, glass arts combine fragility with enduring beauty.',
    badges: [
      { icon: 'craft' as const, label: 'Hand-Blown Glass' },
      { icon: 'art' as const, label: 'Colored & Etched' },
    ],
    chips: [
      { label: 'Blown Glass' },
      { label: 'Painted Glass' },
      { label: 'Mosaic Glass' },
      { label: 'Stained Glass' },
    ],
    accentColor: 'emerald',
    insightCard: {
      title: 'Glass Traditions',
      content: 'Hebron glass blowing and Turkish glass arts represent centuries-old techniques, with each piece shaped entirely by hand using methods passed directly from master to apprentice.',
    },
  },
  'mixed': {
    title: 'Mixed Materials',
    subtitle: 'Combining Craft Traditions',
    description: 'Some of the most compelling pieces combine multiple materials and techniques—wood inlaid with mother-of-pearl, metal adorned with precious stones, textiles embellished with metallic threads. These works showcase the full range of artisan mastery.',
    badges: [
      { icon: 'craft' as const, label: 'Multi-Technique' },
      { icon: 'art' as const, label: 'Complex Artistry' },
    ],
    chips: [
      { label: 'Inlay Work' },
      { label: 'Mixed Media' },
      { label: 'Embellished Pieces' },
      { label: 'Composite Crafts' },
    ],
    accentColor: 'slate',
    insightCard: {
      title: 'Mastery Across Materials',
      content: 'Creating mixed-material pieces requires expertise in multiple crafts. Artisans often collaborate, combining their specialized skills to create truly exceptional works.',
    },
  },
};

export default function MaterialPage({
  material,
  products,
  onViewProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}: MaterialPageProps) {
  const data = materialData[material];

  if (!data) return null;

  return (
    <div>
      <DiscoveryHero
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Shop', href: '#' },
          { label: 'By Material', href: '#' },
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
            {products.length} {products.length === 1 ? 'product' : 'products'} crafted from {data.title.toLowerCase()}
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
