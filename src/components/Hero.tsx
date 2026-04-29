import { ChevronRight, Star, TrendingUp, Zap, Heart, ShoppingBag, Award, Layers, Crown, Clock, Calendar, Gift } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';

interface HeroProps {
  onShopNow: () => void;
  onViewProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (section: string) => void;
}

export default function Hero({ onShopNow, onViewProduct, wishlist, onToggleWishlist, onAddToCart, onNavigate }: HeroProps) {
  const featuredProducts = mockProducts.filter(p => p.featured).slice(0, 3);
  const trendingProducts = mockProducts.filter(p => p.trending).slice(0, 4);
  const collectionsProducts = mockProducts.slice(0, 4);
  const curatedProducts = mockProducts.filter(p => p.featured).slice(0, 4);
  const heritageProducts = mockProducts.filter(p => p.rating >= 4.5).slice(0, 4);
  const seasonalProducts = mockProducts.slice(8, 12);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                New Collection 2026
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                Discover Your
                <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"> Purple Soul</span>
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                By DKC Collective - Experience shopping reimagined with AI-powered recommendations, curated collections, and exclusive deals tailored just for you.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onShopNow}
                  className="bg-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-purple-700 transition-all shadow-theme-lg hover:shadow-theme-xl hover:scale-105 flex items-center gap-2"
                >
                  Shop Now
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('discover')}
                  className="bg-surface text-primary px-8 py-4 rounded-full font-semibold hover:bg-surface-elevated transition-all border-2 border-default hover:border-purple-600 shadow-theme-md"
                >
                  Explore Collections
                </button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-secondary">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.9</div>
                  <div className="flex items-center gap-1 text-sm text-secondary">
                    <Star className="w-4 h-4 fill-purple-400 text-purple-400" />
                    Rating
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-secondary">Products</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {featuredProducts.slice(0, 2).map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative bg-surface rounded-2xl overflow-hidden shadow-theme-lg hover:shadow-theme-2xl transition-all cursor-pointer transform hover:scale-105"
                    onClick={() => onViewProduct(product)}
                  >
                    <div className="aspect-square overflow-hidden bg-surface-deep">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            wishlist.includes(product.id)
                              ? 'fill-accent text-accent'
                              : 'text-secondary'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-primary mb-1">{product.name}</h3>
                      <p className="text-purple-600 font-bold">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-3xl font-bold text-primary">Trending Now</h2>
            </div>
            <p className="text-secondary">Discover what everyone's shopping for</p>
          </div>
          <button
            onClick={onShopNow}
            className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-surface rounded-xl overflow-hidden shadow-theme-md hover:shadow-theme-xl transition-all cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden bg-surface-deep">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onClick={() => onViewProduct(product)}
                />
                <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  TRENDING
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
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
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="w-full bg-surface text-primary py-2 rounded-lg font-semibold hover:bg-surface-deep transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Quick Add
                  </button>
                </div>
              </div>
              <div
                className="p-4"
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
                <h3 className="font-semibold text-primary mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold text-lg">${product.price}</span>
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
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-3xl font-bold text-primary">Featured Treasures</h2>
              <p className="text-secondary">Handpicked masterpieces by our curators</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-surface-elevated rounded-2xl p-6 hover:shadow-theme-xl transition-all duration-300 transform hover:scale-105 flex flex-col"
              >
                <div className="relative mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => onViewProduct(product)}
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
                          ? 'fill-accent text-accent'
                          : 'text-secondary'
                      }`}
                    />
                  </button>
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Featured
                  </div>
                </div>

                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full text-left mb-4 flex-grow"
                >
                  <h3 className="font-bold text-lg text-primary mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
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
                              ? 'fill-purple-400 text-purple-400'
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
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-theme-md hover:shadow-theme-lg mt-auto"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-deep py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Layers className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-3xl font-bold text-primary">Collections</h2>
              <p className="text-secondary">Themed sets curated for meaning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collectionsProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-surface rounded-xl p-4 hover:shadow-theme-xl transition-all duration-300 transform hover:scale-105 flex flex-col"
              >
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => onViewProduct(product)}
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
                          ? 'fill-accent text-accent'
                          : 'text-secondary'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full text-left mb-3 flex-grow"
                >
                  <h4 className="font-bold text-sm text-primary mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-purple-400 text-purple-400" />
                    <span className="text-xs text-secondary">{product.rating}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">${product.price}</div>
                </button>

                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow-theme-md mt-auto"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Crown className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-3xl font-bold text-primary">Curated</h2>
              <p className="text-secondary">Expert selections for discerning collectors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {curatedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-surface-elevated rounded-xl p-4 hover:shadow-theme-xl transition-all duration-300 transform hover:scale-105 flex flex-col"
              >
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => onViewProduct(product)}
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
                          ? 'fill-accent text-accent'
                          : 'text-secondary'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full text-left mb-3 flex-grow"
                >
                  <h4 className="font-bold text-sm text-primary mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-purple-400 text-purple-400" />
                    <span className="text-xs text-secondary">{product.rating}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">${product.price}</div>
                </button>

                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow-theme-md mt-auto"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-deep py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-3xl font-bold text-primary">Heritage</h2>
              <p className="text-secondary">Timeless pieces with centuries of tradition</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {heritageProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-surface rounded-xl p-4 hover:shadow-theme-xl transition-all duration-300 transform hover:scale-105 flex flex-col"
              >
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => onViewProduct(product)}
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
                          ? 'fill-accent text-accent'
                          : 'text-secondary'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full text-left mb-3 flex-grow"
                >
                  <h4 className="font-bold text-sm text-primary mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-purple-400 text-purple-400" />
                    <span className="text-xs text-secondary">{product.rating}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">${product.price}</div>
                </button>

                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow-theme-md mt-auto"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-3xl font-bold text-primary">Seasonal Picks</h2>
              <p className="text-secondary">Perfect for upcoming celebrations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-surface-elevated rounded-xl p-4 hover:shadow-theme-xl transition-all duration-300 transform hover:scale-105 flex flex-col"
              >
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => onViewProduct(product)}
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
                          ? 'fill-accent text-accent'
                          : 'text-secondary'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full text-left mb-3 flex-grow"
                >
                  <h4 className="font-bold text-sm text-primary mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-purple-400 text-purple-400" />
                    <span className="text-xs text-secondary">{product.rating}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">${product.price}</div>
                </button>

                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow-theme-md mt-auto"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl p-12 text-white text-center bg-gradient-to-r from-purple-600 to-purple-700">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMThoMnYxMnptLTQgMGgtMlYxOGgydjEyem0tNCAwSDI2VjE4aDJ2MTJ6bS00IDBoLTJWMThoMnYxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10">
              <Gift className="w-16 h-16 mx-auto mb-6 opacity-90 animate-bounce text-white" />
              <h2 className="text-4xl font-bold mb-4 text-white">Not Sure Where to Start?</h2>
              <p className="text-xl text-purple-50 mb-8 max-w-2xl mx-auto">
                Let our intelligent gift finder help you discover the perfect sacred treasure for any occasion
              </p>
              <button
                onClick={() => onNavigate('gifts')}
                className="inline-flex items-center gap-2 bg-surface text-purple-700 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-theme-lg hover:shadow-theme-xl transform hover:scale-105"
              >
                <Gift className="w-5 h-5" />
                Try Gift Finder
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-primary">Fast Delivery</h3>
              <p className="text-secondary">Get your orders delivered in 2-3 business days</p>
            </div>
            <div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-primary">Premium Quality</h3>
              <p className="text-secondary">Handpicked products that meet our high standards</p>
            </div>
            <div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-primary">Best Prices</h3>
              <p className="text-secondary">Competitive pricing with exclusive member deals</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
