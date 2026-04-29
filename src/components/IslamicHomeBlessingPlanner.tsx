import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Home, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import HomeBlessingProductCatalog from './HomeBlessingProductCatalog';

interface IslamicHomeBlessingPlannerProps {
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
  category: 'spiritual' | 'preparation' | 'decoration' | 'hosting' | 'charity';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function IslamicHomeBlessingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: IslamicHomeBlessingPlannerProps) {
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
    { id: '1', text: 'Recite dua when entering new home with right foot', completed: false, category: 'spiritual' },
    { id: '2', text: 'Perform two rakaat prayer in the new home', completed: false, category: 'spiritual' },
    { id: '3', text: 'Recite Surah Al-Baqarah to protect the home', completed: false, category: 'spiritual' },
    { id: '4', text: 'Display Islamic calligraphy and Quranic verses', completed: false, category: 'decoration' },
    { id: '5', text: 'Set up prayer area (Musallah) facing Qibla', completed: false, category: 'preparation' },
    { id: '6', text: 'Arrange Quran stand and Islamic books', completed: false, category: 'preparation' },
    { id: '7', text: 'Plan Walima al-Dar (housewarming gathering)', completed: false, category: 'hosting' },
    { id: '8', text: 'Prepare halal food for guests', completed: false, category: 'hosting' },
    { id: '9', text: 'Invite family, friends, and neighbors', completed: false, category: 'hosting' },
    { id: '10', text: 'Give charity (Sadaqah) for new home blessing', completed: false, category: 'charity' },
    { id: '11', text: 'Share food with neighbors', completed: false, category: 'charity' },
    { id: '12', text: 'Install Qibla direction marker', completed: false, category: 'preparation' },
    { id: '13', text: 'Set up Islamic home library', completed: false, category: 'decoration' },
    { id: '14', text: 'Arrange modest and tasteful furnishings', completed: false, category: 'decoration' },
    { id: '15', text: 'Create welcoming guest area', completed: false, category: 'preparation' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'Before Moving In',
      timeframe: '1-2 weeks before',
      tasks: [
        'Clean and purify the home thoroughly',
        'Plan Islamic decoration and setup',
        'Order Islamic wall art and calligraphy',
        'Purchase prayer mats and Quran stands',
        'Identify Qibla direction'
      ],
      completed: false
    },
    {
      id: '2',
      title: 'Moving Day',
      timeframe: 'Day of move-in',
      tasks: [
        'Enter with right foot first',
        'Recite entering home dua',
        'Perform two rakaat prayer',
        'Set up prayer area immediately',
        'Recite Ayat al-Kursi in each room'
      ],
      completed: false
    },
    {
      id: '3',
      title: 'First Week',
      timeframe: 'First 7 days',
      tasks: [
        'Recite Surah Al-Baqarah in the home',
        'Complete Islamic decoration',
        'Introduce yourself to neighbors',
        'Share dates or sweets with neighbors',
        'Establish prayer routine in new home'
      ],
      completed: false
    },
    {
      id: '4',
      title: 'Housewarming Planning',
      timeframe: '2-3 weeks after',
      tasks: [
        'Set date for Walima al-Dar',
        'Create guest list',
        'Plan halal menu',
        'Arrange seating and space',
        'Prepare Islamic gifts for guests'
      ],
      completed: false
    },
    {
      id: '5',
      title: 'Housewarming Event',
      timeframe: 'Event day',
      tasks: [
        'Welcome guests with Islamic greetings',
        'Offer refreshments and food',
        'Give home tour highlighting Islamic elements',
        'Share duas and blessings together',
        'Distribute gifts and thanks to guests'
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
    { name: 'Housewarming Reception', estimated: 500, actual: 0, icon: Home },
    { name: 'Islamic Decor & Art', estimated: 400, actual: 0, icon: Sparkles },
    { name: 'Food & Catering', estimated: 400, actual: 0, icon: Gift },
    { name: 'Guest Gifts & Favors', estimated: 200, actual: 0, icon: Package },
    { name: 'Prayer Items', estimated: 300, actual: 0, icon: Star },
    { name: 'Charity (Sadaqah)', estimated: 200, actual: 0, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Islamic Home Blessing Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Plan a blessed new home celebration with Islamic traditions and duas</p>

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
                    <option value="" className="text-gray-900">Select</option>
                    <option value="apartment" className="text-gray-900">Apartment</option>
                    <option value="house" className="text-gray-900">House</option>
                    <option value="townhouse" className="text-gray-900">Townhouse</option>
                    <option value="condo" className="text-gray-900">Condo</option>
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
                    min="1"
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white w-full"
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
              { id: 'blessing', label: 'Blessing', icon: Star },
              { id: 'decoration', label: 'Decoration', icon: Home },
              { id: 'hospitality', label: 'Hospitality', icon: Users },
              { id: 'gifts', label: 'Gifts', icon: Gift },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Islamic Guide', icon: Book }
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Your New Home with Islamic Blessings</h2>
              <p className="text-secondary mb-6">
                Moving into a new home is a significant milestone. Make it blessed and special by following Islamic traditions, performing duas, and celebrating with loved ones according to the Sunnah. This planner helps you organize every aspect of your Islamic home blessing.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Home className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Home Blessing Rituals</h3>
                  <p className="text-sm text-secondary">Enter with right foot, recite duas, and perform prayers to bless your new home</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Islamic Decoration</h3>
                  <p className="text-sm text-secondary">Arrange your home with Islamic art, calligraphy, and prayer spaces</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Walima al-Dar</h3>
                  <p className="text-sm text-secondary">Host a beautiful housewarming gathering with Islamic hospitality</p>
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
                  <div className="text-3xl font-bold">{timeline.filter(e => e.completed).length}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Timeline Phases</div>
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
                <h3 className="text-xl font-bold text-primary mb-4">Essential Duas</h3>
                <div className="space-y-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-xs text-muted mb-2">Entering the Home:</p>
                    <p className="text-gray-800 dark:text-gray-200 font-arabic text-base mb-2">بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا</p>
                    <p className="text-xs text-secondary">"In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely"</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-xs text-muted mb-2">For New Home Blessing:</p>
                    <p className="text-gray-800 dark:text-gray-200 font-arabic text-base mb-2">اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ</p>
                    <p className="text-xs text-secondary">"O Allah, I ask You for the best entering and the best leaving"</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Next Steps</h3>
                <div className="space-y-3">
                  {checklist.filter(item => !item.completed).slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-secondary">{item.text}</span>
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
              <h2 className="text-2xl font-bold text-primary mb-6">Islamic Home Blessing Checklist</h2>

              {['spiritual', 'preparation', 'decoration', 'hosting', 'charity'].map(category => (
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
              <h2 className="text-2xl font-bold text-primary mb-6">Home Blessing Timeline</h2>

              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-purple-600 dark:bg-purple-600"></div>
                    )}

                    <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-6 ${
                      event.completed ? 'border-2 border-purple-600' : ''
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.completed
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-600 dark:bg-purple-600/30 text-purple-600 dark:text-purple-400'
                        }`}>
                          <Clock className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                            <button
                              onClick={() => toggleTimelineEvent(event.id)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                event.completed
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-secondary'
                              }`}
                            >
                              {event.completed ? 'Completed' : 'Mark Complete'}
                            </button>
                          </div>

                          <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">{event.timeframe}</p>

                          <ul className="space-y-2">
                            {event.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start gap-2 text-secondary">
                                <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{task}</span>
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
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Islamic Home Blessing Rituals</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Entering Your New Home</h4>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Enter with Right Foot:</strong> Begin by stepping into your home with your right foot, following the Sunnah
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Recite the Dua:</strong> Say "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna"
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Perform Prayer:</strong> Pray two rakaat of Tahiyyat al-Masjid or voluntary prayer in your new home
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4 text-lg">Essential Duas for New Home</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Entering Home Dua:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">
                        بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا
                      </p>
                      <p className="text-sm text-secondary">
                        "In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">For Blessing and Protection:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">
                        اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللهِ وَلَجْنَا وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا
                      </p>
                      <p className="text-sm text-secondary">
                        "O Allah, I ask You for the best entering and the best leaving. In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">For Home Protection:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">
                        أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ
                      </p>
                      <p className="text-sm text-secondary">
                        "I seek refuge in the perfect words of Allah from the evil of what He has created"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Recite Surah Al-Baqarah</h4>
                  <p className="text-secondary mb-3">
                    The Prophet (PBUH) said: "Do not turn your homes into graveyards. Verily, Satan flees from a house in which Surah Al-Baqarah is recited." (Sahih Muslim)
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Recite Surah Al-Baqarah in your home within the first few days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>This brings blessings and protection from evil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Recite Ayat al-Kursi daily for continuous protection</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decoration' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Islamic Home Decoration Guide</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Islamic Art and Calligraphy</h4>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Quranic Verses:</strong> Display beautiful calligraphy of Ayat al-Kursi, Surah Ikhlas, or other meaningful verses
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Allah and Muhammad (PBUH):</strong> Hang elegant Islamic calligraphy of Allah's names or Prophet's name
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Geometric Patterns:</strong> Use Islamic geometric art that reflects beauty and order
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Modest Decor:</strong> Keep decorations tasteful, avoiding extravagance or images of living beings
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Prayer Area (Musallah)</h4>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Qibla Direction:</strong> Identify and mark the Qibla direction for prayers
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Prayer Mats:</strong> Keep clean prayer rugs in a dedicated area
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Quran Storage:</strong> Set up a beautiful Quran stand or shelf at respectful height
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Clean Space:</strong> Ensure the prayer area is clean, quiet, and free from distractions
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Room-by-Room Guidance</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Living Room</h5>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Islamic wall art and calligraphy</li>
                        <li>• Modest family photos (if any)</li>
                        <li>• Islamic books display</li>
                        <li>• Comfortable guest seating</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Entrance</h5>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Welcoming Islamic greeting sign</li>
                        <li>• Shoe storage area</li>
                        <li>• Dua reminder near door</li>
                        <li>• Mirror (not facing door if possible)</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Bedroom</h5>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Ayat al-Kursi display</li>
                        <li>• Morning/evening dua reminders</li>
                        <li>• Modest and simple furnishings</li>
                        <li>• Avoid images of living beings</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h5 className="font-semibold text-primary mb-2">Kitchen/Dining</h5>
                      <ul className="text-sm text-secondary space-y-1">
                        <li>• Bismillah reminder before eating</li>
                        <li>• Alhamdulillah after meals</li>
                        <li>• Separate halal food storage</li>
                        <li>• Clean and organized space</li>
                      </ul>
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
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Islamic Hospitality & Walima al-Dar</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Planning Your Housewarming</h4>
                  <p className="text-secondary mb-3">
                    Walima al-Dar is a beautiful tradition of hosting a gathering to celebrate your new home with family, friends, and neighbors.
                  </p>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Guest List:</strong> Invite close family, friends, neighbors, and community members
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Timing:</strong> Host within the first few weeks of moving in
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Duration:</strong> Can be a few hours in the afternoon or evening
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Food and Refreshments</h4>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Halal Menu:</strong> Ensure all food is halal and clearly labeled
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Variety:</strong> Offer a mix of appetizers, main dishes, and sweets
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Dates:</strong> Traditional to serve dates as blessed food
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Beverages:</strong> Provide non-alcoholic drinks, tea, coffee, and juices
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Islamic Hospitality Etiquette</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Warm Welcome</p>
                          <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Greet guests with "Assalamu Alaikum" and genuine smile</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Show Gratitude</p>
                          <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Thank guests for coming and making dua for your home</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Home Tour</p>
                          <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Show guests around, highlighting Islamic elements</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Comfortable Setting</p>
                          <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Ensure adequate seating and comfortable atmosphere</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Shared Duas</p>
                          <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Invite guests to make dua for blessings in the home</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Modest Gathering</p>
                          <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Keep the event simple, avoiding extravagance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Neighbor Relations</h4>
                  <p className="text-secondary mb-3">
                    The Prophet (PBUH) emphasized the importance of good relations with neighbors.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Introduce yourself to neighbors early</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Share food, dates, or sweets with neighboring homes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Be considerate with noise and parking during move-in</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Invite neighbors to your housewarming if appropriate</span>
                    </li>
                  </ul>
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
                <h3 className="text-2xl font-bold text-primary">Guest Gifts & Charity</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Gifts for Guests (Optional)</h4>
                  <p className="text-secondary mb-3">
                    Small tokens of appreciation can be given to guests who attend your housewarming.
                  </p>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Dates:</strong> Beautifully packaged dates as a blessed gift
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Small Islamic Items:</strong> Bookmarks with duas, prayer beads, or mini Qurans
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Sweets:</strong> Traditional halal sweets or chocolates
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Personalized Cards:</strong> Thank you cards with duas
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Sadaqah (Charity)</h4>
                  <p className="text-secondary mb-3">
                    Giving charity when moving into a new home is a beautiful way to seek Allah's blessings.
                  </p>
                  <ul className="space-y-3 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Financial Charity:</strong> Donate to Islamic organizations or those in need
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Food Distribution:</strong> Share meals with the poor and needy
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Old Items:</strong> Donate usable furniture or items to charity
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Intention:</strong> Make sincere intention for Allah's pleasure and home blessings
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Recommended Gift Ideas</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-purple-600 dark:bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Book className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h5 className="font-semibold text-primary mb-1">Islamic Books</h5>
                      <p className="text-xs text-muted">Dua compilations or short Islamic reads</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-purple-600 dark:bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h5 className="font-semibold text-primary mb-1">Dates Package</h5>
                      <p className="text-xs text-muted">Premium Ajwa or Medjool dates</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-purple-600 dark:bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h5 className="font-semibold text-primary mb-1">Islamic Decor</h5>
                      <p className="text-xs text-muted">Small wall art or decorative items</p>
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Islamic Home Blessing Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Transform your new house into a blessed Islamic home</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Islamic Principles for Home</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Entering and Leaving Home</h4>
                  <p className="text-secondary mb-3">
                    The Prophet (PBUH) taught us specific etiquettes for entering and leaving our homes.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Right Foot First:</strong> Enter with right foot, exit with left foot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Say Bismillah:</strong> Begin with Allah's name when entering and leaving</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Greet Family:</strong> Say Salam to family members when entering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Announce Entry:</strong> If home is empty, say Salam anyway for angels</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Creating an Islamic Atmosphere</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Regular Quran Recitation:</strong> Recite Quran daily, especially Surah Al-Baqarah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Establish Prayers:</strong> Pray five daily prayers at home when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Dhikr and Duas:</strong> Make morning and evening adhkar regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Avoid Haram:</strong> Keep home free from music, images, alcohol, and haram items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Islamic Learning:</strong> Make home a place of knowledge and faith growth</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4 text-lg">Important Home Duas</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Upon Entering Home:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">
                        بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا
                      </p>
                      <p className="text-sm text-secondary">
                        "In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">For Home Protection (Ayat al-Kursi):</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-base mb-2">
                        اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...
                      </p>
                      <p className="text-sm text-secondary">
                        Recite Ayat al-Kursi (2:255) for protection. Whoever recites it in their home, Satan will not enter until morning.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Morning and Evening Protection:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2">
                        بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ
                      </p>
                      <p className="text-sm text-secondary">
                        "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing" (3 times)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Family Life in Islamic Home</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Pray together as a family when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Read Quran together and discuss Islamic teachings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Maintain respect, kindness, and Islamic manners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Keep home clean and organized as part of faith</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Welcome guests with Islamic hospitality</span>
                    </li>
                  </ul>
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
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Protect Your Home</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Recite Surah Al-Baqarah regularly to keep Satan away from your home.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Be a Good Neighbor</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">The Prophet (PBUH) emphasized treating neighbors with kindness and respect.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Give Charity</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Share your blessings with those less fortunate to increase barakah in your home.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Maintain Modesty</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Keep your home decoration modest and free from extravagance.</p>
                    </div>
                  </div>
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
