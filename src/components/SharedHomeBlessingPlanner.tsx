import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Home, Book, Clock, Gift, Package, ListChecks, DollarSign, Bell, Star, CheckCircle, MapPin, Utensils, PartyPopper } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import HomeBlessingProductCatalog from './HomeBlessingProductCatalog';

interface SharedHomeBlessingPlannerProps {
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
  category: 'preparation' | 'blessing' | 'decoration' | 'hospitality' | 'gifts';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function SharedHomeBlessingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: SharedHomeBlessingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'blessing' | 'decoration' | 'hospitality' | 'gifts' | 'shopping' | 'guide'>('overview');
  const [moveInDate, setMoveInDate] = useState('');
  const [homeType, setHomeType] = useState('apartment');
  const [familySize, setFamilySize] = useState('1-2');
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
    { id: '1', text: 'Deep clean entire home before move-in', completed: false, category: 'preparation' },
    { id: '2', text: 'Sage or smudge the space (if desired)', completed: false, category: 'blessing' },
    { id: '3', text: 'Set up welcoming entryway', completed: false, category: 'decoration' },
    { id: '4', text: 'Arrange furniture for positive energy flow', completed: false, category: 'preparation' },
    { id: '5', text: 'Prepare blessing ceremony elements', completed: false, category: 'blessing' },
    { id: '6', text: 'Light candles or incense for purification', completed: false, category: 'blessing' },
    { id: '7', text: 'Walk through each room with intention', completed: false, category: 'blessing' },
    { id: '8', text: 'Place plants for fresh energy', completed: false, category: 'decoration' },
    { id: '9', text: 'Hang artwork and personal touches', completed: false, category: 'decoration' },
    { id: '10', text: 'Create a gratitude or blessing corner', completed: false, category: 'blessing' },
    { id: '11', text: 'Plan housewarming party date', completed: false, category: 'hospitality' },
    { id: '12', text: 'Create guest list', completed: false, category: 'hospitality' },
    { id: '13', text: 'Send invitations', completed: false, category: 'hospitality' },
    { id: '14', text: 'Plan menu and refreshments', completed: false, category: 'hospitality' },
    { id: '15', text: 'Stock pantry with essentials', completed: false, category: 'preparation' },
    { id: '16', text: 'Prepare welcome gifts for guests', completed: false, category: 'gifts' },
    { id: '17', text: 'Set up music playlist', completed: false, category: 'hospitality' },
    { id: '18', text: 'Place welcoming doormat', completed: false, category: 'decoration' },
    { id: '19', text: 'Display family photos', completed: false, category: 'decoration' },
    { id: '20', text: 'Create house tour plan for guests', completed: false, category: 'hospitality' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: '2 Months Before Move-In',
      timeframe: '8 weeks prior',
      tasks: [
        'Research moving companies',
        'Start decluttering current home',
        'Order essential furniture',
        'Plan room layouts',
      ],
      completed: false,
    },
    {
      id: '2',
      title: '1 Month Before Move-In',
      timeframe: '4 weeks prior',
      tasks: [
        'Finalize furniture orders',
        'Purchase home essentials',
        'Schedule utility connections',
        'Plan blessing ceremony details',
      ],
      completed: false,
    },
    {
      id: '3',
      title: '2 Weeks Before Move-In',
      timeframe: '2 weeks prior',
      tasks: [
        'Pack non-essential items',
        'Confirm moving date',
        'Buy cleaning supplies',
        'Plan housewarming party',
      ],
      completed: false,
    },
    {
      id: '4',
      title: 'Move-In Week',
      timeframe: 'Week of move',
      tasks: [
        'Deep clean new home',
        'Coordinate furniture delivery',
        'Set up utilities',
        'Perform initial blessing',
      ],
      completed: false,
    },
    {
      id: '5',
      title: 'First Week in Home',
      timeframe: 'Days 1-7',
      tasks: [
        'Unpack essentials',
        'Arrange furniture',
        'Set up kitchen and bedrooms',
        'Perform full home blessing ceremony',
      ],
      completed: false,
    },
    {
      id: '6',
      title: 'Second Week',
      timeframe: 'Days 8-14',
      tasks: [
        'Add decorative touches',
        'Finalize room setups',
        'Send housewarming invitations',
        'Stock pantry fully',
      ],
      completed: false,
    },
    {
      id: '7',
      title: 'Housewarming Celebration',
      timeframe: '2-4 weeks after move',
      tasks: [
        'Prepare food and drinks',
        'Final cleaning and decorating',
        'Host blessing ceremony with guests',
        'Celebrate new beginnings',
      ],
      completed: false,
    },
  ]);

  const budgetCategories = [
    { name: 'Housewarming Party', estimated: 400, actual: 0, icon: PartyPopper },
    { name: 'Decorations & Ambiance', estimated: 300, actual: 0, icon: Sparkles },
    { name: 'Home Essentials', estimated: 600, actual: 0, icon: Home },
    { name: 'Gifts for Guests', estimated: 200, actual: 0, icon: Gift },
    { name: 'Blessing Ceremony Items', estimated: 150, actual: 0, icon: Bell },
    { name: 'Food & Refreshments', estimated: 250, actual: 0, icon: Utensils },
    { name: 'Plants & Greenery', estimated: 100, actual: 0, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Universal Home Blessing & Housewarming Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Create meaningful home blessings and celebrate your new beginning with an interfaith, inclusive approach</p>

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
                    <option value="apartment" className="text-gray-900">Apartment</option>
                    <option value="condo" className="text-gray-900">Condo</option>
                    <option value="townhouse" className="text-gray-900">Townhouse</option>
                    <option value="house" className="text-gray-900">House</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Family Size</div>
                  <select
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  >
                    <option value="1-2" className="text-gray-900">1-2 people</option>
                    <option value="3-4" className="text-gray-900">3-4 people</option>
                    <option value="5+" className="text-gray-900">5+ people</option>
                  </select>
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
              { id: 'blessing', label: 'Blessing', icon: Bell },
              { id: 'decoration', label: 'Decoration', icon: Star },
              { id: 'hospitality', label: 'Hospitality', icon: Users },
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Your New Home</h2>
              <p className="text-secondary mb-6">
                Create a meaningful home blessing ceremony that honors your beliefs, traditions, and intentions for your new space. This planner guides you through preparing, blessing, and celebrating your home in a way that feels authentic to you, whether you follow a specific faith tradition or prefer a secular, universal approach.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Home Blessing</h3>
                  <p className="text-sm text-secondary">Create a sacred ceremony to bless your new space with positive energy and intentions</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <PartyPopper className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Housewarming Party</h3>
                  <p className="text-sm text-secondary">Plan a joyful celebration to welcome friends and family into your new home</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Welcoming Space</h3>
                  <p className="text-sm text-secondary">Transform your house into a warm, inviting home filled with love and comfort</p>
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
                  <div className="text-3xl font-bold">{timeline.filter(t => t.completed).length}/{timeline.length}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Timeline Milestones</div>
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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl font-bold text-primary">Upcoming Tasks</h3>
                </div>
                <div className="space-y-3">
                  {checklist.filter(item => !item.completed).slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-secondary">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl font-bold text-primary">Budget Overview</h3>
                </div>
                <div className="space-y-3">
                  {budgetCategories.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-secondary">{category.name}</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">${category.estimated}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Home Blessing Checklist</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted">Progress</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {checklist.filter(i => i.completed).length}/{checklist.length} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-700 h-3 rounded-full transition-all"
                    style={{ width: `${(checklist.filter(i => i.completed).length / checklist.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {['preparation', 'blessing', 'decoration', 'hospitality', 'gifts'].map(category => (
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
              <h2 className="text-2xl font-bold text-primary mb-6">Moving & Blessing Timeline</h2>
              <p className="text-muted mb-6">
                Follow this timeline to ensure a smooth transition into your new home and a meaningful blessing ceremony.
              </p>

              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-purple-600 dark:bg-purple-600"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        event.completed
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-muted'
                      }`}>
                        {event.completed ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-primary">{event.title}</h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">{event.timeframe}</p>
                          </div>
                          <button
                            onClick={() => {
                              setTimeline(timeline.map(t =>
                                t.id === event.id ? { ...t, completed: !t.completed } : t
                              ));
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              event.completed
                                ? 'bg-gray-200 dark:bg-gray-600 text-secondary'
                                : 'bg-purple-600 text-white hover:bg-purple-600'
                            }`}
                          >
                            {event.completed ? 'Completed' : 'Mark Complete'}
                          </button>
                        </div>
                        <ul className="space-y-2 mt-3">
                          {event.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                              <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$500</span>
                  <span>$5,000</span>
                </div>
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
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(category.estimated / budget) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      {((category.estimated / budget) * 100).toFixed(1)}% of total budget
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
                {budgetCategories.reduce((sum, cat) => sum + cat.estimated, 0) > budget && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    Your estimated costs exceed your budget by ${(budgetCategories.reduce((sum, cat) => sum + cat.estimated, 0) - budget).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blessing' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Home Blessing Ceremony Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Create a meaningful blessing that honors your beliefs and intentions</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Universal Blessing Elements</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Setting Intentions</h4>
                  <p className="text-secondary mb-3">
                    Begin by setting clear, positive intentions for your new home. What energy do you want to cultivate?
                  </p>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Peace and harmony for all who enter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Love and connection among family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Health and well-being</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Prosperity and abundance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Creativity and inspiration</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Cleansing Ritual</h4>
                  <p className="text-secondary mb-3">
                    Purify your space before moving in to clear previous energies and create a fresh start.
                  </p>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Sage smudging or incense burning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Sound cleansing with bells or singing bowls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Salt and water purification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span>Opening windows to refresh energy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Blessing Ceremony Options</h3>

              <div className="space-y-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Secular/Humanist Blessing</h4>
                  <p className="text-sm text-secondary mb-3">
                    A non-religious ceremony focused on gratitude, intentions, and community
                  </p>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Walk through each room speaking positive affirmations</li>
                    <li>• Light candles representing warmth and light</li>
                    <li>• Share what you're grateful for in this new space</li>
                    <li>• Invite loved ones to offer well-wishes</li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Interfaith/Eclectic Blessing</h4>
                  <p className="text-sm text-secondary mb-3">
                    Combine elements from various traditions that resonate with you
                  </p>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Use prayers or poems from different cultures</li>
                    <li>• Incorporate symbols from various traditions</li>
                    <li>• Blend sage smudging with candle lighting</li>
                    <li>• Honor ancestors and spiritual guides</li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Nature-Based Blessing</h4>
                  <p className="text-sm text-secondary mb-3">
                    Connect with natural elements and cycles
                  </p>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Represent four elements: earth, air, fire, water</li>
                    <li>• Bring plants and flowers into each room</li>
                    <li>• Time blessing with moon phase or season</li>
                    <li>• Create offerings to the land</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Room-by-Room Blessing</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Entryway</h4>
                  <p className="text-sm text-secondary">
                    "May all who enter here find welcome, warmth, and peace. May this threshold mark the boundary between the world's chaos and our sanctuary of love."
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Kitchen</h4>
                  <p className="text-sm text-secondary">
                    "May this kitchen be filled with nourishment, abundance, and joyful gatherings. May the meals prepared here sustain our bodies and strengthen our bonds."
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Bedrooms</h4>
                  <p className="text-sm text-secondary">
                    "May this room be a haven of rest, dreams, and renewal. May sleep come easily and mornings bring fresh energy and hope."
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Living Spaces</h4>
                  <p className="text-sm text-secondary">
                    "May this space hold laughter, conversation, and connection. May we gather here in joy and comfort, creating memories that last a lifetime."
                  </p>
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
                <h2 className="text-2xl font-bold text-primary">Creating a Welcoming Atmosphere</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">Entryway Ideas</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Home className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Welcoming Doormat</div>
                        <div className="text-sm text-secondary">Choose a mat with positive message</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Lighting</div>
                        <div className="text-sm text-secondary">Warm, inviting entrance lighting</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Plants & Greenery</div>
                        <div className="text-sm text-secondary">Fresh plants for positive energy</div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">Living Spaces</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Personal Touches</div>
                        <div className="text-sm text-secondary">Family photos and meaningful art</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Comfortable Seating</div>
                        <div className="text-sm text-secondary">Create inviting conversation areas</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Ambient Elements</div>
                        <div className="text-sm text-secondary">Candles, soft lighting, cozy textiles</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Color Psychology for Home</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-primary mb-1">Calming</div>
                    <p className="text-secondary">Blues, greens, soft neutrals for bedrooms and bathrooms</p>
                  </div>
                  <div>
                    <div className="font-semibold text-primary mb-1">Energizing</div>
                    <p className="text-secondary">Warm yellows, oranges for kitchens and social spaces</p>
                  </div>
                  <div>
                    <div className="font-semibold text-primary mb-1">Grounding</div>
                    <p className="text-secondary">Earth tones, browns for living rooms and offices</p>
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
                <PartyPopper className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Housewarming Party Planning</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4">Party Checklist</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Before the Party</h4>
                      <ul className="space-y-2 text-sm text-secondary">
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Send invitations 2-3 weeks ahead</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Plan menu and dietary accommodations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Prepare house tour route</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Create playlist or arrange music</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Day of Party</h4>
                      <ul className="space-y-2 text-sm text-secondary">
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Deep clean and declutter</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Set up food and drink stations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Arrange seating areas</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Prepare blessing ceremony elements</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">Menu Ideas</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <Utensils className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                      <h4 className="font-semibold text-primary mb-2">Appetizers</h4>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Cheese and charcuterie board</li>
                        <li>• Vegetable crudités</li>
                        <li>• Bruschetta or crostini</li>
                        <li>• Stuffed mushrooms</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <Utensils className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                      <h4 className="font-semibold text-primary mb-2">Main Dishes</h4>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Slider bar</li>
                        <li>• Pasta station</li>
                        <li>• Taco or burrito buffet</li>
                        <li>• Grilled selections</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                      <h4 className="font-semibold text-primary mb-2">Desserts</h4>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• House-shaped cake</li>
                        <li>• Cookie assortment</li>
                        <li>• Fruit platter</li>
                        <li>• Mini cheesecakes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-primary mb-4">Party Activities</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Guided House Tour</div>
                        <p className="text-sm text-secondary">Share your vision for each room and future plans</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Group Blessing</div>
                        <p className="text-sm text-secondary">Invite guests to participate in blessing ceremony</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Wish Tree or Guestbook</div>
                        <p className="text-sm text-secondary">Let guests write blessings and well-wishes for your home</p>
                      </div>
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
                <h2 className="text-2xl font-bold text-primary">Meaningful Housewarming Gifts</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">Traditional Gifts</h3>
                  <div className="space-y-3">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">Bread & Salt</div>
                          <p className="text-sm text-secondary">Traditional symbol: "May you never go hungry or lack flavor in life"</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">Candles</div>
                          <p className="text-sm text-secondary">Symbolizing light, warmth, and positive energy</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">Plants</div>
                          <p className="text-sm text-secondary">Living gifts that grow with the family</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">Modern Practical Gifts</h3>
                  <div className="space-y-3">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Home className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">Kitchen Essentials</div>
                          <p className="text-sm text-secondary">Quality cookware, utensils, or appliances</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">Home Decor</div>
                          <p className="text-sm text-secondary">Artwork, throw pillows, decorative pieces</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-primary">Gift Cards</div>
                          <p className="text-sm text-secondary">Home improvement stores, furniture retailers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Symbolic Gifts & Their Meanings</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-secondary">
                  <div>• <strong>Broom:</strong> Sweep away bad luck</div>
                  <div>• <strong>Honey:</strong> Sweetness in life</div>
                  <div>• <strong>Wine:</strong> Joy and celebration</div>
                  <div>• <strong>Houseplant:</strong> Growth and prosperity</div>
                  <div>• <strong>Doormat:</strong> Welcome and hospitality</div>
                  <div>• <strong>Clock:</strong> May you have many happy hours</div>
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

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Home Blessing Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Create meaningful rituals and welcoming spaces for all faiths and traditions</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">The Art of Home Blessing</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">What is a Home Blessing?</h4>
                  <p className="text-secondary mb-3">
                    A home blessing is a meaningful ceremony performed when moving into a new space to set positive intentions, clear energy, and invite peace, prosperity, and protection. These rituals exist across cultures and can be adapted to any belief system.
                  </p>
                  <p className="text-secondary">
                    Whether you're religious, spiritual, or simply appreciate meaningful rituals, a home blessing helps you consciously transition into your new space and establish the energy you want your home to hold.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">When to Perform a Blessing</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Before Move-In:</strong> Ideal time to clear previous energies when the space is empty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>First Day:</strong> Set intentions as you begin living in the space</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>After Settling In:</strong> Perform a fuller ceremony during your housewarming party</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Seasonally:</strong> Refresh your home's energy with the changing seasons</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4">Step-by-Step Blessing Ceremony</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-primary mb-1">Prepare Your Space</h5>
                        <p className="text-sm text-secondary">Deep clean the entire home. Open windows to let fresh air circulate. Gather your blessing items: candles, incense, sage, bells, or other meaningful objects.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-primary mb-1">Set Your Intentions</h5>
                        <p className="text-sm text-secondary">Take a moment to reflect on what you want for your home. Write down or mentally note your intentions for peace, love, health, prosperity, or whatever resonates with you.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-primary mb-1">Cleanse the Space</h5>
                        <p className="text-sm text-secondary">Walk through each room with sage, incense, or a bell. Moving clockwise, cleanse corners where energy may be stagnant. Visualize negative energy being cleared away.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-primary mb-1">Bless Each Room</h5>
                        <p className="text-sm text-secondary">In each room, speak your intentions aloud or silently. You may use prayers, affirmations, or simply speak from the heart. Light a candle as a symbol of light and warmth.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-primary mb-1">Create a Sacred Space</h5>
                        <p className="text-sm text-secondary">Designate a corner or shelf as a special place for meaningful items: photos, spiritual objects, plants, or anything that represents your values and intentions.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">6</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-primary mb-1">Seal with Gratitude</h5>
                        <p className="text-sm text-secondary">End your ceremony by expressing gratitude for your new home. You might share a meal, toast with loved ones, or simply sit in quiet appreciation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Interfaith Blessing Traditions</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Christian House Blessing</h4>
                  <p className="text-sm text-secondary mb-2">
                    Traditional Christian blessings involve a priest or pastor walking through the home with holy water, prayers, and Bible readings.
                  </p>
                  <p className="text-xs text-muted">
                    Common elements: Cross or crucifix placement, Psalm 127, blessing each room
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Jewish Chanukat HaBayit</h4>
                  <p className="text-sm text-secondary mb-2">
                    Affixing mezuzot to doorposts and hosting a celebration with food, music, and Torah study.
                  </p>
                  <p className="text-xs text-muted">
                    Common elements: Mezuzah blessing, bread and salt, communal celebration
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Hindu Griha Pravesh</h4>
                  <p className="text-sm text-secondary mb-2">
                    Performed on an auspicious day with prayers, fire ceremony (havan), and rituals for prosperity.
                  </p>
                  <p className="text-xs text-muted">
                    Common elements: Ganesh puja, breaking a coconut, lighting lamps
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Islamic Home Blessing</h4>
                  <p className="text-sm text-secondary mb-2">
                    Reciting Quranic verses (especially Ayat al-Kursi) and offering prayers in each room for baraka.
                  </p>
                  <p className="text-xs text-muted">
                    Common elements: Quran recitation, dua in every room, dates and milk
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Buddhist Home Blessing</h4>
                  <p className="text-sm text-secondary mb-2">
                    Monks may be invited to chant sutras, offer blessings, and create a peaceful atmosphere.
                  </p>
                  <p className="text-xs text-muted">
                    Common elements: Meditation, incense, creating a Buddha altar
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Native American Smudging</h4>
                  <p className="text-sm text-secondary mb-2">
                    Using sacred herbs like sage, cedar, or sweetgrass to purify and bless the space.
                  </p>
                  <p className="text-xs text-muted">
                    Common elements: Four directions, tobacco offering, prayer ties
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Important Tips & Reminders</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Make it Personal</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Your blessing should reflect your beliefs, values, and what home means to you. There's no wrong way to do it.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Involve Your Family</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Include everyone who will live in the home, letting each person contribute their own intentions and blessings.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Regular Renewal</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Consider refreshing your home blessing seasonally or after major life changes to maintain positive energy.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Document the Moment</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Take photos or journal about your blessing ceremony to remember this special beginning in your new home.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
