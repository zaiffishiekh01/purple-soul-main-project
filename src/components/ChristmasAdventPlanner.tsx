import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Bell, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus } from 'lucide-react';
import { Product } from '../App';
import { supabase } from '../lib/supabase';
import SeasonalProductCatalog from './SeasonalProductCatalog';
import UniversalRegistry from './UniversalRegistry';

interface ChristmasAdventPlannerProps {
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
  category: 'advent' | 'preparation' | 'church' | 'gifts' | 'celebration';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function ChristmasAdventPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView, products = [], comparisonProducts = [], onToggleComparison }: ChristmasAdventPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'advent' | 'christmas' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [christmasDate, setChristmasDate] = useState('2024-12-25');
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
    { id: '1', text: 'Set up Advent wreath with candles', completed: false, category: 'advent' },
    { id: '2', text: 'Create daily Advent devotional schedule', completed: false, category: 'advent' },
    { id: '3', text: 'Prepare Advent calendar for family', completed: false, category: 'advent' },
    { id: '4', text: 'Plan weekly candle lighting ceremonies', completed: false, category: 'advent' },
    { id: '5', text: 'Set up Nativity scene', completed: false, category: 'preparation' },
    { id: '6', text: 'Decorate Christmas tree', completed: false, category: 'preparation' },
    { id: '7', text: 'Hang outdoor lights and decorations', completed: false, category: 'preparation' },
    { id: '8', text: 'Send Christmas cards', completed: false, category: 'preparation' },
    { id: '9', text: 'Plan Christmas menu and recipes', completed: false, category: 'preparation' },
    { id: '10', text: 'Book Christmas Eve service seats', completed: false, category: 'church' },
    { id: '11', text: 'Arrange choir participation or attendance', completed: false, category: 'church' },
    { id: '12', text: 'Prepare church offering/tithe', completed: false, category: 'church' },
    { id: '13', text: 'Volunteer for church Christmas events', completed: false, category: 'church' },
    { id: '14', text: 'Create gift list for family members', completed: false, category: 'gifts' },
    { id: '15', text: 'Purchase and wrap all gifts', completed: false, category: 'gifts' },
    { id: '16', text: 'Select charitable organizations for giving', completed: false, category: 'gifts' },
    { id: '17', text: 'Buy gifts for those in need', completed: false, category: 'gifts' },
    { id: '18', text: 'Plan Christmas Day schedule', completed: false, category: 'celebration' },
    { id: '19', text: 'Prepare guest rooms for visitors', completed: false, category: 'celebration' },
    { id: '20', text: 'Coordinate family gathering activities', completed: false, category: 'celebration' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Gifts for Family', estimated: 600, actual: 0, icon: Gift },
    { name: 'Decorations', estimated: 300, actual: 0, icon: Sparkles },
    { name: 'Food & Feast', estimated: 400, actual: 0, icon: Heart },
    { name: 'Church Offering', estimated: 200, actual: 0, icon: Bell },
    { name: 'Charitable Giving', estimated: 300, actual: 0, icon: Star },
    { name: 'Travel & Hosting', estimated: 200, actual: 0, icon: Package },
  ];

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'First Week of Advent',
      timeframe: '4 weeks before Christmas',
      tasks: [
        'Light first purple candle (Hope)',
        'Set up Advent wreath',
        'Begin daily Scripture readings',
        'Start Advent calendar activities',
      ],
      completed: false,
    },
    {
      id: '2',
      title: 'Second Week of Advent',
      timeframe: '3 weeks before Christmas',
      tasks: [
        'Light second purple candle (Peace)',
        'Send Christmas cards',
        'Begin gift shopping',
        'Decorate home exterior',
      ],
      completed: false,
    },
    {
      id: '3',
      title: 'Third Week of Advent',
      timeframe: '2 weeks before Christmas',
      tasks: [
        'Light pink candle (Joy)',
        'Set up Christmas tree',
        'Finalize Christmas menu',
        'Complete gift shopping',
      ],
      completed: false,
    },
    {
      id: '4',
      title: 'Fourth Week of Advent',
      timeframe: '1 week before Christmas',
      tasks: [
        'Light fourth purple candle (Love)',
        'Wrap all gifts',
        'Final grocery shopping',
        'Prepare guest rooms',
      ],
      completed: false,
    },
    {
      id: '5',
      title: 'Christmas Eve',
      timeframe: 'December 24',
      tasks: [
        'Light white Christ candle',
        'Attend Christmas Eve service',
        'Family celebration dinner',
        'Read the Nativity story',
      ],
      completed: false,
    },
    {
      id: '6',
      title: 'Christmas Day',
      timeframe: 'December 25',
      tasks: [
        'Morning worship and prayer',
        'Open gifts together',
        'Christmas feast',
        'Call distant family members',
      ],
      completed: false,
    },
  ];

  const calculateDaysUntilChristmas = () => {
    const today = new Date();
    const christmas = new Date(christmasDate);
    const diffTime = christmas.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Christmas & Advent Planner</h1>
          </div>
          <p className="text-red-100 text-lg mb-6">Prepare your heart and home for the celebration of Christ's birth with meaningful traditions and planning</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-red-100">Christmas Date</div>
                  <input
                    type="date"
                    value={christmasDate}
                    onChange={(e) => setChristmasDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-red-100">Family Size</div>
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
                  <div className="text-sm text-red-100">Checklist</div>
                  <div className="text-2xl font-bold">{checklist.filter(i => i.completed).length}/{checklist.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                <div>
                  <div className="text-sm text-red-100">Budget</div>
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
              { id: 'advent', label: 'Advent', icon: Bell },
              { id: 'christmas', label: 'Christmas', icon: Gift },
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
                    ? 'text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400'
                    : 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Your Christmas & Advent Journey</h2>
              <p className="text-secondary mb-6">
                Prepare your heart, home, and family for the celebration of Christ's birth. This planner helps you navigate the sacred season of Advent and create meaningful Christmas traditions that honor the true meaning of the season.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Bell className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Advent Preparation</h3>
                  <p className="text-sm text-secondary">Journey through 4 weeks of hope, peace, joy, and love</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Scripture & Tradition</h3>
                  <p className="text-sm text-secondary">Connect with the biblical Christmas story and sacred customs</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Family Celebration</h3>
                  <p className="text-sm text-secondary">Create lasting memories with loved ones this season</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Progress Summary</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-3xl font-bold">{calculateDaysUntilChristmas()}</div>
                  <div className="text-red-100 text-sm">Days Until Christmas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{checklist.filter(i => i.completed).length}</div>
                  <div className="text-red-100 text-sm">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{selectedProducts.length}</div>
                  <div className="text-red-100 text-sm">Items Selected</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">${budget.toLocaleString()}</div>
                  <div className="text-red-100 text-sm">Total Budget</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Christmas Preparation Checklist</h2>

              {['advent', 'preparation', 'church', 'gifts', 'celebration'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-lg text-red-600 dark:text-red-400 mb-3 capitalize">{category}</h3>
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
              <h2 className="text-2xl font-bold text-primary mb-6">Advent & Christmas Timeline</h2>

              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-1">{event.title}</h3>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{event.timeframe}</p>
                        <ul className="space-y-2">
                          {event.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-start gap-2">
                              <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                              <span className="text-secondary">{task}</span>
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
                        <category.icon className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-primary">{category.name}</span>
                      </div>
                      <span className="text-red-600 font-bold">${category.estimated}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full"
                        style={{ width: `${(category.estimated / budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">Total Estimated</span>
                  <span className="text-2xl font-bold text-red-600">
                    ${budgetCategories.reduce((sum, cat) => sum + cat.estimated, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advent' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">The Season of Advent</h2>
              <p className="text-red-50">Four weeks of spiritual preparation for Christmas</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-red-600" />
                <h3 className="text-2xl font-bold text-primary">The Advent Wreath</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Week 1: Hope (Purple Candle)</h4>
                  <p className="text-secondary mb-3">
                    The first candle represents the Hope we have in Christ's coming. We remember the prophets who foretold the Messiah's arrival.
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">Scripture: Isaiah 9:6</p>
                    <p className="text-sm text-purple-800 dark:text-purple-200 italic">
                      "For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace."
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Week 2: Peace (Purple Candle)</h4>
                  <p className="text-secondary mb-3">
                    The second candle represents Peace. We reflect on the peace that Christ brings to our hearts and the world.
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">Scripture: Luke 2:14</p>
                    <p className="text-sm text-purple-800 dark:text-purple-200 italic">
                      "Glory to God in the highest heaven, and on earth peace to those on whom his favor rests."
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Week 3: Joy (Pink Candle)</h4>
                  <p className="text-secondary mb-3">
                    The third candle, often pink or rose, represents Joy. Also called "Gaudete Sunday" (Rejoice Sunday), we celebrate the coming of the Lord.
                  </p>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Scripture: Luke 1:46-47</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 italic">
                      "My soul glorifies the Lord and my spirit rejoices in God my Savior."
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Week 4: Love (Purple Candle)</h4>
                  <p className="text-secondary mb-3">
                    The fourth candle represents Love. We contemplate God's amazing love in sending His Son to save us.
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">Scripture: John 3:16</p>
                    <p className="text-sm text-purple-800 dark:text-purple-200 italic">
                      "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-white dark:border-gray-300 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Christmas Eve/Day: Christ Candle (White)</h4>
                  <p className="text-secondary mb-3">
                    The center white candle represents Christ, the Light of the World. It is lit on Christmas Eve or Christmas Day.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Scripture: John 8:12</p>
                    <p className="text-sm text-secondary italic">
                      "When Jesus spoke again to the people, he said, 'I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life.'"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'christmas' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Christmas Celebration</h2>
              <p className="text-red-50">Celebrate the birth of our Savior with joy and meaning</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-8 h-8 text-red-600" />
                <h3 className="text-2xl font-bold text-primary">Christmas Traditions & Symbols</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-red-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">The Nativity Scene</h4>
                  <p className="text-secondary mb-3">
                    The Nativity scene depicts the birth of Jesus in Bethlehem. It typically includes Mary, Joseph, baby Jesus, shepherds, wise men, angels, and animals.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>The manger represents Christ's humble birth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>The star symbolizes the Star of Bethlehem that guided the wise men</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Animals represent all of creation welcoming the Savior</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">The Christmas Tree</h4>
                  <p className="text-secondary mb-3">
                    The evergreen tree symbolizes eternal life through Christ. Its triangular shape can represent the Holy Trinity.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Star or angel on top represents the Star of Bethlehem or announcing angels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Lights symbolize Christ as the Light of the World</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Ornaments can represent prayers and good deeds</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Gift Giving</h4>
                  <p className="text-secondary mb-3">
                    We give gifts in remembrance of the wise men's gifts to Jesus and God's gift of His Son to us.
                  </p>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">The Three Gifts:</p>
                    <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                      <li><strong>Gold:</strong> Symbolizing Christ's kingship</li>
                      <li><strong>Frankincense:</strong> Representing Christ's divinity and priesthood</li>
                      <li><strong>Myrrh:</strong> Foreshadowing Christ's death and burial</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Christmas Scripture Readings</h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">The Prophecy - Isaiah 9:2, 6-7</p>
                      <p className="text-sm text-secondary">
                        "The people walking in darkness have seen a great light... For to us a child is born..."
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">The Annunciation - Luke 1:26-38</p>
                      <p className="text-sm text-secondary">
                        The angel Gabriel announces to Mary that she will bear the Son of God.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">The Nativity - Luke 2:1-20</p>
                      <p className="text-sm text-secondary">
                        The birth of Jesus in Bethlehem and the angels' announcement to shepherds.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">The Wise Men - Matthew 2:1-12</p>
                      <p className="text-sm text-secondary">
                        The magi follow the star to worship the newborn King.
                      </p>
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Christmas & Advent Guide</h2>
              <p className="text-red-50">Deepen your celebration with spiritual insight and practical wisdom</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-red-600" />
                <h3 className="text-2xl font-bold text-primary">The Meaning of Christmas</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-red-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">The Incarnation</h4>
                  <p className="text-secondary mb-3">
                    Christmas celebrates the incredible mystery of the Incarnation - God becoming human in the person of Jesus Christ. This is the central truth of the Christian faith.
                  </p>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">John 1:14</p>
                    <p className="text-sm text-red-800 dark:text-red-200 italic">
                      "The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth."
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Family Devotional Ideas</h4>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Daily Advent Readings:</strong>
                        <p className="text-sm mt-1">Read one chapter from the Gospels each day focusing on Christ's birth and ministry</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Jesse Tree:</strong>
                        <p className="text-sm mt-1">Trace the genealogy of Jesus with daily ornaments and Scripture readings</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Acts of Kindness Countdown:</strong>
                        <p className="text-sm mt-1">Perform one act of service or kindness each day of December</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Family Prayer Time:</strong>
                        <p className="text-sm mt-1">Gather each evening to light Advent candles and pray together</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Keeping Christ at the Center</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Attend church services regularly during Advent and on Christmas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Read and discuss the Christmas story from the Bible as a family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Give to those in need in honor of Christ's love for us</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Sing carols that tell the story of Jesus's birth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Have a birthday cake for Jesus on Christmas Day</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Christmas Prayers</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Prayer for Advent:</p>
                      <p className="text-sm text-secondary italic">
                        "Lord Jesus, as we prepare our hearts for Christmas, help us to reflect on the wonder of Your coming. May this season deepen our faith, increase our hope, and kindle our love for You and others. Amen."
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Prayer for Christmas Day:</p>
                      <p className="text-sm text-secondary italic">
                        "Heavenly Father, we thank You for the gift of Your Son, Jesus Christ. On this day we celebrate His birth and the salvation He brings. Fill our hearts with joy and our homes with peace. May we share Your love with all we meet. In Jesus' name, Amen."
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Prayer Before Gift Opening:</p>
                      <p className="text-sm text-secondary italic">
                        "Dear God, as we exchange gifts, remind us of Your greatest gift to us. Help us to be generous and grateful. May these gifts be a reflection of Your love for us. Thank You for family, friends, and all Your blessings. Amen."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-red-600" />
                <h3 className="text-2xl font-bold text-primary">Important Reminders</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Prepare Your Heart</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Use Advent as a time of spiritual preparation, not just busy activity.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Simplify When Needed</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Don't let preparations overshadow the true meaning of the season.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Include Everyone</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Make sure family traditions include and engage all ages.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Give Generously</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Remember those in need and share your blessings cheerfully.</p>
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
            <p className="text-muted">Save items you love for your Christmas celebration.</p>
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
