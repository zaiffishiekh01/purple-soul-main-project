import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Fuel as Mosque, Book, Clock, Gift, Utensils, Plane, Package, ListChecks, User, MapPin, Star, Phone, Mail, CheckCircle, DollarSign, Plus, Minus, ChevronDown, ChevronUp, Check, CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, Target, Award, Search, Filter, Download, Share2, Printer, Play, FileText, Lightbulb, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import WeddingProductCatalog from './WeddingProductCatalog';
import WeddingRegistry from './WeddingRegistry';

interface IslamicWeddingPlannerProps {
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
  category: 'spiritual' | 'legal' | 'venue' | 'attire' | 'guests' | 'reception';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function IslamicWeddingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: IslamicWeddingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'nikah' | 'packages' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(15000);

  // Location filtering state
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Nikah planning state
  const [selectedImam, setSelectedImam] = useState<string | null>(null);
  const [selectedNikahPackage, setSelectedNikahPackage] = useState<string | null>(null);
  const [nikahDecorAddons, setNikahDecorAddons] = useState<string[]>([]);
  const [nikahHospitalityAddons, setNikahHospitalityAddons] = useState<string[]>([]);

  // Guide tab interactive state
  const [guideTab, setGuideTab] = useState<'timeline' | 'ceremony' | 'tips' | 'resources'>('timeline');
  const [expandedTimeline, setExpandedTimeline] = useState<{[key: string]: boolean}>({ '6-12': true });
  const [timelineTasks, setTimelineTasks] = useState<{[key: string]: boolean}>({});
  const [expandedCeremony, setExpandedCeremony] = useState<{[key: string]: boolean}>({});
  const [expandedFAQ, setExpandedFAQ] = useState<{[key: string]: boolean}>({});
  const [reviewedSections, setReviewedSections] = useState<{[key: string]: boolean}>({});
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
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

  // Load cities when state changes
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
    { id: '1', text: 'Discuss marriage with families', completed: false, category: 'spiritual' },
    { id: '2', text: 'Perform Istikhara prayer for guidance', completed: false, category: 'spiritual' },
    { id: '3', text: 'Arrange meeting between families', completed: false, category: 'spiritual' },
    { id: '4', text: 'Agree on Mahr (dower)', completed: false, category: 'legal' },
    { id: '5', text: 'Choose Imam/Sheikh for Nikah ceremony', completed: false, category: 'spiritual' },
    { id: '6', text: 'Prepare marriage contract (Nikah contract)', completed: false, category: 'legal' },
    { id: '7', text: 'Book venue for Nikah ceremony', completed: false, category: 'venue' },
    { id: '8', text: 'Book venue for Walima reception', completed: false, category: 'venue' },
    { id: '9', text: 'Select wedding attire (modest Islamic dress)', completed: false, category: 'attire' },
    { id: '10', text: 'Arrange for gender-separated seating/areas', completed: false, category: 'venue' },
    { id: '11', text: 'Plan halal catering menu', completed: false, category: 'reception' },
    { id: '12', text: 'Send wedding invitations', completed: false, category: 'guests' },
    { id: '13', text: 'Arrange Islamic nasheeds/anasheed (no music)', completed: false, category: 'reception' },
    { id: '14', text: 'Plan henna/mehndi night', completed: false, category: 'reception' },
    { id: '15', text: 'Arrange photography (halal, modest)', completed: false, category: 'reception' },
  ]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: '6-12 Months Before',
      timeframe: '6-12 months',
      tasks: ['Perform Istikhara', 'Meet families', 'Agree on Mahr', 'Set wedding date', 'Book venues'],
      completed: false
    },
    {
      id: '2',
      title: '3-6 Months Before',
      timeframe: '3-6 months',
      tasks: ['Book Imam', 'Prepare guest list', 'Order wedding attire', 'Plan Walima menu', 'Book photographer'],
      completed: false
    },
    {
      id: '3',
      title: '1-3 Months Before',
      timeframe: '1-3 months',
      tasks: ['Send invitations', 'Finalize menu', 'Plan mehndi event', 'Arrange decorations', 'Book nasheed artists'],
      completed: false
    },
    {
      id: '4',
      title: '1 Month Before',
      timeframe: '1 month',
      tasks: ['Confirm guest count', 'Final venue walkthrough', 'Prepare marriage contract', 'Wedding rehearsal'],
      completed: false
    },
    {
      id: '5',
      title: 'Wedding Week',
      timeframe: '1 week',
      tasks: ['Mehndi night', 'Final preparations', 'Confirm all vendors', 'Prepare Mahr payment', 'Pack for honeymoon'],
      completed: false
    }
  ]);

  const [budgetCategories, setBudgetCategories] = useState([
    { id: 'mahr', name: 'Mahr (Dower)', allocated: 3000, spent: 0, min: 500, max: 10000 },
    { id: 'venue', name: 'Venue (Nikah & Walima)', allocated: 3500, spent: 0, min: 500, max: 15000 },
    { id: 'catering', name: 'Catering', allocated: 4000, spent: 0, min: 1000, max: 20000 },
    { id: 'attire', name: 'Attire & Jewelry', allocated: 2000, spent: 0, min: 500, max: 10000 },
    { id: 'photography', name: 'Photography', allocated: 1000, spent: 0, min: 300, max: 5000 },
    { id: 'decorations', name: 'Decorations', allocated: 800, spent: 0, min: 200, max: 5000 },
    { id: 'invitations', name: 'Invitations & Favors', allocated: 400, spent: 0, min: 100, max: 2000 },
    { id: 'misc', name: 'Miscellaneous', allocated: 300, spent: 0, min: 100, max: 3000 }
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

  // Guide helper functions
  const toggleTimelineSection = (id: string) => {
    setExpandedTimeline(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTimelineTask = (id: string) => {
    setTimelineTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCeremonyStep = (id: string) => {
    setExpandedCeremony(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const markAsReviewed = (section: string) => {
    setReviewedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getDaysUntilWedding = () => {
    if (!weddingDate) return null;
    const today = new Date();
    const wedding = new Date(weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCurrentPhaseRecommendation = () => {
    const days = getDaysUntilWedding();
    if (!days) return null;

    if (days > 365) return { phase: 'Early Planning', color: 'green', tasks: ['Choose wedding date', 'Start budget planning', 'Begin vendor research'] };
    if (days > 180) return { phase: '6-12 Months Out', color: 'green', tasks: ['Book venue and Imam', 'Finalize Mahr', 'Order attire'] };
    if (days > 90) return { phase: '3-6 Months Out', color: 'yellow', tasks: ['Arrange catering', 'Book entertainment', 'Send invitations'] };
    if (days > 30) return { phase: '1-3 Months Out', color: 'yellow', tasks: ['Finalize guest count', 'Confirm vendors', 'Final fittings'] };
    if (days > 7) return { phase: 'Final Month', color: 'orange', tasks: ['Create day-of timeline', 'Prepare Mahr payment', 'Final confirmations'] };
    if (days > 0) return { phase: 'Final Week', color: 'red', tasks: ['Attend rehearsal', 'Pack for honeymoon', 'Make dua'] };
    return { phase: 'Wedding Day', color: 'rose', tasks: ['Enjoy your special day!'] };
  };

  const calculateGuideProgress = () => {
    const totalTasks = Object.keys(timelineTasks).length;
    const completedTasks = Object.values(timelineTasks).filter(Boolean).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Islamic Wedding Planner</h1>
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
              { id: 'nikah', label: 'Nikah', icon: Mosque },
              { id: 'packages', label: 'Tour Packages', icon: Plane },
              { id: 'registry', label: 'Registry', icon: ListChecks },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Islamic Guide', icon: Book }
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
                <Mosque className="w-8 h-8 text-accent" />
                <h2 className="text-2xl font-bold text-primary">Islamic Wedding Overview</h2>
              </div>
              <p className="text-secondary mb-6">
                Plan your blessed union according to Islamic traditions. This planner helps you organize every aspect of your Nikah ceremony and Walima celebration while maintaining Islamic values and customs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Mosque className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Nikah Ceremony</h3>
                  <p className="text-sm text-secondary">Islamic marriage contract with Imam, witnesses, and Mahr agreement</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Utensils className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Walima Reception</h3>
                  <p className="text-sm text-secondary">Wedding feast celebrating the marriage with family and friends</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Mehndi Night</h3>
                  <p className="text-sm text-secondary">Traditional henna celebration for the bride with family</p>
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

            {['spiritual', 'legal', 'venue', 'attire', 'guests', 'reception'].map(category => {
              const categoryItems = checklist.filter(item => item.category === category);
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
                            ? 'bg-rose-100 text-accent dark:bg-rose-900/30'
                            : 'bg-surface-elevated text-secondary'
                        }`}
                      >
                        {event.completed ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                    <p className="text-sm text-accent dark:text-purple-400 mb-4">{event.timeframe}</p>
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

                    {/* Allocation Slider */}
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
                          className="w-full h-2 bg-gray-200 dark:bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-rose-600"
                          style={{
                            background: `linear-gradient(to right, rgb(225, 29, 72) 0%, rgb(225, 29, 72) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Spent Input */}
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

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 dark:bg-surface-elevated rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(category.spent / category.allocated) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Summary */}
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

              {/* Total Summary */}
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

        {/* Nikah Tab */}
        {activeTab === 'nikah' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary">Nikah Ceremony Planning</h2>
                <p className="text-secondary mt-1">Complete your sacred union with our comprehensive Nikah planning services</p>
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

            {/* Imam / Officiant Booking Section */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Book Your Imam / Officiant</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 'imam-1',
                    name: 'Sheikh Ahmed Al-Hashimi',
                    location: 'New York, NY',
                    experience: '15+ years',
                    languages: 'Arabic, English',
                    rating: 4.9,
                    reviews: 127,
                    price: 500,
                    specialties: ['Traditional Nikah', 'Marriage Counseling', 'Interfaith Guidance']
                  },
                  {
                    id: 'imam-2',
                    name: 'Imam Mohammad Farooq',
                    location: 'Los Angeles, CA',
                    experience: '20+ years',
                    languages: 'Urdu, English, Arabic',
                    rating: 5.0,
                    reviews: 203,
                    price: 600,
                    specialties: ['Nikah Ceremonies', 'Pre-marital Counseling', 'Islamic Law']
                  },
                  {
                    id: 'imam-3',
                    name: 'Sheikh Yusuf Ibrahim',
                    location: 'Chicago, IL',
                    experience: '12+ years',
                    languages: 'English, French, Arabic',
                    rating: 4.8,
                    reviews: 89,
                    price: 450,
                    specialties: ['Modern Nikah', 'Youth Guidance', 'Community Services']
                  }
                ].map((imam) => (
                  <div
                    key={imam.id}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedImam === imam.id
                        ? 'border-rose-600 bg-purple-100 dark:bg-purple-900/20'
                        : 'border-default hover:border-rose-300'
                    }`}
                    onClick={() => setSelectedImam(imam.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-primary">{imam.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted" />
                          <p className="text-sm text-secondary">{imam.location}</p>
                        </div>
                      </div>
                      {selectedImam === imam.id && (
                        <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-primary">{imam.rating}</span>
                      <span className="text-sm text-secondary">({imam.reviews} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted" />
                        <span className="text-secondary">{imam.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Book className="w-4 h-4 text-muted" />
                        <span className="text-secondary">{imam.languages}</span>
                      </div>
                    </div>

                    <div className="border-t border-default pt-3 mb-3">
                      <p className="text-xs text-secondary mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {imam.specialties.map((specialty, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-surface-elevated text-secondary px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-default">
                      <div className="text-2xl font-bold text-accent">${imam.price}</div>
                      <button className="text-sm text-accent hover:text-rose-700 font-semibold">View Profile</button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedImam && (
                <div className="mt-6 bg-purple-100 dark:bg-purple-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-primary">Imam Selected</p>
                      <p className="text-sm text-secondary mt-1">Payment will be processed after consultation. A $100 deposit is required to confirm booking.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nikah Package Options */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Nikah Package Options</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'basic',
                    name: 'Essential Nikah',
                    price: 800,
                    description: 'Simple and sacred ceremony',
                    features: [
                      'Imam services',
                      'Marriage contract preparation',
                      'Basic venue decoration',
                      'Witness coordination',
                      'Certificate processing'
                    ],
                    popular: false
                  },
                  {
                    id: 'premium',
                    name: 'Premium Nikah',
                    price: 1500,
                    description: 'Enhanced ceremony experience',
                    features: [
                      'Everything in Essential',
                      'Premium venue decoration',
                      'Photography (2 hours)',
                      'Refreshments for 50 guests',
                      'Nasheed performance',
                      'Personalized ceremony script'
                    ],
                    popular: true
                  },
                  {
                    id: 'luxury',
                    name: 'Luxury Nikah',
                    price: 2800,
                    description: 'Complete premium experience',
                    features: [
                      'Everything in Premium',
                      'Luxury venue decoration',
                      'Full-day photography & videography',
                      'Catering for 100 guests',
                      'Live Nasheed artists',
                      'Henna artist',
                      'Gift favors',
                      'Wedding coordinator'
                    ],
                    popular: false
                  }
                ].map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedNikahPackage === pkg.id
                        ? 'border-rose-600 bg-purple-100 dark:bg-purple-900/20 shadow-lg'
                        : 'border-default hover:border-rose-300'
                    }`}
                    onClick={() => setSelectedNikahPackage(pkg.id)}
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
                        selectedNikahPackage === pkg.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-surface-elevated text-primary hover:bg-rose-100 dark:hover:bg-rose-900/30'
                      }`}
                    >
                      {selectedNikahPackage === pkg.id ? 'Selected' : 'Select Package'}
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
                      'Confirm Imam booking and ceremony time',
                      'Finalize Mahr amount and documentation',
                      'Arrange Wali (guardian) attendance',
                      'Confirm two Muslim witnesses',
                      'Review and sign marriage contract',
                      'Prepare ceremony venue'
                    ]
                  },
                  {
                    category: 'Ceremony Day',
                    items: [
                      'Arrive 30 minutes early',
                      'Ensure witnesses are present',
                      'Have marriage contract ready',
                      'Prepare Mahr payment/gift',
                      'Coordinate family seating',
                      'Photography/videography setup'
                    ]
                  },
                  {
                    category: 'Legal Requirements',
                    items: [
                      'Marriage license from local authority',
                      'Valid ID for bride and groom',
                      'Witness identification',
                      'Nikah contract (Islamic)',
                      'Civil marriage registration',
                      'Certificate collection'
                    ]
                  },
                  {
                    category: 'Post-Ceremony',
                    items: [
                      'Collect official marriage certificate',
                      'Distribute copies to families',
                      'Submit to relevant authorities',
                      'Update legal documents',
                      'Plan Walima reception',
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
                <h3 className="text-2xl font-bold text-primary">Required Items for Nikah</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    category: 'Documentation',
                    icon: Book,
                    items: [
                      'Marriage license',
                      'Valid IDs (bride & groom)',
                      'Witness identification',
                      'Nikah contract',
                      'Mahr agreement document'
                    ]
                  },
                  {
                    category: 'Ceremony Essentials',
                    icon: Mosque,
                    items: [
                      'Prayer mat (for Imam)',
                      'Quran',
                      'Microphone (if large gathering)',
                      'Seating arrangements',
                      'Water for attendees'
                    ]
                  },
                  {
                    category: 'Optional Ceremonial',
                    icon: Heart,
                    items: [
                      'Mahr (gift/payment ready)',
                      'Ring exchange (optional)',
                      'Dates for distribution',
                      'Rose water',
                      'Decorative Quran stand'
                    ]
                  }
                ].map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg p-5">
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
                      { id: 'decor-flowers', name: 'Premium Floral Arrangements', price: 350 },
                      { id: 'decor-backdrop', name: 'Custom Photo Backdrop', price: 250 },
                      { id: 'decor-lighting', name: 'Ambient Lighting Setup', price: 200 },
                      { id: 'decor-fabric', name: 'Luxury Fabric Draping', price: 300 },
                      { id: 'decor-carpet', name: 'Red Carpet Entrance', price: 150 },
                      { id: 'decor-centerpiece', name: 'Table Centerpieces', price: 180 }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          nikahDecorAddons.includes(addon.id)
                            ? 'border-rose-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-default hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={nikahDecorAddons.includes(addon.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNikahDecorAddons([...nikahDecorAddons, addon.id]);
                              } else {
                                setNikahDecorAddons(nikahDecorAddons.filter(id => id !== addon.id));
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
                      { id: 'hosp-tea', name: 'Traditional Tea Service', price: 200, guests: '50 guests' },
                      { id: 'hosp-dates', name: 'Premium Dates & Sweets', price: 150, guests: '100 guests' },
                      { id: 'hosp-juice', name: 'Fresh Juice Bar', price: 250, guests: '75 guests' },
                      { id: 'hosp-appetizers', name: 'Halal Appetizer Platter', price: 400, guests: '100 guests' },
                      { id: 'hosp-dessert', name: 'Dessert Station', price: 350, guests: '80 guests' },
                      { id: 'hosp-waiter', name: 'Professional Wait Staff', price: 300, guests: '4 hours' }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          nikahHospitalityAddons.includes(addon.id)
                            ? 'border-rose-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-default hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={nikahHospitalityAddons.includes(addon.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNikahHospitalityAddons([...nikahHospitalityAddons, addon.id]);
                              } else {
                                setNikahHospitalityAddons(nikahHospitalityAddons.filter(id => id !== addon.id));
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
            {(selectedImam || selectedNikahPackage || nikahDecorAddons.length > 0 || nikahHospitalityAddons.length > 0) && (
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Payment Summary</h3>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-5 space-y-3">
                  {selectedImam && (
                    <div className="flex justify-between items-center">
                      <span>Imam Services</span>
                      <span className="font-bold">$500</span>
                    </div>
                  )}
                  {selectedNikahPackage && (
                    <div className="flex justify-between items-center">
                      <span>
                        {selectedNikahPackage === 'basic' && 'Essential Nikah Package'}
                        {selectedNikahPackage === 'premium' && 'Premium Nikah Package'}
                        {selectedNikahPackage === 'luxury' && 'Luxury Nikah Package'}
                      </span>
                      <span className="font-bold">
                        ${selectedNikahPackage === 'basic' ? 800 : selectedNikahPackage === 'premium' ? 1500 : 2800}
                      </span>
                    </div>
                  )}
                  {nikahDecorAddons.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Decor Add-ons ({nikahDecorAddons.length})</span>
                      <span className="font-bold">$XXX</span>
                    </div>
                  )}
                  {nikahHospitalityAddons.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Hospitality Add-ons ({nikahHospitalityAddons.length})</span>
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
                  <h3 className="text-xl font-bold text-primary">Islamic Travel Experiences</h3>
                  <p className="text-secondary">Halal-friendly honeymoon destinations and pilgrimage packages</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Umrah Package</h4>
                  <p className="text-sm text-secondary mb-4">Start your marriage with a spiritual journey to Makkah and Madinah</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $3,500</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 7-10 days</li>
                    <li>• 4-star hotel near Haram</li>
                    <li>• Guided tours</li>
                    <li>• Group Umrah programs</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Turkey Honeymoon</h4>
                  <p className="text-sm text-secondary mb-4">Explore Istanbul's Islamic heritage and natural beauty</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $2,800</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 6 days / 5 nights</li>
                    <li>• Historic mosques tour</li>
                    <li>• Halal dining experiences</li>
                    <li>• Luxury accommodation</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Dubai Experience</h4>
                  <p className="text-sm text-secondary mb-4">Modern luxury with Islamic values and culture</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $3,200</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 5 days / 4 nights</li>
                    <li>• 5-star halal resorts</li>
                    <li>• Desert safari & attractions</li>
                    <li>• Prayer facilities everywhere</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-colors">
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
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors">
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Islamic Wedding Guide</h2>
              <p className="text-rose-50">Everything you need to know to plan a beautiful, blessed Islamic wedding</p>
            </div>

            {/* Timeline Section */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Planning Timeline</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-rose-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">6-12 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Choose and book wedding date (avoid Ramadan and Hajj if possible)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Select and book venue (mosque, banquet hall, or outdoor space)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Find an Imam or Islamic officiant for Nikah ceremony</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Discuss and finalize Mahr (dower) amount with families</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Create preliminary guest list and budget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Book photographer/videographer experienced with Islamic weddings</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-rose-500 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">3-6 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Order wedding attire (bride's dress with hijab, groom's thobe or suit)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Arrange halal catering and menu tasting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Plan Mehndi/Henna party for bride</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Send save-the-date cards or announcements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Book Islamic nasheeds performer or plan halal entertainment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prepare Nikah contract and review with families</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-rose-400 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">1 Month Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Finalize guest count and seating arrangements (gender-separated if needed)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Confirm all vendors and review contracts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prepare wedding favors and gifts for guests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Schedule final dress fittings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Confirm witnesses (two males or one male and two females)</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-rose-300 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">1 Week Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Confirm final headcount with caterer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Create detailed day-of timeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prepare Mahr payment and presentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Pack for honeymoon (if traveling)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Make dua and seek blessings from parents and elders</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Nikah Ceremony Section */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">The Nikah Ceremony</h3>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5 mb-6">
                <p className="text-secondary mb-4">
                  The Nikah is the Islamic marriage contract that makes the marriage official in the eyes of Allah and the community. It is a sacred covenant based on mutual consent, respect, and Islamic principles.
                </p>
              </div>

              <h4 className="font-bold text-lg text-primary mb-4">Essential Elements of Nikah:</h4>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                  <h5 className="font-semibold text-accent mb-2">1. Ijab and Qabul (Offer & Acceptance)</h5>
                  <p className="text-sm text-secondary">The bride and groom must both freely consent to the marriage through a clear offer and acceptance, typically done verbally in front of witnesses.</p>
                </div>
                <div className="border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                  <h5 className="font-semibold text-accent mb-2">2. Mahr (Dower)</h5>
                  <p className="text-sm text-secondary">A mandatory gift from the groom to the bride, agreed upon before the ceremony. Can be monetary, property, or other valuables, given immediately or deferred.</p>
                </div>
                <div className="border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                  <h5 className="font-semibold text-accent mb-2">3. Witnesses</h5>
                  <p className="text-sm text-secondary">At least two adult Muslim witnesses must be present. Can be two males, or one male and two females, to validate the marriage contract.</p>
                </div>
                <div className="border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                  <h5 className="font-semibold text-accent mb-2">4. Wali (Guardian)</h5>
                  <p className="text-sm text-secondary">The bride's guardian (typically her father or closest male relative) represents her during the ceremony and gives consent on her behalf.</p>
                </div>
              </div>

              <h4 className="font-bold text-lg text-primary mb-3">Typical Ceremony Flow:</h4>
              <ol className="space-y-3 mb-6">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div className="flex-1">
                    <strong className="text-primary">Khutbah (Sermon):</strong>
                    <p className="text-secondary text-sm">The Imam delivers a brief sermon about the importance of marriage in Islam, rights and responsibilities of spouses.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div className="flex-1">
                    <strong className="text-primary">Confirmation of Consent:</strong>
                    <p className="text-secondary text-sm">Both bride and groom are asked separately if they consent to the marriage, typically saying "Qabiltu" (I accept).</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div className="flex-1">
                    <strong className="text-primary">Mahr Presentation:</strong>
                    <p className="text-secondary text-sm">The agreed-upon Mahr is announced and may be presented to the bride during the ceremony.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                  <div className="flex-1">
                    <strong className="text-primary">Signing the Contract:</strong>
                    <p className="text-secondary text-sm">Bride, groom, wali, and witnesses sign the Nikah contract document.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
                  <div className="flex-1">
                    <strong className="text-primary">Dua (Supplication):</strong>
                    <p className="text-secondary text-sm">The Imam makes dua for the couple's blessed marriage and happy life together.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">6</span>
                  <div className="flex-1">
                    <strong className="text-primary">Announcement:</strong>
                    <p className="text-secondary text-sm">The marriage is announced to the community, and congratulations are shared.</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Reception and Traditions */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Walima & Reception Planning</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-rose-900 dark:text-purple-50 mb-2">Walima (Wedding Feast)</h4>
                  <p className="text-secondary mb-3">
                    The Walima is a Sunnah celebration following the marriage, traditionally hosted by the groom. It announces the marriage to the community and is considered a blessed act.
                  </p>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Should be held within 3 days of the Nikah (though timing is flexible)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Invite both rich and poor, making it inclusive and accessible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Keep it modest and avoid extravagance or waste</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Serve halal food prepared according to Islamic guidelines</span>
                    </li>
                  </ul>
                </div>

                <h4 className="font-bold text-lg text-primary mt-6 mb-3">Important Cultural Considerations:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-l-4 border-rose-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Modesty & Dress Code</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Maintain Islamic dress code (hijab for women)</li>
                      <li>• Ensure modest attire for all attendees</li>
                      <li>• Bride may wear traditional dress with full coverage</li>
                      <li>• Groom often wears thobe, sherwani, or formal suit</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-rose-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Gender Separation</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Consider separate areas for men and women</li>
                      <li>• Separate entrances if venue allows</li>
                      <li>• Different dining arrangements if preferred</li>
                      <li>• Levels of separation vary by family preference</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-rose-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Halal Food & Drinks</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• All meat must be zabiha halal</li>
                      <li>• No alcohol or intoxicants</li>
                      <li>• Avoid cross-contamination with haram items</li>
                      <li>• Clearly label ingredients for guests</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-rose-600 pl-4 py-2">
                    <h5 className="font-semibold text-primary mb-2">Entertainment</h5>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Islamic nasheeds (acappella or with duff)</li>
                      <li>• Avoid music with instruments (varies by school)</li>
                      <li>• Maintain appropriate interaction between genders</li>
                      <li>• Focus on celebration, not excess</li>
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
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Neglecting Nikah Requirements</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Ensure all Islamic requirements are met: consent, witnesses, wali, and Mahr. Don't rush through the religious ceremony.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Extravagant Spending</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Islam encourages simplicity. Avoid going into debt or spending excessively on the wedding. Keep it blessed and balanced.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Compromising Modesty</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Don't compromise on Islamic values for cultural trends. Maintain hijab, modest dress, and appropriate behavior throughout.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Ignoring Family Discussions</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Involve families early in planning. Address concerns about Mahr, venue, and traditions before conflicts arise.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Forgetting Legal Registration</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Complete civil marriage registration alongside Nikah. Ensure marriage is legally recognized for rights and documentation.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Mixed-Gender Inappropriateness</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Plan for appropriate gender interaction. Consider separate spaces if needed to maintain Islamic etiquette.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Best Practices & Tips</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Start with Prayer</h4>
                      <p className="text-sm text-secondary">Make Istikhara (prayer for guidance) before major decisions. Seek Allah's blessings throughout the process.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Family Involvement</h4>
                      <p className="text-sm text-secondary">Involve both families in planning. Their blessings and support are crucial for a blessed marriage.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Learn Islamic Rights</h4>
                      <p className="text-sm text-secondary">Study the rights and responsibilities of spouses in Islam. Attend pre-marital counseling with an Islamic scholar.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Budget Wisely</h4>
                      <p className="text-sm text-secondary">Create realistic budget within your means. The best marriages are those with less financial burden and more barakah.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Document Everything</h4>
                      <p className="text-sm text-secondary">Keep detailed records of Mahr, Nikah contract, witnesses, and civil registration. Maintain proper documentation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Choose Mosque or Islamic Venue</h4>
                      <p className="text-sm text-secondary">Consider having Nikah at a mosque for blessings. Choose reception venues that accommodate Islamic requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Give Sadaqah (Charity)</h4>
                      <p className="text-sm text-secondary">Give charity before and during the wedding. Share blessings with those in need and seek barakah in your union.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Focus on Marriage, Not Just Wedding</h4>
                      <p className="text-sm text-secondary">Remember the wedding is one day, marriage is a lifetime. Invest in building a strong, blessed relationship.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Helpful Resources</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Pre-Marital Counseling</h4>
                  <p className="text-sm text-secondary mb-3">Meet with an Imam or Islamic counselor to discuss marriage expectations, rights, and responsibilities.</p>
                  <p className="text-xs text-accent font-medium">Highly Recommended</p>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Islamic Books on Marriage</h4>
                  <p className="text-sm text-secondary mb-3">Read books about marriage in Islam, spousal rights, and building a blessed home.</p>
                  <p className="text-xs text-accent font-medium">Educational</p>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Community Support</h4>
                  <p className="text-sm text-secondary mb-3">Connect with married Muslim couples in your community for advice and mentorship.</p>
                  <p className="text-xs text-accent font-medium">Support Network</p>
                </div>
              </div>
            </div>

            {/* Post-Wedding Section */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">After the Wedding</h3>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-rose-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-2">Legal & Administrative Tasks</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Update legal documents (passport, driver's license, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Notify employers and insurance providers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Update bank accounts and beneficiaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Send thank-you cards to guests and vendors</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-rose-600 pl-4 py-2">
                  <h4 className="font-bold text-primary mb-2">Building Your Islamic Home</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Establish regular family prayer and Quran recitation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Communicate openly and resolve conflicts Islamically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Continue learning together about Islamic marriage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Support each other's faith and personal growth</span>
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
