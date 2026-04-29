import React, { useState, useMemo } from 'react';
import { Heart, ShoppingBag, Star, Sparkles, Filter, Eye, GitCompare, Gift, Calendar, Sun, Snowflake, Package, Flame, Moon } from 'lucide-react';
import DiscoveryHero from './DiscoveryHero';
import { Product } from '../App';
import { FilterSection } from './FilterSection';

interface SeasonalProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onViewProduct: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  comparisonProducts?: string[];
  onToggleComparison?: (id: string) => void;
}

type Occasion = 'worship' | 'fasting' | 'festivals' | 'home-decor' | 'gifts' | 'all';
type Tradition = 'islamic' | 'christian' | 'jewish' | 'shared' | 'all';

const occasions = [
  { value: 'all' as const, label: 'All Occasions', icon: Star, description: 'View all seasonal essentials' },
  { value: 'worship' as const, label: 'Worship & Prayer', icon: Flame, description: 'Sacred observance items' },
  { value: 'fasting' as const, label: 'Fasting & Reflection', icon: Moon, description: 'Spiritual preparation items' },
  { value: 'festivals' as const, label: 'Festivals & Joy', icon: Sparkles, description: 'Celebration decorations' },
  { value: 'home-decor' as const, label: 'Home Décor', icon: Gift, description: 'Seasonal home blessings' },
  { value: 'gifts' as const, label: 'Gifts & Favors', icon: Heart, description: 'Meaningful seasonal gifts' },
];

const traditions = [
  { value: 'all' as const, label: 'All Traditions', color: 'slate', icon: '🌟', description: 'View all faith traditions' },
  { value: 'islamic' as const, label: 'Islamic Celebrations', color: 'emerald', icon: '☪', description: 'Ramadan, Eid, and more' },
  { value: 'christian' as const, label: 'Christian Celebrations', color: 'blue', icon: '✝', description: 'Christmas, Easter, and more' },
  { value: 'jewish' as const, label: 'Jewish Celebrations', color: 'indigo', icon: '✡', description: 'Hanukkah, Passover, and more' },
  { value: 'shared' as const, label: 'Universal Essentials', color: 'amber', icon: '🎁', description: 'Cross-tradition items' },
];

const occasionContent = {
  worship: {
    title: 'Worship & Prayer',
    subtitle: 'Sacred Observance Items',
    description: 'Beautiful handcrafted items for worship, prayer, and sacred observances across faith traditions. From prayer essentials to devotional art, honor your spiritual practices with reverence.',
    examples: {
      islamic: ['Prayer mats', 'Tasbih beads', 'Quran stands', 'Calligraphy art', 'Mosque décor'],
      christian: ['Prayer candles', 'Crosses', 'Rosaries', 'Scripture art', 'Church items'],
      jewish: ['Tallit', 'Tefillin bags', 'Torah pointers', 'Shabbat candles', 'Synagogue art'],
      shared: ['Prayer journals', 'Meditation cushions', 'Devotional books', 'Blessing plaques', 'Sacred textiles'],
    },
  },
  fasting: {
    title: 'Fasting & Reflection',
    subtitle: 'Spiritual Preparation Items',
    description: 'Support your spiritual journey during fasting periods with thoughtful, meaningful items. From iftar essentials to Lenten devotionals, prepare your heart and home for sacred seasons.',
    examples: {
      islamic: ['Ramadan lanterns', 'Iftar serving sets', 'Moon calendars', 'Quran covers', 'Charity boxes'],
      christian: ['Lenten candles', 'Ash Wednesday items', 'Fasting journals', 'Purple textiles', 'Devotional guides'],
      jewish: ['Yom Kippur items', 'Fast day candles', 'Prayer books', 'White textiles', 'Reflection journals'],
      shared: ['Water carafes', 'Intention cards', 'Prayer timers', 'Reflection journals', 'Charity boxes'],
    },
  },
  festivals: {
    title: 'Festivals & Joy',
    subtitle: 'Celebration Decorations',
    description: 'Transform your space for joyous celebrations with vibrant decorations and festive essentials. From Eid to Christmas to Hanukkah, create memorable moments with beautiful, culturally authentic items.',
    examples: {
      islamic: ['Eid banners', 'Crescent decorations', 'Lanterns', 'Gift boxes', 'Table settings'],
      christian: ['Christmas ornaments', 'Nativity sets', 'Advent wreaths', 'Easter décor', 'Pentecost items'],
      jewish: ['Hanukkah menorahs', 'Dreidels', 'Passover seder plates', 'Sukkot decorations', 'Purim items'],
      shared: ['Festival banners', 'Candle holders', 'Table runners', 'Garlands', 'Gift wrap'],
    },
  },
  'home-decor': {
    title: 'Home Décor',
    subtitle: 'Seasonal Home Blessings',
    description: 'Beautify your living space with seasonal decorations that reflect your faith and values. From wall art to centerpieces, create a warm, blessed environment for family gatherings.',
    examples: {
      islamic: ['Islamic wall art', 'Ayat plaques', 'Prayer corner décor', 'Geometric patterns', 'Blessed home signs'],
      christian: ['Scripture wall art', 'Seasonal wreaths', 'Holy family art', 'Cross décor', 'Blessing plaques'],
      jewish: ['Shema plaques', 'Star of David décor', 'Hebrew blessings', 'Mezuzah cases', 'Holiday textiles'],
      shared: ['Family blessing signs', 'Seasonal wreaths', 'Table centerpieces', 'Decorative pillows', 'Wall hangings'],
    },
  },
  gifts: {
    title: 'Gifts & Favors',
    subtitle: 'Meaningful Seasonal Gifts',
    description: 'Express love and blessings with thoughtful, handcrafted gifts for every celebration. From hostess gifts to children\'s presents, share meaningful items that carry spiritual significance.',
    examples: {
      islamic: ['Eid gift sets', 'Prayer bead sets', 'Dates gift boxes', 'Islamic books', 'Perfume bottles'],
      christian: ['Christmas gift baskets', 'Prayer cards', 'Holy water fonts', 'Scripture journals', 'Cross necklaces'],
      jewish: ['Hanukkah gelt', 'Seder plates', 'Mezuzah sets', 'Torah bookmarks', 'Blessing boxes'],
      shared: ['Gift baskets', 'Candle sets', 'Chocolate boxes', 'Tea sets', 'Artisan soaps'],
    },
  },
};

const seasonalHighlights = {
  islamic: [
    { name: 'Ramadan', description: 'Month of fasting and reflection' },
    { name: 'Eid al-Fitr', description: 'Festival of breaking the fast' },
    { name: 'Eid al-Adha', description: 'Festival of sacrifice' },
    { name: 'Mawlid al-Nabi', description: 'Prophet\'s birthday' },
    { name: 'Islamic New Year', description: 'Hijri new year celebration' },
    { name: 'Laylat al-Qadr', description: 'Night of power' },
    { name: 'Ashura', description: 'Day of remembrance' },
    { name: 'Hajj Season', description: 'Pilgrimage preparations' },
  ],
  christian: [
    { name: 'Advent', description: 'Preparation for Christmas' },
    { name: 'Christmas', description: 'Celebration of Christ\'s birth' },
    { name: 'Epiphany', description: 'Manifestation of Christ' },
    { name: 'Lent', description: 'Season of fasting and prayer' },
    { name: 'Palm Sunday', description: 'Beginning of Holy Week' },
    { name: 'Holy Week', description: 'Week before Easter' },
    { name: 'Good Friday', description: 'Crucifixion remembrance' },
    { name: 'Easter', description: 'Resurrection celebration' },
    { name: 'Pentecost', description: 'Coming of the Holy Spirit' },
    { name: 'All Saints\' Day', description: 'Honoring all saints' },
  ],
  jewish: [
    { name: 'Passover', description: 'Festival of freedom' },
    { name: 'Hanukkah', description: 'Festival of lights' },
    { name: 'Rosh Hashanah', description: 'Jewish new year' },
    { name: 'Yom Kippur', description: 'Day of atonement' },
    { name: 'Sukkot', description: 'Festival of booths' },
    { name: 'Simchat Torah', description: 'Rejoicing with Torah' },
    { name: 'Purim', description: 'Festival of lots' },
    { name: 'Shavuot', description: 'Festival of weeks' },
    { name: 'Tu BiShvat', description: 'New year for trees' },
    { name: 'Shabbat', description: 'Weekly day of rest' },
  ],
};

export default function SeasonalProductCatalog({
  products,
  onViewProduct,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onQuickView,
  comparisonProducts = [],
  onToggleComparison,
}: SeasonalProductCatalogProps) {
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
          { label: 'Celebrations', href: '#' },
          { label: 'Browse Seasonal Products' },
        ]}
        title="Browse Seasonal Products"
        subtitle="Faith-Based Celebrations Throughout the Year"
        description="Discover beautiful handcrafted items for sacred celebrations across Islamic, Christian, and Jewish traditions. From Ramadan to Christmas to Passover, find meaningful essentials that honor your faith and create blessed moments."
        badges={[
          { icon: 'tradition' as const, label: 'All Three Faiths' },
          { icon: 'craft' as const, label: 'Artisan Crafted' },
          { icon: 'global' as const, label: 'Culturally Authentic' },
        ]}
        chips={[
          { label: 'Ramadan & Eid' },
          { label: 'Christmas & Easter' },
          { label: 'Hanukkah & Passover' },
          { label: 'Seasonal Blessings' },
        ]}
        accentColor="purple"
        visualType="gradient"
        insightCard={{
          title: 'Celebrate Your Faith',
          content: 'Every celebration is an opportunity to honor your traditions and strengthen your spiritual connection. These handcrafted essentials bring beauty and meaning to sacred seasons.',
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
                  {['decorations', 'prayer', 'wall-art', 'home-blessings', 'jewelry', 'gift-sets'].map((cat) => (
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
                  {['cotton', 'ceramic', 'wood', 'metal', 'silk', 'paper'].map((mat) => (
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

            {selectedTradition !== 'all' && selectedTradition !== 'shared' && seasonalHighlights[selectedTradition] && (
              <div className="mb-12 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-default">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {currentTradition?.label} Celebrations
                  </h3>
                  <p className="text-secondary">
                    Explore products for these sacred observances and festivals
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {seasonalHighlights[selectedTradition].map((celebration, idx) => (
                    <div key={idx} className="bg-surface rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">{celebration.name}</h4>
                          <p className="text-xs text-secondary">{celebration.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  className="text-accent font-semibold hover:text-purple-700 dark:hover:text-purple-300"
                >
                  View all seasonal products
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Year-Round Celebrations</h3>
            <p className="text-sm text-secondary">
              From Ramadan to Christmas to Passover, honor every sacred season with authentic items
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
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Artisan Crafted</h3>
            <p className="text-sm text-secondary">
              Supporting talented artisans and traditional craftsmanship from around the world
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
