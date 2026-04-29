import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Home, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import HomeBlessingProductCatalog from './HomeBlessingProductCatalog';

interface ChristianHomeBlessingPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'spiritual' | 'preparation' | 'ceremony' | 'decoration' | 'celebration';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function ChristianHomeBlessingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: ChristianHomeBlessingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'blessing' | 'decoration' | 'hospitality' | 'gifts' | 'shopping' | 'guide'>('overview');
  const [moveInDate, setMoveInDate] = useState('');
  const [homeType, setHomeType] = useState('');
  const [familySize, setFamilySize] = useState('');
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
    { id: '1', text: 'Contact pastor/priest for house blessing', completed: false, category: 'spiritual' },
    { id: '2', text: 'Choose blessing ceremony date', completed: false, category: 'spiritual' },
    { id: '3', text: 'Prepare Scripture readings for each room', completed: false, category: 'spiritual' },
    { id: '4', text: 'Purchase or prepare holy water', completed: false, category: 'spiritual' },
    { id: '5', text: 'Select cross and religious art for home', completed: false, category: 'decoration' },
    { id: '6', text: 'Clean and prepare home for blessing', completed: false, category: 'preparation' },
    { id: '7', text: 'Create guest list for housewarming', completed: false, category: 'preparation' },
    { id: '8', text: 'Send invitations to family and church community', completed: false, category: 'celebration' },
    { id: '9', text: 'Plan food and refreshments', completed: false, category: 'celebration' },
    { id: '10', text: 'Arrange for blessing ceremony setup', completed: false, category: 'ceremony' },
    { id: '11', text: 'Purchase Christian home decor items', completed: false, category: 'decoration' },
    { id: '12', text: 'Prepare prayer stations in each room', completed: false, category: 'ceremony' },
    { id: '13', text: 'Set up hospitality welcome area', completed: false, category: 'celebration' },
    { id: '14', text: 'Prepare thank you gifts for guests', completed: false, category: 'celebration' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'House Blessing Ceremony', estimated: 300, actual: 0, icon: Home },
    { name: 'Housewarming Party', estimated: 500, actual: 0, icon: Heart },
    { name: 'Christian Decor & Symbols', estimated: 400, actual: 0, icon: Star },
    { name: 'Food & Refreshments', estimated: 400, actual: 0, icon: Gift },
    { name: 'Gifts & Favors', estimated: 200, actual: 0, icon: Package },
    { name: 'Invitations & Printing', estimated: 100, actual: 0, icon: Book },
    { name: 'Miscellaneous', estimated: 100, actual: 0, icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Christian Home Blessing Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Plan a blessed house blessing ceremony and welcome celebration for your new home with Christian traditions</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Move-In Date</div>
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
                  <div className="text-sm text-purple-600 dark:text-purple-400">Home Type</div>
                  <select
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  >
                    <option value="" className="text-gray-900">Select type</option>
                    <option value="house" className="text-gray-900">House</option>
                    <option value="apartment" className="text-gray-900">Apartment</option>
                    <option value="condo" className="text-gray-900">Condo</option>
                    <option value="townhouse" className="text-gray-900">Townhouse</option>
                  </select>
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
                    onChange={(e) => setFamilySize(e.target.value)}
                    placeholder="Number"
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white w-full"
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
              { id: 'blessing', label: 'Blessing', icon: Home },
              { id: 'decoration', label: 'Decoration', icon: Star },
              { id: 'hospitality', label: 'Hospitality', icon: Heart },
              { id: 'gifts', label: 'Gifts', icon: Gift },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Guide', icon: Book }
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
              <h2 className="text-2xl font-bold text-primary mb-4">Bless Your New Home with Christian Traditions</h2>
              <p className="text-secondary mb-6">
                Welcome to your new home with the beautiful Christian tradition of house blessing. This planner guides you through every step of consecrating your home to God, creating a sacred space for your family, and celebrating with your church community.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Home className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">House Blessing</h3>
                  <p className="text-sm text-secondary">Invite clergy to bless your home room by room with prayer and Scripture</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Christian Decor</h3>
                  <p className="text-sm text-secondary">Adorn your home with crosses, Scripture art, and sacred symbols</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Hospitality</h3>
                  <p className="text-sm text-secondary">Celebrate with family and church community in Christian fellowship</p>
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
                  <div className="text-3xl font-bold">{moveInDate ? 'Scheduled' : 'Pending'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Blessing Date</div>
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
              <h3 className="text-xl font-bold text-primary mb-4">Biblical Foundation</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="text-secondary italic mb-2">
                    "As for me and my household, we will serve the Lord." - Joshua 24:15
                  </p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="text-secondary italic mb-2">
                    "Unless the Lord builds the house, the builders labor in vain." - Psalm 127:1
                  </p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <p className="text-secondary italic mb-2">
                    "Through wisdom a house is built, and by understanding it is established." - Proverbs 24:3
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Christian Home Blessing Checklist</h2>

              {['spiritual', 'preparation', 'ceremony', 'decoration', 'celebration'].map(category => (
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
              <h2 className="text-2xl font-bold text-primary mb-6">Blessing Timeline</h2>

              <div className="space-y-6">
                <div className="relative pl-8 pb-8 border-l-2 border-purple-600 dark:border-purple-600">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 border-4 border-white dark:border-gray-800"></div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">4-6 Weeks Before Move-In</h3>
                    <ul className="space-y-1 text-sm text-secondary">
                      <li>• Contact pastor/priest for blessing ceremony</li>
                      <li>• Start planning housewarming celebration</li>
                      <li>• Create guest list</li>
                      <li>• Begin shopping for Christian home decor</li>
                    </ul>
                  </div>
                </div>

                <div className="relative pl-8 pb-8 border-l-2 border-purple-600 dark:border-purple-600">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 border-4 border-white dark:border-gray-800"></div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">2-3 Weeks Before</h3>
                    <ul className="space-y-1 text-sm text-secondary">
                      <li>• Send invitations to family and church community</li>
                      <li>• Finalize blessing ceremony date and time</li>
                      <li>• Order crosses and religious art</li>
                      <li>• Plan menu for housewarming</li>
                    </ul>
                  </div>
                </div>

                <div className="relative pl-8 pb-8 border-l-2 border-purple-600 dark:border-purple-600">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 border-4 border-white dark:border-gray-800"></div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">1 Week Before</h3>
                    <ul className="space-y-1 text-sm text-secondary">
                      <li>• Deep clean the home</li>
                      <li>• Install crosses and Christian decor</li>
                      <li>• Prepare Scripture readings for each room</li>
                      <li>• Confirm catering or prepare food</li>
                    </ul>
                  </div>
                </div>

                <div className="relative pl-8 pb-8 border-l-2 border-purple-600 dark:border-purple-600">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 border-4 border-white dark:border-gray-800"></div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Day Before</h3>
                    <ul className="space-y-1 text-sm text-secondary">
                      <li>• Final cleaning and setup</li>
                      <li>• Prepare prayer stations in each room</li>
                      <li>• Set up hospitality area</li>
                      <li>• Review blessing ceremony order</li>
                    </ul>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 border-4 border-white dark:border-gray-800"></div>
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">Blessing Day</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Welcome clergy and prepare for ceremony</li>
                      <li>• House blessing with room-by-room prayers</li>
                      <li>• Housewarming celebration with community</li>
                      <li>• Fellowship and hospitality</li>
                    </ul>
                  </div>
                </div>
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

        {activeTab === 'blessing' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">House Blessing Ceremony</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Order of Service</h3>
                  <ol className="space-y-3 text-secondary">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <strong>Gathering & Welcome</strong>
                        <p className="text-sm">Gather at the entrance, welcome clergy and guests</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <strong>Opening Prayer</strong>
                        <p className="text-sm">Invoke God's presence and blessing on the home</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <strong>Scripture Reading</strong>
                        <p className="text-sm">Read passages about God's protection and presence</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <strong>Room-by-Room Blessing</strong>
                        <p className="text-sm">Walk through each room with prayer and holy water</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">5</span>
                      <div>
                        <strong>Final Blessing</strong>
                        <p className="text-sm">Return to main area for concluding prayer and blessing</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">6</span>
                      <div>
                        <strong>Fellowship</strong>
                        <p className="text-sm">Celebrate with refreshments and community</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">General House Blessing Prayer</h4>
                  <p className="text-secondary mb-3">
                    "Heavenly Father, we ask Your blessing upon this home and all who enter here. May it be a place of faith, hope, and love. Protect us from all harm and fill these rooms with Your presence. In Jesus' name, Amen."
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-4">Room-by-Room Blessing Guide</h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-purple-600 pl-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Living Room</h5>
                      <p className="text-sm text-secondary">Scripture: Psalm 127:1 - "Unless the Lord builds the house..."</p>
                      <p className="text-sm text-secondary">Prayer: "Bless this room as a place of fellowship and rest"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Kitchen</h5>
                      <p className="text-sm text-secondary">Scripture: Acts 2:46 - "They broke bread in their homes..."</p>
                      <p className="text-sm text-secondary">Prayer: "Bless those who prepare food and nourish our bodies"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Bedrooms</h5>
                      <p className="text-sm text-secondary">Scripture: Psalm 4:8 - "In peace I will lie down and sleep..."</p>
                      <p className="text-sm text-secondary">Prayer: "Grant peaceful rest and protection through the night"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Study/Office</h5>
                      <p className="text-sm text-secondary">Scripture: James 1:5 - "If any of you lacks wisdom..."</p>
                      <p className="text-sm text-secondary">Prayer: "Bless our work and grant us wisdom and diligence"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Children's Rooms</h5>
                      <p className="text-sm text-secondary">Scripture: Mark 10:14 - "Let the little children come to me..."</p>
                      <p className="text-sm text-secondary">Prayer: "Watch over our children and guide them in Your ways"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Entrance/Doorway</h5>
                      <p className="text-sm text-secondary">Scripture: Deuteronomy 6:9 - "Write them on the doorframes..."</p>
                      <p className="text-sm text-secondary">Prayer: "Bless all who enter and leave this home"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decoration' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Christian Home Decoration</h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Essential Religious Items</h3>
                    <ul className="space-y-2 text-secondary">
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Cross or crucifix for main living area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Scripture wall art with favorite verses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Family Bible in prominent location</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Prayer corner or devotional space</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Religious artwork or icons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Holy water font near entrance</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Decorative Ideas</h3>
                    <ul className="space-y-2 text-secondary">
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Scripture plaques for each room</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Christian-themed throw pillows and textiles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Nativity scene or religious figurines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Inspirational quote frames</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Candles for prayer and reflection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Christian music collection display</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-4">Popular Scripture Verses for Home Decor</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Joshua 24:15</p>
                      <p className="text-sm text-secondary italic">"As for me and my household, we will serve the Lord"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Psalm 91:1</p>
                      <p className="text-sm text-secondary italic">"He who dwells in the shelter of the Most High"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Philippians 4:13</p>
                      <p className="text-sm text-secondary italic">"I can do all things through Christ"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Jeremiah 29:11</p>
                      <p className="text-sm text-secondary italic">"For I know the plans I have for you"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Proverbs 24:3-4</p>
                      <p className="text-sm text-secondary italic">"By wisdom a house is built"</p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">John 14:27</p>
                      <p className="text-sm text-secondary italic">"Peace I leave with you"</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Creating Sacred Spaces</h4>
                  <p className="text-secondary mb-3">
                    Designate special areas in your home for prayer, Bible study, and spiritual reflection:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Prayer Corner</h5>
                      <p className="text-sm text-secondary">
                        Set up a quiet space with a comfortable chair, Bible, prayer journal, and candles for daily devotions.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Family Altar</h5>
                      <p className="text-sm text-secondary">
                        Create a central display with family Bible, photos, prayer requests, and religious items for family worship.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Blessing Board</h5>
                      <p className="text-sm text-secondary">
                        Display answered prayers, gratitude notes, and blessings to remind family of God's faithfulness.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hospitality' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Christian Hospitality</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Biblical Foundation of Hospitality</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="text-secondary italic mb-1">
                        "Share with the Lord's people who are in need. Practice hospitality." - Romans 12:13
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="text-secondary italic mb-1">
                        "Do not forget to show hospitality to strangers, for by so doing some people have shown hospitality to angels without knowing it." - Hebrews 13:2
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <p className="text-secondary italic mb-1">
                        "Offer hospitality to one another without grumbling." - 1 Peter 4:9
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-5">
                    <h3 className="font-bold text-primary mb-3">Housewarming Party Planning</h3>
                    <ul className="space-y-2 text-secondary">
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Send invitations 2-3 weeks in advance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Plan menu with dietary considerations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Prepare welcome drinks and refreshments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Create comfortable seating areas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Plan home tour route</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Prepare thank you favors</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-5">
                    <h3 className="font-bold text-primary mb-3">Christian Fellowship Ideas</h3>
                    <ul className="space-y-2 text-secondary">
                      <li className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Group prayer and thanksgiving</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Worship music in background</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Share testimony of finding the home</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Blessing ceremony for all guests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Scripture memory game or activity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Communion or blessing meal</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-4">Food & Refreshment Ideas</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Appetizers</h5>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Cheese and crackers</li>
                        <li>• Vegetable platter</li>
                        <li>• Fruit display</li>
                        <li>• Finger sandwiches</li>
                        <li>• Deviled eggs</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Main Dishes</h5>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Casserole buffet</li>
                        <li>• BBQ or grilled items</li>
                        <li>• Pasta dishes</li>
                        <li>• Soup and bread</li>
                        <li>• Potluck contributions</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Desserts</h5>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Welcome cake</li>
                        <li>• Cookies and brownies</li>
                        <li>• Pie selection</li>
                        <li>• Cupcakes</li>
                        <li>• Ice cream bar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Welcome Activities</h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Blessing Book</h5>
                      <p className="text-sm text-secondary">
                        Provide a guest book where visitors can write prayers, blessings, and Scripture verses for your family.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Prayer Wall</h5>
                      <p className="text-sm text-secondary">
                        Set up a board where guests can write prayer requests and praises to be prayed for in the new home.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Home Tour</h5>
                      <p className="text-sm text-secondary">
                        Guide guests through each blessed room, sharing the specific Scripture and prayer for that space.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gifts' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Christian Home Gifts</h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Traditional Christian Gifts</h3>
                    <ul className="space-y-2 text-secondary">
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Family Bible or study Bible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Wall cross or crucifix</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Scripture wall art</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Devotional books</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Prayer journal set</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Religious candles</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                    <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Practical Blessing Gifts</h3>
                    <ul className="space-y-2 text-secondary">
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Bread and salt (traditional welcome)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Welcome mat with Scripture</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Kitchen blessing plaque</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Christian music collection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Prayer basket supplies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Hospitality serving pieces</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-4">Gift Ideas by Room</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Living Room</h5>
                      <p className="text-sm text-secondary">
                        Scripture throw pillows, Christian coffee table books, wall crosses, inspirational quotes
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Kitchen</h5>
                      <p className="text-sm text-secondary">
                        Blessing plaque, prayer over meals sign, Christian recipe cards, blessed bread basket
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Bedroom</h5>
                      <p className="text-sm text-secondary">
                        Bedside devotional, prayer wall art, Scripture bedding, nighttime prayer cards
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-600 pl-4 py-2">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Entrance</h5>
                      <p className="text-sm text-secondary">
                        Welcome sign with Scripture, holy water font, blessing doorpost, faith-based doormat
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Guest Favor Ideas</h4>
                  <p className="text-secondary mb-3">
                    Send guests home with meaningful remembrances of your house blessing:
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Prayer Cards</p>
                      <p className="text-xs text-secondary">Custom cards with house blessing prayer</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Mini Crosses</p>
                      <p className="text-xs text-secondary">Small crosses or religious charms</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Bookmarks</p>
                      <p className="text-xs text-secondary">Scripture bookmarks with blessing</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Candles</p>
                      <p className="text-xs text-secondary">Prayer candles with verse labels</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Seeds</p>
                      <p className="text-xs text-secondary">Seed packets for "planting faith"</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Cookies</p>
                      <p className="text-xs text-secondary">Homemade treats with blessing tags</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Christian Home Blessing Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Consecrate your home as a sanctuary for faith, family, and fellowship</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">The Tradition of House Blessing</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">What is a House Blessing?</h4>
                  <p className="text-secondary mb-3">
                    A house blessing is a Christian ceremony where clergy or family members invite God's presence and protection into a new home. This ancient practice recognizes that our homes are more than physical structures—they are sacred spaces where faith is lived out daily.
                  </p>
                  <p className="text-secondary">
                    The blessing typically includes prayers for each room, Scripture readings, sprinkling of holy water (in some traditions), and dedicating the home to God's service.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Biblical Foundation</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Deuteronomy 6:6-9:</strong> Instructions to write God's words on doorframes and gates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Joshua 24:15:</strong> "As for me and my household, we will serve the Lord"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Psalm 127:1:</strong> "Unless the Lord builds the house, the builders labor in vain"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Luke 10:5-7:</strong> Jesus sends disciples to bless homes with peace</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Historical Traditions</h4>
                  <p className="text-secondary mb-3">
                    House blessings have been practiced throughout Christian history across various denominations:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Catholic Tradition</h5>
                      <p className="text-sm text-secondary">
                        Priests bless homes with holy water and prayers from the Roman Ritual. Often performed on Epiphany (January 6) or when moving into a new home.
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Orthodox Tradition</h5>
                      <p className="text-sm text-secondary">
                        Priests conduct house blessings with holy water, incense, and prayers. Icons are blessed and placed in each room.
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Protestant Tradition</h5>
                      <p className="text-sm text-secondary">
                        Pastors or families lead dedication services with Scripture readings, hymns, and prayers for God's blessing and protection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Complete Blessing Prayers & Scriptures</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Opening Blessing Prayer</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      Almighty and Everlasting God, bless this home and all who enter here. May Your presence dwell in every room, Your peace rest upon every heart, and Your love fill every corner. Guard this household from all harm, sanctify it for Your service, and make it a haven of faith, hope, and charity. Through Jesus Christ our Lord. Amen.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-primary">Room-by-Room Blessings</h4>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Entrance & Doorway</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Deuteronomy 6:9</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "Write them on the doorframes of your houses and on your gates."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Lord, bless all who enter and leave through this door. May those who come bring blessing, and those who depart carry Your peace. Let this threshold be a gateway of hospitality and welcome.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Living Room</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Acts 2:46</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "They broke bread in their homes and ate together with glad and sincere hearts."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Heavenly Father, bless this room as a place of fellowship and rest. May it be filled with laughter, meaningful conversations, and Your abiding presence. Grant us joy in gathering here together.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Kitchen & Dining Room</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Proverbs 9:5</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "Come, eat my food and drink the wine I have mixed."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Lord, bless this kitchen and dining area. Bless the hands that prepare food here and the meals shared at this table. May gratitude and grace always be present in this space of nourishment.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Master Bedroom</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Psalm 4:8</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Gracious God, bless this place of rest. Grant peaceful sleep, protection through the night, and renewal for each new day. Strengthen the bond of love in this marriage bed.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Children's Bedrooms</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Proverbs 22:6</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "Start children off on the way they should go, and even when they are old they will not turn from it."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Loving Father, watch over these children as they sleep and play. Fill their dreams with Your presence, guard them from all harm, and guide them to grow in wisdom and faith.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Home Office/Study</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Colossians 3:23</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "Whatever you do, work at it with all your heart, as working for the Lord."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Lord, bless this workspace. Grant wisdom, creativity, and diligence in all work done here. May our efforts glorify You and serve others with excellence.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Bathroom</h5>
                    <p className="text-sm text-muted mb-2">Scripture: 1 Corinthians 6:19</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "Do you not know that your bodies are temples of the Holy Spirit?"
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Creator God, bless this place of cleansing and renewal. Remind us to care for our bodies as temples of Your Holy Spirit, treating ourselves with respect and dignity.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Garage/Storage</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Luke 12:15</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "Life does not consist in an abundance of possessions."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Generous God, bless this space of storage and provision. Help us to be good stewards of our possessions and generous with what we have been given.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Yard/Garden</h5>
                    <p className="text-sm text-muted mb-2">Scripture: Genesis 2:15</p>
                    <p className="text-sm text-secondary mb-3 italic">
                      "The Lord God took the man and put him in the Garden of Eden to work it and take care of it."
                    </p>
                    <p className="text-sm text-secondary">
                      <strong>Prayer:</strong> Creator of all beauty, bless this outdoor space. May it be a place of growth, refreshment, and connection with Your creation. Grant us joy in tending what You have made.
                    </p>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Closing Blessing</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      May the Lord bless this house and all who dwell within. May the Father protect it, the Son sanctify it, and the Holy Spirit fill it with grace. May the peace of Christ rule here, the love of God abide here, and the joy of the Spirit overflow here, now and forever. Amen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Important Reminders & Tips</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Schedule Early</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Contact your pastor or priest well in advance to schedule the blessing ceremony.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Clean Thoroughly</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Prepare your home by cleaning and organizing before the blessing day.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Involve Family</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Include all family members in the blessing ceremony and preparation.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Continue the Practice</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Make your home blessing the beginning of ongoing spiritual practices in your home.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Document the Day</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Take photos and preserve memories of this special dedication.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Share with Community</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Invite church family and friends to celebrate with you.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Making Your Home a Sacred Space</h3>
              </div>

              <div className="space-y-4">
                <p className="text-secondary">
                  Beyond the initial blessing, create ongoing practices that keep your home centered on Christ:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Daily Practices</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Family prayer time</li>
                      <li>• Scripture reading at meals</li>
                      <li>• Bedtime prayers with children</li>
                      <li>• Morning devotionals</li>
                      <li>• Grace before meals</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Weekly Practices</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Sabbath rest observance</li>
                      <li>• Family Bible study</li>
                      <li>• Worship music time</li>
                      <li>• Hospitality to others</li>
                      <li>• Service and outreach</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Seasonal Practices</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Advent and Christmas celebrations</li>
                      <li>• Lenten observances</li>
                      <li>• Easter traditions</li>
                      <li>• Pentecost remembrance</li>
                      <li>• Thanksgiving gratitude</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Occasional Practices</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Home group gatherings</li>
                      <li>• Prayer meetings</li>
                      <li>• Annual re-blessing</li>
                      <li>• Baptism celebrations</li>
                      <li>• Communion at home</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-5 mt-6">
                  <h4 className="font-bold mb-2">Final Encouragement</h4>
                  <p className="text-purple-600 dark:text-purple-400">
                    Your home is more than walls and rooms—it is a temple where God's presence dwells, a sanctuary where faith is nurtured, and a lighthouse that shines Christ's love to your community. May your blessed home be a testimony to God's faithfulness and a haven of hope for all who enter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <HomeBlessingProductCatalog
              products={mockProducts}
              onAddToCart={onAddToCart}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
              onViewProduct={onViewProduct}
              onQuickView={onQuickView}
            />
          </div>
        )}
      </div>
    </div>
  );
}
