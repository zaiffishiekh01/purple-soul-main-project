import { useState, useMemo } from 'react';
import { Star, Heart, ShoppingBag, ChevronDown, Eye, GitCompare, MapPin, Globe, Award } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { FilterSection } from './FilterSection';

interface OriginPageProps {
  originSlug: string;
  onViewProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  comparisonProducts: string[];
  onToggleComparison: (id: string) => void;
}

const originData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  region: string;
  craftTraditions: string[];
  relatedCraftTypes: string[];
  relatedCollections: string[];
}> = {
  'kashmir-india': {
    title: 'Kashmir, India',
    subtitle: 'Srinagar Craft Heritage',
    description: 'Discover handcrafted treasures from Kashmir\'s renowned artisan communities. From intricate walnut wood carvings to exquisite papier-mâché work, each piece carries centuries of craft mastery and cultural heritage from the valleys of Srinagar.',
    region: 'Srinagar, Kashmir',
    craftTraditions: ['Walnut wood carving', 'Papier-mâché', 'Kashmiri embroidery', 'Copperware'],
    relatedCraftTypes: ['hand-carved', 'hand-painted', 'embroidered'],
    relatedCollections: ['artisan-heritage', 'sacred-home']
  },
  'bethlehem-holy-land': {
    title: 'Bethlehem / Holy Land',
    subtitle: 'Sacred Geography & Heritage',
    description: 'Experience authentic handcrafted works from the Holy Land\'s historic artisan communities. Each piece is created by master craftspeople in Bethlehem and Jerusalem, where olive wood carving and mother-of-pearl inlay traditions have been preserved for generations.',
    region: 'Bethlehem & Jerusalem',
    craftTraditions: ['Olive wood carving', 'Mother-of-pearl inlay', 'Iconography', 'Ceramic work'],
    relatedCraftTypes: ['hand-carved', 'hand-painted'],
    relatedCollections: ['sacred-home', 'prayer-reflection']
  },
  'jerusalem': {
    title: 'Jerusalem',
    subtitle: 'Ancient City of Faith',
    description: 'Sacred handcrafted works from Jerusalem\'s storied artisan quarters. From Armenian ceramics to traditional iconography, each piece reflects the deep spiritual heritage and multicultural craft traditions of the Holy City.',
    region: 'Jerusalem Old City',
    craftTraditions: ['Armenian ceramics', 'Iconography', 'Stone carving', 'Calligraphy'],
    relatedCraftTypes: ['hand-painted', 'calligraphic', 'hand-carved'],
    relatedCollections: ['sacred-home', 'artisan-heritage']
  },
  'morocco': {
    title: 'Morocco',
    subtitle: 'North African Craft Mastery',
    description: 'Explore Morocco\'s rich artisan heritage, from intricate zellige tilework to hand-tooled leather and brass lanterns. Each piece embodies the sophisticated craft traditions of Fez, Marrakech, and beyond.',
    region: 'Fez, Marrakech & Beyond',
    craftTraditions: ['Zellige mosaic', 'Brass work', 'Leather tooling', 'Pottery'],
    relatedCraftTypes: ['hand-carved', 'cast-forged', 'hand-painted'],
    relatedCollections: ['light-lantern', 'sacred-home']
  },
  'turkey': {
    title: 'Turkey / Anatolia',
    subtitle: 'Byzantine & Ottoman Heritage',
    description: 'Discover the refined craft traditions of Anatolia, where Byzantine and Ottoman influences create extraordinary works. From hand-painted ceramics to intricate calligraphy and copper vessels, each piece reflects centuries of artistic excellence.',
    region: 'Istanbul, Cappadocia & Anatolia',
    craftTraditions: ['Iznik ceramics', 'Calligraphy', 'Copper work', 'Textile weaving'],
    relatedCraftTypes: ['hand-painted', 'calligraphic', 'cast-forged'],
    relatedCollections: ['sacred-home', 'artisan-heritage']
  },
  'iran': {
    title: 'Iran / Persia',
    subtitle: 'Persian Artistic Legacy',
    description: 'Experience the timeless beauty of Persian craftsmanship, from miniature painting to intricate metalwork and hand-knotted textiles. Each piece carries the sophisticated artistic heritage of Isfahan, Shiraz, and Persia\'s historic craft centers.',
    region: 'Isfahan, Shiraz & Beyond',
    craftTraditions: ['Miniature painting', 'Metalwork', 'Textile weaving', 'Calligraphy'],
    relatedCraftTypes: ['hand-painted', 'calligraphic', 'handwoven'],
    relatedCollections: ['artisan-heritage', 'sacred-home']
  },
  'egypt': {
    title: 'Egypt',
    subtitle: 'Coptic & Islamic Heritage',
    description: 'Discover Egyptian craft traditions blending Coptic Christian and Islamic artistic heritage. From hand-tooled copper to intricate mashrabiya woodwork, each piece reflects millennia of cultural continuity.',
    region: 'Cairo & Upper Egypt',
    craftTraditions: ['Copperwork', 'Mashrabiya carving', 'Iconography', 'Textile work'],
    relatedCraftTypes: ['hand-carved', 'cast-forged', 'hand-painted'],
    relatedCollections: ['sacred-home', 'light-lantern']
  },
  'armenia': {
    title: 'Armenia',
    subtitle: 'Ancient Christian Craft',
    description: 'Explore Armenia\'s profound Christian artistic heritage through handcrafted crosses, illuminated manuscripts, and stone carvings. Each piece embodies the ancient faith and resilience of one of Christianity\'s oldest traditions.',
    region: 'Yerevan & Echmiadzin',
    craftTraditions: ['Khachkar carving', 'Manuscript illumination', 'Metalwork', 'Ceramics'],
    relatedCraftTypes: ['hand-carved', 'hand-painted', 'calligraphic'],
    relatedCollections: ['sacred-home', 'prayer-reflection']
  },
  'ethiopia': {
    title: 'Ethiopia',
    subtitle: 'Ethiopian Orthodox Heritage',
    description: 'Experience the distinctive craft traditions of Ethiopian Orthodox Christianity, from vibrant iconography to handwoven textiles and processional crosses. Each piece reflects Ethiopia\'s unique spiritual and artistic legacy.',
    region: 'Addis Ababa & Lalibela',
    craftTraditions: ['Icon painting', 'Processional crosses', 'Textile weaving', 'Manuscript art'],
    relatedCraftTypes: ['hand-painted', 'handwoven', 'cast-forged'],
    relatedCollections: ['sacred-home', 'prayer-reflection']
  },
  'lebanon': {
    title: 'Lebanon',
    subtitle: 'Levantine Craft Excellence',
    description: 'Discover Lebanon\'s refined artisan traditions, blending Phoenician heritage with Christian and Islamic influences. From hand-blown glass to intricate woodwork, each piece reflects the Levant\'s multicultural craft legacy.',
    region: 'Beirut & Mount Lebanon',
    craftTraditions: ['Glass blowing', 'Cedar wood carving', 'Metalwork', 'Textile art'],
    relatedCraftTypes: ['hand-carved', 'cast-forged', 'handwoven'],
    relatedCollections: ['sacred-home', 'artisan-heritage']
  },
  'jordan': {
    title: 'Jordan',
    subtitle: 'Desert & Heritage Craft',
    description: 'Explore Jordan\'s artisan heritage from Petra to the Dead Sea. Traditional Bedouin weaving, Nabataean-inspired pottery, and contemporary sacred art reflect the kingdom\'s rich cultural tapestry.',
    region: 'Petra, Madaba & Amman',
    craftTraditions: ['Bedouin weaving', 'Mosaic work', 'Pottery', 'Sand art'],
    relatedCraftTypes: ['handwoven', 'hand-painted', 'hand-carved'],
    relatedCollections: ['artisan-heritage', 'sacred-home']
  },
  'greece': {
    title: 'Greece',
    subtitle: 'Byzantine & Orthodox Heritage',
    description: 'Experience Greece\'s living iconographic and craft traditions, from Mount Athos to the islands. Each handcrafted piece embodies Byzantine artistic excellence and Orthodox spiritual devotion.',
    region: 'Mount Athos, Athens & Islands',
    craftTraditions: ['Icon painting', 'Silver work', 'Ceramics', 'Textile weaving'],
    relatedCraftTypes: ['hand-painted', 'cast-forged', 'handwoven'],
    relatedCollections: ['sacred-home', 'prayer-reflection']
  },
  'italy': {
    title: 'Italy',
    subtitle: 'Renaissance & Sacred Craft',
    description: 'Discover Italy\'s renowned artisan heritage from Florence to Venice. Hand-painted ceramics, carved religious art, and traditional crafts reflect centuries of Christian artistic excellence and Renaissance mastery.',
    region: 'Florence, Venice & Beyond',
    craftTraditions: ['Majolica ceramics', 'Wood carving', 'Glass blowing', 'Fresco art'],
    relatedCraftTypes: ['hand-painted', 'hand-carved', 'cast-forged'],
    relatedCollections: ['sacred-home', 'artisan-heritage']
  },
  'spain': {
    title: 'Spain',
    subtitle: 'Iberian & Moorish Heritage',
    description: 'Explore Spain\'s unique fusion of Christian, Islamic, and Jewish craft traditions. From Andalusian ceramics to religious woodcarvings, each piece reflects the peninsula\'s multicultural artistic legacy.',
    region: 'Andalusia, Toledo & Beyond',
    craftTraditions: ['Talavera ceramics', 'Damascene work', 'Wood carving', 'Tile work'],
    relatedCraftTypes: ['hand-painted', 'hand-carved', 'cast-forged'],
    relatedCollections: ['sacred-home', 'artisan-heritage']
  }
};

export default function OriginPage({
  originSlug,
  onViewProduct,
  onQuickView,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  comparisonProducts,
  onToggleComparison,
}: OriginPageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCraftTypes, setSelectedCraftTypes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<string>('featured');

  const origin = originData[originSlug] || originData['bethlehem-holy-land'];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'wall-art', label: 'Wall Art & Calligraphy' },
    { value: 'prayer', label: 'Prayer Textiles & Accessories' },
    { value: 'home-blessings', label: 'Home Blessings & Decor' },
    { value: 'ceramics', label: 'Ceramics & Vessels' },
    { value: 'woodcraft', label: 'Woodcraft & Carved Objects' },
    { value: 'jewelry', label: 'Jewelry & Personal Items' },
  ];

  const craftTypes = [
    { value: 'handwoven', label: 'Handwoven' },
    { value: 'hand-carved', label: 'Hand-carved' },
    { value: 'hand-painted', label: 'Hand-painted' },
    { value: 'embroidered', label: 'Embroidered' },
    { value: 'cast-forged', label: 'Cast & Forged' },
    { value: 'calligraphic', label: 'Calligraphic Art' },
  ];

  const collections = [
    { value: 'all', label: 'All Collections' },
    { value: 'sacred-home', label: 'Sacred Home' },
    { value: 'prayer-reflection', label: 'Prayer & Reflection' },
    { value: 'light-lantern', label: 'Light & Lantern' },
    { value: 'artisan-heritage', label: 'Artisan Heritage' },
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
      const matchesOrigin = product.tags.includes(originSlug);

      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesCraftType = selectedCraftTypes.length === 0 ||
        selectedCraftTypes.some(ct => product.tags.includes(ct));

      const matchesCollection = selectedCollections.length === 0 ||
        selectedCollections.some(c => product.tags.includes(c));

      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesOrigin && matchesCategory && matchesCraftType && matchesCollection && matchesPrice;
    });

    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return 0;
        case 'popular':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return products;
  }, [originSlug, selectedCategories, selectedCraftTypes, selectedCollections, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
            <span>/</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Origins</span>
            <span>/</span>
            <span className="text-primary font-medium">{origin.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start gap-6 mb-6">
            <div className="p-4 bg-purple-600 dark:bg-purple-700 rounded-2xl">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary mb-2">{origin.title}</h1>
              <p className="text-xl text-purple-700 dark:text-purple-300 mb-4">{origin.subtitle}</p>
              <p className="text-lg text-secondary max-w-3xl leading-relaxed">{origin.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg border border-default">
              <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-secondary">{origin.region}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg border border-default">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-secondary">Curated Handmade Heritage</span>
            </div>
          </div>

          {/* Craft Traditions */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted mb-3">Traditional Crafts:</h3>
            <div className="flex flex-wrap gap-2">
              {origin.craftTraditions.map(craft => (
                <span key={craft} className="px-3 py-1 bg-surface border border-default rounded-full text-xs font-medium text-secondary">
                  {craft}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block space-y-8">
            <div>
              <h3 className="text-lg font-bold text-primary mb-6">Refine Your Search</h3>

              <FilterSection
                title="Category"
                options={categories}
                selectedValues={selectedCategories}
                onToggle={(value) => toggleFilter(selectedCategories, setSelectedCategories, value)}
              />

              <FilterSection
                title="Craft Type"
                options={craftTypes}
                selectedValues={selectedCraftTypes}
                onToggle={(value) => toggleFilter(selectedCraftTypes, setSelectedCraftTypes, value)}
              />

              <FilterSection
                title="Collection"
                options={collections}
                selectedValues={selectedCollections}
                onToggle={(value) => toggleFilter(selectedCollections, setSelectedCollections, value)}
              />

              <div className="border-b border-default pb-4">
                <h3 className="font-semibold text-primary mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-secondary">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Count */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-default">
              <p className="text-secondary">
                <span className="font-semibold text-primary">{filteredProducts.length}</span> treasures from {origin.title}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-secondary">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface border border-default rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No products found</h3>
                <p className="text-secondary">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-surface border border-default rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden bg-surface-elevated">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => onToggleWishlist(product.id)}
                          className="p-2 bg-surface/90 backdrop-blur rounded-full hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-purple-600 text-purple-600' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleComparison(product.id)}
                          className="p-2 bg-surface/90 backdrop-blur rounded-full hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <GitCompare className={`w-5 h-5 ${comparisonProducts.includes(product.id) ? 'text-purple-600' : ''}`} />
                        </button>
                      </div>
                      <button
                        onClick={() => onQuickView(product)}
                        className="absolute bottom-3 right-3 p-2 bg-surface/90 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-primary mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-secondary mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-default'}`}
                          />
                        ))}
                        <span className="text-sm text-secondary ml-1">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewProduct(product)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onAddToCart(product)}
                            className="p-2 bg-surface-elevated hover:bg-purple-600 hover:text-white rounded-lg transition-colors"
                          >
                            <ShoppingBag className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
