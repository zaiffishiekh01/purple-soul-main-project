import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Star, Book, Clock, Gift, Utensils, Plane, Package, ListChecks, Home, User, MapPin, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import WeddingProductCatalog from './WeddingProductCatalog';
import WeddingRegistry from './WeddingRegistry';

interface JewishWeddingPlannerProps {
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
  category: 'spiritual' | 'venue' | 'attire' | 'guests' | 'ceremony' | 'reception';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function JewishWeddingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: JewishWeddingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'chuppah' | 'packages' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState(120);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(30000);

  // Location filtering state
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Chuppah ceremony planning state
  const [selectedRabbi, setSelectedRabbi] = useState<string | null>(null);
  const [selectedChuppahPackage, setSelectedChuppahPackage] = useState<string | null>(null);
  const [chuppahDecorAddons, setChuppahDecorAddons] = useState<string[]>([]);
  const [chuppahHospitalityAddons, setChuppahHospitalityAddons] = useState<string[]>([]);

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
    { id: '1', text: 'Choose wedding date (avoid Shabbat and holidays)', completed: false, category: 'spiritual' },
    { id: '2', text: 'Book synagogue or wedding venue', completed: false, category: 'venue' },
    { id: '3', text: 'Meet with rabbi for pre-marital guidance', completed: false, category: 'spiritual' },
    { id: '4', text: 'Arrange for Ketubah (marriage contract)', completed: false, category: 'spiritual' },
    { id: '5', text: 'Select witnesses (edim) for ceremony', completed: false, category: 'ceremony' },
    { id: '6', text: 'Order or build chuppah (wedding canopy)', completed: false, category: 'ceremony' },
    { id: '7', text: 'Purchase wedding rings (plain bands)', completed: false, category: 'attire' },
    { id: '8', text: 'Choose wedding attire and kippot', completed: false, category: 'attire' },
    { id: '9', text: 'Plan aufruf (Torah honor before wedding)', completed: false, category: 'spiritual' },
    { id: '10', text: 'Arrange kosher catering', completed: false, category: 'reception' },
    { id: '11', text: 'Book klezmer band or Jewish music', completed: false, category: 'reception' },
    { id: '12', text: 'Prepare for tisch (groom\'s table ceremony)', completed: false, category: 'ceremony' },
    { id: '13', text: 'Arrange badeken (veiling ceremony)', completed: false, category: 'ceremony' },
    { id: '14', text: 'Plan bedeken and yichud room', completed: false, category: 'venue' },
    { id: '15', text: 'Send invitations with Hebrew date', completed: false, category: 'guests' },
  ]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: '12+ Months Before',
      timeframe: '12+ months',
      tasks: ['Get engaged (vort celebration)', 'Set wedding date', 'Book venue', 'Choose rabbi', 'Start guest list'],
      completed: false
    },
    {
      id: '2',
      title: '9-12 Months Before',
      timeframe: '9-12 months',
      tasks: ['Order Ketubah', 'Book kosher caterer', 'Choose wedding party', 'Shop for dress/suit', 'Plan chuppah'],
      completed: false
    },
    {
      id: '3',
      title: '6-9 Months Before',
      timeframe: '6-9 months',
      tasks: ['Order wedding rings', 'Book photographer', 'Book band/DJ', 'Register for gifts', 'Plan aufruf'],
      completed: false
    },
    {
      id: '4',
      title: '3-6 Months Before',
      timeframe: '3-6 months',
      tasks: ['Send invitations', 'Finalize menu', 'Order kippot and bentchers', 'Arrange yichud room', 'Plan tisch'],
      completed: false
    },
    {
      id: '5',
      title: '1-3 Months Before',
      timeframe: '1-3 months',
      tasks: ['Final fittings', 'Confirm all vendors', 'Prepare Ketubah text', 'Finalize seating chart', 'Wedding rehearsal'],
      completed: false
    },
    {
      id: '6',
      title: 'Wedding Week',
      timeframe: '1 week',
      tasks: ['Aufruf at synagogue', 'Fast on wedding day (optional)', 'Prepare for tisch', 'Mikvah (bride)', 'Final preparations'],
      completed: false
    }
  ]);

  const [budgetCategories, setBudgetCategories] = useState([
    { id: 'venue', name: 'Venue & Rental', allocated: 8000, spent: 0, min: 2000, max: 25000 },
    { id: 'catering', name: 'Kosher Catering', allocated: 12000, spent: 0, min: 3000, max: 35000 },
    { id: 'photography', name: 'Photography & Video', allocated: 3500, spent: 0, min: 1000, max: 12000 },
    { id: 'music', name: 'Music & Entertainment', allocated: 2500, spent: 0, min: 500, max: 10000 },
    { id: 'attire', name: 'Attire & Rings', allocated: 2000, spent: 0, min: 500, max: 10000 },
    { id: 'flowers', name: 'Flowers & Chuppah', allocated: 1500, spent: 0, min: 500, max: 8000 },
    { id: 'ketubah', name: 'Ketubah & Judaica', allocated: 300, spent: 0, min: 100, max: 2000 },
    { id: 'misc', name: 'Miscellaneous', allocated: 200, spent: 0, min: 100, max: 3000 }
  ]);

  const updateBudgetAllocation = (id: string, value: number) => {
    setBudgetCategories(categories =>
      categories.map(cat =>
        cat.id === id ? { ...cat, allocated: value } : cat
      )
    );
  };

  const updateBudgetSpent = (id: string, value: number) => {
    setBudgetCategories(categories =>
      categories.map(cat =>
        cat.id === id ? { ...cat, spent: Math.min(value, cat.allocated) } : cat
      )
    );
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const toggleTimeline = (id: string) => {
    setTimeline(timeline.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const selectedProductsTotal = selectedProducts.reduce((sum, id) => sum + 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Jewish Wedding Planner</h1>
          </div>
          <p className="text-purple-50 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-50">Wedding Date</div>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-50">Guest Count</div>
                  <input
                    type="number"
                    min="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-50">Progress</div>
                  <div className="text-2xl font-bold">{completedItems}/{checklist.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-50">Cart Total</div>
                  <div className="text-2xl font-bold">${selectedProductsTotal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-surface shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Heart },
              { id: 'checklist', label: 'Checklist', icon: CheckSquare },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'budget', label: 'Budget', icon: Package },
              { id: 'chuppah', label: 'Chuppah', icon: Star },
              { id: 'packages', label: 'Tour Packages', icon: Plane },
              { id: 'registry', label: 'Registry', icon: ListChecks },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Jewish Guide', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
                    : 'text-muted hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-8 h-8 text-accent" />
                <h2 className="text-2xl font-bold text-primary">Jewish Wedding Overview</h2>
              </div>
              <p className="text-secondary mb-6">
                Plan your sacred union according to Jewish tradition. This planner helps you organize every aspect of your wedding ceremony and celebration, from the Ketubah signing to breaking the glass.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Book className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Ketubah</h3>
                  <p className="text-sm text-secondary">Jewish marriage contract outlining mutual responsibilities and commitments</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Home className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Chuppah</h3>
                  <p className="text-sm text-secondary">Wedding canopy symbolizing the couple's new home together</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Simcha</h3>
                  <p className="text-sm text-secondary">Joyful celebration with family, music, dancing, and festive meal</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary">Checklist Progress</h3>
                  <CheckSquare className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">{Math.round((completedItems / checklist.length) * 100)}%</div>
                <p className="text-sm text-secondary">{completedItems} of {checklist.length} tasks completed</p>
              </div>

              <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary">Budget Status</h3>
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">${budget.toLocaleString()}</div>
                <p className="text-sm text-secondary">Total planned budget</p>
              </div>

              <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary">Guest Count</h3>
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">{guestCount}</div>
                <p className="text-sm text-secondary">Expected attendees</p>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Wedding Checklist</h2>

            {['spiritual', 'venue', 'attire', 'ceremony', 'reception', 'guests'].map(category => {
              const categoryItems = checklist.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              return (
                <div key={category} className="bg-surface rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-primary mb-4 capitalize">{category}</h3>
                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-purple-600 mt-0.5"
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-muted' : 'text-secondary'}`}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Wedding Timeline</h2>

            {timeline.map((event, index) => (
              <div key={event.id} className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      event.completed ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-surface-elevated text-secondary'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                      <button
                        onClick={() => toggleTimeline(event.id)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          event.completed
                            ? 'bg-indigo-100 text-accent dark:bg-indigo-900/30'
                            : 'bg-gray-100 text-gray-600 dark:bg-surface-elevated dark:text-muted'
                        }`}
                      >
                        {event.completed ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                    <p className="text-sm text-accent dark:text-indigo-400 mb-4">{event.timeframe}</p>
                    <ul className="space-y-2">
                      {event.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-secondary">
                          <CheckSquare className="w-4 h-4 text-accent" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Budget Planner</h2>
              <div className="text-right">
                <div className="text-sm text-secondary">Total Allocated</div>
                <div className="text-2xl font-bold text-accent">
                  ${budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="space-y-8">
                {budgetCategories.map((category) => (
                  <div key={category.id} className="border-b border-default pb-6 last:border-0">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg text-primary">{category.name}</span>
                        <span className="text-accent font-bold text-lg">${category.allocated.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-secondary">
                        Allocated: ${category.allocated.toLocaleString()}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-secondary">
                          Budget Allocation
                        </label>
                        <span className="text-sm text-secondary">
                          ${category.min.toLocaleString()} — ${category.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min={category.min}
                          max={category.max}
                          step={50}
                          value={category.allocated}
                          onChange={(e) => updateBudgetAllocation(category.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          style={{
                            background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) 100%)`
                          }}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-sm font-medium text-secondary mb-2 block">
                        Amount Spent
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                          <input
                            type="number"
                            min="0"
                            max={category.allocated}
                            value={category.spent}
                            onChange={(e) => updateBudgetSpent(category.id, parseInt(e.target.value) || 0)}
                            className="w-full pl-8 pr-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-surface-elevated text-primary"
                          />
                        </div>
                        <div className="text-sm text-secondary whitespace-nowrap">
                          of ${category.allocated.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="w-full bg-gray-200 dark:bg-surface-elevated rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(category.spent / category.allocated) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-secondary">Spent: </span>
                        <span className="font-semibold text-primary">${category.spent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-secondary">Remaining: </span>
                        <span className="font-semibold text-accent dark:text-green-400">
                          ${(category.allocated - category.spent).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-default">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-secondary mb-1">Total Budget</div>
                    <div className="text-2xl font-bold text-accent">
                      ${budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-secondary mb-1">Total Spent</div>
                    <div className="text-2xl font-bold text-accent">
                      ${budgetCategories.reduce((sum, cat) => sum + cat.spent, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-secondary mb-1">Total Remaining</div>
                    <div className="text-2xl font-bold text-accent">
                      ${budgetCategories.reduce((sum, cat) => sum + (cat.allocated - cat.spent), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chuppah Tab */}
        {activeTab === 'chuppah' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary">Chuppah Ceremony Planning</h2>
                <p className="text-secondary mt-1">Plan your sacred Jewish wedding with traditional customs and modern elegance</p>
              </div>
            </div>

            {/* Location Filters */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-primary">Filter by Location</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-surface-elevated dark:text-white"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">State/Province</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={!selectedCountry}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-surface-elevated dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-surface-elevated dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Rabbi / Officiant Booking Section */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Book Your Rabbi / Officiant</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 'rabbi-1',
                    name: 'Rabbi David Goldstein',
                    denomination: 'Conservative',
                    location: 'New York, NY',
                    experience: '22+ years',
                    languages: 'Hebrew, English, Yiddish',
                    rating: 5.0,
                    reviews: 189,
                    price: 800,
                    specialties: ['Traditional Ceremonies', 'Ketubah Counseling', 'Interfaith Guidance']
                  },
                  {
                    id: 'rabbi-2',
                    name: 'Rabbi Sarah Levine',
                    denomination: 'Reform',
                    location: 'Los Angeles, CA',
                    experience: '15+ years',
                    languages: 'Hebrew, English',
                    rating: 4.9,
                    reviews: 142,
                    price: 750,
                    specialties: ['Modern Ceremonies', 'LGBTQ+ Weddings', 'Personalized Rituals']
                  },
                  {
                    id: 'rabbi-3',
                    name: 'Rabbi Moshe Cohen',
                    denomination: 'Orthodox',
                    location: 'Chicago, IL',
                    experience: '30+ years',
                    languages: 'Hebrew, English, Aramaic',
                    rating: 4.8,
                    reviews: 267,
                    price: 900,
                    specialties: ['Orthodox Traditions', 'Halachic Guidance', 'Torah Wisdom']
                  }
                ].map((rabbi) => (
                  <div
                    key={rabbi.id}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedRabbi === rabbi.id
                        ? 'border-indigo-600 bg-purple-100 dark:bg-purple-900/20'
                        : 'border-default hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedRabbi(rabbi.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-primary">{rabbi.name}</h4>
                        <p className="text-sm text-accent dark:text-indigo-400 font-semibold">{rabbi.denomination}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted" />
                          <p className="text-sm text-secondary">{rabbi.location}</p>
                        </div>
                      </div>
                      {selectedRabbi === rabbi.id && (
                        <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-primary">{rabbi.rating}</span>
                      <span className="text-sm text-secondary">({rabbi.reviews} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted" />
                        <span className="text-secondary">{rabbi.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Book className="w-4 h-4 text-muted" />
                        <span className="text-secondary">{rabbi.languages}</span>
                      </div>
                    </div>

                    <div className="border-t border-default pt-3 mb-3">
                      <p className="text-xs text-secondary mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {rabbi.specialties.map((specialty, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-surface-elevated text-secondary px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-default">
                      <div className="text-2xl font-bold text-accent">${rabbi.price}</div>
                      <button className="text-sm text-accent hover:text-indigo-700 font-semibold">View Profile</button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedRabbi && (
                <div className="mt-6 bg-purple-100 dark:bg-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-primary">Rabbi Selected</p>
                      <p className="text-sm text-secondary mt-1">Payment will be processed after consultation. A $200 deposit is required to confirm booking.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chuppah Ceremony Package Options */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Chuppah Ceremony Package Options</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'basic',
                    name: 'Essential Chuppah',
                    price: 1500,
                    description: 'Traditional Jewish ceremony',
                    features: [
                      'Rabbi services',
                      'Traditional tallit chuppah',
                      'Basic Ketubah preparation',
                      'Two witnesses coordination',
                      'Simple ceremony setup',
                      'Marriage certificate'
                    ],
                    popular: false
                  },
                  {
                    id: 'premium',
                    name: 'Premium Chuppah',
                    price: 3000,
                    description: 'Enhanced ceremony experience',
                    features: [
                      'Everything in Essential',
                      'Custom designed chuppah',
                      'Artistic Ketubah commission',
                      'Yichud room setup',
                      'Tisch & bedeken coordination',
                      'Klezmer musicians',
                      'Photography (3 hours)',
                      'Kosher wine & kiddush cup'
                    ],
                    popular: true
                  },
                  {
                    id: 'luxury',
                    name: 'Grand Celebration',
                    price: 5500,
                    description: 'Complete luxury experience',
                    features: [
                      'Everything in Premium',
                      'Luxury floral chuppah design',
                      'Museum-quality Ketubah',
                      'Full klezmer band',
                      'Professional hora coordination',
                      'Full-day photography & videography',
                      'Kosher catering setup',
                      'Custom kippot & bentchers',
                      'Wedding coordinator',
                      'Guest welcome gifts'
                    ],
                    popular: false
                  }
                ].map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedChuppahPackage === pkg.id
                        ? 'border-indigo-600 bg-purple-100 dark:bg-purple-900/20 shadow-lg'
                        : 'border-default hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedChuppahPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-primary mb-1">{pkg.name}</h4>
                      <p className="text-sm text-secondary">{pkg.description}</p>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-accent">${pkg.price}</div>
                      <p className="text-sm text-muted dark:text-muted mt-1">one-time payment</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        selectedChuppahPackage === pkg.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-surface-elevated text-primary hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                      }`}
                    >
                      {selectedChuppahPackage === pkg.id ? 'Selected' : 'Select Package'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ceremony Planning Checklist */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <ListChecks className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Ceremony Planning Checklist</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    category: 'Pre-Ceremony (1-2 weeks before)',
                    items: [
                      'Confirm rabbi booking and ceremony time',
                      'Finalize Ketubah text and artwork',
                      'Select and prepare two witnesses (Edim)',
                      'Arrange tisch and bedeken ceremonies',
                      'Confirm chuppah design and setup',
                      'Schedule aufruf at synagogue'
                    ]
                  },
                  {
                    category: 'Ceremony Day',
                    items: [
                      'Fast until after ceremony (optional tradition)',
                      'Bride completes mikvah (if observant)',
                      'Setup yichud room privately',
                      'Groom at tisch signing Ketubah',
                      'Bedeken (veiling ceremony)',
                      'Processional to chuppah'
                    ]
                  },
                  {
                    category: 'Required Items',
                    items: [
                      'Marriage license',
                      'Plain gold wedding bands (no stones)',
                      'Ketubah (marriage contract)',
                      'Wine & kiddush cup for blessings',
                      'Glass to break (wrapped)',
                      'Tallit for chuppah canopy'
                    ]
                  },
                  {
                    category: 'Post-Ceremony',
                    items: [
                      'Yichud (private time for couple)',
                      'Reception & hora dancing',
                      'Sheva Brachot meals (7 days)',
                      'Frame and display Ketubah',
                      'Register marriage certificate',
                      'Send thank you notes'
                    ]
                  }
                ].map((section, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5">
                    <h4 className="font-bold text-primary mb-4">{section.category}</h4>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-purple-600 mt-0.5"
                          />
                          <span className="text-sm text-secondary">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Items */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckSquare className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Required Items for Chuppah Ceremony</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    category: 'Documentation',
                    icon: Book,
                    items: [
                      'Marriage license',
                      'Valid IDs (bride & groom)',
                      'Ketubah (marriage contract)',
                      'Witness identification',
                      'Rabbi\'s certification'
                    ]
                  },
                  {
                    category: 'Ceremony Essentials',
                    icon: Star,
                    items: [
                      'Chuppah (wedding canopy)',
                      'Plain gold wedding rings',
                      'Wine & kiddush cup',
                      'Glass to break',
                      'Tallit (prayer shawl)',
                      'Kippot for guests'
                    ]
                  },
                  {
                    category: 'Optional Ceremonial',
                    icon: Heart,
                    items: [
                      'Artistic Ketubah frame',
                      'Personalized kiddush cup',
                      'Family heirloom tallit',
                      'Bentchers (grace booklets)',
                      'Yichud room refreshments'
                    ]
                  }
                ].map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="w-6 h-6 text-accent" />
                        <h4 className="font-bold text-primary">{section.category}</h4>
                      </div>
                      <ul className="space-y-2">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-sm">
                            <span className="text-accent mt-0.5">•</span>
                            <span className="text-secondary">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Decor & Hospitality Add-ons */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Optional Decor & Hospitality Add-ons</h3>
              </div>

              <div className="space-y-6">
                {/* Decor Add-ons */}
                <div>
                  <h4 className="font-bold text-lg text-primary mb-4">Decoration Enhancements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: 'decor-chuppah', name: 'Luxury Floral Chuppah', price: 800 },
                      { id: 'decor-backdrop', name: 'Custom Photo Backdrop', price: 400 },
                      { id: 'decor-lighting', name: 'Ambient String Lighting', price: 350 },
                      { id: 'decor-centerpiece', name: 'Table Centerpieces', price: 300 },
                      { id: 'decor-aisle', name: 'Flower Petal Aisle', price: 250 },
                      { id: 'decor-signage', name: 'Custom Hebrew Signage', price: 200 }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          chuppahDecorAddons.includes(addon.id)
                            ? 'border-indigo-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-default hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={chuppahDecorAddons.includes(addon.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setChuppahDecorAddons([...chuppahDecorAddons, addon.id]);
                              } else {
                                setChuppahDecorAddons(chuppahDecorAddons.filter(id => id !== addon.id));
                              }
                            }}
                            className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-purple-600"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-primary text-sm">{addon.name}</p>
                            <p className="text-accent font-bold text-sm">${addon.price}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hospitality Add-ons */}
                <div>
                  <h4 className="font-bold text-lg text-primary mb-4">Hospitality Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: 'hosp-kiddush', name: 'Kiddush Luncheon', price: 1200, guests: '100 guests' },
                      { id: 'hosp-wine', name: 'Premium Kosher Wine Selection', price: 400, guests: '75 guests' },
                      { id: 'hosp-challah', name: 'Artisan Challah Service', price: 250, guests: '100 guests' },
                      { id: 'hosp-appetizers', name: 'Kosher Appetizer Station', price: 600, guests: '100 guests' },
                      { id: 'hosp-dessert', name: 'Dessert & Pastry Table', price: 500, guests: '80 guests' },
                      { id: 'hosp-staff', name: 'Kosher Catering Staff', price: 450, guests: '4 hours' }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          chuppahHospitalityAddons.includes(addon.id)
                            ? 'border-indigo-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-default hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={chuppahHospitalityAddons.includes(addon.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setChuppahHospitalityAddons([...chuppahHospitalityAddons, addon.id]);
                              } else {
                                setChuppahHospitalityAddons(chuppahHospitalityAddons.filter(id => id !== addon.id));
                              }
                            }}
                            className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-purple-600"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-primary text-sm">{addon.name}</p>
                            <p className="text-xs text-secondary">{addon.guests}</p>
                            <p className="text-accent font-bold text-sm">${addon.price}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            {(selectedRabbi || selectedChuppahPackage || chuppahDecorAddons.length > 0 || chuppahHospitalityAddons.length > 0) && (
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Payment Summary</h3>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-5 space-y-3">
                  {selectedRabbi && (
                    <div className="flex justify-between items-center">
                      <span>Rabbi Services</span>
                      <span className="font-bold">$800</span>
                    </div>
                  )}
                  {selectedChuppahPackage && (
                    <div className="flex justify-between items-center">
                      <span>
                        {selectedChuppahPackage === 'basic' && 'Essential Chuppah Package'}
                        {selectedChuppahPackage === 'premium' && 'Premium Chuppah Package'}
                        {selectedChuppahPackage === 'luxury' && 'Grand Celebration Package'}
                      </span>
                      <span className="font-bold">
                        ${selectedChuppahPackage === 'basic' ? 1500 : selectedChuppahPackage === 'premium' ? 3000 : 5500}
                      </span>
                    </div>
                  )}
                  {chuppahDecorAddons.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Decor Add-ons ({chuppahDecorAddons.length})</span>
                      <span className="font-bold">$XXX</span>
                    </div>
                  )}
                  {chuppahHospitalityAddons.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Hospitality Add-ons ({chuppahHospitalityAddons.length})</span>
                      <span className="font-bold">$XXX</span>
                    </div>
                  )}

                  <div className="border-t border-white/30 pt-3 mt-3">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold">Total Estimate</span>
                      <span className="font-bold text-2xl">$XXXX</span>
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">*Final amount subject to customization and availability</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button className="w-full bg-white text-accent py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
                    Proceed to Payment
                  </button>
                  <p className="text-center text-sm text-white/90">
                    <span className="font-semibold">Payment Options:</span> Full payment, 50% deposit, or monthly installments available
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tour Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Honeymoon & Travel Packages</h2>

            {/* Location Filters */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-primary">Filter by Location</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-surface-elevated dark:text-white"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">State/Province</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={!selectedCountry}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-surface-elevated dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-surface-elevated dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Plane className="w-8 h-8 text-accent" />
                <div>
                  <h3 className="text-xl font-bold text-primary">Jewish Heritage Travel</h3>
                  <p className="text-secondary">Kosher-friendly honeymoon destinations and heritage tours</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Israel Experience</h4>
                  <p className="text-sm text-secondary mb-4">Explore the Holy Land and Jewish heritage sites</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $5,000</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 10 days / 9 nights</li>
                    <li>• Jerusalem, Tel Aviv, Galilee</li>
                    <li>• Western Wall, Masada, Dead Sea</li>
                    <li>• Kosher dining throughout</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">European Heritage</h4>
                  <p className="text-sm text-secondary mb-4">Discover Jewish history in Prague, Vienna, Budapest</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $4,200</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 8 days / 7 nights</li>
                    <li>• Historic synagogues</li>
                    <li>• Jewish quarter tours</li>
                    <li>• Kosher restaurants available</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Spain & Portugal</h4>
                  <p className="text-sm text-secondary mb-4">Sephardic heritage and Mediterranean romance</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $3,800</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 7 days / 6 nights</li>
                    <li>• Barcelona, Madrid, Lisbon</li>
                    <li>• Historic Jewish quarters</li>
                    <li>• Luxury accommodations</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registry Tab */}
        {activeTab === 'registry' && (
          <WeddingRegistry
            availableProducts={mockProducts}
            onAddToCart={onAddToCart}
            viewMode="browse"
          />
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">My Wishlist</h2>

            <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
              <Heart className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">Save Your Favorite Items</h3>
              <p className="text-secondary mb-6 max-w-2xl mx-auto">
                Keep track of products you love. Add items to your wishlist while browsing and come back to them later.
              </p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Browse Products
              </button>
            </div>

            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {wishlist.map((itemId) => (
                  <div key={itemId} className="bg-surface rounded-xl shadow-lg p-4">
                    <div className="text-center text-secondary">
                      Wishlist item {itemId}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted dark:text-muted py-8">
                Your wishlist is empty. Start browsing to add items!
              </div>
            )}
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <WeddingProductCatalog
              products={mockProducts}
              onAddToCart={onAddToCart}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
              onViewProduct={onViewProduct}
              onQuickView={onQuickView}
            />
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Jewish Wedding Guide</h2>
              <p className="text-indigo-50">Plan a meaningful Jewish wedding honoring tradition, family, and sacred covenant</p>
            </div>

            {/* Planning Timeline */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Wedding Planning Timeline</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-indigo-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">6-12 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Choose date (avoid Shabbat, High Holidays, Three Weeks, Sefirat HaOmer)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Book rabbi/cantor and ceremony venue (synagogue or event space)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Reserve reception venue with kosher catering (if observing)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Commission or purchase Ketubah (marriage contract)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Begin searching for wedding attire and ring</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-indigo-500 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">3-6 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Order wedding dress (with modesty requirements if Orthodox)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Arrange music/band for ceremony and reception</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Send save-the-date cards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Plan Aufruf (Torah honor) for Shabbat before wedding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Choose witnesses and assign honor roles</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-indigo-400 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">1-2 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Mail wedding invitations (6-8 weeks before)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Finalize Ketubah text and arrangements with rabbi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Arrange chuppah rental or construction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Plan Shabbat Kallah (bride's pre-wedding celebration)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Bride visits mikvah (ritual bath) if observant</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-indigo-300 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">1 Week Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Finalize seating chart (separate seating if Orthodox)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Confirm glass for breaking ceremony</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prepare for wedding day fast (if observing custom)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Arrange yichud room with refreshments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ceremony Details */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">The Jewish Wedding Ceremony</h3>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5 mb-6">
                <p className="text-secondary">
                  A Jewish wedding (Kiddushin) is a sacred covenant that sanctifies the relationship between bride and groom through ancient rituals rich in symbolism. The ceremony brings together family, community, and God in celebrating this holy union.
                </p>
              </div>

              <h4 className="font-bold text-lg text-primary mb-4">Ceremony Flow:</h4>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div className="flex-1">
                    <strong className="text-primary">Kabbalat Panim (Receiving the Guests)</strong>
                    <p className="text-secondary text-sm">Bride and groom greet guests separately before ceremony. Bride sits like a queen (Shabbat Kallah) while groom holds Tisch (groom's table) with singing and Torah study.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div className="flex-1">
                    <strong className="text-primary">Bedeken (Veiling)</strong>
                    <p className="text-secondary text-sm">Groom, accompanied by family and friends, approaches bride and lowers veil over her face, recalling Rebecca and Isaac's meeting.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div className="flex-1">
                    <strong className="text-primary">Processional to Chuppah</strong>
                    <p className="text-secondary text-sm">Groom escorted by both parents, then bride escorted by both parents. Bride circles groom 3 or 7 times under the chuppah (varies by custom).</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                  <div className="flex-1">
                    <strong className="text-primary">Birkat Erusin (Betrothal Blessings)</strong>
                    <p className="text-secondary text-sm">First blessing over wine, followed by blessing of betrothal. Couple drinks from cup.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
                  <div className="flex-1">
                    <strong className="text-primary">Ring Exchange</strong>
                    <p className="text-secondary text-sm">Groom places plain gold ring on bride's right index finger saying "Harei at mekudeshet li..." (Behold, you are consecrated to me...)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">6</span>
                  <div className="flex-1">
                    <strong className="text-primary">Ketubah Reading</strong>
                    <p className="text-secondary text-sm">Marriage contract read aloud in Aramaic, detailing groom's obligations. Given to bride for safekeeping.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">7</span>
                  <div className="flex-1">
                    <strong className="text-primary">Sheva Brachot (Seven Blessings)</strong>
                    <p className="text-secondary text-sm">Seven wedding blessings chanted over second cup of wine, often by honored guests or rabbi.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">8</span>
                  <div className="flex-1">
                    <strong className="text-primary">Breaking the Glass</strong>
                    <p className="text-secondary text-sm">Groom stomps on glass (wrapped in cloth), remembering destruction of Jerusalem. Guests shout "Mazel Tov!"</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">9</span>
                  <div className="flex-1">
                    <strong className="text-primary">Yichud (Seclusion)</strong>
                    <p className="text-secondary text-sm">Couple spends 8-20 minutes alone in private room, breaking their fast together if observed. First moments as married couple.</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Reception Traditions */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Reception Traditions & Customs</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-indigo-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Hora Dancing</h4>
                    <p className="text-sm text-secondary">Traditional circle dance with bride and groom lifted on chairs, connected by handkerchief or cloth. Hava Nagila typically played.</p>
                  </div>
                  <div className="border-l-4 border-indigo-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Sheva Brachot Meals</h4>
                    <p className="text-sm text-secondary">Seven days of festive meals following wedding where seven blessings are recited. Hosted by family and friends.</p>
                  </div>
                  <div className="border-l-4 border-indigo-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Kosher Catering</h4>
                    <p className="text-sm text-secondary">If observing kashrut, ensure all food is certified kosher. No mixing meat and dairy. Mashgiach may supervise preparation.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-indigo-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Mechitzah (Partition)</h4>
                    <p className="text-sm text-secondary">Orthodox weddings may have separate dancing areas for men and women with partition or separate rooms.</p>
                  </div>
                  <div className="border-l-4 border-indigo-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Mitzvah Tantz</h4>
                    <p className="text-sm text-secondary">In some communities, special dance where relatives dance with bride (holding gartel or handkerchief to maintain modesty).</p>
                  </div>
                  <div className="border-l-4 border-indigo-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Birkat Hamazon</h4>
                    <p className="text-sm text-secondary">Grace after meals with special additions for weddings. Often led by honored guest with bentchers provided.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Considerations */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Important Considerations</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-primary">Halakhic Requirements</h4>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Two kosher witnesses required (not related to couple)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Ring must be plain gold band (no stones)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Ketubah must be properly written and signed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Chuppah must have open sides (roof over, walls open)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Bride immersed in mikvah before wedding (Orthodox)</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-primary">Restricted Dates</h4>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>No weddings on Shabbat or major holidays</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Three Weeks (17th Tammuz - 9th Av) avoided</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Sefirat HaOmer period (Passover to Shavuot) restricted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Consult rabbi for acceptable dates in your community</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Common Mistakes to Avoid</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Wrong Ring Type</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Halakhically, ring must be plain gold band without gems or engravings for ceremony.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Unqualified Witnesses</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Witnesses must be Shabbat-observant Jewish males, unrelated to bride or groom.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Scheduling Conflicts</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Check Jewish calendar carefully - many restricted dates throughout year.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Non-Kosher Catering</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">If keeping kosher, verify certification and supervision. Don't assume venue's "kosher" claims.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Forgetting Yichud Room</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Essential part of ceremony. Must have private room with food for breaking fast.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Incomplete Ketubah</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Ensure all details correct: names, date, location. Have rabbi review before ceremony.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Best Practices</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Consult Rabbi Early</h4>
                      <p className="text-sm text-secondary">Meet with rabbi 6-12 months ahead for guidance on requirements and customs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Learn Together</h4>
                      <p className="text-sm text-secondary">Study Jewish marriage laws and customs as a couple before the wedding.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Honor Family Customs</h4>
                      <p className="text-sm text-secondary">Discuss both families' traditions and find ways to incorporate meaningful customs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Beautiful Ketubah</h4>
                      <p className="text-sm text-secondary">Choose or commission artistic Ketubah that reflects your style - it's displayed in home.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Budget with Mitzvah in Mind</h4>
                      <p className="text-sm text-secondary">Balance celebration with tzedakah (charity). Consider donating to worthy causes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Rehearse Ceremony</h4>
                      <p className="text-sm text-secondary">Walk through ceremony logistics with rabbi. Practice Hebrew phrases if needed.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Meaningful Honors</h4>
                      <p className="text-sm text-secondary">Assign chuppah holders, Sheva Brachot readers thoughtfully to honor loved ones.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Verify Kosher Standards</h4>
                      <p className="text-sm text-secondary">If keeping kosher, research caterer's certification and supervision level thoroughly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Helpful Resources</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Pre-Wedding Preparation</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Kallah (bridal) classes</li>
                    <li>• Family purity laws education</li>
                    <li>• Jewish marriage books</li>
                    <li>• Rabbinic counseling</li>
                  </ul>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Ketubah Artists</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Custom illustrated ketubot</li>
                    <li>• Traditional calligraphy</li>
                    <li>• Modern artistic styles</li>
                    <li>• Personalized texts</li>
                  </ul>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Jewish Music</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Klezmer bands</li>
                    <li>• Traditional chazzanut</li>
                    <li>• Contemporary Jewish music</li>
                    <li>• Israeli folk dancing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* After Wedding */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">After the Wedding</h3>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-indigo-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-2">Sheva Brachot Week</h4>
                  <p className="text-secondary text-sm mb-3">Seven days of celebratory meals where seven blessings are recited. Hosts should invite new faces each meal.</p>
                  <ul className="space-y-1 text-sm text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Attend meals hosted by family and friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Ensure minyan (10 men) present for blessings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Bring joy and celebrate your new marriage</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-indigo-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-2">Building a Jewish Home</h4>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Establish Shabbat and holiday observance together</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Maintain family purity laws (if observant)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Continue Jewish learning and growth as couple</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Join synagogue and participate in community</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
