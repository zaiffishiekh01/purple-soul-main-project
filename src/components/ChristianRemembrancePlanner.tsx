import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Cross, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import RemembranceProductCatalog from './RemembranceProductCatalog';

interface ChristianRemembrancePlannerProps {
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
  category: 'immediate' | 'funeral' | 'service' | 'memorial' | 'support';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function ChristianRemembrancePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: ChristianRemembrancePlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'service' | 'memorial' | 'support' | 'comfort' | 'shopping' | 'guide'>('overview');
  const [passingDate, setPassingDate] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
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
    { id: '1', text: 'Contact funeral home', completed: false, category: 'immediate' },
    { id: '2', text: 'Notify family members and close friends', completed: false, category: 'immediate' },
    { id: '3', text: 'Obtain death certificates', completed: false, category: 'immediate' },
    { id: '4', text: 'Contact church/pastor', completed: false, category: 'immediate' },
    { id: '5', text: 'Choose burial or cremation', completed: false, category: 'funeral' },
    { id: '6', text: 'Select casket or urn', completed: false, category: 'funeral' },
    { id: '7', text: 'Choose cemetery plot or columbarium', completed: false, category: 'funeral' },
    { id: '8', text: 'Plan funeral/memorial service', completed: false, category: 'service' },
    { id: '9', text: 'Select Scripture readings', completed: false, category: 'service' },
    { id: '10', text: 'Choose hymns and music', completed: false, category: 'service' },
    { id: '11', text: 'Prepare eulogy', completed: false, category: 'service' },
    { id: '12', text: 'Arrange wake/visitation', completed: false, category: 'service' },
    { id: '13', text: 'Order flowers and arrangements', completed: false, category: 'memorial' },
    { id: '14', text: 'Create memorial program/bulletin', completed: false, category: 'memorial' },
    { id: '15', text: 'Arrange reception/gathering', completed: false, category: 'memorial' },
    { id: '16', text: 'Set up memorial donations', completed: false, category: 'memorial' },
    { id: '17', text: 'Connect with grief support group', completed: false, category: 'support' },
    { id: '18', text: 'Arrange pastoral counseling', completed: false, category: 'support' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Funeral Home Services', estimated: 2500, actual: 0, icon: Cross },
    { name: 'Casket or Urn', estimated: 2000, actual: 0, icon: Package },
    { name: 'Cemetery/Burial Plot', estimated: 1500, actual: 0, icon: MapPin },
    { name: 'Church Service', estimated: 500, actual: 0, icon: Book },
    { name: 'Reception & Catering', estimated: 800, actual: 0, icon: Gift },
    { name: 'Flowers & Arrangements', estimated: 400, actual: 0, icon: Heart },
    { name: 'Memorial Items & Programs', estimated: 200, actual: 0, icon: Star },
    { name: 'Memorial Donations', estimated: 100, actual: 0, icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Cross className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Christian Remembrance & Memorial Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Honor your loved one with dignity and grace through Christian funeral traditions</p>

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
                <Heart className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Relationship</div>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g., Mother, Father"
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
              { id: 'service', label: 'Service', icon: Cross },
              { id: 'memorial', label: 'Memorial', icon: Heart },
              { id: 'support', label: 'Support', icon: Users },
              { id: 'comfort', label: 'Comfort', icon: Book },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Guide', icon: Bell }
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
              <h2 className="text-2xl font-bold text-primary mb-4">Honoring Your Loved One with Christian Traditions</h2>
              <p className="text-secondary mb-6">
                This comprehensive planner guides you through every aspect of planning a dignified Christian funeral and memorial service. From immediate decisions to long-term remembrance, we're here to support you during this difficult time with practical guidance rooted in Christian faith and tradition.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Cross className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Funeral Service</h3>
                  <p className="text-sm text-secondary">Plan a meaningful service celebrating life and faith</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Scripture & Hymns</h3>
                  <p className="text-sm text-secondary">Choose comforting readings and traditional hymns</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Grief Support</h3>
                  <p className="text-sm text-secondary">Connect with Christian grief counseling and support</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Planning Summary</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-3xl font-bold">{checklist.filter(i => i.completed).length}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{passingDate ? 'Set' : '-'}</div>
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

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Immediate Steps</h3>
              <div className="space-y-3">
                {checklist.filter(item => item.category === 'immediate').slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      item.completed
                        ? 'bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-600 dark:border-purple-600'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      item.completed
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-default'
                    }`}>
                      {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-primary'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Memorial Planning Checklist</h2>

              {['immediate', 'funeral', 'service', 'memorial', 'support'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3 capitalize">
                    {category === 'immediate' ? 'Immediate Actions' :
                     category === 'funeral' ? 'Funeral Arrangements' :
                     category === 'service' ? 'Service Planning' :
                     category === 'memorial' ? 'Memorial & Reception' :
                     'Grief Support'}
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
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">Immediately (First 24-48 Hours)</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Contact funeral home and make initial arrangements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Notify immediate family members and close friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Contact church pastor or spiritual advisor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Begin gathering important documents</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">First Week</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Plan funeral or memorial service details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Select casket/urn and burial/cremation arrangements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Choose Scripture readings, hymns, and music</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Prepare eulogy and select speakers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Order flowers and memorial items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Arrange reception or gathering venue</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">First Month</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Send thank you notes to those who helped</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Connect with grief support groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Consider memorial donations or scholarships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Begin handling estate and legal matters</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">Ongoing</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Attend grief counseling or support groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Plan memorial events on anniversaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Create lasting memorials or tributes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Stay connected with church community</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Funeral & Memorial Budget</h2>

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
                      <span className="text-purple-600 dark:text-purple-400 font-bold">${category.estimated.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min((category.estimated / budget) * 100, 100)}%` }}
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
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Compare prices from multiple funeral homes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Consider pre-planning to lock in current prices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Ask about veteran's benefits or other assistance programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Memorial donations can help offset costs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'service' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Cross className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Funeral & Memorial Service Planning</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Service Types</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Traditional Funeral Service</h4>
                      <p className="text-sm text-secondary">Full service with viewing, funeral ceremony, and committal service at graveside</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Memorial Service</h4>
                      <p className="text-sm text-secondary">Service without the body present, often after cremation or burial</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Celebration of Life</h4>
                      <p className="text-sm text-secondary">Uplifting service focusing on celebrating the deceased's life and legacy</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Graveside Service</h4>
                      <p className="text-sm text-secondary">Brief committal service held at the burial site</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Service Elements</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Opening & Welcome</h4>
                      <p className="text-sm text-secondary">Pastor or officiant welcomes attendees and opens with prayer</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Hymns & Music</h4>
                      <p className="text-sm text-secondary">Traditional hymns, contemporary Christian music, or deceased's favorite songs</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Scripture Readings</h4>
                      <p className="text-sm text-secondary">Comforting passages from the Bible read by family or clergy</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Eulogy</h4>
                      <p className="text-sm text-secondary">Personal tribute sharing memories and celebrating the life lived</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Sermon or Meditation</h4>
                      <p className="text-sm text-secondary">Message of hope, comfort, and faith from the pastor</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Closing Prayer & Benediction</h4>
                      <p className="text-sm text-secondary">Final prayer and blessing for the deceased and gathered loved ones</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-primary mb-3">Wake/Visitation Planning</h3>
                  <p className="text-sm text-secondary mb-3">
                    A wake or visitation allows family and friends to pay respects, typically held the evening before the funeral.
                  </p>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Usually 2-4 hours in the evening at funeral home or church</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Open or closed casket based on family preference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>May include prayer service or rosary for Catholic families</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Display photos, memorabilia, and guest book</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memorial' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Memorial & Reception Planning</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Reception Ideas</h3>
                  <p className="text-sm text-secondary mb-4">
                    A reception or gathering after the service provides opportunity for fellowship and sharing memories.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Church Fellowship Hall</h4>
                      <p className="text-sm text-secondary">Traditional venue with kitchen facilities and familiar setting</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Family Home</h4>
                      <p className="text-sm text-secondary">Intimate gathering in a comfortable, personal environment</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Restaurant or Banquet Hall</h4>
                      <p className="text-sm text-secondary">Professional service for larger gatherings</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Outdoor Memorial</h4>
                      <p className="text-sm text-secondary">Garden or park setting for nature-loving individuals</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Memorial Items</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Memorial Program/Bulletin</h4>
                      <p className="text-sm text-secondary mb-2">Order of service with photo, dates, readings, and hymns</p>
                      <ul className="text-sm text-muted ml-4">
                        <li>Include obituary or life summary</li>
                        <li>List pallbearers and honorary pallbearers</li>
                        <li>Thank attendees for their support</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Memorial Cards</h4>
                      <p className="text-sm text-secondary">Prayer cards or bookmarks with photo and favorite verse</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Guest Book</h4>
                      <p className="text-sm text-secondary">Record of attendees with space for messages and condolences</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Photo Display</h4>
                      <p className="text-sm text-secondary">Collage or slideshow celebrating life's precious moments</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Memory Table</h4>
                      <p className="text-sm text-secondary">Display of personal items, hobbies, achievements, and mementos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-primary mb-3">Memorial Donations</h3>
                  <p className="text-sm text-secondary mb-3">
                    In lieu of flowers, families often suggest donations to meaningful causes:
                  </p>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Church building fund or mission work</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Christian charities aligned with deceased's values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Medical research for illness that affected loved one</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Scholarship fund in deceased's name</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Flower Arrangements</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="text-sm">
                      <h4 className="font-semibold text-primary mb-1">Casket Spray</h4>
                      <p className="text-secondary">Large arrangement placed on top of casket</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-primary mb-1">Standing Wreaths</h4>
                      <p className="text-secondary">Circular arrangements on easels</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-primary mb-1">Cross Arrangements</h4>
                      <p className="text-secondary">Flowers shaped into Christian cross</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-primary mb-1">Vase Arrangements</h4>
                      <p className="text-secondary">Traditional bouquets in vases</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-primary mb-1">Sympathy Baskets</h4>
                      <p className="text-secondary">Arrangements in decorative baskets</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold text-primary mb-1">Plants</h4>
                      <p className="text-secondary">Living plants as lasting memorials</p>
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
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Grief Support & Resources</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Christian Grief Support</h3>
                  <p className="text-sm text-secondary mb-4">
                    Grieving is a natural process that takes time. The Christian community offers many resources for comfort and healing.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Church Support Groups</h4>
                      <p className="text-sm text-secondary">Join grief share groups meeting weekly at local churches</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Pastoral Counseling</h4>
                      <p className="text-sm text-secondary">One-on-one spiritual guidance from trained clergy</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Stephen Ministry</h4>
                      <p className="text-sm text-secondary">Trained lay caregivers providing confidential support</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Christian Therapists</h4>
                      <p className="text-sm text-secondary">Professional counselors integrating faith and psychology</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Understanding Grief</h3>
                  <div className="space-y-3 text-sm text-secondary">
                    <p>
                      Grief is not a linear process. You may experience various emotions including sadness, anger, guilt, confusion, and even moments of peace. All of these are normal.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Common Grief Experiences:</h4>
                      <ul className="space-y-1 ml-4">
                        <li>Shock and denial in early days</li>
                        <li>Waves of intense emotion</li>
                        <li>Physical symptoms like fatigue or loss of appetite</li>
                        <li>Difficulty concentrating</li>
                        <li>Finding new meaning over time</li>
                        <li>Learning to carry the loss while moving forward</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-primary mb-3">Practical Support Ideas</h3>
                  <div className="space-y-2 text-sm text-secondary">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Meal Trains:</strong> Organize friends to provide meals for the family</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Childcare Help:</strong> Offer to watch children during difficult times</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Household Tasks:</strong> Help with cleaning, lawn care, or errands</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Just Listen:</strong> Sometimes presence and listening are the greatest gifts</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Remember Anniversaries:</strong> Check in on difficult dates in the months ahead</span>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">When to Seek Professional Help</h3>
                  <p className="text-sm text-secondary mb-3">
                    While grief is natural, sometimes additional support is needed. Consider professional counseling if:
                  </p>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>You feel stuck in intense grief for extended periods</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Depression interferes with daily functioning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>You have thoughts of harming yourself</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>You're turning to unhealthy coping mechanisms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>You feel you need additional support beyond friends and family</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comfort' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Comforting Scriptures & Prayers</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-primary mb-4">Popular Funeral Scriptures</h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Psalm 23 - The Lord is My Shepherd</h4>
                      <p className="text-sm text-secondary italic mb-2">
                        "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul... Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me..."
                      </p>
                      <p className="text-xs text-muted">The most beloved funeral text, offering comfort and assurance</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">John 14:1-3 - In My Father's House</h4>
                      <p className="text-sm text-secondary italic mb-2">
                        "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you..."
                      </p>
                      <p className="text-xs text-muted">Jesus' promise of eternal home and reunion</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Romans 8:38-39 - Nothing Can Separate Us</h4>
                      <p className="text-sm text-secondary italic mb-2">
                        "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord."
                      </p>
                      <p className="text-xs text-muted">Assurance of God's eternal love</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">1 Thessalonians 4:13-14 - Christian Hope</h4>
                      <p className="text-sm text-secondary italic mb-2">
                        "But I would not have you to be ignorant, brethren, concerning them which are asleep, that ye sorrow not, even as others which have no hope. For if we believe that Jesus died and rose again, even so them also which sleep in Jesus will God bring with him."
                      </p>
                      <p className="text-xs text-muted">Hope in the resurrection</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Revelation 21:4 - No More Tears</h4>
                      <p className="text-sm text-secondary italic mb-2">
                        "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away."
                      </p>
                      <p className="text-xs text-muted">Promise of heaven's perfect peace</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-3">Additional Comforting Passages</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <p className="font-semibold text-primary">Psalm 46:1</p>
                      <p className="text-secondary">"God is our refuge and strength, a very present help in trouble."</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <p className="font-semibold text-primary">Matthew 5:4</p>
                      <p className="text-secondary">"Blessed are they that mourn: for they shall be comforted."</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <p className="font-semibold text-primary">2 Corinthians 1:3-4</p>
                      <p className="text-secondary">"Blessed be God... the God of all comfort; Who comforteth us in all our tribulation."</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <p className="font-semibold text-primary">Psalm 34:18</p>
                      <p className="text-secondary">"The Lord is nigh unto them that are of a broken heart."</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <p className="font-semibold text-primary">Isaiah 41:10</p>
                      <p className="text-secondary">"Fear thou not; for I am with thee... I will strengthen thee."</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <p className="font-semibold text-primary">Philippians 4:7</p>
                      <p className="text-secondary">"And the peace of God... shall keep your hearts and minds."</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
                  <h3 className="font-bold text-primary mb-4">Traditional Funeral Prayers</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">The Lord's Prayer</h4>
                      <p className="text-sm text-secondary italic">
                        Our Father which art in heaven, Hallowed be thy name. Thy kingdom come, Thy will be done in earth, as it is in heaven...
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Prayer of Commendation</h4>
                      <p className="text-sm text-secondary italic">
                        Into your hands, O merciful Savior, we commend your servant. Acknowledge, we humbly beseech you, a sheep of your own fold, a lamb of your own flock, a sinner of your own redeeming. Receive them into the arms of your mercy, into the blessed rest of everlasting peace, and into the glorious company of the saints in light. Amen.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Prayer for the Bereaved</h4>
                      <p className="text-sm text-secondary italic">
                        Almighty God, Father of mercies and giver of comfort: Deal graciously, we pray, with all who mourn; that, casting all their care on you, they may know the consolation of your love; through Jesus Christ our Lord. Amen.
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Christian Funeral Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Complete guide to Christian funeral traditions, customs, and planning</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Cross className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Christian Funeral Traditions</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Burial vs. Cremation</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-primary mb-2">Traditional Burial</h5>
                      <p className="text-sm text-secondary mb-2">
                        Burial has been the traditional Christian practice for centuries, symbolizing the burial and resurrection of Christ.
                      </p>
                      <ul className="text-sm text-secondary space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Body is placed in casket and buried in cemetery plot</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Committal service at graveside with final prayers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Permanent location for family to visit and remember</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Headstone or marker with name, dates, and inscription</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-primary mb-2">Cremation</h5>
                      <p className="text-sm text-secondary mb-2">
                        Increasingly accepted in Christian traditions as focus is on resurrection of the spirit, not the physical body.
                      </p>
                      <ul className="text-sm text-secondary space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Body is cremated and ashes placed in urn</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Can have viewing/service before cremation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Ashes may be buried, placed in columbarium, or scattered</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Generally less expensive than traditional burial</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Traditional Hymns for Funerals</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">Amazing Grace</h5>
                      <p className="text-xs text-secondary">Classic hymn of redemption and God's grace</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">How Great Thou Art</h5>
                      <p className="text-xs text-secondary">Worship and praise for God's majesty</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">It Is Well With My Soul</h5>
                      <p className="text-xs text-secondary">Peace and trust through life's storms</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">The Old Rugged Cross</h5>
                      <p className="text-xs text-secondary">Hymn of sacrifice and salvation</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">Blessed Assurance</h5>
                      <p className="text-xs text-secondary">Joy and confidence in Christ</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">Abide With Me</h5>
                      <p className="text-xs text-secondary">Prayer for God's presence in darkness</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">Great Is Thy Faithfulness</h5>
                      <p className="text-xs text-secondary">God's unchanging faithfulness</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-primary text-sm mb-1">In the Garden</h5>
                      <p className="text-xs text-secondary">Intimate communion with Jesus</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Eulogy Guidelines</h4>
                  <p className="text-sm text-secondary mb-3">
                    A eulogy is a tribute celebrating the life of the deceased. It should be personal, heartfelt, and honest.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-primary">Length:</h5>
                        <p className="text-secondary">Typically 5-10 minutes (800-1500 words)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-primary">Content:</h5>
                        <p className="text-secondary">Share stories, memories, accomplishments, character traits, and impact on others</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-primary">Tone:</h5>
                        <p className="text-secondary">Balance sadness with celebration; humor appropriate if it reflects the person</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-primary">Faith:</h5>
                        <p className="text-secondary">Mention their Christian faith and hope in resurrection if appropriate</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-primary">Practice:</h5>
                        <p className="text-secondary">Read it aloud several times beforehand; it's okay to show emotion</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Denominational Variations</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-semibold text-primary mb-1">Catholic</h5>
                      <p className="text-secondary">Vigil (wake) with rosary, funeral Mass with Eucharist, Rite of Committal at graveside</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-primary mb-1">Protestant (Baptist, Methodist, Presbyterian, etc.)</h5>
                      <p className="text-secondary">Visitation, funeral service with hymns, Scripture, and sermon, graveside service</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-primary mb-1">Orthodox</h5>
                      <p className="text-secondary">Trisagion prayers, Divine Liturgy, elaborate ritual with icons and incense</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-primary mb-1">Non-denominational/Evangelical</h5>
                      <p className="text-secondary">Celebration of life service, contemporary worship, focus on personal faith testimony</p>
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
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Pre-Planning is a Gift</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Consider pre-planning your own funeral to relieve burden on family during difficult time.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Don't Rush Decisions</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Take time to make choices; funeral homes can wait a day or two for major decisions.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Accept Help</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Let church family, friends, and community support you with meals, tasks, and presence.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Lean on Faith</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Trust in God's comfort and the hope of resurrection through Jesus Christ.</p>
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
