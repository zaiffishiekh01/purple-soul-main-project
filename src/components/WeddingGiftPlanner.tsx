import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Gift, Book, Clock, Package, DollarSign, TrendingUp, Star } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import PlannerProductCard from './PlannerProductCard';

interface WeddingGiftPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function WeddingGiftPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: WeddingGiftPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'occasions' | 'tracker' | 'shopping' | 'guide'>('overview');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [totalBudget, setTotalBudget] = useState(3000);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  // Load recommended products
  useEffect(() => {
    const weddingTags = ['wedding', 'gift', 'favor', 'personalized', 'celebration'];
    const products = mockProducts.filter(p =>
      p.tags.some(tag => weddingTags.includes(tag.toLowerCase()))
    );
    setRecommendedProducts(products);
  }, []);

  const selectedProductsTotal = selectedProducts.reduce((sum, id) => sum + 0, 0);

  const giftCategories = [
    { name: 'Engagement Gifts', budget: 500, spent: 0, count: 2 },
    { name: 'Bridal Shower Gifts', budget: 400, spent: 0, count: 8 },
    { name: 'Wedding Party Gifts', budget: 800, spent: 0, count: 10 },
    { name: 'Parent Gifts', budget: 600, spent: 0, count: 4 },
    { name: 'Guest Favors', budget: 500, spent: 0, count: 100 },
    { name: 'Thank You Gifts', budget: 200, spent: 0, count: 5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br bg-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Wedding Gift Planner</h1>
          </div>
          <p className="text-purple-50 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-50">Wedding Date</div>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-50">Recipients</div>
                  <div className="text-2xl font-bold">{giftCategories.reduce((sum, cat) => sum + cat.count, 0)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-50">Total Budget</div>
                  <div className="text-2xl font-bold">${totalBudget}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-50">Cart Total</div>
                  <div className="text-2xl font-bold">${selectedProductsTotal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-surface shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Heart },
              { id: 'budget', label: 'Budget', icon: DollarSign },
              { id: 'occasions', label: 'Occasions', icon: Calendar },
              { id: 'tracker', label: 'Gift Tracker', icon: CheckSquare },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Gift Guide', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
                    : 'text-muted hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-accent" />
                <h2 className="text-2xl font-bold text-primary">Wedding Gift Planning</h2>
              </div>
              <p className="text-secondary mb-6">
                Manage all wedding-related gifts from engagement to thank you presents. Track your budget, organize gift-giving occasions, and find perfect presents for everyone involved in your special day.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Gift className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Wedding Party</h3>
                  <p className="text-sm text-secondary">Thank bridesmaids, groomsmen, and attendants with meaningful gifts</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Family Gifts</h3>
                  <p className="text-sm text-secondary">Show appreciation to parents and family members</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Package className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Guest Favors</h3>
                  <p className="text-sm text-secondary">Memorable favors for your wedding guests</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary">Total Recipients</h3>
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">{giftCategories.reduce((sum, cat) => sum + cat.count, 0)}</div>
                <p className="text-sm text-secondary">People to gift</p>
              </div>

              <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary">Gift Budget</h3>
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">${totalBudget}</div>
                <p className="text-sm text-secondary">Total allocated</p>
              </div>

              <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary">Categories</h3>
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">{giftCategories.length}</div>
                <p className="text-sm text-secondary">Gift occasions</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Gift Budget</h2>

            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                {giftCategories.map((category, index) => (
                  <div key={index} className="border-b border-default pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-primary">{category.name}</span>
                        <p className="text-sm text-muted">{category.count} recipient{category.count > 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-accent font-bold">${category.budget.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-surface-deep rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(category.spent / category.budget) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-sm text-secondary">
                      <span>Spent: ${category.spent.toLocaleString()}</span>
                      <span>Remaining: ${(category.budget - category.spent).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Wedding Gift Shopping</h2>
              <p className="text-gray-600 dark:text-gray-300">Curated products for all your wedding gift needs</p>
            </div>

            {/* Product Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {giftCategories.map((category, index) => (
                <button
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-left border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Gift className="w-6 h-6 text-purple-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{category.count}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">${category.budget} budget</p>
                </button>
              ))}
            </div>

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Wedding Gifts</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedProducts.slice(0, 12).map((product) => (
                    <PlannerProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onViewProduct={(product) => {
                        if (onViewProduct) {
                          onViewProduct(product);
                        }
                        setViewingProduct(product);
                      }}
                      onQuickView={onQuickView}
                      isWishlisted={wishlist.includes(product.id)}
                      onToggleWishlist={onToggleWishlist}
                    />
                  ))}
                </div>
              </div>
            )}

            {recommendedProducts.length === 0 && (
              <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">No Products Available</h3>
                <p className="text-secondary">
                  Wedding gift products will appear here
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Wedding Gift Guide</h2>
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="font-bold text-primary mt-6 mb-3">Gift-Giving Timeline:</h3>
                <ul className="space-y-2 text-secondary">
                  <li><strong>Engagement:</strong> Small congratulatory gifts for the couple</li>
                  <li><strong>Bridal Shower:</strong> Practical household items or registry gifts</li>
                  <li><strong>Bachelor/Bachelorette:</strong> Fun, personalized gifts for bride/groom</li>
                  <li><strong>Wedding Party:</strong> Meaningful thank you gifts (jewelry, accessories, experiences)</li>
                  <li><strong>Parents:</strong> Sentimental gifts expressing gratitude</li>
                  <li><strong>Wedding Favors:</strong> Small keepsakes for all guests</li>
                  <li><strong>Thank You:</strong> Vendor tips and extra gifts for special helpers</li>
                </ul>

                <h3 className="font-bold text-primary mt-6 mb-3">Popular Gift Ideas:</h3>
                <ul className="space-y-2 text-secondary">
                  <li>Personalized jewelry for bridesmaids</li>
                  <li>Engraved accessories for groomsmen</li>
                  <li>Photo albums or frames for parents</li>
                  <li>Customized favor boxes or bags</li>
                  <li>Experience gifts (spa days, dinners)</li>
                  <li>Monogrammed robes or matching items</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
