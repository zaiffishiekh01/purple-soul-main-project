import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { supabase } from '../lib/supabase';
import SeasonalProductCatalog from './SeasonalProductCatalog';
import UniversalRegistry from './UniversalRegistry';

interface HanukkahPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  products?: Product[];
  comparisonProducts?: string[];
  onToggleComparison?: (id: string) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'preparation' | 'menorah' | 'food' | 'gifts' | 'celebration' | 'charity';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function HanukkahPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView, products = [], comparisonProducts = [], onToggleComparison }: HanukkahPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'menorah' | 'celebration' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [hanukkahStartDate, setHanukkahStartDate] = useState('');
  const [familySize, setFamilySize] = useState(4);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(2000);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry);
      setSelectedState('');
      setSelectedCity('');
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState);
      setSelectedCity('');
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const loadCountries = async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name');

    if (!error && data) {
      setCountries(data);
    }
  };

  const loadStates = async (countryId: string) => {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .eq('country_id', countryId)
      .order('name');

    if (!error && data) {
      setStates(data);
    }
  };

  const loadCities = async (stateId: string) => {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('state_id', stateId)
      .order('name');

    if (!error && data) {
      setCities(data);
    }
  };

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Purchase or prepare menorah (hanukkiah)', completed: false, category: 'menorah' },
    { id: '2', text: 'Stock up on candles (44 candles + 8 shamash)', completed: false, category: 'menorah' },
    { id: '3', text: 'Clean and polish menorah', completed: false, category: 'menorah' },
    { id: '4', text: 'Plan latke recipes and purchase potatoes', completed: false, category: 'food' },
    { id: '5', text: 'Get ingredients for sufganiyot (jelly donuts)', completed: false, category: 'food' },
    { id: '6', text: 'Purchase or prepare olive oil for cooking', completed: false, category: 'food' },
    { id: '7', text: 'Buy dreidels for games', completed: false, category: 'celebration' },
    { id: '8', text: 'Prepare gelt (chocolate coins)', completed: false, category: 'celebration' },
    { id: '9', text: 'Plan 8 nights of gifts', completed: false, category: 'gifts' },
    { id: '10', text: 'Wrap gifts for each night', completed: false, category: 'gifts' },
    { id: '11', text: 'Set up Hanukkah decorations (blue/silver)', completed: false, category: 'preparation' },
    { id: '12', text: 'Prepare charity donations (tzedakah)', completed: false, category: 'charity' },
    { id: '13', text: 'Plan Hanukkah party or gathering', completed: false, category: 'celebration' },
    { id: '14', text: 'Learn or review Hanukkah blessings', completed: false, category: 'preparation' },
    { id: '15', text: 'Prepare applesauce and sour cream for latkes', completed: false, category: 'food' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Gifts (8 Nights)', estimated: 600, actual: 0, icon: Gift },
    { name: 'Food & Oil', estimated: 300, actual: 0, icon: Heart },
    { name: 'Menorah & Candles', estimated: 150, actual: 0, icon: Sparkles },
    { name: 'Decorations', estimated: 200, actual: 0, icon: Star },
    { name: 'Dreidels & Gelt', estimated: 100, actual: 0, icon: Package },
    { name: 'Charitable Giving (Tzedakah)', estimated: 400, actual: 0, icon: CheckCircle },
    { name: 'Party & Entertainment', estimated: 250, actual: 0, icon: Users },
  ];

  const menorahLightingOrder = [
    { night: 1, candles: 1, position: 'Far right', shamash: true },
    { night: 2, candles: 2, position: 'Right to left', shamash: true },
    { night: 3, candles: 3, position: 'Right to left', shamash: true },
    { night: 4, candles: 4, position: 'Right to left', shamash: true },
    { night: 5, candles: 5, position: 'Right to left', shamash: true },
    { night: 6, candles: 6, position: 'Right to left', shamash: true },
    { night: 7, candles: 7, position: 'Right to left', shamash: true },
    { night: 8, candles: 8, position: 'All candles lit', shamash: true },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Hanukkah Celebration Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Plan a meaningful 8-night Festival of Lights celebration with family and friends</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Hanukkah Start Date</div>
                  <input
                    type="date"
                    value={hanukkahStartDate}
                    onChange={(e) => setHanukkahStartDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Family Size</div>
                  <input
                    type="number"
                    value={familySize}
                    onChange={(e) => setFamilySize(parseInt(e.target.value))}
                    min="1"
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Checklist</div>
                  <div className="text-2xl font-bold">{checklist.filter(i => i.completed).length}/{checklist.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Budget</div>
                  <div className="text-2xl font-bold">${budget.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface shadow-theme-md border-t border-default sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {[
              { id: 'overview', label: 'Overview', icon: Sparkles },
              { id: 'checklist', label: 'Checklist', icon: CheckSquare },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'budget', label: 'Budget', icon: Package },
              { id: 'menorah', label: 'Menorah Guide', icon: Sparkles },
              { id: 'celebration', label: 'Celebration', icon: Gift },
              { id: 'registry', label: 'Registry', icon: ListChecks },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Hanukkah Guide', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
                    : 'text-gray-600 hover:text-purple-700 dark:text-gray-400 dark:hover:text-purple-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Celebrate the Festival of Lights</h2>
              <p className="text-secondary mb-6">
                Plan a memorable 8-night Hanukkah celebration filled with tradition, joy, and the miraculous story of the oil that burned for eight days. This comprehensive planner helps you organize menorah lighting, prepare traditional foods, plan gifts, and create lasting memories with your loved ones.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Menorah Lighting</h3>
                  <p className="text-sm text-secondary">Light the menorah each night with proper blessings and traditions</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Traditional Foods</h3>
                  <p className="text-sm text-secondary">Prepare delicious latkes, sufganiyot, and other festive dishes</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">8 Nights of Gifts</h3>
                  <p className="text-sm text-secondary">Plan thoughtful gifts and dreidel games for each night</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Progress Summary</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-3xl font-bold">{checklist.filter(i => i.completed).length}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">8</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Nights to Celebrate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{selectedProducts.length}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Items Selected</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">${budget.toLocaleString()}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Total Budget</div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-xl font-bold text-primary mb-4">8 Nights of Hanukkah</h3>
              <div className="grid md:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(night => (
                  <div key={night} className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4 text-center border-2 border-purple-600 dark:border-purple-600">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">Night {night}</div>
                    <div className="text-sm text-muted">{night} candle{night > 1 ? 's' : ''} + shamash</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Hanukkah Preparation Checklist</h2>

              {['preparation', 'menorah', 'food', 'gifts', 'celebration', 'charity'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {checklist.filter(item => item.category === category).map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
                          item.completed
                            ? 'bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-600 dark:border-purple-600'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          item.completed
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-default'
                        }`}>
                          {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-primary'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">8-Night Timeline</h2>

              <div className="space-y-4">
                {menorahLightingOrder.map((night) => (
                  <div key={night.night} className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-5 border-l-4 border-purple-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-primary">Night {night.night}</h3>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">{night.candles} candle{night.candles > 1 ? 's' : ''} + shamash</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-secondary">Light candles at sundown</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-secondary">Recite blessings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-secondary">Enjoy traditional foods</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-secondary">Exchange gifts & play dreidel</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Budget Planner</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Total Budget: ${budget.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                {budgetCategories.map((category, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <category.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-primary">{category.name}</span>
                      </div>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">${category.estimated}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(category.estimated / budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">Total Estimated</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${budgetCategories.reduce((sum, cat) => sum + cat.estimated, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menorah' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Menorah Lighting Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Learn the proper order and blessings for lighting the Hanukkah menorah</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">How to Light the Menorah</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Candle Placement</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Night 1:</strong> Place one candle on the far right of the menorah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Night 2-8:</strong> Add candles from right to left (newest candle on the left)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Shamash:</strong> Place the helper candle in its elevated position</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Lighting Order</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Step 1:</strong> Light the shamash (helper candle) first</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Step 2:</strong> Recite the blessings while holding the lit shamash</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Step 3:</strong> Light candles from left to right (newest first)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Step 4:</strong> Place shamash back in its holder</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">The Three Blessings</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Blessing 1 (All Nights):</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2">בָּרוּךְ אַתָּה ה' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ לְהַדְלִיק נֵר שֶׁל חֲנֻכָּה</p>
                      <p className="text-sm text-secondary">"Blessed are You, Lord our God, King of the universe, who has sanctified us with His commandments, and commanded us to kindle the Hanukkah light."</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Blessing 2 (All Nights):</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2">בָּרוּךְ אַתָּה ה' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה נִסִּים לַאֲבוֹתֵינוּ בַּיָּמִים הָהֵם בַּזְּמַן הַזֶּה</p>
                      <p className="text-sm text-secondary">"Blessed are You, Lord our God, King of the universe, who performed miracles for our forefathers in those days, at this time."</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Blessing 3 (First Night Only):</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2">בָּרוּךְ אַתָּה ה' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה</p>
                      <p className="text-sm text-secondary">"Blessed are You, Lord our God, King of the universe, who has granted us life, sustained us, and enabled us to reach this occasion."</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Important Guidelines</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Timing:</strong> Light candles after sundown (except Friday, before Shabbat candles)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Placement:</strong> Display menorah in a window or doorway to publicize the miracle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Burning Time:</strong> Candles should burn for at least 30 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Tradition:</strong> Gather family, sing songs, and enjoy the candlelight together</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'celebration' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Celebration Activities</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-lg text-primary mb-3">Traditional Foods</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Latkes:</strong> Crispy potato pancakes fried in oil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Sufganiyot:</strong> Jelly-filled donuts dusted with powdered sugar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Brisket:</strong> Traditional slow-cooked beef</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Cheese Dishes:</strong> Celebrating Judith's bravery</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-lg text-primary mb-3">Dreidel Game</h4>
                  <p className="text-secondary mb-3">
                    The dreidel is a four-sided spinning top with Hebrew letters representing "A Great Miracle Happened There."
                  </p>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li><strong>נ (Nun):</strong> Nothing - no action</li>
                    <li><strong>ג (Gimmel):</strong> Get all - take the pot</li>
                    <li><strong>ה (Hey):</strong> Half - take half the pot</li>
                    <li><strong>ש (Shin):</strong> Share - put one in</li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-lg text-primary mb-3">Gift-Giving Ideas</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Books and educational games</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Jewish cultural items and decorations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Gelt (chocolate coins) for children</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Donations to charity in someone's name</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-lg text-primary mb-3">Songs & Music</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Ma'oz Tzur (Rock of Ages)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Hanukkah, Oh Hanukkah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>I Have a Little Dreidel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Light One Candle</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Hanukkah Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">The story, traditions, and meaning of the Festival of Lights</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">The Story of Hanukkah</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">The Historical Background</h4>
                  <p className="text-secondary mb-3">
                    Over 2,000 years ago, the land of Israel was ruled by the Seleucid Empire. King Antiochus IV tried to force the Jewish people to abandon their religion and adopt Greek culture and idol worship. The Holy Temple in Jerusalem was desecrated.
                  </p>
                  <p className="text-secondary">
                    A small group of faithful Jews, led by Judah Maccabee and his brothers, rose up against the mighty Greek army. Against all odds, they won, reclaimed the Temple, and rededicated it to God.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">The Miracle of the Oil</h4>
                  <p className="text-secondary mb-3">
                    When the Maccabees wanted to light the Temple's menorah (the seven-branched candelabrum), they could find only one small flask of pure olive oil with the High Priest's seal intact. This oil was enough for just one day, but miraculously, it burned for eight days - giving them time to prepare fresh pure oil.
                  </p>
                  <p className="text-secondary">
                    This is why Hanukkah is celebrated for eight nights, and why we light an additional candle each night, commemorating this miracle of light over darkness.
                  </p>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Why We Celebrate with Oil</h4>
                  <p className="text-secondary mb-3">
                    Because the miracle involved oil, it is customary to eat foods fried in oil during Hanukkah, such as latkes (potato pancakes) and sufganiyot (jelly donuts).
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary mb-1">Latkes Recipe</p>
                      <p className="text-sm text-secondary">Grated potatoes, onions, eggs, and flour, fried until golden and crispy. Serve with applesauce or sour cream.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary mb-1">Sufganiyot Recipe</p>
                      <p className="text-sm text-secondary">Round donuts deep-fried and filled with jelly, custard, or chocolate, then dusted with powdered sugar.</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">The Meaning of the Menorah</h4>
                  <p className="text-secondary mb-3">
                    The Hanukkah menorah (also called a hanukkiah) has nine branches - eight for each night of Hanukkah, plus the shamash (helper candle) used to light the others.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>The menorah reminds us of the Temple menorah that burned with the miraculous oil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>We display it publicly to proclaim the miracle to all</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Each night we add more light, symbolizing the spreading of divine light</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Hanukkah Traditions</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-primary mb-1">Dreidel Game</p>
                      <p className="text-secondary text-sm">During Greek persecution, Jews would study Torah in secret. When soldiers approached, they would hide their books and pretend to be playing with a spinning top (dreidel).</p>
                    </div>
                    <div>
                      <p className="font-semibold text-primary mb-1">Gelt (Money)</p>
                      <p className="text-secondary text-sm">Giving children Hanukkah gelt (coins or chocolate coins) commemorates the Maccabees minting coins after their victory and encourages learning.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-primary mb-1">Tzedakah (Charity)</p>
                      <p className="text-secondary text-sm">Hanukkah is an ideal time to increase charitable giving and help those in need, spreading the light of kindness.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Important Reminders</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🕯️</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Safety First</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Never leave burning candles unattended. Place menorah on a stable, fireproof surface away from curtains.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Family Gathering</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Make candle lighting a family event. Share stories, sing songs, and create memories together.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💝</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Meaningful Gifts</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Focus on gifts that promote learning, Jewish values, and quality family time over materialism.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤝</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Share the Light</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Invite friends and neighbors to experience the joy of Hanukkah. Spread light and kindness.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">The Message of Hanukkah</h3>
              <p className="text-purple-600 dark:text-purple-400 mb-4">
                Hanukkah teaches us that even a small light can dispel great darkness. No matter how challenging circumstances may seem, we have the power to bring light, hope, and goodness into the world. The Maccabees' courage reminds us to stand up for our values and faith, while the miracle of the oil shows us that divine help can come when we need it most.
              </p>
              <p className="text-purple-600 dark:text-purple-400">
                As we light the menorah each night, increasing the light, we are reminded to increase our own acts of kindness, learning, and connection to our heritage and community.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <SeasonalProductCatalog
            products={products}
            onAddToCart={onAddToCart!}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist!}
            onViewProduct={onViewProduct!}
            onQuickView={onQuickView}
            comparisonProducts={comparisonProducts}
            onToggleComparison={onToggleComparison}
          />
        )}

        {activeTab === 'wishlist' && (
          <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Your Wishlist</h2>
            <p className="text-muted">Save items you love for your Hanukkah celebration.</p>
          </div>
        )}

        {activeTab === 'registry' && (
          <UniversalRegistry
            registryType="celebration"
            availableProducts={[]}
            onAddToCart={onAddToCart}
            viewMode="browse"
          />
        )}
      </div>
    </div>
  );
}
