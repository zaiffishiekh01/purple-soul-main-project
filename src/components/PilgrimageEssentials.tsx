import React, { useState, useMemo } from 'react';
import { MapPin, Heart, ShoppingBag, Plane, Home, Gift, Star, Sparkles, Book, Package, Filter, X, ChevronDown, Eye, GitCompare, TrendingUp as TrendingUpIcon } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';
import { FilterSection } from './FilterSection';

interface PilgrimageEssentialsProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onQuickView?: (product: Product) => void;
  comparisonProducts?: string[];
  onToggleComparison?: (id: string) => void;
}

type JourneyStage = 'before' | 'during' | 'after' | 'all';
type Tradition = 'islamic' | 'christian' | 'jewish' | 'shared' | 'all';

const journeyStages = [
  { value: 'all' as const, label: 'All Stages', icon: Star, description: 'View all pilgrimage essentials' },
  { value: 'before' as const, label: 'Before the Journey', icon: Book, description: 'Preparation, intention, and spiritual readiness' },
  { value: 'during' as const, label: 'During the Journey', icon: Plane, description: 'Portable devotional and travel companions' },
  { value: 'after' as const, label: 'After the Journey', icon: Gift, description: 'Memory, return gifting, and home blessings' },
];

const traditions = [
  { value: 'all' as const, label: 'All Traditions', color: 'slate', icon: '🤲', description: 'View all faith traditions' },
  { value: 'islamic' as const, label: 'Islamic Tradition', color: 'emerald', icon: '☪', description: 'Hajj, Umrah, and sacred travel' },
  { value: 'christian' as const, label: 'Christian Tradition', color: 'blue', icon: '✝', description: 'Holy Land, pilgrimage sites' },
  { value: 'jewish' as const, label: 'Jewish Tradition', color: 'indigo', icon: '✡', description: 'Jerusalem, heritage sites' },
  { value: 'shared' as const, label: 'Shared Essentials', color: 'amber', icon: '🕊', description: 'Universal travel and gifting' },
];

const stageContent = {
  before: {
    title: 'Before the Journey',
    subtitle: 'Preparation & Spiritual Readiness',
    description: 'Sacred items for intention-setting, study, preparation, and packing. From prayer journals to devotional guides, begin your journey with mindfulness and reverence.',
    examples: {
      islamic: ['Prayer beads', 'Travel prayer mats', 'Quran covers', 'Reflection journals', 'Modest travel wraps', 'Dua cards'],
      christian: ['Rosaries', 'Prayer journals', 'Bible covers', 'Devotional candles', 'Travel crosses', 'Blessing cards'],
      jewish: ['Prayer book covers', 'Reflection journals', 'Travel pouches', 'Blessing cards', 'Keepsake objects'],
      shared: ['Handbound journals', 'Keepsake pouches', 'Blessing boxes', 'Travel scarves', 'Gratitude cards'],
    },
  },
  during: {
    title: 'During the Journey',
    subtitle: 'Portable Devotional Companions',
    description: 'Compact, practical, and respectful items for travel. Prayer companions, devotional tools, and keepsakes designed to support spiritual practice while away from home.',
    examples: {
      islamic: ['Compact prayer mats', 'Travel tasbih', 'Quran sleeves', 'Devotional pouches', 'Prayer time guides'],
      christian: ['Pocket rosaries', 'Compact crosses', 'Scripture sleeves', 'Prayer cards', 'Devotional pouches'],
      jewish: ['Travel prayer items', 'Compact ritual textiles', 'Blessing cards', 'Scripture pouches'],
      shared: ['Travel journals', 'Keepsake pouches', 'Blessing cards', 'Modest wraps', 'Reflection kits'],
    },
  },
  after: {
    title: 'After the Journey',
    subtitle: 'Memory, Gratitude & Return Gifting',
    description: 'Preserve sacred memories and share blessings with loved ones. From home décor to hospitality gifts, honor your journey and express gratitude through thoughtful, handcrafted treasures.',
    examples: {
      islamic: ['Lanterns', 'Calligraphy art', 'Prayer bead sets', 'Home blessings', 'Hospitality trays', 'Gift boxes'],
      christian: ['Wall crosses', 'Devotional art', 'Candle holders', 'Blessing plaques', 'Keepsake boxes', 'Host gifts'],
      jewish: ['Candlesticks', 'Table textiles', 'Blessing objects', 'Hospitality gifts', 'Keepsake boxes'],
      shared: ['Curated gift sets', 'Lanterns', 'Wall blessings', 'Journals', 'Sacred home décor', 'Table pieces'],
    },
  },
};

export default function PilgrimageEssentials({
  products,
  onViewProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onQuickView,
  comparisonProducts = [],
  onToggleComparison,
}: PilgrimageEssentialsProps) {
  const [selectedStage, setSelectedStage] = useState<JourneyStage>('all');
  const [selectedTradition, setSelectedTradition] = useState<Tradition>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const stageMatch = selectedStage === 'all' || product.tags.includes(`journey-${selectedStage}`);
      const traditionMatch = selectedTradition === 'all' || product.tags.includes(`tradition-${selectedTradition}`);
      const isPilgrimageItem = product.tags.includes('pilgrimage') || product.tags.includes('travel-friendly');

      const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(cat => product.category === cat);
      const materialMatch = selectedMaterials.length === 0 || selectedMaterials.some(mat => product.tags.includes(mat));
      const originMatch = selectedOrigins.length === 0 || selectedOrigins.some(origin => product.origin === origin);
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      return isPilgrimageItem && stageMatch && traditionMatch && categoryMatch && materialMatch && originMatch && priceMatch;
    });

    // Sort products
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
  }, [products, selectedStage, selectedTradition, selectedCategories, selectedMaterials, selectedOrigins, priceRange, sortBy]);

  const currentStage = journeyStages.find(s => s.value === selectedStage);
  const currentTradition = traditions.find(t => t.value === selectedTradition);

  return (
    <div>
      <DiscoveryHero
        breadcrumbs={[
          { label: 'Home', href: '#' },
          { label: 'Discover', href: '#' },
          { label: 'Pilgrimage Essentials' },
        ]}
        title="Pilgrimage Essentials"
        subtitle="Sacred Journey Companions"
        description="Thoughtfully curated pieces for preparation, travel, reflection, and meaningful return gifting across the Abrahamic traditions. Each item honors the spiritual significance of sacred journeys while serving practical needs."
        badges={[
          { icon: 'tradition' as const, label: 'All Three Faiths' },
          { icon: 'global' as const, label: 'Holy Land Artisans' },
          { icon: 'craft' as const, label: 'Travel-Ready' },
        ]}
        chips={[
          { label: 'Hajj & Umrah' },
          { label: 'Holy Land' },
          { label: 'Jerusalem' },
          { label: 'Sacred Sites' },
        ]}
        accentColor="emerald"
        visualType="gradient"
        insightCard={{
          title: 'Journey with Intention',
          content: 'Pilgrimage is a transformative spiritual practice across all Abrahamic faiths. These essentials support every stage of your sacred journey with reverence and authenticity.',
        }}
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
                  {['prayer', 'wall-art', 'home-blessings', 'jewelry', 'journals', 'gift-sets'].map((cat) => (
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
                  {['holy-land', 'jerusalem', 'kashmir-india', 'morocco', 'turkey'].map((origin) => (
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

          {/* Main Content */}
          <div className="flex-1">
        {/* Journey Stage Selector */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">Choose Your Journey Stage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {journeyStages.map((stage) => {
              const Icon = stage.icon;
              const isSelected = selectedStage === stage.value;
              return (
                <button
                  key={stage.value}
                  onClick={() => setSelectedStage(stage.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-purple-600 bg-purple-100 dark:bg-purple-900/20 shadow-lg'
                      : 'border-default bg-surface hover:border-purple-700'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                  <h3 className={`font-bold mb-2 ${isSelected ? 'text-primary' : 'text-primary'}`}>
                    {stage.label}
                  </h3>
                  <p className="text-sm text-secondary">{stage.description}</p>
                </button>
              );
            })}
          </div>
        </div>

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

        {/* Stage Information Card */}
        {selectedStage !== 'all' && stageContent[selectedStage] && (
          <div className="mb-12 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-default">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-600 rounded-xl">
                {currentStage && <currentStage.icon className="w-8 h-8 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {stageContent[selectedStage].title}
                </h3>
                <p className="text-lg text-accent font-medium mb-3">
                  {stageContent[selectedStage].subtitle}
                </p>
                <p className="text-secondary leading-relaxed">
                  {stageContent[selectedStage].description}
                </p>
              </div>
            </div>

            {/* Examples by Tradition */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {Object.entries(stageContent[selectedStage].examples).map(([trad, items]) => (
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
            {selectedStage !== 'all' && ` for ${currentStage?.label.toLowerCase()}`}
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
                  {product.tags.includes('travel-friendly') && (
                    <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      Travel-Ready
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
              Try selecting different journey stages or traditions to see more items
            </p>
            <button
              onClick={() => {
                setSelectedStage('all');
                setSelectedTradition('all');
              }}
              className="text-accent font-semibold hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              View all pilgrimage essentials
            </button>
          </div>
        )}

          </div>
        </div>

        {/* Educational Footer */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Holy Land Sourced</h3>
            <p className="text-sm text-secondary">
              Many items crafted by artisans in Jerusalem, Bethlehem, and sacred regions
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Respectfully Curated</h3>
            <p className="text-sm text-secondary">
              Each tradition honored with care, authenticity, and cultural sensitivity
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Gift className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Perfect for Gifting</h3>
            <p className="text-sm text-secondary">
              Return from your journey with meaningful, handcrafted blessings to share
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
