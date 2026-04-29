import React, { useState, useMemo } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, Filter, Eye, GitCompare, Gift, Package, Flower2, Book, Home, Users } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';
import { FilterSection } from './FilterSection';

interface RemembranceProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onViewProduct: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  comparisonProducts?: string[];
  onToggleComparison?: (id: string) => void;
}

type Occasion = 'memorial' | 'prayer' | 'home-tribute' | 'comfort' | 'gifts' | 'all';
type Tradition = 'islamic' | 'christian' | 'jewish' | 'shared' | 'all';

const occasions = [
  { value: 'all' as const, label: 'All Occasions', icon: Star, description: 'View all remembrance essentials' },
  { value: 'memorial' as const, label: 'Memorial Services', icon: Flower2, description: 'Ceremony and service items' },
  { value: 'prayer' as const, label: 'Prayer & Reflection', icon: Book, description: 'Spiritual comfort items' },
  { value: 'home-tribute' as const, label: 'Home Tributes', icon: Home, description: 'Personal memorial displays' },
  { value: 'comfort' as const, label: 'Comfort & Support', icon: Heart, description: 'Items for grieving families' },
  { value: 'gifts' as const, label: 'Condolence Gifts', icon: Gift, description: 'Thoughtful sympathy gifts' },
];

const traditions = [
  { value: 'all' as const, label: 'All Traditions', color: 'slate', icon: '🕊️', description: 'View all faith traditions' },
  { value: 'islamic' as const, label: 'Islamic Remembrance', color: 'emerald', icon: '☪', description: 'Janazah and remembrance traditions' },
  { value: 'christian' as const, label: 'Christian Remembrance', color: 'blue', icon: '✝', description: 'Funeral and memorial traditions' },
  { value: 'jewish' as const, label: 'Jewish Remembrance', color: 'indigo', icon: '✡', description: 'Shiva and yahrzeit traditions' },
  { value: 'shared' as const, label: 'Universal Tributes', color: 'amber', icon: '🌟', description: 'Cross-tradition memorial items' },
];

const occasionContent = {
  memorial: {
    title: 'Memorial Services',
    subtitle: 'Ceremony and Service Items',
    description: 'Beautiful handcrafted items for memorial services and ceremonies across faith traditions. From prayer items to tribute displays, honor your loved ones with reverence and dignity.',
    examples: {
      islamic: ['Prayer beads', 'Quran covers', 'Calligraphy art', 'White textiles', 'Incense burners'],
      christian: ['Cross displays', 'Candle holders', 'Memorial cards', 'Prayer books', 'White flowers'],
      jewish: ['Memorial candles', 'Prayer shawls', 'Kaddish cards', 'Torah covers', 'Yahrzeit items'],
      shared: ['Memory books', 'Guest registers', 'Photo frames', 'Tribute candles', 'Memorial programs'],
    },
  },
  prayer: {
    title: 'Prayer & Reflection',
    subtitle: 'Spiritual Comfort Items',
    description: 'Support spiritual healing and reflection with meaningful prayer items. From devotional books to meditation aids, find solace and peace during times of loss.',
    examples: {
      islamic: ['Prayer mats', 'Tasbih beads', 'Quran stands', 'Du\'a books', 'Meditation guides'],
      christian: ['Rosaries', 'Prayer journals', 'Scripture cards', 'Devotional books', 'Cross pendants'],
      jewish: ['Tehillim books', 'Prayer shawls', 'Kippot', 'Psalms booklets', 'Memorial prayers'],
      shared: ['Meditation cushions', 'Reflection journals', 'Comfort books', 'Prayer candles', 'Blessing cards'],
    },
  },
  'home-tribute': {
    title: 'Home Tributes',
    subtitle: 'Personal Memorial Displays',
    description: 'Create meaningful memorial spaces at home with beautiful tribute items. From memorial shelves to photo displays, keep cherished memories alive with dignity and grace.',
    examples: {
      islamic: ['Memorial plaques', 'Calligraphy verses', 'Photo frames', 'Candle holders', 'Prayer corners'],
      christian: ['Memorial crosses', 'Photo collages', 'Angel figurines', 'Memorial shelves', 'Remembrance boxes'],
      jewish: ['Yahrzeit plaques', 'Memorial lamps', 'Photo displays', 'Memory boxes', 'Hebrew inscriptions'],
      shared: ['Memory tables', 'Photo albums', 'Tribute shelves', 'Keepsake boxes', 'Memorial art'],
    },
  },
  comfort: {
    title: 'Comfort & Support',
    subtitle: 'Items for Grieving Families',
    description: 'Provide comfort and support to grieving families with thoughtful, meaningful items. From practical essentials to spiritual comfort items, show care during difficult times.',
    examples: {
      islamic: ['Comfort baskets', 'Prayer guides', 'Food containers', 'Comfort textiles', 'Healing books'],
      christian: ['Sympathy baskets', 'Comfort blankets', 'Prayer cards', 'Condolence books', 'Support guides'],
      jewish: ['Shiva baskets', 'Comfort foods', 'Memorial candles', 'Grief books', 'Support items'],
      shared: ['Care packages', 'Comfort blankets', 'Tea sets', 'Healing journals', 'Support books'],
    },
  },
  gifts: {
    title: 'Condolence Gifts',
    subtitle: 'Thoughtful Sympathy Gifts',
    description: 'Express sympathy and support with thoughtful, handcrafted condolence gifts. From memorial keepsakes to comfort items, share meaningful gestures during times of loss.',
    examples: {
      islamic: ['Prayer bead sets', 'Quran gift boxes', 'Charity donations', 'Memorial plaques', 'Comfort baskets'],
      christian: ['Memorial crosses', 'Prayer boxes', 'Sympathy cards', 'Angel keepsakes', 'Donation certificates'],
      jewish: ['Memorial candles', 'Charity boxes', 'Yahrzeit items', 'Memory books', 'Shiva stones'],
      shared: ['Memorial jewelry', 'Memory boxes', 'Condolence cards', 'Comfort items', 'Tribute plants'],
    },
  },
};

const remembrancePractices = {
  islamic: [
    { name: 'Janazah Prayer', description: 'Funeral prayer service' },
    { name: 'Three-Day Mourning', description: 'Initial mourning period' },
    { name: 'Forty-Day Remembrance', description: 'Extended remembrance period' },
    { name: 'Annual Remembrance', description: 'Yearly memorial observance' },
    { name: 'Sadaqah Jariyah', description: 'Ongoing charity in memory' },
    { name: 'Quran Recitation', description: 'Reading for the deceased' },
  ],
  christian: [
    { name: 'Funeral Service', description: 'Memorial worship service' },
    { name: 'Burial Rites', description: 'Committal ceremony' },
    { name: 'Memorial Mass', description: 'Remembrance liturgy' },
    { name: 'Prayer Vigil', description: 'Evening prayer service' },
    { name: 'Anniversary Mass', description: 'Annual remembrance' },
    { name: 'All Souls\' Day', description: 'Community remembrance' },
  ],
  jewish: [
    { name: 'Shiva', description: 'Seven-day mourning period' },
    { name: 'Shloshim', description: 'Thirty-day mourning period' },
    { name: 'Yahrzeit', description: 'Annual remembrance' },
    { name: 'Yizkor', description: 'Memorial prayer service' },
    { name: 'Kaddish', description: 'Mourner\'s prayer' },
    { name: 'Unveiling', description: 'Headstone dedication' },
  ],
};

export default function RemembranceProductCatalog({
  products,
  onViewProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onQuickView,
  comparisonProducts = [],
  onToggleComparison,
}: RemembranceProductCatalogProps) {
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
          { label: 'Remembrance' },
        ]}
        title="Remembrance"
        subtitle="Browse Reflection Products"
        description="Honor cherished memories with beautiful, handcrafted items for remembrance and reflection across faith traditions. From memorial services to home tributes, find meaningful pieces that bring comfort, dignity, and peace during times of loss."
        badges={[
          { icon: 'tradition' as const, label: 'All Three Faiths' },
          { icon: 'heritage' as const, label: 'Cultural Respect' },
          { icon: 'craft' as const, label: 'Handcrafted with Care' },
        ]}
        chips={[
          { label: 'Memorial Services' },
          { label: 'Prayer & Reflection' },
          { label: 'Home Tributes' },
          { label: 'Comfort Items' },
        ]}
        accentColor="slate"
        visualType="gradient"
        insightCard={{
          title: 'Honoring Sacred Memories',
          content: 'Every remembrance tradition offers unique ways to honor loved ones and find comfort. These handcrafted items support your spiritual practices with reverence and dignity.',
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

              <FilterSection title="Price Range" isOpen={true}>
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
                  {['wall-art', 'prayer', 'home-blessings', 'jewelry', 'gift-sets', 'memorial'].map((cat) => (
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
              <h2 className="text-2xl font-bold text-primary mb-6">Choose Occasion Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

            {selectedTradition !== 'all' && selectedTradition !== 'shared' && remembrancePractices[selectedTradition] && (
              <div className="mb-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-default">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {currentTradition?.label} Practices
                  </h3>
                  <p className="text-secondary">
                    Explore products for these sacred remembrance traditions
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {remembrancePractices[selectedTradition].map((practice, idx) => (
                    <div key={idx} className="bg-surface rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Flower2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">{practice.name}</h4>
                          <p className="text-xs text-secondary">{practice.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOccasion !== 'all' && occasionContent[selectedOccasion] && (
              <div className="mb-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-default">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-slate-600 rounded-xl">
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
                        {items.slice(0, 5).map((item, idx) => (
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
                  className="text-accent font-semibold hover:text-slate-700 dark:hover:text-slate-300"
                >
                  View all remembrance products
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Compassionate Care</h3>
            <p className="text-sm text-secondary">
              Every item selected with sensitivity and respect for your time of loss
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Cultural Sensitivity</h3>
            <p className="text-sm text-secondary">
              Honoring diverse remembrance traditions with authenticity and dignity
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Flower2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Meaningful Tributes</h3>
            <p className="text-sm text-secondary">
              Beautiful handcrafted items that honor cherished memories with grace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
