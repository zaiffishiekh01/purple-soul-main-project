import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Bell, Book, Clock, Gift, Package, ListChecks, MapPin, Star, CheckCircle, DollarSign, Plus, Minus } from 'lucide-react';
import { Product } from '../App';
import { supabase } from '../lib/supabase';
import SeasonalProductCatalog from './SeasonalProductCatalog';
import UniversalRegistry from './UniversalRegistry';

interface SharedSeasonalPlannerProps {
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
  category: 'planning' | 'preparation' | 'shopping' | 'decorations' | 'celebration';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function SharedSeasonalPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView, products = [], comparisonProducts = [], onToggleComparison }: SharedSeasonalPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'celebration' | 'traditions' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [celebrationDate, setCelebrationDate] = useState('');
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
    { id: '1', text: 'Set celebration date and time', completed: false, category: 'planning' },
    { id: '2', text: 'Create guest list', completed: false, category: 'planning' },
    { id: '3', text: 'Choose celebration theme/traditions', completed: false, category: 'planning' },
    { id: '4', text: 'Send invitations', completed: false, category: 'planning' },
    { id: '5', text: 'Plan menu for all dietary needs', completed: false, category: 'preparation' },
    { id: '6', text: 'Shop for decorations', completed: false, category: 'shopping' },
    { id: '7', text: 'Purchase gifts for family', completed: false, category: 'shopping' },
    { id: '8', text: 'Plan charitable giving/donations', completed: false, category: 'preparation' },
    { id: '9', text: 'Decorate celebration space', completed: false, category: 'decorations' },
    { id: '10', text: 'Prepare food and beverages', completed: false, category: 'preparation' },
    { id: '11', text: 'Set up activity stations', completed: false, category: 'decorations' },
    { id: '12', text: 'Organize gift exchange', completed: false, category: 'celebration' },
    { id: '13', text: 'Plan family traditions/rituals', completed: false, category: 'celebration' },
    { id: '14', text: 'Create celebration playlist', completed: false, category: 'preparation' },
    { id: '15', text: 'Arrange travel/accommodations', completed: false, category: 'planning' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: '8 Weeks Before',
      timeframe: '2 months prior',
      tasks: [
        'Set celebration date',
        'Create preliminary guest list',
        'Determine overall budget',
        'Choose celebration theme',
        'Research traditions to incorporate'
      ],
      completed: false
    },
    {
      id: '2',
      title: '6 Weeks Before',
      timeframe: '1.5 months prior',
      tasks: [
        'Send save-the-date notices',
        'Begin gift shopping',
        'Book travel/accommodations',
        'Plan menu',
        'Order special decorations'
      ],
      completed: false
    },
    {
      id: '3',
      title: '4 Weeks Before',
      timeframe: '1 month prior',
      tasks: [
        'Send formal invitations',
        'Finalize menu and dietary accommodations',
        'Order online gifts',
        'Plan charitable giving',
        'Create shopping list'
      ],
      completed: false
    },
    {
      id: '4',
      title: '2 Weeks Before',
      timeframe: '2 weeks prior',
      tasks: [
        'Confirm RSVPs',
        'Purchase decorations',
        'Shop for food items',
        'Wrap gifts',
        'Plan activities and games'
      ],
      completed: false
    },
    {
      id: '5',
      title: '1 Week Before',
      timeframe: '1 week prior',
      tasks: [
        'Final grocery shopping',
        'Prepare make-ahead dishes',
        'Clean and organize space',
        'Test decorations and lights',
        'Confirm all arrangements'
      ],
      completed: false
    },
    {
      id: '6',
      title: '1-2 Days Before',
      timeframe: 'Final preparation',
      tasks: [
        'Set up decorations',
        'Prepare celebration space',
        'Final food preparation',
        'Arrange gift display area',
        'Create welcoming atmosphere'
      ],
      completed: false
    },
    {
      id: '7',
      title: 'Celebration Day',
      timeframe: 'The big day',
      tasks: [
        'Final setup and decorating',
        'Welcome guests warmly',
        'Share traditions and stories',
        'Exchange gifts',
        'Create lasting memories together'
      ],
      completed: false
    }
  ]);

  const toggleTimelineEvent = (id: string) => {
    setTimeline(timeline.map(event =>
      event.id === id ? { ...event, completed: !event.completed } : event
    ));
  };

  const budgetCategories = [
    { name: 'Gifts & Gift Wrapping', estimated: 600, actual: 0, icon: Gift },
    { name: 'Decorations & Ambiance', estimated: 300, actual: 0, icon: Sparkles },
    { name: 'Food & Gatherings', estimated: 500, actual: 0, icon: Heart },
    { name: 'Travel & Accommodations', estimated: 400, actual: 0, icon: MapPin },
    { name: 'Charitable Giving', estimated: 200, actual: 0, icon: Star },
    { name: 'Activities & Entertainment', estimated: 0, actual: 0, icon: Package },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Shared Seasonal Celebration Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Create inclusive, meaningful celebrations that honor diverse traditions and bring families together</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Celebration Date</div>
                  <input
                    type="date"
                    value={celebrationDate}
                    onChange={(e) => setCelebrationDate(e.target.value)}
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
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setFamilySize(Math.max(1, familySize - 1))}
                      className="bg-white/20 hover:bg-white/30 rounded p-1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold flex-1 text-center">{familySize}</span>
                    <button
                      onClick={() => setFamilySize(familySize + 1)}
                      className="bg-white/20 hover:bg-white/30 rounded p-1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
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
              { id: 'celebration', label: 'Celebration', icon: Heart },
              { id: 'traditions', label: 'Traditions', icon: Star },
              { id: 'registry', label: 'Registry', icon: ListChecks },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
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
              <h2 className="text-2xl font-bold text-primary mb-4">Create Inclusive Seasonal Celebrations</h2>
              <p className="text-secondary mb-6">
                Bring families together across traditions with celebrations that honor diversity, create joy, and build lasting memories. Whether celebrating winter holidays, New Year, seasonal transitions, or interfaith family gatherings, this planner helps you create meaningful experiences for everyone.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Inclusive Celebrations</h3>
                  <p className="text-sm text-secondary">Honor multiple traditions and create spaces where everyone feels welcome</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Universal Values</h3>
                  <p className="text-sm text-secondary">Focus on gratitude, generosity, family, and community</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Memorable Moments</h3>
                  <p className="text-sm text-secondary">Create traditions that bring joy and meaning year after year</p>
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
                  <div className="text-3xl font-bold">{celebrationDate ? Math.ceil((new Date(celebrationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : '-'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Days Until Celebration</div>
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
              <h3 className="text-xl font-bold text-primary mb-4">Celebration Ideas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-1">Winter Solstice & New Year</h4>
                  <p className="text-sm text-secondary">Celebrate the turning of the season, reflection, and new beginnings with light ceremonies, gratitude practices, and hopeful resolutions</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-1">Interfaith Family Gatherings</h4>
                  <p className="text-sm text-secondary">Honor multiple traditions with combined celebrations, shared meals, and activities that respect all backgrounds</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-1">Secular & Universal Traditions</h4>
                  <p className="text-sm text-secondary">Focus on family, kindness, giving back to community, and creating meaningful rituals together</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-1">Seasonal Festivals</h4>
                  <p className="text-sm text-secondary">Mark seasonal transitions with nature-based activities, harvest celebrations, and appreciation for the changing year</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Celebration Planning Checklist</h2>

              {['planning', 'preparation', 'shopping', 'decorations', 'celebration'].map(category => (
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
              <h2 className="text-2xl font-bold text-primary mb-6">Celebration Timeline</h2>

              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-purple-600 dark:bg-purple-600"></div>
                    )}
                    <div
                      onClick={() => toggleTimelineEvent(event.id)}
                      className={`cursor-pointer transition-all ${
                        event.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.completed
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-600 dark:bg-purple-600/30 text-purple-600 dark:text-purple-400'
                        }`}>
                          {event.completed ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Clock className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-primary">{event.title}</h3>
                            <span className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">{event.timeframe}</span>
                          </div>
                          <ul className="space-y-1 text-secondary">
                            {event.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start gap-2 text-sm">
                                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
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
                  max="10000"
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

              <div className="mt-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Budget Tips</h3>
                <ul className="space-y-2 text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Set aside 10-15% of budget for charitable giving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Shop early for better deals and less stress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Consider DIY decorations for personal touch</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Focus spending on experiences over material items</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'celebration' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Celebration Planning</h2>
              <p className="text-purple-600 dark:text-purple-400">Create meaningful gatherings that honor all traditions</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Creating Inclusive Celebrations</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Planning Your Gathering</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Choose a meaningful date:</strong> Consider everyone's schedules and important dates across different traditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Create welcoming space:</strong> Set up areas that feel comfortable and inclusive for all guests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Plan diverse menu:</strong> Include options for various dietary needs and preferences</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Activities & Experiences</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">For Adults</h5>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li>• Story sharing circle</li>
                        <li>• Gratitude activities</li>
                        <li>• Cultural exchange discussions</li>
                        <li>• Collaborative cooking</li>
                      </ul>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">For Children</h5>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li>• Craft stations</li>
                        <li>• Story time with diverse tales</li>
                        <li>• Music and dancing</li>
                        <li>• Games from different cultures</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Gift-Giving Ideas</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Meaningful over expensive:</strong> Choose gifts that reflect thought and personal connection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Experience gifts:</strong> Theater tickets, museum passes, cooking classes, outdoor adventures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Handmade items:</strong> Crafts, baked goods, photo albums, custom artwork</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Charitable donations:</strong> Give in someone's name to causes they care about</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Decoration Ideas</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Lighting</h4>
                  <p className="text-sm text-secondary">String lights, candles, lanterns, and luminarias create warm ambiance</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Natural Elements</h4>
                  <p className="text-sm text-secondary">Seasonal flowers, pine branches, fruit displays, and natural centerpieces</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Personal Touches</h4>
                  <p className="text-sm text-secondary">Family photos, handmade decorations, cultural symbols, memory boards</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traditions' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Universal Traditions & Rituals</h2>
              <p className="text-purple-600 dark:text-purple-400">Create meaningful practices that bring families together</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Building Family Traditions</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Gratitude Practices</h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Gratitude Circle</h5>
                      <p className="text-sm text-secondary">Gather in a circle and share what you're grateful for. Each person can light a candle as they speak.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Thankfulness Tree</h5>
                      <p className="text-sm text-secondary">Create a display where family members write and hang notes of appreciation throughout the season.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Daily Gratitude Journal</h5>
                      <p className="text-sm text-secondary">Keep a family journal where everyone adds entries about daily blessings and happy moments.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Service & Giving Back</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Community Service</h5>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li>• Volunteer at local shelter</li>
                        <li>• Food bank donations</li>
                        <li>• Nursing home visits</li>
                        <li>• Community cleanup</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Acts of Kindness</h5>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li>• Pay it forward chains</li>
                        <li>• Care packages for neighbors</li>
                        <li>• Letters to service members</li>
                        <li>• Random acts calendar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Cultural & Interfaith Sharing</h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Story Exchange</h5>
                      <p className="text-sm text-secondary">Invite family members from different backgrounds to share their cultural celebration stories and memories.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Recipe Sharing</h5>
                      <p className="text-sm text-secondary">Create a family cookbook with traditional recipes from all branches of the family tree.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Multi-Cultural Decorations</h5>
                      <p className="text-sm text-secondary">Incorporate symbols and decorations from various traditions to honor family diversity.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Seasonal Rituals</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Light Ceremonies</h5>
                      <p className="text-sm text-secondary mb-2">Mark the winter solstice or season with candlelight gatherings</p>
                      <ul className="space-y-1 text-xs text-muted">
                        <li>• Luminaria walks</li>
                        <li>• Candle lighting ceremonies</li>
                        <li>• Bonfire gatherings</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Reflection & Renewal</h5>
                      <p className="text-sm text-secondary mb-2">New Year practices for looking back and forward</p>
                      <ul className="space-y-1 text-xs text-muted">
                        <li>• Year in review sharing</li>
                        <li>• Intention setting circle</li>
                        <li>• Vision boards</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Creating New Traditions</h3>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="font-bold text-primary mb-2">Make it Meaningful</h4>
                  <p className="text-secondary">Choose activities that reflect your family's values and bring genuine joy, not just what's expected.</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="font-bold text-primary mb-2">Keep it Simple</h4>
                  <p className="text-secondary">The best traditions are ones you can sustain year after year without excessive stress or expense.</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="font-bold text-primary mb-2">Involve Everyone</h4>
                  <p className="text-secondary">Let each family member contribute ideas and participate in ways that suit their age and abilities.</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="font-bold text-primary mb-2">Stay Flexible</h4>
                  <p className="text-secondary">Traditions can evolve as your family grows and changes. What matters is being together.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Celebration Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Everything you need to create inclusive, meaningful seasonal celebrations</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Universal Values & Principles</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Core Values for All Celebrations</h4>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary">Gratitude:</span> Take time to appreciate what we have, the people in our lives, and the experiences that enrich us
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary">Family & Community:</span> Strengthen bonds with loved ones and build connections within our wider community
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary">Generosity:</span> Give freely of our time, resources, and kindness without expecting anything in return
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary">Inclusion:</span> Create spaces where everyone feels welcome, valued, and able to be their authentic selves
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary">Joy & Wonder:</span> Embrace the magic of celebration and create moments of delight for all ages
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Honoring Diverse Traditions</h4>
                  <div className="space-y-3">
                    <p className="text-secondary">
                      In interfaith or multicultural families, the winter season offers opportunities to honor multiple traditions simultaneously. Rather than choosing one tradition over another, consider ways to blend and celebrate them all.
                    </p>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Tips for Blended Celebrations</h5>
                      <ul className="space-y-2 text-sm text-secondary">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Learn about each tradition together as a family</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Give equal importance and space to different celebrations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Create new hybrid traditions that honor all backgrounds</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Invite extended family to share their cultural practices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Use celebrations as teaching moments about diversity</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Seasonal Celebration Types</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-700 dark:from-purple-900/20 dark:to-purple-700/20 rounded-lg p-4">
                      <h5 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Winter Holidays</h5>
                      <p className="text-sm text-secondary mb-2">December celebrations across cultures</p>
                      <ul className="space-y-1 text-xs text-muted">
                        <li>• Christmas (Christian)</li>
                        <li>• Hanukkah (Jewish)</li>
                        <li>• Kwanzaa (African heritage)</li>
                        <li>• Winter Solstice</li>
                        <li>• Secular family gatherings</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                      <h5 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">New Year Celebrations</h5>
                      <p className="text-sm text-secondary mb-2">Fresh starts and new beginnings</p>
                      <ul className="space-y-1 text-xs text-muted">
                        <li>• Gregorian New Year (Jan 1)</li>
                        <li>• Lunar New Year (Asian cultures)</li>
                        <li>• Persian Nowruz (Spring)</li>
                        <li>• Jewish Rosh Hashanah (Fall)</li>
                        <li>• Other cultural new years</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                      <h5 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Seasonal Transitions</h5>
                      <p className="text-sm text-secondary mb-2">Nature-based celebrations</p>
                      <ul className="space-y-1 text-xs text-muted">
                        <li>• Solstice celebrations</li>
                        <li>• Equinox gatherings</li>
                        <li>• Harvest festivals</li>
                        <li>• First day of spring</li>
                        <li>• Seasonal gratitude days</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                      <h5 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Universal Themes</h5>
                      <p className="text-sm text-secondary mb-2">Non-religious celebrations</p>
                      <ul className="space-y-1 text-xs text-muted">
                        <li>• Family reunion days</li>
                        <li>• Gratitude gatherings</li>
                        <li>• Community service days</li>
                        <li>• Cultural heritage celebrations</li>
                        <li>• Milestone commemorations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Important Guidelines</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Respect All Backgrounds</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Honor the traditions of all family members and guests without appropriation or dismissal.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Focus on Connection</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Prioritize quality time together over perfect decorations or expensive gifts.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Practice Gratitude</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Make appreciation and thankfulness central themes of your celebration.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Give Back</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Include charitable giving and community service as part of your celebration.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Create Memories</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Take photos, share stories, and document your family's unique celebration journey.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Stay Present</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Don't get so caught up in planning that you forget to enjoy the moment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Resources & Further Reading</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">Books & Guides</h4>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li>• "The Book of New Family Traditions" - Meg Cox</li>
                    <li>• "Celebrating Diversity: Creating an Inclusive Family" - Multiple Authors</li>
                    <li>• "The Family Dinner" - Laurie David</li>
                    <li>• "Raising Global Children" - Stacie Nevadomski Berdan</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">Online Communities</h4>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li>• Interfaith family support groups</li>
                    <li>• Multi-cultural parenting forums</li>
                    <li>• Secular celebration communities</li>
                    <li>• Local cultural centers and organizations</li>
                  </ul>
                </div>
              </div>
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
            <p className="text-muted">Save items you love for your seasonal celebrations and share with family.</p>
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
