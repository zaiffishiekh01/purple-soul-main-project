import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Heart, Book, Clock, Gift, Package, ListChecks, User, MapPin, CheckCircle, DollarSign, Bell, Sparkles } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import RemembranceProductCatalog from './RemembranceProductCatalog';

interface IslamicRemembrancePlannerProps {
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
  category: 'immediate' | 'janazah' | 'burial' | 'mourning' | 'charity' | 'remembrance';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function IslamicRemembrancePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: IslamicRemembrancePlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'janazah' | 'remembrance' | 'charity' | 'comfort' | 'shopping' | 'guide'>('overview');
  const [passingDate, setPassingDate] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(5000);

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
    { id: '1', text: 'Recite Shahada near the deceased', completed: false, category: 'immediate' },
    { id: '2', text: 'Close eyes and cover body', completed: false, category: 'immediate' },
    { id: '3', text: 'Notify family and community', completed: false, category: 'immediate' },
    { id: '4', text: 'Contact Islamic funeral services', completed: false, category: 'immediate' },
    { id: '5', text: 'Arrange for ghusl (ritual washing)', completed: false, category: 'janazah' },
    { id: '6', text: 'Prepare kafan (shroud)', completed: false, category: 'janazah' },
    { id: '7', text: 'Arrange Salat al-Janazah location', completed: false, category: 'janazah' },
    { id: '8', text: 'Notify mosque and Islamic center', completed: false, category: 'janazah' },
    { id: '9', text: 'Select burial plot in Islamic cemetery', completed: false, category: 'burial' },
    { id: '10', text: 'Arrange transportation to cemetery', completed: false, category: 'burial' },
    { id: '11', text: 'Coordinate burial procedures', completed: false, category: 'burial' },
    { id: '12', text: 'Plan 3-day gathering for condolences', completed: false, category: 'mourning' },
    { id: '13', text: 'Arrange food for visitors', completed: false, category: 'mourning' },
    { id: '14', text: 'Set up Quran recitation sessions', completed: false, category: 'charity' },
    { id: '15', text: 'Organize Sadaqah Jariyah projects', completed: false, category: 'charity' },
    { id: '16', text: 'Plan 7-day remembrance', completed: false, category: 'remembrance' },
    { id: '17', text: 'Plan 40-day remembrance', completed: false, category: 'remembrance' },
    { id: '18', text: 'Schedule yearly remembrance', completed: false, category: 'remembrance' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'Immediate (First Hours)',
      timeframe: 'Within 1-2 hours',
      tasks: [
        'Recite Shahada near the deceased',
        'Close eyes and straighten limbs',
        'Cover body with clean cloth',
        'Contact family members',
        'Begin funeral arrangements'
      ],
      completed: false
    },
    {
      id: '2',
      title: 'Janazah Preparation',
      timeframe: 'Within 24 hours',
      tasks: [
        'Complete ghusl (ritual washing)',
        'Shroud in kafan (white cloth)',
        'Arrange Salat al-Janazah',
        'Notify community',
        'Prepare for burial'
      ],
      completed: false
    },
    {
      id: '3',
      title: 'Burial',
      timeframe: 'As soon as possible',
      tasks: [
        'Transport to Islamic cemetery',
        'Perform burial according to Sunnah',
        'Recite duas at graveside',
        'Place body facing Qibla',
        'Return to gather for condolences'
      ],
      completed: false
    },
    {
      id: '4',
      title: '3-Day Mourning Period',
      timeframe: 'Days 1-3',
      tasks: [
        'Receive condolence visitors',
        'Arrange Quran recitation',
        'Provide food for guests',
        'Begin Sadaqah distributions',
        'Offer comfort to immediate family'
      ],
      completed: false
    },
    {
      id: '5',
      title: '7-Day Remembrance',
      timeframe: 'Day 7',
      tasks: [
        'Host remembrance gathering',
        'Complete Quran recitation (if planned)',
        'Distribute charity in their name',
        'Share memories and duas',
        'Provide meal for attendees'
      ],
      completed: false
    },
    {
      id: '6',
      title: '40-Day Remembrance',
      timeframe: 'Day 40',
      tasks: [
        'Organize memorial gathering',
        'Continue Sadaqah Jariyah projects',
        'Visit grave with family',
        'Recite Quran and duas',
        'Reflect on their legacy'
      ],
      completed: false
    },
    {
      id: '7',
      title: 'Yearly Remembrance',
      timeframe: 'Annual',
      tasks: [
        'Annual memorial gathering',
        'Renew charitable commitments',
        'Visit grave',
        'Share their legacy with younger generation',
        'Make dua for their forgiveness'
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
    { name: 'Funeral Expenses', estimated: 1500, actual: 0, icon: Heart },
    { name: 'Ghusl & Kafan', estimated: 300, actual: 0, icon: Package },
    { name: 'Burial Plot & Services', estimated: 1000, actual: 0, icon: MapPin },
    { name: 'Food for Mourners', estimated: 800, actual: 0, icon: Gift },
    { name: 'Quran Recitation', estimated: 400, actual: 0, icon: Book },
    { name: 'Sadaqah Jariyah', estimated: 700, actual: 0, icon: Heart },
    { name: 'Memorial Services', estimated: 300, actual: 0, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Islamic Remembrance & Janazah Planner</h1>
          </div>
          <p className="text-gray-100 text-lg mb-6">Honor your loved one with Islamic funeral traditions and remembrance services - Inna lillahi wa inna ilayhi raji'un</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-gray-100">Date of Passing</div>
                  <input
                    type="date"
                    value={passingDate}
                    onChange={(e) => setPassingDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-gray-100">Name of Deceased</div>
                  <input
                    type="text"
                    value={deceasedName}
                    onChange={(e) => setDeceasedName(e.target.value)}
                    placeholder="Full name"
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-gray-100">Relationship</div>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g., Father, Mother"
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6" />
                <div>
                  <div className="text-sm text-gray-100">Checklist</div>
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
              { id: 'janazah', label: 'Janazah', icon: Bell },
              { id: 'remembrance', label: 'Remembrance', icon: Clock },
              { id: 'charity', label: 'Charity', icon: Heart },
              { id: 'comfort', label: 'Comfort', icon: Users },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Islamic Guide', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'text-gray-600 border-b-2 border-gray-600 dark:text-gray-400 dark:border-gray-400'
                    : 'text-gray-500 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
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
              <h2 className="text-2xl font-bold text-primary mb-4">Islamic Funeral & Remembrance Services</h2>
              <p className="text-secondary mb-6">
                إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ - "Indeed we belong to Allah, and indeed to Him we will return." This comprehensive planner guides you through the Islamic traditions of Janazah, burial, and remembrance with dignity and proper Islamic etiquette.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <Bell className="w-8 h-8 text-gray-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Janazah Services</h3>
                  <p className="text-sm text-secondary">Complete funeral prayer and burial arrangements according to Sunnah</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <Clock className="w-8 h-8 text-gray-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Remembrance Gatherings</h3>
                  <p className="text-sm text-secondary">Organize 3-day, 7-day, 40-day, and yearly memorial services</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-gray-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Sadaqah Jariyah</h3>
                  <p className="text-sm text-secondary">Establish ongoing charity in memory of your loved one</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Progress Summary</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-3xl font-bold">{checklist.filter(i => i.completed).length}</div>
                  <div className="text-gray-100 text-sm">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{timeline.filter(e => e.completed).length}</div>
                  <div className="text-gray-100 text-sm">Timeline Events</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{selectedProducts.length}</div>
                  <div className="text-gray-100 text-sm">Items Selected</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">${budget.toLocaleString()}</div>
                  <div className="text-gray-100 text-sm">Total Budget</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600 dark:to-purple-700 rounded-xl shadow-lg p-6 border-l-4 border-gray-600">
              <h3 className="text-xl font-bold text-primary mb-4">Essential Duas for the Deceased</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-800 dark:text-gray-200 font-arabic text-xl mb-3 text-right leading-relaxed">
                    اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ
                  </p>
                  <p className="text-secondary text-sm">
                    "O Allah, forgive him, have mercy on him, grant him well-being, and pardon him"
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-800 dark:text-gray-200 font-arabic text-xl mb-3 text-right leading-relaxed">
                    اللَّهُمَّ نَوِّرْ لَهُ فِي قَبْرِهِ وَاجْعَلْهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ
                  </p>
                  <p className="text-secondary text-sm">
                    "O Allah, illuminate their grave and make it a garden from the gardens of Paradise"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Islamic Funeral & Remembrance Checklist</h2>

              {['immediate', 'janazah', 'burial', 'mourning', 'charity', 'remembrance'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-lg text-muted mb-3 capitalize">
                    {category === 'immediate' && 'Immediate Actions'}
                    {category === 'janazah' && 'Janazah Preparation'}
                    {category === 'burial' && 'Burial Arrangements'}
                    {category === 'mourning' && 'Mourning Period'}
                    {category === 'charity' && 'Charitable Acts'}
                    {category === 'remembrance' && 'Remembrance Services'}
                  </h3>
                  <div className="space-y-2">
                    {checklist.filter(item => item.category === category).map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
                          item.completed
                            ? 'bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-200 dark:border-gray-700'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          item.completed
                            ? 'bg-gray-600 border-gray-600'
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
              <h2 className="text-2xl font-bold text-primary mb-6">Islamic Funeral & Remembrance Timeline</h2>

              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    )}
                    <div
                      className={`relative bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-all ${
                        event.completed ? 'border-2 border-gray-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          onClick={() => toggleTimelineEvent(event.id)}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                            event.completed
                              ? 'bg-gray-600 border-gray-600'
                              : 'border-default hover:border-gray-600'
                          }`}
                        >
                          {event.completed ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-muted font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-primary mb-1">{event.title}</h3>
                          <p className="text-muted mb-4">{event.timeframe}</p>
                          <ul className="space-y-2">
                            {event.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start gap-2">
                                <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                <span className="text-secondary">{task}</span>
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
                  min="1000"
                  max="20000"
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
                        <category.icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-primary">{category.name}</span>
                      </div>
                      <span className="text-gray-600 font-bold">${category.estimated}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${(category.estimated / budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">Total Estimated</span>
                  <span className="text-2xl font-bold text-gray-600">
                    ${budgetCategories.reduce((sum, cat) => sum + cat.estimated, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'janazah' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-gray-600" />
                <h2 className="text-2xl font-bold text-primary">Janazah (Funeral) Planning</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Ghusl (Ritual Washing)</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Performed by same-gender Muslims</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Body washed odd number of times (3, 5, or 7)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Use clean water and optional camphor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Maintain dignity and privacy</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Kafan (Shroud)</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">White cotton cloth, preferably new</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Men: 3 white sheets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Women: 5 pieces (includes chest wrapper)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Simple and modest, no extravagance</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Salat al-Janazah</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Fard Kifayah (communal obligation)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Performed standing (no ruku or sujud)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Four takbirs with specific duas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Can be performed at mosque or cemetery</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Transportation</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Transport to Islamic cemetery promptly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Followers should walk when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Maintain silence and reflection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">No music or loud conversation</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-5">
                <h4 className="font-bold text-lg mb-3">Important Reminder</h4>
                <p className="text-gray-100">
                  The Prophet (PBUH) said: "Hasten with the funeral procession, for if the deceased is righteous, you are forwarding them to good, and if otherwise, then you are laying evil off your necks." (Bukhari)
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'remembrance' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-gray-600" />
                <h2 className="text-2xl font-bold text-primary">Remembrance Gatherings</h2>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-gray-600 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-4">3-Day Mourning Period</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                    <h4 className="font-semibold text-primary mb-2">Purpose</h4>
                    <p className="text-secondary">
                      The first three days are for immediate family and close community to gather, offer condolences, and support the grieving family.
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Receive visitors at home or community center</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Community provides food for the family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Continuous Quran recitation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Share memories and make duas</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-gray-500 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-4">7-Day Remembrance</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                    <h4 className="font-semibold text-primary mb-2">Purpose</h4>
                    <p className="text-secondary">
                      A gathering to complete Quran recitation, distribute charity, and continue supporting the family through the early stages of grief.
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Host memorial gathering with Quran recitation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Complete Khatm al-Quran (if planned)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Distribute food and charity in their name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Family shares stories and legacy</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-gray-400 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-4">40-Day Remembrance</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                    <h4 className="font-semibold text-primary mb-2">Purpose</h4>
                    <p className="text-secondary">
                      A significant milestone for reflection, continued charity, and honoring the deceased's memory within the community.
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Organize memorial gathering at mosque or home</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Visit grave with family members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Continue Sadaqah Jariyah projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Recite Quran and offer special duas</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-gray-300 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-4">Yearly Remembrance</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                    <h4 className="font-semibold text-primary mb-2">Purpose</h4>
                    <p className="text-secondary">
                      Annual commemoration to honor their legacy, renew charitable commitments, and keep their memory alive in the family and community.
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Annual memorial gathering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Renew or expand Sadaqah Jariyah commitments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Family visit to the grave</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Share their legacy with younger generations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charity' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-gray-600" />
                <h2 className="text-2xl font-bold text-primary">Sadaqah Jariyah (Ongoing Charity)</h2>
              </div>

              <p className="text-secondary mb-6">
                The Prophet (PBUH) said: "When a person dies, their deeds come to an end except for three: ongoing charity (Sadaqah Jariyah), knowledge that is benefited from, and a righteous child who prays for them." (Muslim)
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Water Wells & Infrastructure</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Build water wells in needy communities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Install water pumps and filtration systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Support irrigation projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Provide clean water access to villages</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Mosques & Islamic Centers</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Build or renovate mosques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Donate prayer rugs, Qurans, or furniture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Support Islamic education programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Fund Imam or teacher salaries</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Education & Knowledge</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Establish Islamic schools or madrasas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Provide scholarships for students</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Publish and distribute Islamic books</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Support online Islamic education platforms</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Healthcare & Relief</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Build medical clinics or hospitals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Provide medical equipment or supplies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Support orphanages and care homes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Fund emergency relief programs</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Quran Distribution</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Print and distribute Qurans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Provide Qurans in multiple languages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Support Quran memorization programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Donate digital Quran resources</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Planting & Environment</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Plant fruit trees for communities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Create community gardens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Support reforestation projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Fund sustainable agriculture initiatives</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-5">
                <h4 className="font-bold text-lg mb-3">Making Your Sadaqah Jariyah</h4>
                <p className="text-gray-100 mb-3">
                  When donating on behalf of the deceased, make your intention clear and say: "O Allah, this charity is on behalf of [name]. Please accept it and make it a means of continuous reward for them."
                </p>
                <p className="text-gray-100">
                  Consider working with reputable Islamic charities that can help establish lasting projects in the name of your loved one.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comfort' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-gray-600" />
                <h2 className="text-2xl font-bold text-primary">Condolences & Comfort</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Offering Condolences (Ta'ziyah)</h3>
                  <p className="text-secondary mb-4">
                    Offering condolences is an Islamic duty and a way to share the burden of grief with the bereaved family.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Common Condolence Phrases</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-1">إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</p>
                          <p className="text-sm text-secondary">"Indeed we belong to Allah, and indeed to Him we will return"</p>
                        </div>
                        <div>
                          <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-1">أَعْظَمَ اللهُ أَجْرَكُمْ</p>
                          <p className="text-sm text-secondary">"May Allah magnify your reward"</p>
                        </div>
                        <div>
                          <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-1">وَأَحْسَنَ عَزَاءَكُمْ</p>
                          <p className="text-sm text-secondary">"And make perfect your solace"</p>
                        </div>
                        <div>
                          <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-1">وَغَفَرَ لِمَيِّتِكُمْ</p>
                          <p className="text-sm text-secondary">"And forgive your deceased"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Etiquette for Visitors</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Visit within the first three days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Keep visits brief and respectful</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Bring food for the family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Offer practical help (shopping, childcare, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Avoid excessive questioning or curiosity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Make dua for the deceased and family</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Supporting the Grieving Family</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Prepare meals for the family (Sunnah practice)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Help with household chores and responsibilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Assist with funeral arrangements if needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Check in regularly after the initial period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Respect their need for space when requested</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Listen without judgment or unsolicited advice</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Mourning Period for Widows</h3>
                  <p className="text-secondary mb-4">
                    A widow observes Iddah (waiting period) of 4 months and 10 days as prescribed in the Quran.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Remain in the home (unless necessary to leave)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Dress modestly, avoid adornment and perfume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Focus on prayer, Quran, and reflection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">Community should provide support and necessities</span>
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Islamic Funeral & Burial Guide</h2>
              <p className="text-gray-50">Understanding death and the afterlife through Islamic teachings</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-gray-600" />
                <h3 className="text-2xl font-bold text-primary">Islamic Burial Practices</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-gray-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Burial According to Sunnah</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Swift Burial:</strong> Bury as soon as possible after death, preferably within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Facing Qibla:</strong> Body placed on right side facing Makkah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Grave Depth:</strong> Approximately chest-height of an average person</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Direct Earth Contact:</strong> No coffin is required; body placed directly in earth when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Simple Grave Marker:</strong> Small, modest marker with name and dates (no elaborate monuments)</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-gray-500 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Duas at the Graveside</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">When lowering the body:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2 text-right">بِسْمِ اللهِ وَعَلَى مِلَّةِ رَسُولِ اللهِ</p>
                      <p className="text-sm text-secondary">"In the name of Allah and according to the way of the Messenger of Allah"</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">After burial:</p>
                      <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2 text-right">اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ</p>
                      <p className="text-sm text-secondary">"O Allah, forgive them, have mercy on them, grant them well-being, and pardon them"</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-gray-400 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Visiting Graves (Ziyarat al-Qubur)</h4>
                  <p className="text-secondary mb-3">
                    The Prophet (PBUH) said: "I used to forbid you from visiting graves, but now visit them, for verily they remind you of the Hereafter." (Muslim)
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span>Visit graves for remembrance and reflection, not for asking from the deceased</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span>Greet the deceased with Islamic greeting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span>Make dua for their forgiveness and mercy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span>Reflect on your own mortality and the Hereafter</span>
                    </li>
                  </ul>
                  <div className="mt-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                    <p className="text-sm text-muted mb-2">Greeting at the grave:</p>
                    <p className="text-gray-800 dark:text-gray-200 font-arabic text-lg mb-2 text-right">السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ</p>
                    <p className="text-sm text-secondary">"Peace be upon you, inhabitants of the graves from among the believers and Muslims"</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">What to Avoid</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Excessive wailing, chest-beating, or tearing of clothes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Building elaborate structures over graves</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Sitting or stepping on graves</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Asking the deceased for help or intercession</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Cremation or embalming (prohibited in Islam)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-gray-600" />
                <h3 className="text-2xl font-bold text-primary">Understanding Death in Islam</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">Death as a Transition</h4>
                  <p className="text-secondary mb-3">
                    Death in Islam is not the end, but a transition from this temporary world to the eternal Hereafter. It is a return to Allah, our Creator.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 font-arabic text-xl mb-2 text-right">كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ</p>
                    <p className="text-sm text-secondary">"Every soul will taste death" - Quran 3:185</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">Patience and Trust in Allah</h4>
                  <p className="text-secondary mb-3">
                    While grief is natural and permitted, Muslims are encouraged to be patient (have Sabr) and trust in Allah's wisdom. The reward for patience during trials is immense.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 font-arabic text-xl mb-2 text-right">إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ</p>
                    <p className="text-sm text-secondary">"Indeed, the patient will be given their reward without account" - Quran 39:10</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">The Journey After Death</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-600">1.</span>
                      <span><strong>Barzakh:</strong> The period between death and the Day of Judgment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-600">2.</span>
                      <span><strong>Questioning in the Grave:</strong> Angels ask three questions about faith</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-600">3.</span>
                      <span><strong>Day of Resurrection:</strong> All will be raised for final judgment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-600">4.</span>
                      <span><strong>Paradise or Hellfire:</strong> Based on faith and deeds</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-gray-600" />
                <h3 className="text-2xl font-bold text-primary">Important Reminders</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Act Swiftly</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-200">Complete burial within 24 hours when possible, as commanded by the Prophet (PBUH).</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Simplicity is Sunnah</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-200">Keep funeral and burial simple, avoiding extravagance and ostentation.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Continuous Charity</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-200">Establish Sadaqah Jariyah to provide ongoing reward for the deceased.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Make Constant Dua</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-200">Pray regularly for forgiveness and mercy for your deceased loved one.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <RemembranceProductCatalog
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
