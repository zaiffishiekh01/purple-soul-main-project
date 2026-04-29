import { Sparkles, Star, Calendar, Package, ChevronRight, TrendingUp, Heart, Gift, Award, Zap, Globe, Layers, Crown, Clock, Boxes } from 'lucide-react';
import { useState } from 'react';
import { mockProducts } from '../data/products';
import { Product } from '../App';

interface DiscoverHubProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  onViewProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function DiscoverHub({ currentSection, onNavigate, onViewProduct, wishlist, onToggleWishlist, onAddToCart }: DiscoverHubProps) {
  const [activePillar, setActivePillar] = useState<string>('collections');

  const featuredCollections = [
    {
      id: 'christian',
      title: 'Christian',
      description: 'Sacred Christian art and meaningful religious items',
      icon: Star,
      gradient: 'from-blue-600 to-blue-700',
      image: 'https://images.pexels.com/photos/5207152/pexels-photo-5207152.jpeg?auto=compress&cs=tinysrgb&w=800',
      categories: ['Crosses & Crucifixes', 'Icons & Art', 'Prayer Items', 'Books & Media', 'Jewelry', 'Home Decor']
    },
    {
      id: 'jewish',
      title: 'Jewish',
      description: 'Authentic Judaica and traditional ceremonial pieces',
      icon: Star,
      gradient: 'from-indigo-600 to-indigo-700',
      image: 'https://images.pexels.com/photos/5207117/pexels-photo-5207117.jpeg?auto=compress&cs=tinysrgb&w=800',
      categories: ['Mezuzahs', 'Menorahs', 'Tallit & Tefillin', 'Shabbat Items', 'Judaica Art']
    },
    {
      id: 'islamic',
      title: 'Islamic',
      description: 'Beautiful Islamic calligraphy and devotional items',
      icon: Star,
      gradient: 'from-emerald-600 to-emerald-700',
      image: 'https://images.pexels.com/photos/5207167/pexels-photo-5207167.jpeg?auto=compress&cs=tinysrgb&w=800',
      categories: ['Prayer Rugs', 'Calligraphy Art', 'Quran & Books', 'Tasbih & Prayer Beads', 'Islamic Decor']
    },
    {
      id: 'interfaith',
      title: 'Interfaith & Universal',
      description: 'Meaningful gifts celebrating all traditions',
      icon: Globe,
      gradient: 'from-purple-600 to-purple-700',
      image: 'https://images.pexels.com/photos/5207237/pexels-photo-5207237.jpeg?auto=compress&cs=tinysrgb&w=800',
      categories: ['Peace & Unity', 'Meditation', 'Inspirational Art', 'Cultural Gifts', 'Seasonal Celebrations']
    }
  ];

  const trendingProducts = mockProducts.filter(p => p.trending).slice(0, 6);
  const featuredProducts = mockProducts.filter(p => p.featured).slice(0, 3);

  // If on a specific discover subpage, show products for that category
  if (currentSection !== 'discover') {
    const categoryMap: { [key: string]: string } = {
      'discover-christian': 'christian',
      'discover-jewish': 'jewish',
      'discover-islamic': 'islamic',
      'discover-interfaith': 'interfaith'
    };

    const category = categoryMap[currentSection];
    const categoryProducts = mockProducts.filter(p =>
      p.tags.some(tag => tag.toLowerCase().includes(category))
    );

    const categoryTrending = categoryProducts.filter(p => p.trending).slice(0, 6);
    const categoryFeatured = categoryProducts.filter(p => p.featured).slice(0, 3);

    const currentCollection = featuredCollections.find(c => c.id === category);

    const corePillars = [
      {
        id: 'collections',
        icon: Layers,
        title: 'Collections',
        description: 'Themed sets curated for meaning',
        products: categoryProducts.slice(0, 4)
      },
      {
        id: 'curated',
        icon: Crown,
        title: 'Curated',
        description: 'Expert selections for discerning collectors',
        products: categoryProducts.filter(p => p.featured).slice(0, 4)
      },
      {
        id: 'heritage',
        icon: Clock,
        title: 'Heritage',
        description: 'Timeless pieces with centuries of tradition',
        products: categoryProducts.filter(p => p.rating >= 4.5).slice(0, 4)
      },
      {
        id: 'seasonal',
        icon: Calendar,
        title: 'Seasonal Picks',
        description: 'Perfect for upcoming celebrations',
        products: categoryProducts.slice(4, 8)
      }
    ];

    return (
      <div className="min-h-screen">
        <section className="relative bg-page overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <button
                  onClick={() => onNavigate('discover')}
                  className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Collections
                </button>
                <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                  {currentCollection?.title}
                  <span className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent"> Collection</span>
                </h1>
                <p className="text-xl text-secondary leading-relaxed">
                  {currentCollection?.description}
                </p>
                <div className="flex items-center gap-8 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">{categoryProducts.length}+</div>
                    <div className="text-sm text-secondary">Sacred Items</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">{categoryFeatured.length}</div>
                    <div className="text-sm text-secondary">Featured</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">4.9</div>
                    <div className="flex items-center gap-1 text-sm text-secondary">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Rating
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-surface rounded-2xl p-8 shadow-theme-2xl border-2 border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 bg-gradient-to-r ${currentCollection?.gradient} rounded-xl`}>
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-primary">{currentCollection?.title} Traditions</h3>
                      <p className="text-sm text-secondary">Explore our curated categories</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {currentCollection?.categories.slice(0, 5).map((cat) => (
                      <div key={cat} className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-secondary">{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-page">

        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Four Core Pillars */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-3">Discover Your Path</h2>
              <p className="text-lg text-secondary">Explore through our four curated discovery pillars</p>
            </div>

            {/* Interactive Pillar Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {corePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillar(pillar.id)}
                    className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 ${
                      activePillar === pillar.id
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 dark:from-purple-500 dark:to-purple-600 text-white shadow-theme-xl'
                        : 'bg-surface text-secondary shadow-theme-md hover:shadow-theme-lg'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${activePillar === pillar.id ? 'text-white animate-pulse' : 'text-secondary'}`} />
                    <div className="text-left">
                      <div className="font-bold">{pillar.title}</div>
                      <div className={`text-xs ${activePillar === pillar.id ? 'text-purple-50 dark:text-purple-200' : 'text-muted'}`}>
                        {pillar.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Pillar Content */}
            {corePillars.map((pillar) => {
              const Icon = pillar.icon;
              return activePillar === pillar.id && pillar.products.length > 0 ? (
                <div key={pillar.id} className="animate-fadeIn">
                  <div className="bg-surface rounded-3xl shadow-theme-xl p-8 border-2 border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{pillar.title}</h3>
                        <p className="text-secondary">{pillar.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {pillar.products.map((product) => (
                        <div
                          key={product.id}
                          className="group bg-surface-elevated rounded-xl p-4 hover:shadow-theme-lg transition-all duration-300 transform hover:scale-105 flex flex-col"
                        >
                          <div className="relative mb-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist(product.id);
                              }}
                              className="absolute top-2 right-2 p-2 bg-surface rounded-full shadow-theme-md hover:scale-110 transition-transform"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  wishlist.includes(product.id)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-secondary'
                                }`}
                              />
                            </button>
                          </div>

                          <button
                            onClick={() => onViewProduct(product)}
                            className="w-full text-left mb-3 flex-grow"
                          >
                            <h4 className="font-bold text-sm text-primary mb-1 line-clamp-2 group-hover:text-purple-600 dark:text-purple-400 transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-secondary">{product.rating}</span>
                            </div>
                            <div className="text-lg font-bold text-primary">${product.price}</div>
                          </button>

                          <button
                            onClick={() => onAddToCart(product)}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 dark:from-purple-500 dark:to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow-theme-md mt-auto"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>

          {/* Trending Now */}
          {categoryTrending.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-2">Trending Now</h2>
                  <p className="text-secondary">Most popular {currentCollection?.title.toLowerCase()} items this week</p>
                </div>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Hot Picks</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categoryTrending.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-surface rounded-2xl shadow-theme-md hover:shadow-theme-xl transition-all duration-300 overflow-hidden border border-default hover:border-purple-300 transform hover:scale-105"
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-surface rounded-full shadow-theme-md hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            wishlist.includes(product.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-secondary'
                          }`}
                        />
                      </button>
                      {product.trending && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                          <Zap className="w-3 h-3" />
                          Trending
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <button
                        onClick={() => onViewProduct(product)}
                        className="w-full text-left"
                      >
                        <h3 className="font-semibold text-sm text-primary mb-1 line-clamp-2 group-hover:text-purple-600 dark:text-purple-400 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-secondary">{product.rating}</span>
                        </div>
                        <div className="text-lg font-bold text-primary">${product.price}</div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Treasures */}
          {categoryFeatured.length > 0 && (
            <div className="bg-surface rounded-3xl shadow-theme-xl p-10 border border-purple-200 dark:border-purple-800 mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <h2 className="text-3xl font-bold text-primary">Featured Treasures</h2>
                  <p className="text-secondary">Handpicked {currentCollection?.title.toLowerCase()} masterpieces by our curators</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {categoryFeatured.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-surface-elevated rounded-2xl p-6 hover:shadow-theme-lg transition-all duration-300 transform hover:scale-105 flex flex-col"
                  >
                    <div className="relative mb-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-56 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-surface rounded-full shadow-theme-md hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            wishlist.includes(product.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-secondary'
                          }`}
                        />
                      </button>
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Featured
                      </div>
                    </div>

                    <button
                      onClick={() => onViewProduct(product)}
                      className="w-full text-left mb-4 flex-grow"
                    >
                      <h3 className="font-bold text-lg text-primary mb-2 group-hover:text-purple-600 dark:text-purple-400 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-secondary mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-secondary">({product.reviews})</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">${product.price}</div>
                    </button>

                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 dark:from-purple-500 dark:to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-theme-md hover:shadow-theme-lg mt-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not Sure Where to Start - Gift Finder CTA */}
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-3xl p-12 text-white text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMThoMnYxMnptLTQgMGgtMlYxOGgydjEyem0tNCAwSDI2VjE4aDJ2MTJ6bS00IDBoLTJWMThoMnYxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10">
              <Gift className="w-16 h-16 mx-auto mb-6 opacity-90 animate-bounce text-white" />
              <h2 className="text-3xl font-bold mb-4 text-white">Not Sure Where to Start?</h2>
              <p className="text-xl text-purple-50 dark:text-purple-200 mb-8 max-w-2xl mx-auto">
                Let our intelligent gift finder help you discover the perfect sacred treasure for any occasion
              </p>
              <button
                onClick={() => onNavigate('gifts')}
                className="inline-flex items-center gap-2 bg-surface text-purple-700 dark:text-purple-300 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all shadow-theme-lg hover:shadow-theme-xl transform hover:scale-105"
              >
                <Gift className="w-5 h-5" />
                Try Gift Finder
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Main discover hub page
  return (
    <div className="min-h-screen">
      <section className="relative bg-page overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Curated Collections
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                Discover Sacred
                <span className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent"> Treasures</span>
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                Explore our curated world of handcrafted religious art, heritage pieces, and seasonal collections from master artisans across faith traditions.
              </p>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-secondary">Sacred Items</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-secondary">Master Artisans</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.9</div>
                  <div className="flex items-center gap-1 text-sm text-secondary">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    Rating
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-surface rounded-2xl p-8 shadow-theme-2xl border-2 border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-xl">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">Explore Collections</h3>
                    <p className="text-sm text-secondary">Faith traditions from around the world</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-secondary">Curated by Tradition</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-secondary">Artisan-Crafted Quality</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-secondary">Heritage & Seasonal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-page">

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {featuredCollections.map((collection) => {
            const Icon = collection.icon;
            return (
              <button
                key={collection.id}
                onClick={() => onNavigate(`discover-${collection.id}`)}
                className="group relative overflow-hidden rounded-3xl shadow-theme-xl hover:shadow-theme-2xl transition-all duration-500 transform hover:scale-[1.02]"
              >
                <div className="absolute inset-0">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                </div>

                <div className="relative p-8 h-80 flex flex-col justify-end text-left">
                  <div className="mb-4">
                    <div className="inline-block p-3 bg-surface/20 backdrop-blur-sm rounded-xl mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                      {collection.title}
                    </h2>
                    <p className="text-purple-100 text-lg mb-6">
                      {collection.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {collection.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-surface/20 backdrop-blur-sm rounded-full text-sm text-white font-medium hover:bg-surface/30 transition-all"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>Explore Collection</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Trending Now</h2>
              <p className="text-secondary">Most popular items this week</p>
            </div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Hot Picks</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trendingProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-surface rounded-2xl shadow-theme-md hover:shadow-theme-xl transition-all duration-300 overflow-hidden border border-default hover:border-purple-300 transform hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-surface rounded-full shadow-theme-md hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlist.includes(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-secondary'
                      }`}
                    />
                  </button>
                  {product.trending && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                      <Zap className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <button
                    onClick={() => onViewProduct(product)}
                    className="w-full text-left"
                  >
                    <h3 className="font-semibold text-sm text-primary mb-1 line-clamp-2 group-hover:text-purple-600 dark:text-purple-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-secondary">{product.rating}</span>
                    </div>
                    <div className="text-lg font-bold text-primary">${product.price}</div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-3xl shadow-theme-xl p-10 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-3xl font-bold text-primary">Featured Treasures</h2>
              <p className="text-secondary">Handpicked by our curators</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-theme-lg transition-all duration-300 transform hover:scale-105 flex flex-col"
              >
                <div className="relative mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-surface rounded-full shadow-theme-md hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlist.includes(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-secondary'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full text-left mb-4 flex-grow"
                >
                  <h3 className="font-bold text-lg text-primary mb-2 group-hover:text-purple-600 dark:text-purple-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-secondary mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-secondary">({product.reviews})</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">${product.price}</div>
                </button>

                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 dark:from-purple-500 dark:to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-theme-md hover:shadow-theme-lg mt-auto"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-3xl p-12 text-white text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMThoMnYxMnptLTQgMGgtMlYxOGgydjEyem0tNCAwSDI2VjE4aDJ2MTJ6bS00IDBoLTJWMThoMnYxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10">
            <Gift className="w-16 h-16 mx-auto mb-6 opacity-90 animate-bounce text-white" />
            <h2 className="text-3xl font-bold mb-4 text-white">Not Sure Where to Start?</h2>
            <p className="text-xl text-purple-50 dark:text-purple-200 mb-8 max-w-2xl mx-auto">
              Let our intelligent gift finder help you discover the perfect sacred treasure for any occasion
            </p>
            <button
              onClick={() => onNavigate('gifts')}
              className="inline-flex items-center gap-2 bg-surface text-purple-700 dark:text-purple-300 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all shadow-theme-lg hover:shadow-theme-xl transform hover:scale-105"
            >
              <Gift className="w-5 h-5" />
              Try Gift Finder
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
