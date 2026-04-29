import React, { useState, useMemo } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, Filter, Eye, GitCompare, Home, Lightbulb, Gift } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';
import { FilterSection } from './FilterSection';

interface HomeBlessingProductCatalogProps {
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
type Purpose = 'blessing' | 'decor' | 'protective' | 'all';

export default function HomeBlessingProductCatalog({
  products,
  onAddToCart,
  wishlist = [],
  onToggleWishlist,
  onViewProduct,
  onQuickView,
  comparisonProducts = [],
  onToggleComparison
}: HomeBlessingProductCatalogProps) {
  const [selectedTradition, setSelectedTradition] = useState<Tradition>('all');
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const traditions = [
    { value: 'all' as const, label: 'All Traditions', color: 'slate', icon: '🏠', description: 'View all blessing traditions' },
    { value: 'islamic' as const, label: 'Islamic Home', color: 'emerald', icon: '☪', description: 'Barakah and blessings' },
    { value: 'christian' as const, label: 'Christian Home', color: 'blue', icon: '✝', description: 'Sacred home items' },
    { value: 'jewish' as const, label: 'Jewish Home', color: 'indigo', icon: '✡', description: 'Mezuzahs and rituals' },
    { value: 'shared' as const, label: 'Universal Home', color: 'amber', icon: '🌟', description: 'Cross-tradition blessings' },
  ];

  const purposes = [
    { value: 'all' as const, label: 'All Purposes', icon: Home, description: 'View all home blessing items' },
    { value: 'blessing' as const, label: 'Blessing Items', icon: Sparkles, description: 'Sacred blessing and prayer' },
    { value: 'decor' as const, label: 'Home Décor', icon: Lightbulb, description: 'Spiritual wall art and décor' },
    { value: 'protective' as const, label: 'Protection & Peace', icon: Star, description: 'Items for protection and peace' },
  ];

  const purposeContent = {
    blessing: {
      title: 'Blessing Items',
      subtitle: 'Sacred Blessing & Prayer',
      description: 'Beautiful handcrafted items for home blessings and daily prayers. From traditional religious objects to modern interpretations, sanctify your living space with authenticity.',
      examples: {
        islamic: ['Ayat al-Kursi plaques', 'Prayer mats', 'Quran stands', 'Calligraphy art', 'Dua wall hangings'],
        christian: ['House blessing crosses', 'Prayer wall art', 'Holy water fonts', 'Scripture plaques', 'Saint statues'],
        jewish: ['Mezuzah cases', 'Shabbat items', 'Blessing plaques', 'Hanukkah menorahs', 'Torah art'],
        shared: ['Blessing boxes', 'Prayer candles', 'Sacred symbols', 'Meditation items', 'Peace wall art'],
      },
    },
    decor: {
      title: 'Home Décor',
      subtitle: 'Spiritual Wall Art & Décor',
      description: 'Transform your home with spiritually meaningful décor that reflects your faith and values. From wall art to table items, create a sacred atmosphere throughout your living space.',
      examples: {
        islamic: ['Arabic calligraphy', 'Geometric patterns', 'Mosque art', 'Islamic lanterns', 'Decorative plates'],
        christian: ['Cross wall art', 'Scripture canvas', 'Religious paintings', 'Angel figurines', 'Sacred heart art'],
        jewish: ['Hebrew calligraphy', 'Jerusalem art', 'Star of David décor', 'Menorah displays', 'Shabbat table items'],
        shared: ['Interfaith symbols', 'Peace artwork', 'Blessing signs', 'Spiritual quotes', 'Sacred geometry'],
      },
    },
    protective: {
      title: 'Protection & Peace',
      subtitle: 'Items for Protection and Peace',
      description: 'Bring peace and protection to your home with traditional items believed to ward off negativity and invite divine blessings. Honor ancient practices with authentic handcrafted pieces.',
      examples: {
        islamic: ['Ayat al-Kursi', 'Evil eye protection', 'Four Quls art', 'Protective amulets', 'Blessing plaques'],
        christian: ['Protection medals', 'Guardian angel items', 'Protective crosses', 'St. Benedict medals', 'Peace prayers'],
        jewish: ['Protective mezuzahs', 'Hamsa hands', 'Psalms art', 'Shema plaques', 'Chai symbols'],
        shared: ['Peace symbols', 'Protective amulets', 'Harmony items', 'Blessing tokens', 'Sacred protection art'],
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
  }, [products, selectedTradition, selectedPurpose, selectedCategories, selectedMaterials, selectedOrigins, priceRange, sortBy]);

  const currentPurpose = purposes.find(p => p.value === selectedPurpose);
  const currentTradition = traditions.find(t => t.value === selectedTradition);

  return (
    <div>
      <DiscoveryHero
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Celebrations', href: '#' },
          { label: 'Browse Home Blessing Products' },
        ]}
        title="Browse Home Blessing Products"
        subtitle="Discover Sacred Home Essentials"
        description="Explore handcrafted home blessing items across faith traditions. From mezuzahs to crosses to calligraphy, find meaningful pieces that sanctify your living space and welcome divine blessings."
        badges={[
          { icon: 'tradition' as const, label: 'All Three Faiths' },
          { icon: 'craft' as const, label: 'Artisan Crafted' },
          { icon: 'global' as const, label: 'Culturally Authentic' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile Filter Toggle */}
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
          {/* Advanced Filters Sidebar */}
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
                  {['home-blessings', 'wall-art', 'gift-sets', 'textiles', 'jewelry'].map((cat) => (
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
                  {['Holy Land', 'Jerusalem', 'Morocco', 'Turkey', 'Kashmir India'].map((origin) => (
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
                      <span className="text-sm text-secondary">{origin}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
        {/* Tradition Selector */}
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

        {/* Purpose Selector */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Browse by Purpose</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {purposes.map((purpose) => {
              const Icon = purpose.icon;
              const isSelected = selectedPurpose === purpose.value;
              return (
                <button
                  key={purpose.value}
                  onClick={() => setSelectedPurpose(purpose.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-purple-600 bg-purple-100 dark:bg-purple-900/20 shadow-lg'
                      : 'border-default bg-surface hover:border-purple-700'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                  <h3 className={`font-bold mb-2 ${isSelected ? 'text-primary' : 'text-primary'}`}>
                    {purpose.label}
                  </h3>
                  <p className="text-sm text-secondary">{purpose.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Purpose Information Card */}
        {selectedPurpose !== 'all' && purposeContent[selectedPurpose] && (
          <div className="mb-12 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-default">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-600 rounded-xl">
                {currentPurpose && <currentPurpose.icon className="w-8 h-8 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {purposeContent[selectedPurpose].title}
                </h3>
                <p className="text-lg text-accent font-medium mb-3">
                  {purposeContent[selectedPurpose].subtitle}
                </p>
                <p className="text-secondary leading-relaxed">
                  {purposeContent[selectedPurpose].description}
                </p>
              </div>
            </div>

            {/* Examples by Tradition */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {Object.entries(purposeContent[selectedPurpose].examples).map(([trad, items]) => (
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

        {/* Product Count & Sort */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-secondary">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            {selectedTradition !== 'all' && ` in ${currentTradition?.label}`}
            {selectedPurpose !== 'all' && ` for ${currentPurpose?.label.toLowerCase()}`}
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

        {/* Product Grid */}
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
                    onClick={() => onViewProduct && onViewProduct(product)}
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {onToggleWishlist && (
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
                    )}
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
                <div className="p-5">
                  <h3
                    className="font-semibold text-primary mb-1 line-clamp-2 cursor-pointer hover:text-accent transition-colors"
                    onClick={() => onViewProduct && onViewProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-secondary mb-3">{product.artisan}</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-secondary ml-1">
                      ({product.reviews || 0})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-accent">${product.price}</p>
                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-sm font-medium">Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary">No products found matching your criteria.</p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
