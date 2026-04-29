import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Church, Book, Clock, Gift, Utensils, Plane, Package, Cross, ListChecks, User, MapPin, Star, Phone, Mail, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import WeddingProductCatalog from './WeddingProductCatalog';
import WeddingRegistry from './WeddingRegistry';

interface ChristianWeddingPlannerProps {
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
  category: 'spiritual' | 'venue' | 'attire' | 'guests' | 'reception' | 'legal';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function ChristianWeddingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: ChristianWeddingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'ceremony' | 'packages' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState(150);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(25000);

  // Location filtering state
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Ceremony planning state
  const [selectedOfficiant, setSelectedOfficiant] = useState<string | null>(null);
  const [selectedCeremonyPackage, setSelectedCeremonyPackage] = useState<string | null>(null);
  const [ceremonyDecorAddons, setCeremonyDecorAddons] = useState<string[]>([]);
  const [ceremonyHospitalityAddons, setCeremonyHospitalityAddons] = useState<string[]>([]);

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
    { id: '1', text: 'Choose wedding date and time', completed: false, category: 'spiritual' },
    { id: '2', text: 'Book church for ceremony', completed: false, category: 'venue' },
    { id: '3', text: 'Meet with pastor/priest for pre-marital counseling', completed: false, category: 'spiritual' },
    { id: '4', text: 'Obtain marriage license', completed: false, category: 'legal' },
    { id: '5', text: 'Select wedding party (bridesmaids, groomsmen)', completed: false, category: 'guests' },
    { id: '6', text: 'Book reception venue', completed: false, category: 'venue' },
    { id: '7', text: 'Choose wedding dress and suits', completed: false, category: 'attire' },
    { id: '8', text: 'Select wedding rings', completed: false, category: 'attire' },
    { id: '9', text: 'Arrange florist for bouquets and decorations', completed: false, category: 'reception' },
    { id: '10', text: 'Book photographer and videographer', completed: false, category: 'reception' },
    { id: '11', text: 'Choose and book DJ or band', completed: false, category: 'reception' },
    { id: '12', text: 'Plan ceremony music (processional, recessional)', completed: false, category: 'spiritual' },
    { id: '13', text: 'Select readings and vows', completed: false, category: 'spiritual' },
    { id: '14', text: 'Order wedding cake', completed: false, category: 'reception' },
    { id: '15', text: 'Send invitations', completed: false, category: 'guests' },
  ]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: '12+ Months Before',
      timeframe: '12+ months',
      tasks: ['Get engaged', 'Set budget', 'Choose wedding date', 'Book church', 'Book reception venue'],
      completed: false
    },
    {
      id: '2',
      title: '9-12 Months Before',
      timeframe: '9-12 months',
      tasks: ['Start pre-marital counseling', 'Choose wedding party', 'Book vendors', 'Shop for dress', 'Create guest list'],
      completed: false
    },
    {
      id: '3',
      title: '6-9 Months Before',
      timeframe: '6-9 months',
      tasks: ['Order wedding dress', 'Book florist', 'Book photographer', 'Plan honeymoon', 'Register for gifts'],
      completed: false
    },
    {
      id: '4',
      title: '3-6 Months Before',
      timeframe: '3-6 months',
      tasks: ['Send invitations', 'Order cake', 'Plan ceremony details', 'Book DJ/band', 'Finalize menu'],
      completed: false
    },
    {
      id: '5',
      title: '1-3 Months Before',
      timeframe: '1-3 months',
      tasks: ['Dress fittings', 'Ceremony rehearsal', 'Obtain marriage license', 'Confirm all vendors', 'Finalize seating'],
      completed: false
    },
    {
      id: '6',
      title: 'Wedding Week',
      timeframe: '1 week',
      tasks: ['Final dress fitting', 'Rehearsal dinner', 'Confirm final details', 'Pack for honeymoon', 'Relax and pray'],
      completed: false
    }
  ]);

  const [budgetCategories, setBudgetCategories] = useState([
    { id: 'venue', name: 'Venue & Catering', allocated: 10000, spent: 0, min: 2000, max: 30000 },
    { id: 'attire', name: 'Attire & Rings', allocated: 4000, spent: 0, min: 1000, max: 15000 },
    { id: 'photography', name: 'Photography & Video', allocated: 3000, spent: 0, min: 500, max: 10000 },
    { id: 'flowers', name: 'Flowers & Decorations', allocated: 2500, spent: 0, min: 500, max: 8000 },
    { id: 'music', name: 'Music & Entertainment', allocated: 2000, spent: 0, min: 500, max: 8000 },
    { id: 'cake', name: 'Cake & Desserts', allocated: 1500, spent: 0, min: 300, max: 5000 },
    { id: 'invitations', name: 'Invitations & Stationery', allocated: 800, spent: 0, min: 200, max: 3000 },
    { id: 'misc', name: 'Miscellaneous', allocated: 1200, spent: 0, min: 200, max: 5000 }
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
    <div className="min-h-screen bg-gradient-to-br bg-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Christian Wedding Planner</h1>
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
              { id: 'ceremony', label: 'Church Wedding', icon: Church },
              { id: 'packages', label: 'Tour Packages', icon: Plane },
              { id: 'registry', label: 'Registry', icon: ListChecks },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Christian Guide', icon: Book }
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
                <Church className="w-8 h-8 text-accent" />
                <h2 className="text-2xl font-bold text-primary">Christian Wedding Overview</h2>
              </div>
              <p className="text-secondary mb-6">
                Plan your sacred union in Christ. This planner helps you organize every aspect of your church ceremony and reception while honoring Christian traditions and celebrating your commitment before God.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Church className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Church Ceremony</h3>
                  <p className="text-sm text-secondary">Sacred vows before God, family, and friends in a blessed church setting</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Cross className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Christian Vows</h3>
                  <p className="text-sm text-secondary">Traditional or personal vows expressing lifelong commitment in faith</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Blessed Reception</h3>
                  <p className="text-sm text-secondary">Joyful celebration with loved ones following the ceremony</p>
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

            {['spiritual', 'venue', 'attire', 'guests', 'reception', 'legal'].map(category => {
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
                            ? 'bg-blue-100 text-accent dark:bg-blue-900/30'
                            : 'bg-gray-100 text-gray-600 dark:bg-surface-elevated dark:text-muted'
                        }`}
                      >
                        {event.completed ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                    <p className="text-sm text-accent dark:text-blue-400 mb-4">{event.timeframe}</p>
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
                          className="w-full h-2 bg-gray-200 dark:bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-blue-600"
                          style={{
                            background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) 100%)`
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

        {/* Church Wedding Tab */}
        {activeTab === 'ceremony' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary">Church Wedding Planning</h2>
                <p className="text-secondary mt-1">Plan your sacred ceremony with our comprehensive church wedding services</p>
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

            {/* Pastor / Officiant Booking Section */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Book Your Pastor / Officiant</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 'pastor-1',
                    name: 'Rev. Michael Thompson',
                    denomination: 'Non-denominational',
                    location: 'New York, NY',
                    experience: '18+ years',
                    languages: 'English, Spanish',
                    rating: 4.9,
                    reviews: 156,
                    price: 600,
                    specialties: ['Traditional Ceremonies', 'Pre-marital Counseling', 'Interfaith Weddings']
                  },
                  {
                    id: 'pastor-2',
                    name: 'Father James O\'Connor',
                    denomination: 'Catholic',
                    location: 'Boston, MA',
                    experience: '25+ years',
                    languages: 'English, Latin',
                    rating: 5.0,
                    reviews: 234,
                    price: 700,
                    specialties: ['Catholic Mass', 'Nuptial Blessings', 'Sacramental Preparation']
                  },
                  {
                    id: 'pastor-3',
                    name: 'Pastor Sarah Williams',
                    denomination: 'Baptist',
                    location: 'Atlanta, GA',
                    experience: '12+ years',
                    languages: 'English',
                    rating: 4.8,
                    reviews: 98,
                    price: 550,
                    specialties: ['Contemporary Ceremonies', 'Personalized Vows', 'Family Ministry']
                  }
                ].map((pastor) => (
                  <div
                    key={pastor.id}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedOfficiant === pastor.id
                        ? 'border-blue-600 bg-purple-100 dark:bg-purple-900/20'
                        : 'border-default hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedOfficiant(pastor.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-primary">{pastor.name}</h4>
                        <p className="text-sm text-accent dark:text-blue-400 font-semibold">{pastor.denomination}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted" />
                          <p className="text-sm text-secondary">{pastor.location}</p>
                        </div>
                      </div>
                      {selectedOfficiant === pastor.id && (
                        <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-primary">{pastor.rating}</span>
                      <span className="text-sm text-secondary">({pastor.reviews} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted" />
                        <span className="text-secondary">{pastor.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Book className="w-4 h-4 text-muted" />
                        <span className="text-secondary">{pastor.languages}</span>
                      </div>
                    </div>

                    <div className="border-t border-default pt-3 mb-3">
                      <p className="text-xs text-secondary mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {pastor.specialties.map((specialty, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-surface-elevated text-secondary px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-default">
                      <div className="text-2xl font-bold text-accent">${pastor.price}</div>
                      <button className="text-sm text-accent hover:text-blue-700 font-semibold">View Profile</button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOfficiant && (
                <div className="mt-6 bg-purple-100 dark:bg-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-primary">Officiant Selected</p>
                      <p className="text-sm text-secondary mt-1">Payment will be processed after consultation. A $150 deposit is required to confirm booking.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ceremony Package Options */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Church Ceremony Package Options</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'basic',
                    name: 'Simple Blessing',
                    price: 1200,
                    description: 'Intimate church ceremony',
                    features: [
                      'Pastor/priest services',
                      'Church venue (2 hours)',
                      'Basic altar decoration',
                      'Marriage certificate processing',
                      'Rehearsal session'
                    ],
                    popular: false
                  },
                  {
                    id: 'premium',
                    name: 'Traditional Wedding',
                    price: 2500,
                    description: 'Classic church ceremony',
                    features: [
                      'Everything in Simple Blessing',
                      'Premium floral arrangements',
                      'Professional organist/musician',
                      'Pew decorations',
                      'Unity candle ceremony',
                      'Photography (3 hours)',
                      'Refreshments in fellowship hall'
                    ],
                    popular: true
                  },
                  {
                    id: 'luxury',
                    name: 'Grand Cathedral',
                    price: 4500,
                    description: 'Magnificent ceremony experience',
                    features: [
                      'Everything in Traditional',
                      'Cathedral or historic church',
                      'Full orchestra or choir',
                      'Luxury floral designs',
                      'Red carpet aisle runner',
                      'Full-day photography & videography',
                      'Reception in church hall',
                      'Wedding coordinator',
                      'Guest favors'
                    ],
                    popular: false
                  }
                ].map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedCeremonyPackage === pkg.id
                        ? 'border-blue-600 bg-purple-100 dark:bg-purple-900/20 shadow-lg'
                        : 'border-default hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedCeremonyPackage(pkg.id)}
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
                        selectedCeremonyPackage === pkg.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-surface-elevated text-primary hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      }`}
                    >
                      {selectedCeremonyPackage === pkg.id ? 'Selected' : 'Select Package'}
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
                    category: 'Pre-Ceremony (2-4 weeks before)',
                    items: [
                      'Complete pre-marital counseling sessions',
                      'Confirm pastor/priest booking',
                      'Select Scripture readings and prayers',
                      'Finalize wedding vows (traditional or custom)',
                      'Schedule ceremony rehearsal',
                      'Arrange wedding party positions'
                    ]
                  },
                  {
                    category: 'Ceremony Day',
                    items: [
                      'Arrive 1 hour before ceremony',
                      'Ensure wedding party is ready',
                      'Have marriage license ready',
                      'Prepare rings for ring bearer',
                      'Coordinate processional music',
                      'Setup unity candle or communion elements'
                    ]
                  },
                  {
                    category: 'Legal Requirements',
                    items: [
                      'Obtain marriage license from county clerk',
                      'Valid government-issued IDs',
                      'Witness signatures (usually 2 required)',
                      'Church membership documentation (if required)',
                      'Baptism/confirmation certificates',
                      'Pre-marital counseling completion certificate'
                    ]
                  },
                  {
                    category: 'Post-Ceremony',
                    items: [
                      'Collect signed marriage certificate',
                      'Return to county clerk for official registration',
                      'Obtain certified copies',
                      'Update legal name (if changing)',
                      'Send thank you notes to church staff',
                      'Schedule follow-up with pastor/priest'
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
                <h3 className="text-2xl font-bold text-primary">Required Items for Church Ceremony</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    category: 'Documentation',
                    icon: Book,
                    items: [
                      'Marriage license',
                      'Valid IDs (bride & groom)',
                      'Baptism certificates',
                      'Confirmation records',
                      'Counseling completion certificate'
                    ]
                  },
                  {
                    category: 'Ceremony Essentials',
                    icon: Church,
                    items: [
                      'Wedding rings',
                      'Unity candle (if applicable)',
                      'Holy Bible for readings',
                      'Printed ceremony programs',
                      'Kneeling cushion (some traditions)'
                    ]
                  },
                  {
                    category: 'Optional Ceremonial',
                    icon: Heart,
                    items: [
                      'Communion elements (bread & wine)',
                      'Rose ceremony items',
                      'Family blessing stones',
                      'Sand ceremony vessels',
                      'Memorial candles'
                    ]
                  }
                ].map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5">
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
                      { id: 'decor-flowers', name: 'Premium Altar Florals', price: 500 },
                      { id: 'decor-pew', name: 'Pew End Decorations', price: 350 },
                      { id: 'decor-aisle', name: 'Aisle Runner & Petals', price: 200 },
                      { id: 'decor-lighting', name: 'Sanctuary Lighting Design', price: 400 },
                      { id: 'decor-candles', name: 'Decorative Candelabras', price: 250 },
                      { id: 'decor-entrance', name: 'Church Entrance Archway', price: 600 }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          ceremonyDecorAddons.includes(addon.id)
                            ? 'border-blue-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-default hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={ceremonyDecorAddons.includes(addon.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCeremonyDecorAddons([...ceremonyDecorAddons, addon.id]);
                              } else {
                                setCeremonyDecorAddons(ceremonyDecorAddons.filter(id => id !== addon.id));
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
                      { id: 'hosp-reception', name: 'Fellowship Hall Reception', price: 800, guests: '100 guests' },
                      { id: 'hosp-refreshments', name: 'Coffee & Tea Service', price: 200, guests: '75 guests' },
                      { id: 'hosp-cake', name: 'Wedding Cake & Desserts', price: 600, guests: '100 guests' },
                      { id: 'hosp-champagne', name: 'Champagne Toast', price: 300, guests: '75 guests' },
                      { id: 'hosp-appetizers', name: 'Hors d\'oeuvres Service', price: 500, guests: '100 guests' },
                      { id: 'hosp-staff', name: 'Professional Catering Staff', price: 400, guests: '4 hours' }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          ceremonyHospitalityAddons.includes(addon.id)
                            ? 'border-blue-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-default hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={ceremonyHospitalityAddons.includes(addon.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCeremonyHospitalityAddons([...ceremonyHospitalityAddons, addon.id]);
                              } else {
                                setCeremonyHospitalityAddons(ceremonyHospitalityAddons.filter(id => id !== addon.id));
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
            {(selectedOfficiant || selectedCeremonyPackage || ceremonyDecorAddons.length > 0 || ceremonyHospitalityAddons.length > 0) && (
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Payment Summary</h3>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-5 space-y-3">
                  {selectedOfficiant && (
                    <div className="flex justify-between items-center">
                      <span>Officiant Services</span>
                      <span className="font-bold">$600</span>
                    </div>
                  )}
                  {selectedCeremonyPackage && (
                    <div className="flex justify-between items-center">
                      <span>
                        {selectedCeremonyPackage === 'basic' && 'Simple Blessing Package'}
                        {selectedCeremonyPackage === 'premium' && 'Traditional Wedding Package'}
                        {selectedCeremonyPackage === 'luxury' && 'Grand Cathedral Package'}
                      </span>
                      <span className="font-bold">
                        ${selectedCeremonyPackage === 'basic' ? 1200 : selectedCeremonyPackage === 'premium' ? 2500 : 4500}
                      </span>
                    </div>
                  )}
                  {ceremonyDecorAddons.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Decor Add-ons ({ceremonyDecorAddons.length})</span>
                      <span className="font-bold">$XXX</span>
                    </div>
                  )}
                  {ceremonyHospitalityAddons.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Hospitality Add-ons ({ceremonyHospitalityAddons.length})</span>
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
                  <h3 className="text-xl font-bold text-primary">Romantic Getaways</h3>
                  <p className="text-secondary">Faith-friendly honeymoon destinations and spiritual journeys</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Holy Land Tour</h4>
                  <p className="text-sm text-secondary mb-4">Walk where Jesus walked in Israel and Palestine</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $4,500</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 10 days / 9 nights</li>
                    <li>• Jerusalem, Bethlehem, Nazareth</li>
                    <li>• Guided biblical tours</li>
                    <li>• Daily worship services</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Rome & Vatican</h4>
                  <p className="text-sm text-secondary mb-4">Explore Christian history and art in Italy</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $3,800</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 7 days / 6 nights</li>
                    <li>• Vatican, Sistine Chapel</li>
                    <li>• Historic churches</li>
                    <li>• Papal audience opportunities</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Greek Islands</h4>
                  <p className="text-sm text-secondary mb-4">Biblical sites and romantic Mediterranean beauty</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $3,200</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 8 days / 7 nights</li>
                    <li>• Athens, Santorini, Patmos</li>
                    <li>• Paul's missionary journeys</li>
                    <li>• Luxury resort stays</li>
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Christian Wedding Guide</h2>
              <p className="text-blue-50">Plan a beautiful, Christ-centered wedding celebration that honors God and your commitment</p>
            </div>

            {/* Planning Timeline */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Wedding Planning Timeline</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">6-12 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Set wedding date and book church/ceremony venue</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Meet with pastor/priest to discuss ceremony and requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Begin pre-marital counseling sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Book reception venue and catering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Create budget and guest list</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Reserve photographer, videographer, and musicians</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">3-6 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Order wedding dress and bridesmaids dresses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Arrange men's formal wear rentals or purchases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Select and order wedding invitations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Choose Scripture readings and ceremony music</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Book florist and finalize floral arrangements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Register for gifts at selected stores</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-400 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">1-2 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Mail wedding invitations (6-8 weeks before)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Finalize ceremony details with pastor and musicians</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Order wedding cake</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Arrange rehearsal dinner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Apply for marriage license</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Schedule dress fittings</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-300 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">1 Week Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Attend wedding rehearsal at church</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Confirm final headcount with caterer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Pack for honeymoon</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prepare payments for vendors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Pray together and seek God's blessing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ceremony Details */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">The Christian Wedding Ceremony</h3>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5 mb-6">
                <p className="text-secondary mb-4">
                  A Christian wedding is a sacred covenant made before God, family, and community. It's not just a legal contract, but a spiritual union where two become one in Christ. The ceremony celebrates God's design for marriage as a reflection of Christ's love for the church.
                </p>
              </div>

              <h4 className="font-bold text-lg text-primary mb-4">Typical Ceremony Order:</h4>
              <ol className="space-y-4 mb-6">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div className="flex-1">
                    <strong className="text-primary">Prelude Music</strong>
                    <p className="text-secondary text-sm">Instrumental or vocal music as guests are seated (20-30 minutes before ceremony)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div className="flex-1">
                    <strong className="text-primary">Seating of the Mothers</strong>
                    <p className="text-secondary text-sm">Groom's mother seated first, then bride's mother (signals ceremony is about to begin)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div className="flex-1">
                    <strong className="text-primary">Processional</strong>
                    <p className="text-secondary text-sm">Wedding party enters: officiant, groom, groomsmen, bridesmaids, flower girl, ring bearer, bride with father</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                  <div className="flex-1">
                    <strong className="text-primary">Welcome & Opening Prayer</strong>
                    <p className="text-secondary text-sm">Pastor welcomes guests and invokes God's blessing on the ceremony and couple</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
                  <div className="flex-1">
                    <strong className="text-primary">Giving Away the Bride</strong>
                    <p className="text-secondary text-sm">"Who gives this woman to be married?" Father responds and may kiss bride before joining mother</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">6</span>
                  <div className="flex-1">
                    <strong className="text-primary">Scripture Readings</strong>
                    <p className="text-secondary text-sm">1-3 biblical passages about love, marriage, and commitment (often 1 Corinthians 13, Ephesians 5, Genesis 2)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">7</span>
                  <div className="flex-1">
                    <strong className="text-primary">Message/Homily</strong>
                    <p className="text-secondary text-sm">Brief sermon (5-10 minutes) on Christian marriage, God's design, and the couple's journey</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">8</span>
                  <div className="flex-1">
                    <strong className="text-primary">Exchange of Vows</strong>
                    <p className="text-secondary text-sm">Traditional or personalized vows promising lifelong love, honor, and faithfulness before God</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">9</span>
                  <div className="flex-1">
                    <strong className="text-primary">Ring Exchange & Blessing</strong>
                    <p className="text-secondary text-sm">Rings blessed by pastor, exchanged as symbols of unending love and commitment</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">10</span>
                  <div className="flex-1">
                    <strong className="text-primary">Unity Ceremony (Optional)</strong>
                    <p className="text-secondary text-sm">Unity candle, sand ceremony, or communion - symbolizing two lives becoming one</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">11</span>
                  <div className="flex-1">
                    <strong className="text-primary">Prayers & Blessings</strong>
                    <p className="text-secondary text-sm">Lord's Prayer and/or special prayers for the couple's future together</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">12</span>
                  <div className="flex-1">
                    <strong className="text-primary">Pronouncement</strong>
                    <p className="text-secondary text-sm">"By the power vested in me, I now pronounce you husband and wife. You may kiss the bride!"</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">13</span>
                  <div className="flex-1">
                    <strong className="text-primary">Presentation of the Couple</strong>
                    <p className="text-secondary text-sm">"I present to you Mr. and Mrs. [Name]" - couple turns to face guests</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">14</span>
                  <div className="flex-1">
                    <strong className="text-primary">Recessional</strong>
                    <p className="text-secondary text-sm">Newlyweds exit together followed by wedding party, upbeat joyful music</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Pre-Marital Preparation */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Pre-Marital Preparation & Counseling</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-blue-900 dark:text-purple-50 mb-3">Why Pre-Marital Counseling Matters</h4>
                  <p className="text-secondary mb-3">
                    Most churches require 3-6 sessions of pre-marital counseling. This isn't just a formality - it's an investment in your marriage that helps you:
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Discuss expectations and potential areas of conflict before marriage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Learn biblical principles for a Christ-centered marriage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Develop communication and conflict resolution skills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Align on faith, finances, family planning, and future goals</span>
                    </li>
                  </ul>
                </div>

                <h4 className="font-bold text-lg text-primary mb-3">Common Counseling Topics:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Spiritual Foundation</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Faith journey and spiritual compatibility</li>
                      <li>• Prayer and Bible study as a couple</li>
                      <li>• Church involvement and service</li>
                      <li>• Raising children in the faith</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Communication Skills</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Active listening and empathy</li>
                      <li>• Expressing needs and boundaries</li>
                      <li>• Healthy conflict resolution</li>
                      <li>• Love languages and affection</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Financial Planning</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Budgeting and spending habits</li>
                      <li>• Debt management and savings goals</li>
                      <li>• Tithing and generosity</li>
                      <li>• Joint vs. separate accounts</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Family & Future</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Children: timing, parenting approach</li>
                      <li>• Extended family relationships</li>
                      <li>• Career and life goals</li>
                      <li>• Roles and responsibilities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Church Requirements */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckSquare className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Church Requirements & Etiquette</h3>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                    <h4 className="font-bold text-blue-900 dark:text-purple-50 mb-3">Typical Requirements</h4>
                    <ul className="space-y-2 text-secondary text-sm">
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>At least one person must be a church member</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>Complete pre-marital counseling (3-6 sessions)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>Book ceremony 6-12 months in advance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>Obtain marriage license before ceremony</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>Attend wedding rehearsal (usually night before)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>Pay facility fee and honorarium for pastor</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                    <h4 className="font-bold text-blue-900 dark:text-purple-50 mb-3">Church Etiquette Guidelines</h4>
                    <ul className="space-y-2 text-secondary text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Modest, appropriate attire for church setting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>No rice/confetti indoors (check church policy)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Follow church rules on photography/video</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Respect sanctuary - no food or drinks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Coordinate decorations with church guidelines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Clean up and leave venue as you found it</span>
                      </li>
                    </ul>
                  </div>
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
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Skipping Pre-Marital Counseling</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Don't view counseling as a checkbox. Take it seriously - it builds a strong foundation for marriage.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Focusing Only on the Wedding Day</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Remember: you're planning a marriage, not just a wedding. Invest in your relationship, not just the event.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Overspending & Debt</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Don't start your marriage in debt. Set a realistic budget and stick to it. Simplicity can be beautiful.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Neglecting Spiritual Preparation</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Pray together regularly before the wedding. Build your relationship with God and each other.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Last-Minute Ceremony Planning</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Don't rush ceremony details. Choose meaningful Scripture readings and vows thoughtfully.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Forgetting Legal Requirements</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Obtain marriage license in advance. Know your state's waiting period and expiration date.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Best Practices for a Christ-Centered Wedding</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Pray Together Regularly</h4>
                      <p className="text-sm text-secondary">Build a foundation of prayer during engagement. Pray for your marriage, not just the wedding.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Study Marriage in Scripture</h4>
                      <p className="text-sm text-secondary">Read books on Christian marriage together. Study what the Bible says about love and commitment.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Seek Mentorship</h4>
                      <p className="text-sm text-secondary">Find a strong Christian couple to mentor you. Learn from those with successful marriages.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Personalize Your Ceremony</h4>
                      <p className="text-sm text-secondary">Choose Scripture readings and songs that are meaningful to your relationship and faith journey.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Practice Good Stewardship</h4>
                      <p className="text-sm text-secondary">Budget wisely. Honor God with financial responsibility - avoid debt and excessive spending.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Practice Purity</h4>
                      <p className="text-sm text-secondary">Honor God by maintaining physical boundaries during engagement. Save intimacy for marriage.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Stay Organized</h4>
                      <p className="text-sm text-secondary">Use planning tools and checklists. Reduce stress by staying on top of details and deadlines.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Remember the True Purpose</h4>
                      <p className="text-sm text-secondary">Keep Christ at the center. Your wedding celebrates your covenant before God, not just a party.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Recommended Resources</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Books for Engaged Couples</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• The Meaning of Marriage (Keller)</li>
                    <li>• Preparing for Marriage (Rainey)</li>
                    <li>• Love & Respect (Eggerichs)</li>
                    <li>• Sacred Marriage (Thomas)</li>
                  </ul>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Online Courses</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Prepare-Enrich Assessment</li>
                    <li>• RightNow Media Marriage Series</li>
                    <li>• FamilyLife's Art of Marriage</li>
                    <li>• FocusOnTheFamily.com</li>
                  </ul>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Scripture References</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• 1 Corinthians 13:4-8</li>
                    <li>• Ephesians 5:21-33</li>
                    <li>• Genesis 2:18-24</li>
                    <li>• Colossians 3:12-17</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* After the Wedding */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">After the Wedding</h3>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-2">Administrative Tasks</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Submit marriage license to county clerk</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Update names on legal documents (Social Security, DMV, passport)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Update insurance policies and beneficiaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Send thank-you notes within 3 months</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-2">Building a Christ-Centered Marriage</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Establish daily prayer and Bible reading as a couple</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Find a church home and serve together</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Join a small group or couples Bible study</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Continue learning and growing in your faith together</span>
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
