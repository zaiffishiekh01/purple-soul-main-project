import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Bell, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus } from 'lucide-react';
import { Product } from '../App';
import { supabase } from '../lib/supabase';
import SeasonalProductCatalog from './SeasonalProductCatalog';
import UniversalRegistry from './UniversalRegistry';

interface RamadanEidPlannerProps {
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
  category: 'preparation' | 'daily' | 'spiritual' | 'eid' | 'charity';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function RamadanEidPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView, products = [], comparisonProducts = [], onToggleComparison }: RamadanEidPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'iftar' | 'eid' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [startDate, setStartDate] = useState('');
  const [familySize, setFamilySize] = useState(4);
  const [zakatAmount, setZakatAmount] = useState(0);
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
    { id: '1', text: 'Calculate Zakat al-Fitr for family', completed: false, category: 'charity' },
    { id: '2', text: 'Set Ramadan intentions and goals', completed: false, category: 'spiritual' },
    { id: '3', text: 'Stock up on dates and water for Iftar', completed: false, category: 'preparation' },
    { id: '4', text: 'Plan Suhoor meal schedules', completed: false, category: 'daily' },
    { id: '5', text: 'Schedule Taraweeh prayers', completed: false, category: 'spiritual' },
    { id: '6', text: 'Prepare Ramadan calendar and tracker', completed: false, category: 'preparation' },
    { id: '7', text: 'Plan last 10 nights activities (I\'tikaf)', completed: false, category: 'spiritual' },
    { id: '8', text: 'Seek Laylat al-Qadr (odd nights)', completed: false, category: 'spiritual' },
    { id: '9', text: 'Shop for Eid clothes and gifts', completed: false, category: 'eid' },
    { id: '10', text: 'Plan Eid celebration and feast', completed: false, category: 'eid' },
    { id: '11', text: 'Distribute Zakat al-Fitr before Eid prayer', completed: false, category: 'charity' },
    { id: '12', text: 'Prepare Eid decorations', completed: false, category: 'eid' },
    { id: '13', text: 'Complete Quran recitation', completed: false, category: 'spiritual' },
    { id: '14', text: 'Increase daily charity (Sadaqah)', completed: false, category: 'charity' },
    { id: '15', text: 'Plan Iftar gatherings with community', completed: false, category: 'daily' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Food & Iftar', estimated: 600, actual: 0, icon: Gift },
    { name: 'Eid Gifts', estimated: 300, actual: 0, icon: Package },
    { name: 'Decorations', estimated: 150, actual: 0, icon: Sparkles },
    { name: 'Charity/Zakat', estimated: 400, actual: 0, icon: Heart },
    { name: 'Eid Clothes', estimated: 350, actual: 0, icon: ShoppingCart },
    { name: 'Celebration', estimated: 200, actual: 0, icon: Star },
  ];

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Pre-Ramadan Preparation',
      timeframe: '2-3 weeks before',
      tasks: [
        'Set spiritual goals and intentions',
        'Stock pantry with Ramadan essentials',
        'Plan meal schedules and recipes',
        'Calculate Zakat obligations'
      ],
      completed: false
    },
    {
      id: '2',
      title: 'First 10 Days - Mercy',
      timeframe: 'Days 1-10',
      tasks: [
        'Establish fasting routine',
        'Attend Taraweeh prayers',
        'Daily Quran recitation',
        'Host or attend Iftar gatherings'
      ],
      completed: false
    },
    {
      id: '3',
      title: 'Middle 10 Days - Forgiveness',
      timeframe: 'Days 11-20',
      tasks: [
        'Increase dhikr and prayers',
        'Seek forgiveness (Istighfar)',
        'Increase charity and good deeds',
        'Maintain daily worship schedule'
      ],
      completed: false
    },
    {
      id: '4',
      title: 'Last 10 Days - Protection from Fire',
      timeframe: 'Days 21-30',
      tasks: [
        'Seek Laylat al-Qadr (odd nights)',
        'Consider I\'tikaf if possible',
        'Maximum worship and Quran',
        'Distribute Zakat al-Fitr'
      ],
      completed: false
    },
    {
      id: '5',
      title: 'Eid al-Fitr Celebration',
      timeframe: 'Shawwal 1',
      tasks: [
        'Perform Ghusl and wear best clothes',
        'Give Zakat al-Fitr before Eid prayer',
        'Attend Eid prayer and khutbah',
        'Visit family and exchange gifts'
      ],
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Ramadan & Eid al-Fitr Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Plan a blessed Ramadan and joyful Eid celebration with comprehensive tracking and guidance</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Ramadan Start Date</div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                    <span className="text-2xl font-bold">{familySize}</span>
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
                <Heart className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Zakat al-Fitr</div>
                  <input
                    type="number"
                    value={zakatAmount}
                    onChange={(e) => setZakatAmount(parseFloat(e.target.value))}
                    placeholder="$0"
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white w-full text-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Progress</div>
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
              { id: 'iftar', label: 'Iftar Planning', icon: Gift },
              { id: 'eid', label: 'Eid Celebration', icon: Star },
              { id: 'registry', label: 'Registry', icon: ListChecks },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Ramadan Guide', icon: Book }
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome to the Blessed Month of Ramadan</h2>
              <p className="text-secondary mb-6">
                Make this Ramadan your most spiritually enriching experience with our comprehensive planner. Track your fasting, prayers, Quran recitation, and prepare for a joyful Eid al-Fitr celebration.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Daily Routines</h3>
                  <p className="text-sm text-secondary">Plan Suhoor, Iftar, and Taraweeh prayers</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Charity & Zakat</h3>
                  <p className="text-sm text-secondary">Track your Zakat al-Fitr and Sadaqah</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Eid Celebration</h3>
                  <p className="text-sm text-secondary">Plan your Eid al-Fitr festivities</p>
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
                  <div className="text-3xl font-bold">{startDate ? '30 days' : '-'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Ramadan Duration</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">${zakatAmount > 0 ? zakatAmount.toFixed(2) : '0'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Zakat al-Fitr</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">${budget.toLocaleString()}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Total Budget</div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Ramadan Countdown</h3>
              <div className="grid md:grid-cols-5 gap-4">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{index + 1}</div>
                    <div className="text-sm font-medium text-primary mt-2">{event.title}</div>
                    <div className="text-xs text-muted mt-1">{event.timeframe}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Ramadan & Eid Checklist</h2>

              {['preparation', 'daily', 'spiritual', 'charity', 'eid'].map(category => (
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
              <h2 className="text-2xl font-bold text-primary mb-6">Ramadan Timeline</h2>

              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-primary">{event.title}</h3>
                          <span className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 font-medium">{event.timeframe}</span>
                        </div>
                        <ul className="space-y-2 mt-3">
                          {event.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-start gap-2 text-secondary">
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
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Zakat al-Fitr Calculator</h3>
              <p className="text-muted mb-4">
                Zakat al-Fitr is obligatory charity given before Eid prayer. Calculate based on your family size.
              </p>
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-secondary">Family Members: {familySize}</span>
                  <span className="text-secondary">Rate per person: $10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">Total Zakat al-Fitr:</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">${familySize * 10}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'iftar' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Iftar & Suhoor Planning</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-primary">Suhoor Essentials</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Hydration:</strong>
                        <span className="text-secondary"> Plenty of water, milk, fresh juices</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Complex Carbs:</strong>
                        <span className="text-secondary"> Oatmeal, whole grain bread, brown rice</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Protein:</strong>
                        <span className="text-secondary"> Eggs, cheese, yogurt, nuts</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Fruits:</strong>
                        <span className="text-secondary"> Bananas, dates, berries for energy</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-primary">Iftar Traditions</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Break with Dates:</strong>
                        <span className="text-secondary"> Follow Sunnah with 3 dates and water</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Maghrib Prayer:</strong>
                        <span className="text-secondary"> Pray before main meal</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Main Course:</strong>
                        <span className="text-secondary"> Balanced meal with protein, carbs, vegetables</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-primary">Community:</strong>
                        <span className="text-secondary"> Share Iftar with family and neighbors</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-5 border-2 border-purple-600 dark:border-purple-600">
                <h4 className="font-bold text-primary mb-3">Sample Iftar Menu Ideas</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Week 1</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>Chicken Biryani</li>
                      <li>Lentil Soup</li>
                      <li>Grilled Fish</li>
                      <li>Lamb Kabobs</li>
                      <li>Vegetable Curry</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Week 2</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>Butter Chicken</li>
                      <li>Falafel Wrap</li>
                      <li>Beef Stew</li>
                      <li>Pasta Alfredo</li>
                      <li>Shawarma Plate</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Desserts</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>Baklava</li>
                      <li>Kunafa</li>
                      <li>Rice Pudding</li>
                      <li>Fruit Salad</li>
                      <li>Date Bars</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eid' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Eid al-Fitr Celebration Planning</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Pre-Eid Preparations</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Pay Zakat al-Fitr before Eid prayer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Shop for new clothes (Eid outfit)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Prepare Eid decorations at home</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Buy gifts for family and children</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Plan Eid feast menu</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Eid Day Traditions</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Wake up early and perform Ghusl</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Wear your best clothes and apply perfume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Eat dates before going to Eid prayer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Attend Eid prayer and khutbah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Exchange "Eid Mubarak" greetings</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Eid Celebration Ideas</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <Gift className="w-8 h-8 mb-3" />
                    <h4 className="font-bold mb-2">Gift Exchange</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Give gifts to children and loved ones</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <Users className="w-8 h-8 mb-3" />
                    <h4 className="font-bold mb-2">Family Gathering</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Host or attend family feast</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <Heart className="w-8 h-8 mb-3" />
                    <h4 className="font-bold mb-2">Visit Relatives</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Strengthen family bonds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Ramadan & Eid Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Everything you need to know about the blessed month of Ramadan and Eid al-Fitr</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">The Blessed Month of Ramadan</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">What is Ramadan?</h4>
                  <p className="text-secondary mb-3">
                    Ramadan is the ninth month of the Islamic lunar calendar and the holiest month for Muslims worldwide. It is the month in which the Quran was revealed to Prophet Muhammad (peace be upon him). Muslims fast from dawn to sunset, abstaining from food, drink, and other physical needs.
                  </p>
                  <p className="text-secondary">
                    The purpose of fasting is to develop self-discipline, draw closer to Allah, empathize with those less fortunate, and purify the soul from sins and negative behaviors.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Fasting (Sawm)</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Intention (Niyyah):</strong> Make intention to fast each day before Fajr</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Suhoor:</strong> Pre-dawn meal, eaten before Fajr prayer (highly recommended)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Fasting Hours:</strong> From dawn (Fajr) until sunset (Maghrib)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Iftar:</strong> Breaking fast at sunset, traditionally with dates and water</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>What to Avoid:</strong> Food, drink, smoking, negative speech, and bad behavior</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Taraweeh Prayers</h4>
                  <p className="text-secondary mb-3">
                    Taraweeh are special nightly prayers performed during Ramadan after the Isha prayer. These prayers are a beautiful Sunnah tradition where the Quran is recited in its entirety over the course of the month.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Typically 8 or 20 rakats, prayed in congregation at the mosque</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Can also be prayed at home individually or with family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Great opportunity for spiritual reflection and connection</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Last 10 Nights & Laylat al-Qadr</h4>
                  <p className="text-secondary mb-3">
                    The last ten nights of Ramadan are the most blessed, with Laylat al-Qadr (Night of Power) being the most virtuous night of the entire year. The Quran states that this single night is "better than a thousand months."
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>When:</strong> Seek it on odd nights (21st, 23rd, 25th, 27th, 29th)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>I'tikaf:</strong> Spiritual retreat in the mosque during last 10 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Increase Worship:</strong> Maximum Quran, prayers, dhikr, and dua</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Recommended Dua:</strong> "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni" (O Allah, You are Forgiving and love forgiveness, so forgive me)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Ramadan Duas</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">When Breaking Fast (Iftar):</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ</p>
                      <p className="text-sm text-secondary">"The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills"</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">For Suhoor:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ</p>
                      <p className="text-sm text-secondary">"I intend to keep the fast for tomorrow in the month of Ramadan"</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Upon Seeing New Moon:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ</p>
                      <p className="text-sm text-secondary">"O Allah, bring it over us with blessing and faith, and safety and Islam"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Eid al-Fitr - The Festival of Breaking the Fast</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">What is Eid al-Fitr?</h4>
                  <p className="text-secondary mb-3">
                    Eid al-Fitr is the joyous celebration that marks the end of Ramadan. It is a day of gratitude to Allah for the strength to complete the month of fasting and a celebration of spiritual renewal.
                  </p>
                  <p className="text-secondary">
                    The day begins with a special Eid prayer, followed by celebrations with family and friends, exchanging gifts, wearing new clothes, and sharing festive meals.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Zakat al-Fitr</h4>
                  <p className="text-secondary mb-3">
                    Zakat al-Fitr is obligatory charity given before the Eid prayer. It purifies those who fast from any indecent act or speech and serves as food for the needy.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Amount:</strong> Approximately $10-15 per person (or equivalent in staple food)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Who Pays:</strong> Every Muslim who has the means (on behalf of self and dependents)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Timing:</strong> Must be paid before Eid prayer (can be given during Ramadan)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Recipients:</strong> The poor and needy in the community</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Eid Day Sunnah Practices</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Wake up early and perform Ghusl (full bath)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Wear your best clothes and apply perfume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Eat dates (odd number) before leaving for prayer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Give Zakat al-Fitr before the Eid prayer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Go to prayer ground early</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Recite Takbeer on the way: "Allahu Akbar, Allahu Akbar, La ilaha illallah, Wallahu Akbar, Allahu Akbar, Wa lillahil hamd"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Take different routes to and from the prayer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Exchange greetings: "Eid Mubarak" or "Taqabbal Allahu minna wa minkum"</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Spiritual Goals for Ramadan</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Complete Quran Recitation</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Read at least one Juz (1/30th) per day to complete the Quran</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Consistent Prayers</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Perform all five daily prayers and Taraweeh on time</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">3</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Daily Charity</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Give Sadaqah every day, even if small amounts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">4</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Dhikr & Dua</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Constantly remember Allah and make sincere supplications</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">5</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Good Character</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Control anger, speak kindly, and help others</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">6</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Seek Forgiveness</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Increase Istighfar and repent from all sins</p>
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
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Intention Matters</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Make sincere intention (niyyah) for all acts of worship to be solely for Allah's pleasure.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Don't Miss Suhoor</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">The Prophet (PBUH) said there are blessings in Suhoor. Wake up and eat even if just dates and water.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Maximize Last 10 Nights</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">The Prophet (PBUH) would exert himself more in worship during the last ten nights. Follow his example.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Feed Others for Iftar</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">The Prophet (PBUH) said whoever provides Iftar to a fasting person earns the same reward.</p>
                    </div>
                  </div>
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
            <p className="text-muted">Save items you love for your Ramadan and Eid celebrations.</p>
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
