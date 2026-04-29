import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Heart, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell, Flame } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import RemembranceProductCatalog from './RemembranceProductCatalog';

interface JewishRemembrancePlannerProps {
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
  category: 'funeral' | 'shiva' | 'shloshim' | 'yahrzeit' | 'support';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function JewishRemembrancePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: JewishRemembrancePlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'funeral' | 'shiva' | 'yahrzeit' | 'support' | 'shopping' | 'guide'>('overview');
  const [passingDate, setPassingDate] = useState('');
  const [hebrewName, setHebrewName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(8000);

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
    { id: '1', text: 'Contact Chevra Kadisha (burial society)', completed: false, category: 'funeral' },
    { id: '2', text: 'Arrange for Taharah (ritual purification)', completed: false, category: 'funeral' },
    { id: '3', text: 'Select burial plot or arrange cemetery space', completed: false, category: 'funeral' },
    { id: '4', text: 'Coordinate funeral service with rabbi', completed: false, category: 'funeral' },
    { id: '5', text: 'Arrange Shomer (guardian) until burial', completed: false, category: 'funeral' },
    { id: '6', text: 'Prepare home for sitting shiva', completed: false, category: 'shiva' },
    { id: '7', text: 'Cover mirrors in shiva house', completed: false, category: 'shiva' },
    { id: '8', text: 'Arrange low chairs/stools for mourners', completed: false, category: 'shiva' },
    { id: '9', text: 'Organize meal of condolence', completed: false, category: 'shiva' },
    { id: '10', text: 'Coordinate minyan for daily prayers', completed: false, category: 'shiva' },
    { id: '11', text: 'Arrange shiva food donations schedule', completed: false, category: 'shiva' },
    { id: '12', text: 'Set up shiva candle (7-day)', completed: false, category: 'shiva' },
    { id: '13', text: 'Plan shloshim (30-day) observances', completed: false, category: 'shloshim' },
    { id: '14', text: 'Determine yahrzeit date (Hebrew calendar)', completed: false, category: 'yahrzeit' },
    { id: '15', text: 'Purchase yahrzeit candle holder', completed: false, category: 'yahrzeit' },
    { id: '16', text: 'Arrange for kaddish to be recited', completed: false, category: 'yahrzeit' },
    { id: '17', text: 'Plan unveiling ceremony (11-12 months)', completed: false, category: 'yahrzeit' },
    { id: '18', text: 'Contact family and community for support', completed: false, category: 'support' },
    { id: '19', text: 'Arrange tzedakah (charity) donations', completed: false, category: 'support' },
    { id: '20', text: 'Consider grief counseling resources', completed: false, category: 'support' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Funeral & Burial Services', estimated: 4000, actual: 0, icon: MapPin },
    { name: 'Shiva Food & Hospitality', estimated: 1200, actual: 0, icon: Gift },
    { name: 'Kaddish Arrangements', estimated: 500, actual: 0, icon: Book },
    { name: 'Yahrzeit Candles & Memorial', estimated: 300, actual: 0, icon: Flame },
    { name: 'Memorial Donations (Tzedakah)', estimated: 1000, actual: 0, icon: Heart },
    { name: 'Unveiling Ceremony', estimated: 800, actual: 0, icon: Star },
    { name: 'Support Services', estimated: 200, actual: 0, icon: Users },
  ];

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Immediate (Before Burial)',
      timeframe: 'First 24-48 hours',
      tasks: [
        'Contact Chevra Kadisha immediately',
        'Arrange Shomer (guardian)',
        'Coordinate with funeral home',
        'Notify family and close friends',
        'Prepare keriah ribbon or garment for tearing'
      ],
      completed: false
    },
    {
      id: '2',
      title: 'Shiva (Seven Days)',
      timeframe: 'Days 1-7 after burial',
      tasks: [
        'Sit shiva at designated home',
        'Light 7-day shiva candle',
        'Receive visitors for condolence',
        'Hold minyan twice daily',
        'Receive meal of condolence',
        'Recite Kaddish three times daily'
      ],
      completed: false
    },
    {
      id: '3',
      title: 'Shloshim (Thirty Days)',
      timeframe: 'Days 1-30 after burial',
      tasks: [
        'Continue saying Kaddish daily',
        'Avoid celebrations and festivities',
        'Refrain from haircuts and shaving',
        'Transition back to work gradually',
        'Continue receiving support'
      ],
      completed: false
    },
    {
      id: '4',
      title: 'Yahrzeit (Annual Remembrance)',
      timeframe: 'First year and annually',
      tasks: [
        'Light 24-hour yahrzeit candle',
        'Recite Kaddish at synagogue',
        'Visit grave if possible',
        'Make charitable donation',
        'Study Torah in memory',
        'Plan unveiling ceremony (11-12 months)'
      ],
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Jewish Remembrance & Mourning Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Honor your loved one with dignity and navigate Jewish mourning traditions with care and respect</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Date of Passing</div>
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
                  <div className="text-sm text-purple-600 dark:text-purple-400">Hebrew Name</div>
                  <input
                    type="text"
                    value={hebrewName}
                    onChange={(e) => setHebrewName(e.target.value)}
                    placeholder="Name ben/bat Name"
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Relationship</div>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="Parent, Spouse, etc."
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
              { id: 'overview', label: 'Overview', icon: Heart },
              { id: 'checklist', label: 'Checklist', icon: CheckSquare },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'budget', label: 'Budget', icon: Package },
              { id: 'funeral', label: 'Funeral', icon: MapPin },
              { id: 'shiva', label: 'Shiva', icon: Users },
              { id: 'yahrzeit', label: 'Yahrzeit', icon: Flame },
              { id: 'support', label: 'Support', icon: ListChecks },
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
              <h2 className="text-2xl font-bold text-primary mb-4">Jewish Mourning & Memorial Traditions</h2>
              <p className="text-secondary mb-6">
                May their memory be a blessing (זכרונם לברכה). This planner guides you through Jewish mourning customs with compassion and clarity, from funeral arrangements to yahrzeit observance, helping you honor your loved one according to tradition.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Funeral & Burial</h3>
                  <p className="text-sm text-secondary">Coordinate respectful Jewish burial customs and funeral service</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Shiva (7 Days)</h3>
                  <p className="text-sm text-secondary">Observe traditional week of mourning with community support</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Flame className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Yahrzeit</h3>
                  <p className="text-sm text-secondary">Plan annual remembrance and memorial traditions</p>
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
                  <div className="text-3xl font-bold">{passingDate ? '7 days' : '-'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Shiva Period</div>
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

            {hebrewName && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600 dark:to-purple-700/20 rounded-xl shadow-lg p-6 text-center">
                <p className="text-secondary text-lg mb-2">In loving memory of</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">{hebrewName}</p>
                <p className="text-muted text-sm">May their memory be a blessing</p>
                <p className="text-muted text-sm hebrew mt-2">זכרונם לברכה</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Jewish Mourning Checklist</h2>

              {['funeral', 'shiva', 'shloshim', 'yahrzeit', 'support'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3 capitalize">
                    {category === 'shloshim' ? 'Shloshim (30 Days)' : category}
                  </h3>
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
              <h2 className="text-2xl font-bold text-primary mb-6">Jewish Mourning Timeline</h2>

              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== timelineEvents.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-purple-600 dark:bg-purple-600"></div>
                    )}

                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-primary mb-1">{event.title}</h3>
                          <p className="text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">{event.timeframe}</p>
                          <ul className="space-y-2">
                            {event.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start gap-2 text-secondary">
                                <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
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
                  min="1000"
                  max="20000"
                  step="500"
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

        {activeTab === 'funeral' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Funeral & Burial Service</h2>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Immediate Arrangements</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Contact Chevra Kadisha:</strong> The holy burial society will prepare the body according to Jewish law</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Shomer (Guardian):</strong> Arrange for someone to stay with the deceased until burial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Burial Timing:</strong> Traditional Jewish burial should occur within 24 hours when possible</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Taharah (Ritual Purification)</h3>
                  <p className="text-secondary mb-3">
                    The Chevra Kadisha performs taharah, a sacred ritual of cleansing and dressing the deceased in simple white linen shrouds (tachrichim), treating the body with utmost respect and dignity.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Funeral Service Elements</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Keriah:</strong> Tearing of garment or ribbon as sign of grief</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Hesped:</strong> Eulogy honoring the deceased</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>El Malei Rachamim:</strong> Memorial prayer for the soul</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Kaddish:</strong> Mourner's prayer recited by family</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Burial Participation:</strong> Family and friends shovel earth onto casket</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Important Considerations</h4>
                  <div className="space-y-3 text-secondary">
                    <p><strong>Casket:</strong> Traditional Jewish burial uses a simple wooden casket without metal parts or ornamentation</p>
                    <p><strong>Flowers:</strong> Not customary at Jewish funerals; consider charitable donations instead</p>
                    <p><strong>Embalming:</strong> Generally not permitted in traditional Jewish practice</p>
                    <p><strong>Viewing:</strong> Not typically part of Jewish tradition; casket remains closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shiva' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Sitting Shiva (Seven Days)</h2>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Preparing the Shiva House</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Cover Mirrors:</strong> Mirrors are covered to focus on inner reflection rather than appearance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Low Seating:</strong> Mourners sit on low chairs or stools as a sign of mourning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Shiva Candle:</strong> Light a seven-day memorial candle that burns throughout shiva</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Prayer Books:</strong> Have siddurim available for prayer services</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Shiva Customs & Practices</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Stay Home:</strong> Mourners remain at home except for Shabbat synagogue attendance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Visitors Welcome:</strong> Community comes to offer comfort and support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Meal of Condolence:</strong> First meal after burial provided by others (often eggs and bread)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>No Greetings:</strong> Visitors should not greet mourners; wait for mourner to speak first</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Work Prohibited:</strong> Mourners refrain from work during shiva</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Daily Minyan Services</h3>
                  <p className="text-secondary mb-3">
                    A minyan (quorum of 10 Jewish adults) gathers at the shiva house twice daily for prayer services, allowing mourners to recite Kaddish. Morning and evening services are typically held.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-3">
                    <p className="text-sm text-secondary"><strong>Tip:</strong> Coordinate with local synagogue or community to ensure minyan attendance throughout the week.</p>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Comforting Mourners</h4>
                  <p className="text-secondary mb-3">
                    The traditional words of comfort to say to mourners:
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                    <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1">Hebrew:</p>
                    <p className="text-gray-800 dark:text-gray-200 text-lg mb-3 hebrew">המקום ינחם אתכם בתוך שאר אבלי ציון וירושלים</p>
                    <p className="text-sm text-secondary">"May God comfort you among the other mourners of Zion and Jerusalem"</p>
                  </div>
                  <p className="text-sm text-muted">Visitors should focus on listening, sharing memories, and providing practical support rather than trying to explain or minimize the loss.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">Food & Hospitality During Shiva</h4>
                  <ul className="space-y-2 text-secondary">
                    <li>Friends and community typically organize meal schedule for mourners</li>
                    <li>Focus on comforting foods that are easy to serve and eat</li>
                    <li>Coffee, tea, and light refreshments for visitors</li>
                    <li>All food should be kosher if family observes kashrut</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'yahrzeit' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Flame className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Yahrzeit & Annual Remembrance</h2>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Understanding Yahrzeit</h3>
                  <p className="text-secondary mb-3">
                    Yahrzeit (Yiddish for "year's time") is the anniversary of a loved one's passing according to the Hebrew calendar. It is observed annually as a day of remembrance and prayer.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Hebrew Date:</strong> Yahrzeit follows the Hebrew calendar date of passing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>24-Hour Candle:</strong> Light a yahrzeit candle at sunset and let it burn for 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Kaddish:</strong> Recite Kaddish at synagogue services on yahrzeit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Torah Study:</strong> Study Torah or Mishnah in memory of the departed</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Yahrzeit Observances</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Synagogue Attendance:</strong> Attend services to recite Kaddish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Cemetery Visit:</strong> Visit the grave if possible (not on Shabbat or holidays)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Tzedakah:</strong> Give charity in memory of the deceased</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Good Deeds:</strong> Perform mitzvot to honor their memory</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Unveiling Ceremony</h3>
                  <p className="text-secondary mb-3">
                    The unveiling (dedication of the tombstone) typically occurs between 11-12 months after burial, though customs vary by community. It provides closure and a formal moment to dedicate the permanent memorial.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Timing:</strong> Usually held before the first yahrzeit, often at 11 months</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Brief Ceremony:</strong> Family gathers at graveside for prayers and unveiling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Prayers Recited:</strong> Psalms, El Malei Rachamim, Kaddish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Tombstone:</strong> The covering is removed to reveal the monument</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Yizkor Memorial Service</h4>
                  <p className="text-secondary mb-3">
                    Yizkor (meaning "may [God] remember") is a memorial prayer service held four times a year during major Jewish holidays:
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li>• Yom Kippur (Day of Atonement)</li>
                    <li>• Shemini Atzeret (final day of Sukkot)</li>
                    <li>• Last day of Passover</li>
                    <li>• Second day of Shavuot</li>
                  </ul>
                  <p className="text-sm text-muted mt-3">Many synagogues offer these services, and it's customary to pledge tzedakah during Yizkor.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">Memorial Prayers</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Mourner's Kaddish (excerpt):</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2 hebrew">יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא</p>
                      <p className="text-sm text-secondary">"May His great Name be exalted and sanctified..."</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Blessing when lighting yahrzeit candle:</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2 hebrew">זֵכֶר צַדִּיק לִבְרָכָה</p>
                      <p className="text-sm text-secondary">"The memory of the righteous is a blessing"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <ListChecks className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Support & Resources</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Community Support</h3>
                  <p className="text-secondary mb-4">
                    The Jewish community rallies around mourners with tangible support and comfort. Don't hesitate to accept help during this difficult time.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Synagogue Support:</strong> Contact your rabbi and congregation for assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Meal Coordination:</strong> Accept offers to organize shiva meals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Minyan Organization:</strong> Community helps ensure daily prayer quorum</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Practical Help:</strong> Accept assistance with childcare, errands, household tasks</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Grief Counseling Resources</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Many Jewish Family Services offer grief counseling and support groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Rabbis and chaplains provide spiritual guidance during mourning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Bereavement support groups connect you with others experiencing loss</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Individual therapy can help process grief in a healthy way</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Making Memorial Donations</h3>
                  <p className="text-secondary mb-3">
                    Tzedakah (charitable giving) in memory of a loved one is a beautiful way to honor their life and create a lasting legacy.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Choose causes that were important to the deceased</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Synagogue memorial funds, Jewish education, Israel-related causes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Torah dedications or prayer book dedications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Plant trees in Israel through Jewish National Fund</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">Self-Care During Mourning</h4>
                  <p className="text-secondary mb-3">
                    While Jewish tradition provides structure for mourning, remember to care for your physical and emotional wellbeing:
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li>• Allow yourself to feel grief without judgment</li>
                    <li>• Maintain basic nutrition and rest, even if appetite is diminished</li>
                    <li>• Accept help from family and community</li>
                    <li>• Talk about your loved one and share memories</li>
                    <li>• Return to routines gradually after shiva</li>
                    <li>• Seek professional help if grief feels overwhelming</li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Children and Mourning</h4>
                  <p className="text-secondary mb-3">
                    If children are mourning, provide age-appropriate explanations and support:
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li>• Answer questions honestly and simply</li>
                    <li>• Include children in rituals appropriate to their age</li>
                    <li>• Allow them to express grief in their own way</li>
                    <li>• Maintain routines to provide security</li>
                    <li>• Consider child-focused grief resources or counseling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Jewish Mourning Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Understanding Jewish burial customs and bereavement practices</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Jewish Mourning Periods</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Aninut (Before Burial)</h4>
                  <p className="text-secondary mb-3">
                    The period between death and burial is called aninut. The mourner (onen) is exempt from positive commandments, as their focus is entirely on honoring the deceased and preparing for burial.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li>• Immediate family focuses on funeral arrangements</li>
                    <li>• Mourners are exempt from prayer and mitzvot obligations</li>
                    <li>• Burial should happen as soon as possible (within 24 hours when feasible)</li>
                    <li>• Body is never left alone - Shomer keeps watch</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Shiva (Seven Days)</h4>
                  <p className="text-secondary mb-3">
                    Shiva (Hebrew for "seven") is the seven-day intensive mourning period following burial. This time of deep grief allows mourners to process their loss with community support.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li><strong>Who observes:</strong> Children, parents, siblings, and spouses of the deceased</li>
                    <li><strong>Work:</strong> Prohibited during shiva</li>
                    <li><strong>Restrictions:</strong> No leather shoes, bathing for pleasure, marital relations, studying Torah (except Job, Lamentations, laws of mourning)</li>
                    <li><strong>Community role:</strong> Visitors comfort mourners, help form minyan, bring food</li>
                    <li><strong>Shabbat:</strong> Public mourning is suspended on Shabbat, but counts toward the seven days</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Shloshim (Thirty Days)</h4>
                  <p className="text-secondary mb-3">
                    Shloshim (Hebrew for "thirty") extends from burial through the thirtieth day. Mourners gradually return to normal life while maintaining certain restrictions.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li>• Return to work after shiva concludes</li>
                    <li>• Continue reciting Kaddish daily</li>
                    <li>• Avoid celebrations, parties, and live music</li>
                    <li>• Refrain from haircuts and shaving (men)</li>
                    <li>• For parents: observances continue for 12 months</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Twelve Months (For Parents)</h4>
                  <p className="text-secondary mb-3">
                    When mourning a parent, the mourning period extends to eleven months for Kaddish recitation and twelve months for other observances.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li>• Recite Kaddish for 11 months (not 12, to avoid implying parent needs full year of prayer)</li>
                    <li>• Avoid purely joyful celebrations for 12 months</li>
                    <li>• Some continue to avoid live music for the year</li>
                    <li>• Gradually return to normal life while honoring parent's memory</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Jewish Burial Customs</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Respect for the Deceased</h4>
                  <p className="text-secondary mb-3">
                    Jewish law emphasizes treating the deceased with utmost dignity and respect (kavod ha-met). Every aspect of burial reflects this core value.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li><strong>Shomer:</strong> Body is never left alone from death until burial</li>
                    <li><strong>Taharah:</strong> Ritual purification performed by Chevra Kadisha</li>
                    <li><strong>Tachrichim:</strong> Simple white linen shrouds, equal for all</li>
                    <li><strong>Aron:</strong> Plain wooden casket without metal fasteners</li>
                    <li><strong>Quick Burial:</strong> Typically within 24 hours (unless Shabbat or other factors)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Keriah (Tearing)</h4>
                  <p className="text-secondary mb-3">
                    Keriah (tearing of garment) is an ancient expression of grief mentioned in the Torah. It represents the tear in one's life caused by loss.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li>• Performed while standing, before funeral service</li>
                    <li>• For parents: tear on left side (over the heart)</li>
                    <li>• For others: tear on right side</li>
                    <li>• Blessing recited: "Baruch Dayan Ha-Emet" (Blessed is the True Judge)</li>
                    <li>• Ribbon may be used instead of actual garment</li>
                    <li>• Worn throughout shiva</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Graveside Customs</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Participation:</strong> Family and friends take turns shoveling earth onto casket</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Not Passing Shovel:</strong> Place shovel in earth pile, don't hand directly to next person</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>First Kaddish:</strong> Mourners recite Kaddish at graveside</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Forming Rows:</strong> Attendees form two rows to comfort mourners as they leave</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Hand Washing:</strong> Wash hands before leaving cemetery (pitcher usually provided)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Kaddish Prayer</h3>
              </div>

              <div className="space-y-6">
                <p className="text-secondary">
                  The Mourner's Kaddish is a prayer that praises God, recited by mourners in the presence of a minyan. Paradoxically, it contains no mention of death, instead affirming faith and sanctifying God's name.
                </p>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Kaddish Details</h4>
                  <ul className="space-y-2 text-secondary">
                    <li><strong>Minyan Required:</strong> Must be recited with 10 Jewish adults present</li>
                    <li><strong>Language:</strong> Recited in Aramaic (the common language in Talmudic times)</li>
                    <li><strong>Frequency:</strong> Three times daily (Shacharit, Mincha, Maariv) during mourning period</li>
                    <li><strong>Duration:</strong> 11 months for parents; 30 days (shloshim) for other relatives</li>
                    <li><strong>Yahrzeit:</strong> Also recited annually on the anniversary of death</li>
                    <li><strong>Who Recites:</strong> Traditionally sons, though many communities now include daughters</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-5 border-2 border-purple-600 dark:border-purple-600">
                  <h4 className="font-bold text-primary mb-3">Mourner's Kaddish (Transliteration)</h4>
                  <div className="space-y-2 text-secondary text-sm">
                    <p><em>Yitgadal v'yitkadash sh'mei raba</em></p>
                    <p><em>B'alma di v'ra chirutei, v'yamlich malchutei</em></p>
                    <p><em>B'chayeichon uvyomeichon uvchayei d'chol beit Yisrael</em></p>
                    <p><em>Ba'agala uviz'man kariv, v'im'ru: Amen</em></p>
                    <p className="mt-3"><strong>Congregation:</strong> <em>Y'hei sh'mei raba m'varach l'alam ul'almei almaya</em></p>
                    <p className="text-xs text-muted mt-3">
                      "May His great Name be exalted and sanctified in the world which He created according to His will..."
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h4 className="font-bold text-primary mb-3">If Unable to Attend Minyan</h4>
                  <ul className="space-y-2 text-secondary">
                    <li>• Kaddish can only be said with a minyan; no substitute alone</li>
                    <li>• Can arrange for someone else to recite Kaddish on your behalf</li>
                    <li>• Study Torah, give tzedakah, perform mitzvot in memory of deceased</li>
                    <li>• Many synagogues offer Kaddish sponsorship programs</li>
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
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Accept Community Support</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Jewish tradition emphasizes communal support during mourning. Let others help with meals, minyan, and daily needs.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Consult Your Rabbi</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Every situation is unique. Your rabbi can guide you through specific questions about Jewish law and custom.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Honor Through Memory</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">The highest honor to the deceased is living righteously and performing mitzvot in their memory.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Take Care of Yourself</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">While observing mourning rituals, remember that self-care is also important for healing.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600 dark:to-purple-700/20 rounded-lg text-center">
                <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-2">May their memory be a blessing</p>
                <p className="text-secondary hebrew text-2xl">זכרונם לברכה</p>
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
