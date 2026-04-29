import React, { useState, useMemo } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, Filter, Eye, GitCompare, Baby, Home, Gift, Package, X } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';
import { FilterSection } from './FilterSection';

interface WelcomeProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onViewProduct: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  comparisonProducts?: string[];
  onToggleComparison?: (id: string) => void;
}

type Occasion = 'birth' | 'naming' | 'blessing' | 'gifts' | 'all';
type Tradition = 'islamic' | 'christian' | 'jewish' | 'shared' | 'all';

const occasions = [
  { value: 'all' as const, label: 'All Occasions', icon: Gift, description: 'View all welcome essentials' },
  { value: 'birth' as const, label: 'Birth Celebration', icon: Baby, description: 'Welcome the new arrival' },
  { value: 'naming' as const, label: 'Naming Ceremony', icon: Star, description: 'Sacred naming traditions' },
  { value: 'blessing' as const, label: 'Home Blessing', icon: Home, description: 'Prepare the nursery and home' },
  { value: 'gifts' as const, label: 'Gifts & Keepsakes', icon: Sparkles, description: 'Meaningful gifts for family' },
];

const traditions = [
  { value: 'all' as const, label: 'All Traditions', color: 'slate', icon: '👶', description: 'View all welcome traditions' },
  { value: 'islamic' as const, label: 'Islamic Welcome', color: 'emerald', icon: '☪', description: 'Aqiqah and welcoming ceremonies' },
  { value: 'christian' as const, label: 'Christian Welcome', color: 'blue', icon: '✝', description: 'Baptism and dedication ceremonies' },
  { value: 'jewish' as const, label: 'Jewish Welcome', color: 'indigo', icon: '✡', description: 'Brit Milah and naming traditions' },
  { value: 'shared' as const, label: 'Universal Essentials', color: 'amber', icon: '🎁', description: 'Cross-tradition baby gifts' },
];

const occasionContent = {
  birth: {
    title: 'Birth Celebration',
    subtitle: 'Welcome the New Arrival',
    description: 'Beautiful handcrafted items to celebrate the arrival of a new baby. From decorative pieces to practical essentials, honor this sacred moment with items that carry cultural and spiritual meaning.',
    examples: {
      islamic: ['Prayer wall art', 'Ayatul Kursi frames', 'Decorative crescents', 'Bismillah plaques', 'Islamic mobiles'],
      christian: ['Cross wall décor', 'Prayer blessing frames', 'Angel figurines', 'Baptism candles', 'Scripture art'],
      jewish: ['Shema plaques', 'Star of David décor', 'Hebrew name art', 'Mezuzah for nursery', 'Blessing plaques'],
      shared: ['Custom name art', 'Welcome signs', 'Growth charts', 'Photo frames', 'Blessing plaques'],
    },
  },
  naming: {
    title: 'Naming Ceremony',
    subtitle: 'Sacred Naming Traditions',
    description: 'Honor the sacred tradition of naming your child with beautiful ceremonial items. From calligraphy art to blessing objects, celebrate this meaningful milestone with reverence.',
    examples: {
      islamic: ['Name calligraphy', 'Aqiqah décor', 'Prayer sets', 'Blessing frames', 'Custom name art'],
      christian: ['Baptism certificates', 'Name blessing frames', 'Prayer books', 'Dedication candles', 'Custom crosses'],
      jewish: ['Hebrew name art', 'Brit Milah items', 'Naming certificates', 'Blessing plaques', 'Torah textiles'],
      shared: ['Name plaques', 'Blessing boxes', 'Memory books', 'Keepsake frames', 'Custom artwork'],
    },
  },
  blessing: {
    title: 'Home Blessing',
    subtitle: 'Prepare the Nursery',
    description: 'Create a peaceful, blessed space for your new arrival. From nursery décor to protective blessings, fill your home with items that inspire comfort, safety, and spiritual connection.',
    examples: {
      islamic: ['Nursery wall art', 'Moon & star décor', 'Prayer tapestries', 'Protective verses', 'Soft prayer mats'],
      christian: ['Guardian angel décor', 'Prayer tapestries', 'Cross nightlights', 'Blessing plaques', 'Scripture textiles'],
      jewish: ['Nursery mezuzah', 'Shema décor', 'Star mobiles', 'Hebrew wall art', 'Blessing textiles'],
      shared: ['Blessing mobiles', 'Wall hangings', 'Soft textiles', 'Night lights', 'Decorative cushions'],
    },
  },
  gifts: {
    title: 'Gifts & Keepsakes',
    subtitle: 'Meaningful Family Gifts',
    description: 'Express love and blessings with thoughtful, handcrafted gifts for the new family. From keepsake boxes to memory books, share meaningful items that will be treasured for years.',
    examples: {
      islamic: ['Prayer bead sets', 'Quran gift boxes', 'Baby tasbih', 'Blessing pouches', 'Memory books'],
      christian: ['Rosary sets', 'Prayer journals', 'Cross keepsakes', 'Blessing boxes', 'Bible gift sets'],
      jewish: ['Prayer shawl sets', 'Kiddush cups', 'Blessing boxes', 'Memory albums', 'Torah gifts'],
      shared: ['Memory boxes', 'Handprint kits', 'Photo albums', 'Blessing journals', 'Keepsake pouches'],
    },
  },
};

export default function WelcomeProductCatalog({
  products,
  onViewProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onQuickView,
  comparisonProducts = [],
  onToggleComparison,
}: WelcomeProductCatalogProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>('all');
  const [selectedTradition, setSelectedTradition] = useState<Tradition>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(cat => product.category === cat);
      const materialMatch = selectedMaterials.length === 0 || selectedMaterials.some(mat => product.tags.includes(mat));
      const originMatch = selectedOrigins.length === 0 || selectedOrigins.some(origin => product.origin === origin);
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      return categoryMatch && materialMatch && originMatch && priceMatch;
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedOccasion, selectedTradition, selectedCategories, selectedMaterials, selectedOrigins, priceRange, sortBy]);

  const currentOccasion = occasions.find(o => o.value === selectedOccasion);
  const currentTradition = traditions.find(t => t.value === selectedTradition);

  return (
    <div>
      <DiscoveryHero
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Discover', href: '#' },
          { label: 'New Birth & Welcome' },
        ]}
        title="New Birth & Welcome"
        subtitle="Sacred Celebrations for New Beginnings"
        description="Welcome new life with beautiful, handcrafted items that honor your faith traditions. From birth celebrations to naming ceremonies, find meaningful gifts and décor that carry blessings, heritage, and love."
        badges={[
          { icon: 'tradition' as const, label: 'All Three Faiths' },
          { icon: 'heritage' as const, label: 'Cultural Treasures' },
          { icon: 'craft' as const, label: 'Handmade with Love' },
        ]}
        chips={[
          { label: 'Aqiqah' },
          { label: 'Baptism' },
          { label: 'Brit Milah' },
          { label: 'Baby Blessings' },
        ]}
        accentColor="rose"
        visualType="gradient"
        insightCard={{
          title: 'Celebrate New Life',
          content: 'Welcoming a new baby is a sacred moment across all faiths. These essentials support every milestone from birth to blessing with reverence and love.',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex gap-8">
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-surface rounded-xl shadow-theme-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                {(selectedCategories.length > 0 || selectedMaterials.length > 0 || selectedOrigins.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedMaterials([]);
                      setSelectedOrigins([]);
                      setPriceRange([0, 500]);
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <FilterSection
                title="Price Range"
                isOpen={true}
              >
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-secondary">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Category" isOpen={true}>
                <div className="space-y-2">
                  {['wall-art', 'home-blessings', 'jewelry', 'baby-care', 'gift-sets', 'nursery'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat));
                          }
                        }}
                        className="rounded border-default text-accent focus:ring-purple-600"
                      />
                      <span className="text-sm text-secondary capitalize">{cat.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Material" isOpen={true}>
                <div className="space-y-2">
                  {['cotton', 'silk', 'ceramic', 'wood', 'metal', 'paper'].map((mat) => (
                    <label key={mat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.includes(mat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMaterials([...selectedMaterials, mat]);
                          } else {
                            setSelectedMaterials(selectedMaterials.filter(m => m !== mat));
                          }
                        }}
                        className="rounded border-default text-accent focus:ring-purple-600"
                      />
                      <span className="text-sm text-secondary capitalize">{mat}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Origin" isOpen={true}>
                <div className="space-y-2">
                  {['turkey', 'morocco', 'india', 'palestine', 'jerusalem'].map((origin) => (
                    <label key={origin} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOrigins.includes(origin)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrigins([...selectedOrigins, origin]);
                          } else {
                            setSelectedOrigins(selectedOrigins.filter(o => o !== origin));
                          }
                        }}
                        className="rounded border-default text-accent focus:ring-purple-600"
                      />
                      <span className="text-sm text-secondary capitalize">{origin.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-6">Choose Your Occasion</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {occasions.map((occasion) => {
                  const Icon = occasion.icon;
                  const isSelected = selectedOccasion === occasion.value;
                  return (
                    <button
                      key={occasion.value}
                      onClick={() => setSelectedOccasion(occasion.value)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-purple-600 bg-purple-100 dark:bg-purple-900/20 shadow-lg'
                          : 'border-default bg-surface hover:border-purple-700'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                      <h3 className={`font-bold mb-2 ${isSelected ? 'text-primary' : 'text-primary'}`}>
                        {occasion.label}
                      </h3>
                      <p className="text-sm text-secondary">{occasion.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-6">Select Faith Tradition</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {traditions.map((tradition) => {
                  const isSelected = selectedTradition === tradition.value;
                  return (
                    <button
                      key={tradition.value}
                      onClick={() => setSelectedTradition(tradition.value)}
                      className={`p-5 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? `border-${tradition.color}-500 bg-${tradition.color}-50 dark:bg-${tradition.color}-900/20 shadow-lg`
                          : 'border-default bg-surface hover:border-hover'
                      }`}
                    >
                      <div className="text-4xl mb-2">{tradition.icon}</div>
                      <h3 className={`font-bold text-sm mb-1 ${isSelected ? `text-${tradition.color}-900 dark:text-${tradition.color}-100` : 'text-primary'}`}>
                        {tradition.label}
                      </h3>
                      <p className="text-xs text-secondary">{tradition.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedOccasion !== 'all' && occasionContent[selectedOccasion] && (
              <div className="mb-12 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-default">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-purple-600 rounded-xl">
                    {currentOccasion && <currentOccasion.icon className="w-8 h-8 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {occasionContent[selectedOccasion].title}
                    </h3>
                    <p className="text-lg text-accent font-medium mb-3">
                      {occasionContent[selectedOccasion].subtitle}
                    </p>
                    <p className="text-secondary leading-relaxed">
                      {occasionContent[selectedOccasion].description}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {Object.entries(occasionContent[selectedOccasion].examples).map(([trad, items]) => (
                    <div key={trad} className="bg-surface rounded-lg p-4">
                      <h4 className="font-semibold text-sm text-primary mb-3 capitalize">{trad} Items</h4>
                      <ul className="space-y-1.5">
                        {items.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="text-xs text-secondary flex items-start gap-2">
                            <Sparkles className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <p className="text-secondary">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                {selectedOccasion !== 'all' && ` for ${currentOccasion?.label.toLowerCase()}`}
                {selectedTradition !== 'all' && ` in ${currentTradition?.label}`}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-secondary">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-default dark:border-gray-600 bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
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
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(product.id);
                          }}
                          className="bg-surface/90 backdrop-blur-sm rounded-full p-2 hover:bg-surface transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              wishlist.includes(product.id)
                                ? 'fill-accent text-accent'
                                : 'text-secondary'
                            }`}
                          />
                        </button>
                        {onQuickView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView(product);
                            }}
                            className="bg-surface/90 backdrop-blur-sm rounded-full p-2 hover:bg-surface transition-colors"
                          >
                            <Eye className="w-5 h-5 text-secondary" />
                          </button>
                        )}
                        {onToggleComparison && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComparison(product.id);
                            }}
                            className={`bg-surface/90 backdrop-blur-sm rounded-full p-2 hover:bg-surface transition-colors ${
                              comparisonProducts.includes(product.id) ? 'ring-2 ring-purple-600' : ''
                            }`}
                          >
                            <GitCompare className={`w-5 h-5 ${comparisonProducts.includes(product.id) ? 'text-accent' : 'text-secondary'}`} />
                          </button>
                        )}
                      </div>
                      {product.tags.includes('baby-safe') && (
                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Baby className="w-3 h-3" />
                          Baby-Safe
                        </div>
                      )}
                    </div>
                    <div className="p-4 cursor-pointer" onClick={() => onViewProduct(product)}>
                      <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-secondary mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating!)
                                    ? 'fill-purple-400 text-purple-400'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-secondary">
                            ({product.reviews || 0})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-accent font-bold text-lg">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-muted line-through text-sm">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface rounded-xl">
                <Package className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No products found</h3>
                <p className="text-secondary mb-6">
                  Try selecting different occasions or traditions to see more items
                </p>
                <button
                  onClick={() => {
                    setSelectedOccasion('all');
                    setSelectedTradition('all');
                  }}
                  className="text-accent font-semibold hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  View all welcome essentials
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Baby className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Baby-Safe Materials</h3>
            <p className="text-sm text-secondary">
              All items carefully selected with non-toxic, baby-safe materials and craftsmanship
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Culturally Authentic</h3>
            <p className="text-sm text-secondary">
              Each tradition honored with care, authenticity, and deep cultural respect
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Gift className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Perfect for Gifting</h3>
            <p className="text-sm text-secondary">
              Beautiful, meaningful gifts that will be treasured for generations to come
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
