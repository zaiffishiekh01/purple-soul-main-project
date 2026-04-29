import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import RemembranceProductCatalog from './RemembranceProductCatalog';

interface SharedRemembrancePlannerProps {
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
  category: 'immediate' | 'planning' | 'service' | 'memorial' | 'healing';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function SharedRemembrancePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: SharedRemembrancePlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'service' | 'memorial' | 'healing' | 'comfort' | 'shopping' | 'guide'>('overview');
  const [passingDate, setPassingDate] = useState('');
  const [nameOfDeceased, setNameOfDeceased] = useState('');
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
    { id: '1', text: 'Notify immediate family and close friends', completed: false, category: 'immediate' },
    { id: '2', text: 'Contact funeral home or memorial service provider', completed: false, category: 'immediate' },
    { id: '3', text: 'Gather important documents and information', completed: false, category: 'immediate' },
    { id: '4', text: 'Make arrangements for body care/cremation', completed: false, category: 'immediate' },
    { id: '5', text: 'Choose memorial venue or location', completed: false, category: 'planning' },
    { id: '6', text: 'Select date and time for memorial service', completed: false, category: 'planning' },
    { id: '7', text: 'Create guest list and send invitations', completed: false, category: 'planning' },
    { id: '8', text: 'Plan reception or gathering after service', completed: false, category: 'planning' },
    { id: '9', text: 'Choose readings, music, and tributes', completed: false, category: 'service' },
    { id: '10', text: 'Prepare eulogy or life story', completed: false, category: 'service' },
    { id: '11', text: 'Arrange for memorial displays (photos, videos)', completed: false, category: 'service' },
    { id: '12', text: 'Select flowers and memorial decorations', completed: false, category: 'service' },
    { id: '13', text: 'Create memory book or guest book', completed: false, category: 'memorial' },
    { id: '14', text: 'Set up memorial donation fund', completed: false, category: 'memorial' },
    { id: '15', text: 'Arrange grief support for family', completed: false, category: 'healing' },
    { id: '16', text: 'Plan ongoing remembrance traditions', completed: false, category: 'healing' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Memorial Venue', estimated: 1200, actual: 0, icon: MapPin },
    { name: 'Reception & Catering', estimated: 1000, actual: 0, icon: Gift },
    { name: 'Memory Book & Materials', estimated: 400, actual: 0, icon: Book },
    { name: 'Memorial Donations Fund', estimated: 500, actual: 0, icon: Heart },
    { name: 'Flowers & Tributes', estimated: 600, actual: 0, icon: Sparkles },
    { name: 'Professional Services', estimated: 800, actual: 0, icon: Users },
    { name: 'Memorial Keepsakes', estimated: 500, actual: 0, icon: Star },
  ];

  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      title: 'Immediate (First 24-48 hours)',
      timeframe: 'Day 1-2',
      tasks: [
        'Contact immediate family and closest friends',
        'Arrange for body care or cremation',
        'Gather important documents',
        'Begin funeral/memorial planning'
      ],
      completed: false
    },
    {
      id: '2',
      title: 'Early Planning (3-7 days)',
      timeframe: 'Week 1',
      tasks: [
        'Select memorial venue and date',
        'Create guest list',
        'Plan service program',
        'Arrange catering and reception',
        'Prepare memorial displays'
      ],
      completed: false
    },
    {
      id: '3',
      title: 'Service Preparation (1-2 weeks)',
      timeframe: 'Week 1-2',
      tasks: [
        'Finalize service details',
        'Prepare eulogy and tributes',
        'Create memory book',
        'Coordinate with service providers',
        'Send invitations'
      ],
      completed: false
    },
    {
      id: '4',
      title: 'Memorial Service',
      timeframe: 'Service Day',
      tasks: [
        'Set up memorial displays',
        'Welcome guests',
        'Conduct celebration of life',
        'Share memories and stories',
        'Host reception'
      ],
      completed: false
    },
    {
      id: '5',
      title: 'After Service (Ongoing)',
      timeframe: 'Ongoing',
      tasks: [
        'Send thank you notes',
        'Arrange grief support',
        'Create lasting memorial',
        'Plan remembrance traditions',
        'Continue healing journey'
      ],
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Shared Remembrance & Memorial Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Plan a meaningful celebration of life that honors all traditions and brings comfort to grieving hearts</p>

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
                  <div className="text-sm text-purple-600 dark:text-purple-400">Name of Deceased</div>
                  <input
                    type="text"
                    value={nameOfDeceased}
                    onChange={(e) => setNameOfDeceased(e.target.value)}
                    placeholder="Full name"
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
                    placeholder="e.g., Mother, Friend"
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
              { id: 'service', label: 'Service', icon: Heart },
              { id: 'memorial', label: 'Memorial', icon: Book },
              { id: 'healing', label: 'Healing', icon: Sparkles },
              { id: 'comfort', label: 'Comfort', icon: Gift },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Memorial Guide', icon: Book }
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
              <h2 className="text-2xl font-bold text-primary mb-4">Creating a Meaningful Celebration of Life</h2>
              <p className="text-secondary mb-6">
                Honor your loved one with a memorial service that celebrates their unique life, respects all traditions, and brings comfort to family and friends. This planner guides you through creating a heartfelt tribute that reflects their spirit and brings healing to all who gather to remember.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Celebration of Life</h3>
                  <p className="text-sm text-secondary">Create a service that honors their unique journey and impact</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Interfaith & Inclusive</h3>
                  <p className="text-sm text-secondary">Respect all faiths and traditions in a unified gathering</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Healing & Support</h3>
                  <p className="text-sm text-secondary">Find comfort through community and remembrance</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Planning Progress</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-3xl font-bold">{checklist.filter(i => i.completed).length}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{passingDate ? 'Set' : 'Pending'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Service Date</div>
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
                <h3 className="text-xl font-bold text-primary mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab('checklist')} className="w-full text-left px-4 py-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg hover:bg-purple-600 dark:hover:bg-purple-600/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-primary">View Full Checklist</span>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab('timeline')} className="w-full text-left px-4 py-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg hover:bg-purple-600 dark:hover:bg-purple-600/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-primary">Review Timeline</span>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab('guide')} className="w-full text-left px-4 py-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg hover:bg-purple-600 dark:hover:bg-purple-600/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Book className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-primary">Read Memorial Guide</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Grief Support Resources</h3>
                <div className="space-y-3 text-secondary">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-primary">Professional Counseling</div>
                      <p className="text-sm">Connect with grief counselors and support groups</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-primary">Community Support</div>
                      <p className="text-sm">Find comfort in shared experiences and understanding</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Book className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-primary">Healing Resources</div>
                      <p className="text-sm">Access books, articles, and guided healing practices</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Memorial Planning Checklist</h2>

              {['immediate', 'planning', 'service', 'memorial', 'healing'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3 capitalize">
                    {category === 'immediate' && 'Immediate Actions'}
                    {category === 'planning' && 'Service Planning'}
                    {category === 'service' && 'Service Details'}
                    {category === 'memorial' && 'Memorial & Legacy'}
                    {category === 'healing' && 'Healing & Support'}
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
              <h2 className="text-2xl font-bold text-primary mb-6">Memorial Planning Timeline</h2>

              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== timelineEvents.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-purple-600 dark:bg-purple-600"></div>
                    )}

                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                            <span className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 font-medium">{event.timeframe}</span>
                          </div>
                          <ul className="space-y-2 mt-4">
                            {event.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-start gap-2 text-secondary">
                                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
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
                  max="15000"
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

              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold text-primary mb-3">Budget Planning Tips</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Consider a memorial fund in lieu of flowers to honor your loved one's legacy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Venue costs can vary - consider meaningful locations like gardens, community centers, or family homes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Create digital memory books as a cost-effective alternative to printed materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Ask family and friends to contribute photos and memories to personalize the service</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'service' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Memorial Service Planning</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-primary mb-4">Service Elements</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Opening & Welcome</div>
                        <p className="text-sm text-secondary">Gather guests with words of comfort and welcome</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Music & Readings</div>
                        <p className="text-sm text-secondary">Choose meaningful songs, poems, or spiritual texts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Eulogy & Life Story</div>
                        <p className="text-sm text-secondary">Share the journey and impact of their life</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Open Sharing</div>
                        <p className="text-sm text-secondary">Invite guests to share memories and tributes</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Closing & Reflection</div>
                        <p className="text-sm text-secondary">End with hope, peace, and invitation to reception</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-primary mb-4">Interfaith Considerations</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Honor All Traditions</div>
                        <p className="text-sm text-secondary">Include elements from relevant faith traditions</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Inclusive Language</div>
                        <p className="text-sm text-secondary">Use universal themes of love, hope, and peace</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Multiple Perspectives</div>
                        <p className="text-sm text-secondary">Invite speakers from different backgrounds</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Sacred Symbols</div>
                        <p className="text-sm text-secondary">Respectfully incorporate meaningful symbols</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">Moment of Silence</div>
                        <p className="text-sm text-secondary">Allow personal prayer or reflection time</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Sample Service Order</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">1</span>
                    </div>
                    <span>Welcome & Opening Words (5 min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">2</span>
                    </div>
                    <span>Musical Selection or Reading (5 min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">3</span>
                    </div>
                    <span>Eulogy & Life Story (15 min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">4</span>
                    </div>
                    <span>Open Sharing of Memories (15-20 min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">5</span>
                    </div>
                    <span>Musical Selection (5 min)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">6</span>
                    </div>
                    <span>Closing Words & Reflection (5 min)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memorial' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Memorial & Memory Preservation</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Memory Book Ideas</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Guest book with memory prompts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Photo timeline of their life</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Collected stories from family and friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Favorite quotes, sayings, or wisdom</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Video tributes and interviews</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Memorial Options</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Memorial garden or tree planting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Charitable fund in their name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Scholarship or award program</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Memorial website or online tribute</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Legacy projects they cared about</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600/30 dark:to-purple-700 rounded-lg p-6">
                <h3 className="font-bold text-primary mb-4">Creating a Lasting Legacy</h3>
                <p className="text-secondary mb-4">
                  A meaningful memorial goes beyond the service itself. Consider how you want to preserve their memory and continue their impact on the world.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <div className="font-medium text-purple-600 dark:text-purple-400 mb-2">Digital Memorial</div>
                    <p className="text-sm text-secondary">Create an online space for ongoing tributes</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <div className="font-medium text-purple-600 dark:text-purple-400 mb-2">Annual Gathering</div>
                    <p className="text-sm text-secondary">Establish traditions to honor their memory</p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                    <div className="font-medium text-purple-600 dark:text-purple-400 mb-2">Community Impact</div>
                    <p className="text-sm text-secondary">Continue their charitable or community work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'healing' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Grief Support & Healing</h2>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-primary mb-3">Understanding Grief</h3>
                <p className="text-secondary mb-4">
                  Grief is a natural response to loss, and everyone experiences it differently. There is no "right" way to grieve, and healing is not linear. Be patient and compassionate with yourself and others during this journey.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-5 border border-purple-600 dark:border-purple-600">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Healing Practices</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Allow yourself to feel all emotions without judgment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Talk about your loved one and share memories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Join a grief support group or seek counseling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Write letters or journal your thoughts and feelings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Create rituals to honor your loved one</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Take care of your physical health and wellbeing</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-5 border border-purple-600 dark:border-purple-600">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Support Resources</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Professional grief counselors and therapists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Bereavement support groups (in-person and online)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Books and literature on grief and healing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Faith-based or spiritual counseling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Hotlines and crisis support services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Online communities and forums</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Words of Comfort</h3>
                <div className="space-y-4">
                  <blockquote className="border-l-4 border-white/30 pl-4 italic">
                    "What we have once enjoyed we can never lose. All that we love deeply becomes a part of us."
                    <footer className="text-sm text-purple-600 dark:text-purple-400 mt-2">- Helen Keller</footer>
                  </blockquote>
                  <blockquote className="border-l-4 border-white/30 pl-4 italic">
                    "Grief is the price we pay for love."
                    <footer className="text-sm text-purple-600 dark:text-purple-400 mt-2">- Queen Elizabeth II</footer>
                  </blockquote>
                  <blockquote className="border-l-4 border-white/30 pl-4 italic">
                    "The reality is that you will grieve forever. You will not 'get over' the loss of a loved one; you will learn to live with it. You will heal and you will rebuild yourself around the loss you have suffered."
                    <footer className="text-sm text-purple-600 dark:text-purple-400 mt-2">- Elizabeth Kubler-Ross</footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comfort' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Comfort & Support for Grieving Families</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Supporting Others</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Be present and listen without trying to fix</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Offer specific help rather than "let me know if you need anything"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Share memories and stories about the deceased</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Continue support after the funeral is over</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Remember important dates and anniversaries</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Practical Help Ideas</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Prepare and deliver meals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Help with childcare or pet care</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Assist with household tasks and errands</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Organize meal trains or help coordination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Create photo collections or memory books</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-white dark:bg-gray-700 rounded-lg p-6 border border-purple-600 dark:border-purple-600">
                <h3 className="font-bold text-primary mb-4">What to Say (and Not Say)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-purple-600 dark:text-purple-400 font-medium mb-3">Helpful Phrases:</div>
                    <ul className="space-y-2 text-sm text-secondary">
                      <li>"I'm so sorry for your loss"</li>
                      <li>"I'm here for you"</li>
                      <li>"Tell me about [name]"</li>
                      <li>"I remember when [share memory]"</li>
                      <li>"This must be so difficult"</li>
                      <li>"You're in my thoughts"</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-muted font-medium mb-3">Avoid Saying:</div>
                    <ul className="space-y-2 text-sm text-secondary">
                      <li>"They're in a better place"</li>
                      <li>"Everything happens for a reason"</li>
                      <li>"At least they're not suffering"</li>
                      <li>"I know how you feel"</li>
                      <li>"You need to be strong"</li>
                      <li>"Time heals all wounds"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Memorial Planning Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Creating meaningful celebrations of life that honor all traditions and bring healing</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">The Purpose of Memorial Services</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Why We Gather to Remember</h4>
                  <p className="text-secondary mb-3">
                    Memorial services serve multiple important purposes in the healing journey. They provide a structured time and place to acknowledge loss, celebrate a life lived, share grief with others who understand, and begin the process of saying goodbye while finding ways to carry forward the legacy of our loved one.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Acknowledge the Reality:</strong> Gathering helps make the loss real and begins the healing process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Celebrate Life:</strong> Honor the unique journey, personality, and impact of the deceased</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Share Support:</strong> Connect with others who are grieving and provide mutual comfort</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Create Meaning:</strong> Find purpose in loss and envision how to carry forward their legacy</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Planning an Interfaith Memorial</h4>
                  <p className="text-secondary mb-3">
                    In our diverse world, many families navigate multiple faith traditions or secular perspectives. An interfaith memorial can honor all beliefs while creating unity in grief.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Inclusive Planning:</strong> Involve representatives from relevant faith traditions in planning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Universal Themes:</strong> Focus on love, gratitude, hope, and healing that transcend specific beliefs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Multiple Voices:</strong> Include readings, prayers, or reflections from different traditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Respectful Language:</strong> Use inclusive terms that honor diverse perspectives on life and death</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Personal Reflection:</strong> Allow time for silent prayer or meditation where each person can connect in their own way</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Creating a Personalized Celebration of Life</h4>
                  <p className="text-secondary mb-3">
                    The most meaningful memorials reflect the unique personality, passions, and values of the person being remembered.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Their Favorite Music:</strong> Include songs that had special meaning or reflected their personality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Visual Memories:</strong> Create photo displays, video tributes, or memory boards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Meaningful Locations:</strong> Hold the service in a place they loved - a garden, beach, community center, or family home</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Personal Touches:</strong> Display their hobbies, artwork, collections, or achievements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Charitable Focus:</strong> Honor their values through memorial donations to causes they cared about</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Universal Readings & Reflections</h4>
                  <p className="text-secondary mb-4">
                    These timeless words of comfort can be shared at any memorial service:
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">A Traditional Blessing:</p>
                      <p className="text-gray-800 dark:text-gray-200 italic mb-2">
                        "May the road rise up to meet you. May the wind be always at your back. May the sun shine warm upon your face, and rains fall soft upon your fields. And until we meet again, may God hold you in the palm of His hand."
                      </p>
                      <p className="text-sm text-secondary">- Irish Blessing</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">On Remembrance:</p>
                      <p className="text-gray-800 dark:text-gray-200 italic mb-2">
                        "Do not stand at my grave and weep, I am not there, I do not sleep. I am in a thousand winds that blow, I am the softly falling snow... Do not stand at my grave and cry, I am not there. I did not die."
                      </p>
                      <p className="text-sm text-secondary">- Mary Elizabeth Frye</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">On Love and Memory:</p>
                      <p className="text-gray-800 dark:text-gray-200 italic mb-2">
                        "Those we love don't go away, they walk beside us every day. Unseen, unheard, but always near, still loved, still missed, and very dear."
                      </p>
                      <p className="text-sm text-secondary">- Anonymous</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Grief and Healing</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Understanding the Grief Journey</h4>
                  <p className="text-secondary mb-3">
                    Grief is not a problem to solve but a process to navigate. While Dr. Elisabeth Kübler-Ross identified stages of grief (denial, anger, bargaining, depression, acceptance), the reality is that grief is unique to each person and doesn't follow a linear path.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>No Timeline:</strong> There's no "normal" length of time for grieving. Be patient with yourself.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Waves of Emotion:</strong> Grief often comes in waves - you may feel fine one moment and overwhelmed the next.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Physical Symptoms:</strong> Grief can manifest physically through fatigue, changes in appetite, or difficulty sleeping.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Complicated Emotions:</strong> You may feel relief, guilt, anger, or numbness alongside sadness - all are normal.</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Healthy Grief Practices</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Feel Your Feelings:</strong> Don't suppress emotions - allow yourself to cry, be angry, or feel whatever comes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Talk About Them:</strong> Share memories and speak their name - it keeps their presence alive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Create Rituals:</strong> Light candles, visit special places, or establish traditions to honor their memory</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Seek Support:</strong> Join grief groups, talk to a counselor, or lean on understanding friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Care for Yourself:</strong> Maintain basic self-care even when you don't feel like it</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-600/30 dark:to-purple-700 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-3">When to Seek Professional Help</h4>
                  <p className="text-secondary mb-3">
                    While grief is natural, sometimes we need extra support. Consider professional grief counseling if:
                  </p>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li>• You feel unable to carry out daily activities for an extended period</li>
                    <li>• You're experiencing thoughts of self-harm</li>
                    <li>• You're turning to substance abuse to cope</li>
                    <li>• Your grief is getting worse instead of gradually easing</li>
                    <li>• You feel isolated and unable to connect with support systems</li>
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
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Honor Their Wishes</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">If they left specific requests, honor them when possible while also meeting the needs of the grieving.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Include Everyone</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Create space for all who loved them, regardless of faith or background.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Be Kind to Yourself</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Planning a memorial while grieving is difficult. Ask for help and don't expect perfection.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Create Lasting Connection</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">The memorial is just the beginning - find ongoing ways to honor their memory and legacy.</p>
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
