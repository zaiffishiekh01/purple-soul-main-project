import { useState } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Home, Book, Clock, Package, MapPin, Gift } from 'lucide-react';
import { Product } from '../App';

interface NewHomeBlessingPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function NewHomeBlessingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: NewHomeBlessingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'essentials' | 'blessing' | 'shopping' | 'guide'>('overview');
  const [moveInDate, setMoveInDate] = useState('');
  const [homeType, setHomeType] = useState('apartment');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState(0);

  const selectedProductsTotal = selectedProducts.reduce((sum, id) => sum + 0, 0);

  const essentialCategories = [
    { name: 'Kitchen Essentials', items: ['Cookware', 'Dishes', 'Utensils', 'Small appliances'], budget: 800 },
    { name: 'Bedroom Setup', items: ['Bed frame', 'Mattress', 'Bedding', 'Pillows'], budget: 1200 },
    { name: 'Living Room', items: ['Sofa', 'Coffee table', 'Lighting', 'Curtains'], budget: 1500 },
    { name: 'Bathroom Needs', items: ['Towels', 'Bath mat', 'Shower curtain', 'Storage'], budget: 300 },
    { name: 'Cleaning Supplies', items: ['Vacuum', 'Mop', 'Cleaning products', 'Storage'], budget: 200 },
    { name: 'Sacred Items', items: ['Prayer items', 'Religious art', 'Blessing decorations'], budget: 200 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart New Home & Blessing Planner</h1>
          </div>
          <p className="text-teal-100 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-teal-100">Move-in Date</div>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-teal-100">Home Type</div>
                  <select
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  >
                    <option value="apartment" className="text-gray-900">Apartment</option>
                    <option value="condo" className="text-gray-900">Condo</option>
                    <option value="house" className="text-gray-900">House</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6" />
                <div>
                  <div className="text-sm text-teal-100">Progress</div>
                  <div className="text-2xl font-bold">{completedTasks}/25</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <div className="text-sm text-teal-100">Cart Total</div>
                  <div className="text-2xl font-bold">${selectedProductsTotal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Heart },
              { id: 'checklist', label: 'Checklist', icon: CheckSquare },
              { id: 'essentials', label: 'Home Essentials', icon: Home },
              { id: 'blessing', label: 'Blessing Ceremony', icon: Sparkles },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Guide', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'text-teal-600 border-b-2 border-teal-600 dark:text-teal-400 dark:border-teal-400'
                    : 'text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400'
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-8 h-8 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Home & Blessing</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Plan your new home setup and blessing ceremony. Organize everything you need for your new beginning, from essential household items to planning a meaningful home blessing or housewarming celebration.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <Home className="w-6 h-6 text-teal-600 mb-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Home Setup</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Organize all essentials for your new living space</p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <Sparkles className="w-6 h-6 text-teal-600 mb-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Blessing Ceremony</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan a spiritual blessing for your new home</p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <Gift className="w-6 h-6 text-teal-600 mb-2" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Housewarming</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Celebrate with family and friends</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Essential Categories</h3>
                  <Package className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-3xl font-bold text-teal-600">{essentialCategories.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Areas to furnish</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Budget</h3>
                  <Home className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-3xl font-bold text-teal-600">
                  ${essentialCategories.reduce((sum, cat) => sum + cat.budget, 0)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated cost</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Setup Progress</h3>
                  <CheckSquare className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-3xl font-bold text-teal-600">{completedTasks}%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks completed</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'essentials' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Home Essentials</h2>

            {essentialCategories.map((category, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h3>
                  <span className="text-teal-600 font-bold">${category.budget}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'blessing' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Home Blessing Ceremony</h2>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Blessing Traditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Islamic Tradition</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Recite Ayat al-Kursi and offer prayers for baraka (blessings) in the new home
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Recite Quran verses</li>
                    <li>• Pray in each room</li>
                    <li>• Invite guests for dua</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Christian Tradition</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    House blessing with prayer, holy water, and dedication to God
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Invite pastor/priest</li>
                    <li>• Bless each room</li>
                    <li>• Place cross or icons</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Jewish Tradition</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Chanukat HaBayit with mezuzah placement and celebration
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Affix mezuzot</li>
                    <li>• Recite blessings</li>
                    <li>• Host celebration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Home Shopping</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-teal-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Browse Home Products</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Discover home essentials, religious items, blessing decorations, and housewarming gifts
              </p>
              <button className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
                Browse Products
              </button>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">New Home Guide</h2>
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-3">Moving Timeline:</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>2 months before:</strong> Start purchasing essential furniture</li>
                  <li><strong>1 month before:</strong> Order larger items, plan utilities setup</li>
                  <li><strong>2 weeks before:</strong> Pack non-essentials, schedule movers</li>
                  <li><strong>1 week before:</strong> Confirm all deliveries and services</li>
                  <li><strong>Moving day:</strong> Coordinate movers, do walkthrough</li>
                  <li><strong>First week:</strong> Unpack essentials, set up utilities</li>
                  <li><strong>First month:</strong> Complete setup, plan blessing/housewarming</li>
                </ul>

                <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-3">Essential First Purchases:</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Mattress and bedding for quality sleep</li>
                  <li>Basic kitchen items for meal preparation</li>
                  <li>Cleaning supplies for move-in cleaning</li>
                  <li>Bathroom essentials and towels</li>
                  <li>Basic lighting for all rooms</li>
                  <li>Religious/spiritual items for blessings</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
