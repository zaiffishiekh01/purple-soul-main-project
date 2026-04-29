import { useState, useMemo } from 'react';
import { Star, Heart, ShoppingBag, Filter, X, ChevronDown, Eye, GitCompare, Users, TrendingUp as TrendingUpIcon, Layers, Crown, Clock, Calendar } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { FilterSection } from './FilterSection';
import DiscoveryHero from './DiscoveryHero';

interface ProductCatalogProps {
  searchQuery: string;
  onViewProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  userPreferences: {
    viewedProducts: string[];
    searchHistory: string[];
    preferredCategories: string[];
  };
  comparisonProducts: string[];
  onToggleComparison: (id: string) => void;
  onViewOrigin?: (origin: string) => void;
  onViewCraftType?: (craftType: string) => void;
  onViewMaterial?: (material: string) => void;
  onViewCollection?: (collection: string) => void;
  viewMode?: 'shop' | 'category' | 'subcategory' | 'collection';
  viewContext?: {
    type: 'category' | 'subcategory' | 'collection';
    value: string;
    title: string;
    subtitle?: string;
    description: string;
  };
}

export default function ProductCatalog({
  searchQuery,
  onViewProduct,
  onQuickView,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  userPreferences,
  comparisonProducts,
  onToggleComparison,
  onViewOrigin,
  onViewCraftType,
  onViewMaterial,
  onViewCollection,
  viewMode = 'shop',
  viewContext,
}: ProductCatalogProps) {
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedCraftTypes, setSelectedCraftTypes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const traditions = [
    { value: 'all', label: 'All Traditions' },
    { value: 'christian', label: 'Christian Tradition' },
    { value: 'jewish', label: 'Jewish Tradition' },
    { value: 'islamic', label: 'Islamic Tradition' },
    { value: 'abrahamic', label: 'Shared Abrahamic Heritage' },
    { value: 'interfaith', label: 'Interfaith & Universal' },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'wall-art', label: 'Wall Art & Calligraphy' },
    { value: 'prayer', label: 'Prayer Textiles & Accessories' },
    { value: 'home-blessings', label: 'Home Blessings & Decor' },
    { value: 'ceramics', label: 'Ceramics & Vessels' },
    { value: 'candles', label: 'Candles & Sacred Lighting' },
    { value: 'woodcraft', label: 'Woodcraft & Carved Objects' },
    { value: 'jewelry', label: 'Jewelry & Personal Items' },
    { value: 'journals', label: 'Handbound Journals & Paper' },
    { value: 'hospitality', label: 'Table & Hospitality' },
    { value: 'digital', label: 'Digital Products & Resources' },
    { value: 'electronics', label: 'Sacred Electronics & Tech' },
    { value: 'gift-sets', label: 'Curated Gift Sets' },
  ];

  const collections = [
    { value: 'all', label: 'All Collections' },
    { value: 'sacred-home', label: 'Sacred Home' },
    { value: 'prayer-reflection', label: 'Prayer & Reflection' },
    { value: 'light-lantern', label: 'Light & Lantern' },
    { value: 'artisan-heritage', label: 'Artisan Heritage' },
    { value: 'limited-editions', label: 'Limited Editions' },
    { value: 'new-arrivals', label: 'New Arrivals' },
  ];

  const origins = [
    { value: 'all', label: 'All Origins' },
    { value: 'kashmir-india', label: 'Kashmir, India' },
    { value: 'holy-land', label: 'Bethlehem / Holy Land' },
    { value: 'jerusalem', label: 'Jerusalem' },
    { value: 'morocco', label: 'Morocco' },
    { value: 'turkey', label: 'Turkey / Anatolia' },
    { value: 'iran', label: 'Iran / Persia' },
    { value: 'egypt', label: 'Egypt' },
    { value: 'armenia', label: 'Armenia' },
    { value: 'ethiopia', label: 'Ethiopia' },
    { value: 'lebanon', label: 'Lebanon' },
    { value: 'jordan', label: 'Jordan' },
    { value: 'greece', label: 'Greece' },
    { value: 'italy', label: 'Italy' },
    { value: 'spain', label: 'Spain' },
  ];

  const materials = [
    { value: 'wood', label: 'Wood' },
    { value: 'ceramic', label: 'Ceramic' },
    { value: 'brass', label: 'Brass' },
    { value: 'copper', label: 'Copper' },
    { value: 'textile', label: 'Textile' },
    { value: 'leather', label: 'Leather' },
    { value: 'paper', label: 'Paper' },
    { value: 'glass', label: 'Glass' },
    { value: 'mixed', label: 'Mixed Material' },
  ];

  const craftTypes = [
    { value: 'handwoven', label: 'Handwoven' },
    { value: 'hand-carved', label: 'Hand-carved' },
    { value: 'hand-painted', label: 'Hand-painted' },
    { value: 'hand-bound', label: 'Hand-bound' },
    { value: 'embroidered', label: 'Embroidered' },
    { value: 'cast-forged', label: 'Cast & Forged' },
    { value: 'paper-craft', label: 'Paper Craft' },
    { value: 'calligraphic', label: 'Calligraphic Art' },
  ];

  const availability = [
    { value: 'in-stock', label: 'In Stock' },
    { value: 'made-to-order', label: 'Made to Order' },
    { value: 'limited-edition', label: 'Limited Edition' },
  ];

  const toggleFilter = (state: string[], setState: (value: string[]) => void, value: string) => {
    if (value === 'all') {
      setState([]);
    } else if (state.includes(value)) {
      setState(state.filter(v => v !== value));
    } else {
      setState([...state, value]);
    }
  };

  const filteredProducts = useMemo(() => {
    let products = mockProducts.filter(product => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesTradition = selectedTraditions.length === 0 ||
        selectedTraditions.some(t => product.tags.includes(t));

      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesCollection = selectedCollections.length === 0 ||
        selectedCollections.some(c => product.tags.includes(c));

      const matchesOrigin = selectedOrigins.length === 0 ||
        selectedOrigins.some(o => product.tags.includes(o));

      const matchesMaterial = selectedMaterials.length === 0 ||
        selectedMaterials.some(m => product.tags.includes(m));

      const matchesCraftType = selectedCraftTypes.length === 0 ||
        selectedCraftTypes.some(ct => product.tags.includes(ct));

      const matchesAvailability = selectedAvailability.length === 0 ||
        selectedAvailability.some(a => product.tags.includes(a));

      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesTradition && matchesCategory && matchesCollection &&
             matchesOrigin && matchesMaterial && matchesCraftType && matchesAvailability && matchesPrice;
    });

    products.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return 0;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'most-collected':
          return (b.reviews || 0) - (a.reviews || 0);
        case 'editors-picks':
          return (b.rating || 0) - (a.rating || 0);
        case 'featured':
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return 0;
      }
    });

    return products;
  }, [searchQuery, selectedTraditions, selectedCategories, selectedCollections,
      selectedMaterials, selectedCraftTypes, selectedAvailability, priceRange, sortBy]);

  const recommendedProducts = useMemo(() => {
    return mockProducts
      .filter(p =>
        userPreferences.preferredCategories.includes(p.category) &&
        !userPreferences.viewedProducts.includes(p.id)
      )
      .slice(0, 4);
  }, [userPreferences]);

  const getCategoryHeroData = () => {
    if (!viewContext) return null;

    const categoryHeroMap: Record<string, any> = {
      'wall-art': {
        badges: [
          { icon: 'art' as const, label: 'Sacred Art & Calligraphy' },
          { icon: 'heritage' as const, label: 'Handcrafted Heritage' },
        ],
        chips: [
          { label: 'Islamic Calligraphy' },
          { label: 'Hebrew Scripture' },
          { label: 'Christian Icons' },
          { label: 'Interfaith Designs' },
        ],
        accentColor: 'amber',
        insightCard: {
          title: 'Craftlore',
          content: 'Each piece of sacred wall art carries centuries of spiritual tradition, handcrafted by master artisans using techniques passed down through generations.',
        },
      },
      'prayer': {
        badges: [
          { icon: 'tradition' as const, label: 'Prayer & Worship' },
          { icon: 'craft' as const, label: 'Traditional Textiles' },
        ],
        chips: [
          { label: 'Prayer Rugs' },
          { label: 'Tallit & Kippah' },
          { label: 'Prayer Shawls' },
          { label: 'Sacred Textiles' },
        ],
        accentColor: 'blue',
        insightCard: {
          title: 'Artisan Note',
          content: 'Prayer textiles are woven with intention and reverence, creating sacred spaces for contemplation and spiritual connection.',
        },
      },
    };

    return categoryHeroMap[viewContext.value];
  };

  const heroData = getCategoryHeroData();

  return (
    <div>
      {viewMode !== 'shop' && viewContext && (
        <DiscoveryHero
          breadcrumbs={[
            { label: 'Home', href: '#' },
            { label: 'Shop', href: '#' },
            { label: viewContext.title },
          ]}
          title={viewContext.title}
          subtitle={viewContext.subtitle}
          description={viewContext.description}
          badges={heroData?.badges || []}
          chips={heroData?.chips || []}
          accentColor={heroData?.accentColor || 'emerald'}
          visualType="gradient"
          insightCard={heroData?.insightCard}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'shop' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Shop All Products'}
            </h1>
            <p className="text-secondary">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>
        )}

        {viewMode !== 'shop' && (
          <div className="mb-6">
            <p className="text-secondary">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>
        )}

        {recommendedProducts.length > 0 && !searchQuery && viewMode === 'shop' && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Recommended For You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => onViewProduct(product)}
                  className="bg-surface rounded-lg p-3 cursor-pointer hover:shadow-theme-md transition-shadow"
                >
                  <div className="aspect-square bg-surface-deep rounded-lg mb-2 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-medium text-primary line-clamp-1">{product.name}</p>
                  <p className="text-purple-600 dark:text-purple-400 font-bold">${product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searchQuery && viewMode === 'shop' && (
          <div className="mb-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-primary mb-3">Discover Your Path</h2>
              <p className="text-lg text-secondary">Explore through our curated discovery pillars</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Collections Pillar */}
              <div className="bg-surface rounded-2xl p-6 shadow-theme-lg hover:shadow-theme-xl transition-all border-2 border-purple-100 dark:border-purple-800">
                <div className="mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-xl inline-block mb-3">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Collections</h3>
                  <p className="text-secondary text-sm">Themed sets curated for meaning</p>
                </div>
                <div className="space-y-2">
                  {collections.filter(c => c.value !== 'all').slice(0, 4).map(collection => (
                    <button
                      key={collection.value}
                      onClick={() => {
                        if (onViewCollection) {
                          onViewCollection(collection.value);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      <span className="text-sm font-medium text-secondary">{collection.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated Pillar */}
              <div className="bg-surface rounded-2xl p-6 shadow-theme-lg hover:shadow-theme-xl transition-all border-2 border-purple-100 dark:border-purple-800">
                <div className="mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-xl inline-block mb-3">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Curated</h3>
                  <p className="text-secondary text-sm">Expert selections for discerning collectors</p>
                </div>
                <div className="space-y-2">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-primary mb-1">{mockProducts.filter(p => p.featured).length}</p>
                    <p className="text-sm text-secondary">Featured Items</p>
                  </div>
                  <button
                    onClick={() => setSortBy('featured')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    View Featured
                  </button>
                </div>
              </div>

              {/* Heritage Pillar */}
              <div className="bg-surface rounded-2xl p-6 shadow-theme-lg hover:shadow-theme-xl transition-all border-2 border-purple-100 dark:border-purple-800">
                <div className="mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-xl inline-block mb-3">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Heritage</h3>
                  <p className="text-secondary text-sm">Timeless pieces with centuries of tradition</p>
                </div>
                <div className="space-y-2">
                  {origins.filter(o => o.value !== 'all').slice(0, 4).map(origin => (
                    <button
                      key={origin.value}
                      onClick={() => {
                        if (onViewOrigin) {
                          onViewOrigin(origin.value);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      <span className="text-sm font-medium text-secondary">{origin.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasonal Picks Pillar */}
              <div className="bg-surface rounded-2xl p-6 shadow-theme-lg hover:shadow-theme-xl transition-all border-2 border-purple-100 dark:border-purple-800">
                <div className="mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-xl inline-block mb-3">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Seasonal Picks</h3>
                  <p className="text-secondary text-sm">Perfect for upcoming celebrations</p>
                </div>
                <div className="space-y-2">
                  {categories.filter(c => c.value !== 'all' && (c.value.includes('gift') || c.value.includes('candles') || c.value.includes('hospitality'))).slice(0, 4).map(category => (
                    <button
                      key={category.value}
                      onClick={() => toggleFilter(selectedCategories, setSelectedCategories, category.value)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      <span className="text-sm font-medium text-secondary">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        <aside className={`
          lg:w-80 bg-surface
          ${showFilters
            ? 'fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto lg:relative lg:z-auto'
            : 'hidden lg:block'
          }
        `}>
          <div className="bg-surface rounded-xl shadow-theme-sm p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-primary">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <FilterSection
                title="1. Tradition"
                options={traditions}
                selectedValues={selectedTraditions}
                onToggle={(value) => toggleFilter(selectedTraditions, setSelectedTraditions, value)}
              />

              <FilterSection
                title="2. Category"
                options={categories}
                selectedValues={selectedCategories}
                onToggle={(value) => toggleFilter(selectedCategories, setSelectedCategories, value)}
              />

              <FilterSection
                title="3. Collection"
                options={collections}
                selectedValues={selectedCollections}
                onToggle={(value) => {
                  if (value !== 'all' && onViewCollection) {
                    onViewCollection(value);
                  } else {
                    toggleFilter(selectedCollections, setSelectedCollections, value);
                  }
                }}
              />

              <FilterSection
                title="4. Origin / Location"
                options={origins}
                selectedValues={selectedOrigins}
                onToggle={(value) => {
                  if (value !== 'all' && onViewOrigin) {
                    onViewOrigin(value);
                  } else {
                    toggleFilter(selectedOrigins, setSelectedOrigins, value);
                  }
                }}
              />

              <FilterSection
                title="5. Material"
                options={materials}
                selectedValues={selectedMaterials}
                onToggle={(value) => {
                  if (value !== 'all' && onViewMaterial) {
                    onViewMaterial(value);
                  } else {
                    toggleFilter(selectedMaterials, setSelectedMaterials, value);
                  }
                }}
              />

              <FilterSection
                title="6. Craft Type"
                options={craftTypes}
                selectedValues={selectedCraftTypes}
                onToggle={(value) => {
                  if (value !== 'all' && onViewCraftType) {
                    onViewCraftType(value);
                  } else {
                    toggleFilter(selectedCraftTypes, setSelectedCraftTypes, value);
                  }
                }}
              />

              <div className="border-b border-default pb-4">
                <h3 className="font-semibold text-primary mb-3">7. Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <FilterSection
                title="8. Availability"
                options={availability}
                selectedValues={selectedAvailability}
                onToggle={(value) => toggleFilter(selectedAvailability, setSelectedAvailability, value)}
              />

              <div className="border-b border-default pb-4">
                <h3 className="font-semibold text-primary mb-3">8. Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-default bg-surface text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="most-collected">Most Collected</option>
                  <option value="editors-picks">Editor's Picks</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedTraditions([]);
                  setSelectedCategories([]);
                  setSelectedCollections([]);
                  setSelectedMaterials([]);
                  setSelectedCraftTypes([]);
                  setSelectedAvailability([]);
                  setPriceRange([0, 500]);
                  setSortBy('featured');
                }}
                className="w-full text-purple-600 dark:text-purple-400 font-semibold py-2 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg shadow-theme-sm border border-default"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {(selectedTraditions.length > 0 || selectedCategories.length > 0 ||
            selectedCollections.length > 0 || selectedMaterials.length > 0 ||
            selectedCraftTypes.length > 0 || selectedAvailability.length > 0) && (
            <div className="mb-6 flex flex-wrap gap-2">
              {selectedTraditions.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {traditions.find(tr => tr.value === t)?.label}
                  <button
                    onClick={() => toggleFilter(selectedTraditions, setSelectedTraditions, t)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCategories.map(c => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {categories.find(cat => cat.value === c)?.label}
                  <button
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCollections.map(c => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {collections.find(col => col.value === c)?.label}
                  <button
                    onClick={() => toggleFilter(selectedCollections, setSelectedCollections, c)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedMaterials.map(m => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {materials.find(mat => mat.value === m)?.label}
                  <button
                    onClick={() => toggleFilter(selectedMaterials, setSelectedMaterials, m)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCraftTypes.map(ct => (
                <span
                  key={ct}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {craftTypes.find(c => c.value === ct)?.label}
                  <button
                    onClick={() => toggleFilter(selectedCraftTypes, setSelectedCraftTypes, ct)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedAvailability.map(a => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {availability.find(av => av.value === a)?.label}
                  <button
                    onClick={() => toggleFilter(selectedAvailability, setSelectedAvailability, a)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
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
                  {product.trending && (
                    <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      TRENDING
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      SALE
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      className="bg-surface/90 backdrop-blur-sm rounded-full p-2 hover:bg-surface transition-colors"
                      title="Add to wishlist"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.includes(product.id)
                            ? 'fill-accent text-accent'
                            : 'icon-default'
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComparison(product.id);
                      }}
                      className={`bg-surface/90 backdrop-blur-sm rounded-full p-2 hover:bg-surface transition-colors ${
                        comparisonProducts.includes(product.id) ? 'ring-2 ring-purple-600' : ''
                      }`}
                      title="Add to comparison"
                    >
                      <GitCompare
                        className={`w-5 h-5 ${
                          comparisonProducts.includes(product.id)
                            ? 'text-accent'
                            : 'icon-default'
                        }`}
                      />
                    </button>
                  </div>

                  {(product.viewCount || product.purchaseCount) && (
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {product.viewCount && (
                        <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {product.viewCount} viewing
                        </div>
                      )}
                      {product.purchaseCount && (
                        <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <TrendingUpIcon className="w-3 h-3" />
                          {product.purchaseCount} sold
                        </div>
                      )}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="flex-1 bg-surface/90 backdrop-blur-sm text-primary py-2 rounded-lg font-semibold hover:bg-surface transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Quick View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => onViewProduct(product)}
                >
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-purple-400 text-purple-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-secondary ml-1">({product.reviews})</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-secondary mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">${product.price}</span>
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-muted mb-4">
                <Filter className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">No products found</h3>
              <p className="text-secondary mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSelectedTraditions([]);
                  setSelectedCategories([]);
                  setSelectedCollections([]);
                  setSelectedMaterials([]);
                  setSelectedCraftTypes([]);
                  setSelectedAvailability([]);
                  setPriceRange([0, 500]);
                }}
                className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
