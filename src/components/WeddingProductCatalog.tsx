import React, { useState, useMemo } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, Filter, Eye, GitCompare, Package, Church, Users, Gift } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';
import { FilterSection } from './FilterSection';

interface WeddingProductCatalogProps {
  products: Product[];
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  comparisonProducts?: string[];
  onToggleComparison?: (id: string) => void;
}

type Tradition = 'islamic' | 'christian' | 'jewish' | 'shared' | 'all';
type Occasion = 'ceremony' | 'reception' | 'gifts' | 'attire' | 'all';

export default function WeddingProductCatalog({
  products,
  onAddToCart,
  wishlist = [],
  onToggleWishlist,
  onViewProduct,
  onQuickView,
  comparisonProducts = [],
  onToggleComparison
}: WeddingProductCatalogProps) {
  const [selectedTradition, setSelectedTradition] = useState<Tradition>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const traditions = [
    { value: 'all' as const, label: 'All Traditions', color: 'slate', icon: '💒', description: 'View all wedding traditions' },
    { value: 'islamic' as const, label: 'Islamic Wedding', color: 'emerald', icon: '☪', description: 'Nikah ceremonies and celebrations' },
    { value: 'christian' as const, label: 'Christian Wedding', color: 'blue', icon: '✝', description: 'Traditional and modern ceremonies' },
    { value: 'jewish' as const, label: 'Jewish Wedding', color: 'indigo', icon: '✡', description: 'Ketubah and sacred traditions' },
    { value: 'shared' as const, label: 'Universal Essentials', color: 'amber', icon: '💍', description: 'Cross-tradition wedding items' },
  ];

  const occasions = [
    { value: 'all' as const, label: 'All Occasions', icon: Gift, description: 'View all wedding essentials' },
    { value: 'ceremony' as const, label: 'Ceremony', icon: Church, description: 'Sacred ritual items and décor' },
    { value: 'reception' as const, label: 'Reception', icon: Users, description: 'Celebration and hospitality' },
    { value: 'gifts' as const, label: 'Gifts & Favors', icon: Sparkles, description: 'Guest appreciation and blessings' },
    { value: 'attire' as const, label: 'Attire & Accessories', icon: Star, description: 'Modest fashion and jewelry' },
  ];

  const occasionContent = {
    ceremony: {
      title: 'Ceremony Essentials',
      subtitle: 'Sacred Ritual Items',
      description: 'Beautiful handcrafted items for wedding ceremonies across faith traditions. From traditional religious objects to modern interpretations, honor your sacred union with authenticity.',
      examples: {
        islamic: ['Nikah contract frames', 'Prayer mats', 'Decorative Quran stands', 'Calligraphy art', 'Henna sets'],
        christian: ['Unity candles', 'Cross décor', 'Bible covers', 'Rosaries', 'Blessing plaques'],
        jewish: ['Ketubah art', 'Chuppah décor', 'Kiddush cups', 'Havdalah sets', 'Mezuzah cases'],
        shared: ['Unity ceremony items', 'Blessing boxes', 'Candle holders', 'Decorative vessels', 'Sacred textiles'],
      },
    },
    reception: {
      title: 'Reception Décor',
      subtitle: 'Celebration & Hospitality',
      description: 'Transform your celebration space with artisan-crafted décor that reflects your cultural heritage and personal style. From table settings to wall hangings, create a memorable atmosphere.',
      examples: {
        islamic: ['Lanterns', 'Serving trays', 'Table runners', 'Wall hangings', 'Centerpiece items'],
        christian: ['Cross centerpieces', 'Candle arrangements', 'Table blessings', 'Decorative plates', 'Wall art'],
        jewish: ['Challah boards', 'Shabbat items', 'Table linens', 'Blessing plaques', 'Decorative serving ware'],
        shared: ['Artisan tableware', 'Lanterns', 'Table textiles', 'Centerpieces', 'Decorative trays'],
      },
    },
    gifts: {
      title: 'Gifts & Favors',
      subtitle: 'Guest Appreciation',
      description: 'Express gratitude to your guests with meaningful, handcrafted favors. From small tokens to generous gifts, show appreciation with items that carry cultural and spiritual significance.',
      examples: {
        islamic: ['Prayer bead sets', 'Mini Qurans', 'Dates gift boxes', 'Blessing cards', 'Perfume bottles'],
        christian: ['Prayer cards', 'Mini crosses', 'Blessing bookmarks', 'Candle favors', 'Scripture boxes'],
        jewish: ['Mezuzah favors', 'Blessing cards', 'Honey pots', 'Prayer books', 'Candlesticks'],
        shared: ['Gift boxes', 'Blessing pouches', 'Handcrafted soaps', 'Candles', 'Artisan chocolates'],
      },
    },
    attire: {
      title: 'Attire & Accessories',
      subtitle: 'Modest Fashion & Jewelry',
      description: 'Complete your wedding look with elegant, culturally appropriate attire and accessories. From traditional garments to contemporary modest fashion, find pieces that honor your values.',
      examples: {
        islamic: ['Hijabs', 'Modest abayas', 'Jewelry sets', 'Decorative pins', 'Wedding scarves'],
        christian: ['Veils', 'Shawls', 'Cross necklaces', 'Rosary bracelets', 'Modest accessories'],
        jewish: ['Head coverings', 'Prayer shawls', 'Star jewelry', 'Modest wraps', 'Traditional accessories'],
        shared: ['Modest jewelry', 'Elegant scarves', 'Shawls', 'Hair accessories', 'Wedding veils'],
      },
    },
  };

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
  }, [products, selectedTradition, selectedOccasion, selectedCategories, selectedMaterials, selectedOrigins, priceRange, sortBy]);

  const currentOccasion = occasions.find(o => o.value === selectedOccasion);
  const currentTradition = traditions.find(t => t.value === selectedTradition);

  return (
    <div>
      <DiscoveryHero
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Celebrations', href: '#' },
          { label: 'Browse Wedding Products' },
        ]}
        title="Browse Wedding Products"
        subtitle="Discover Beautiful Wedding Essentials"
        description="Explore handcrafted wedding items across faith traditions. From ceremony essentials to reception décor, find meaningful pieces that honor your sacred union and cultural heritage."
        badges={[
          { icon: 'tradition' as const, label: 'All Three Faiths' },
          { icon: 'craft' as const, label: 'Artisan Crafted' },
          { icon: 'global' as const, label: 'Culturally Authentic' },
        ]}
        chips={[
          { label: 'Nikah Ceremonies' },
          { label: 'Christian Weddings' },
          { label: 'Jewish Traditions' },
          { label: 'Reception Décor' },
        ]}
        accentColor="rose"
        visualType="gradient"
        insightCard={{
          title: 'Celebrate with Reverence',
          content: 'Every wedding is a sacred celebration. These handcrafted essentials honor your faith traditions while adding beauty and meaning to your special day.',
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
                      setPriceRange([0, 1000]);
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <FilterSection title="Price Range" isOpen={true}>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
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
                  {['wedding', 'jewelry', 'home-blessings', 'wall-art', 'gift-sets', 'textiles'].map((cat) => (
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
                  {['silk', 'cotton', 'ceramic', 'wood', 'metal', 'glass'].map((mat) => (
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
                  {['holy-land', 'jerusalem', 'morocco', 'turkey', 'kashmir-india'].map((origin) => (
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
              <h2 className="text-2xl font-bold text-primary mb-6">Choose Occasion Type</h2>
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
                        onClick={() => onViewProduct?.(product)}
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist?.(product.id);
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
                    </div>
                    <div className="p-4 cursor-pointer" onClick={() => onViewProduct?.(product)}>
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
                          onAddToCart?.(product);
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
                  className="text-accent font-semibold hover:text-purple-700 dark:hover:text-purple-300"
                >
                  View all wedding products
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Church className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Sacred Traditions</h3>
            <p className="text-sm text-secondary">
              Honor your faith with items crafted to respect religious and cultural values
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Artisan Quality</h3>
            <p className="text-sm text-secondary">
              Each piece handcrafted by skilled artisans with attention to detail
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Meaningful Celebrations</h3>
            <p className="text-sm text-secondary">
              Make your special day unforgettable with authentic, beautiful essentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
