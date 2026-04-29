import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Baby, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import WelcomeProductCatalog from './WelcomeProductCatalog';
import UniversalRegistry from './UniversalRegistry';

interface SharedWelcomePlannerProps {
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
  category: 'planning' | 'preparation' | 'ceremony' | 'gifts' | 'celebration';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function SharedWelcomePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: SharedWelcomePlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'ceremony' | 'packages' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(2500);

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
    { id: '1', text: 'Choose meaningful baby name', completed: false, category: 'planning' },
    { id: '2', text: 'Decide on ceremony type (secular, interfaith, or multi-faith)', completed: false, category: 'planning' },
    { id: '3', text: 'Select ceremony date and time', completed: false, category: 'planning' },
    { id: '4', text: 'Choose venue (home, park, community center, etc.)', completed: false, category: 'preparation' },
    { id: '5', text: 'Create guest list', completed: false, category: 'preparation' },
    { id: '6', text: 'Send invitations', completed: false, category: 'preparation' },
    { id: '7', text: 'Plan ceremony structure and rituals', completed: false, category: 'ceremony' },
    { id: '8', text: 'Select readings, poems, or blessings', completed: false, category: 'ceremony' },
    { id: '9', text: 'Choose officiant or ceremony leader', completed: false, category: 'ceremony' },
    { id: '10', text: 'Prepare reception menu', completed: false, category: 'celebration' },
    { id: '11', text: 'Plan decorations', completed: false, category: 'celebration' },
    { id: '12', text: 'Purchase baby gifts and keepsakes', completed: false, category: 'gifts' },
    { id: '13', text: 'Create memory book or time capsule', completed: false, category: 'gifts' },
    { id: '14', text: 'Arrange photography/videography', completed: false, category: 'celebration' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Ceremony & Venue', estimated: 500, actual: 0, icon: Baby },
    { name: 'Reception & Catering', estimated: 700, actual: 0, icon: Gift },
    { name: 'Invitations & Announcements', estimated: 150, actual: 0, icon: Heart },
    { name: 'Baby Gifts & Keepsakes', estimated: 400, actual: 0, icon: Package },
    { name: 'Decorations & Supplies', estimated: 300, actual: 0, icon: Star },
    { name: 'Photography & Video', estimated: 350, actual: 0, icon: Sparkles },
    { name: 'Miscellaneous', estimated: 100, actual: 0, icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Baby className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Universal Baby Welcome Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Create a meaningful, inclusive celebration to welcome your precious little one</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Birth Date</div>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Baby Name</div>
                  <input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="Baby's name"
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

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Budget</div>
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
              { id: 'ceremony', label: 'Ceremony', icon: Baby },
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome Your Baby with Love and Meaning</h2>
              <p className="text-secondary mb-6">
                Create a beautiful, inclusive celebration that honors your values and traditions. Whether you're planning a secular naming ceremony, interfaith blessing, or multi-cultural welcome celebration, this planner helps you create a meaningful experience for your family and community.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Baby className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Naming Ceremony</h3>
                  <p className="text-sm text-secondary">Create a personalized ceremony to introduce your baby to loved ones</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Universal Traditions</h3>
                  <p className="text-sm text-secondary">Incorporate meaningful rituals from various cultures and philosophies</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Inclusive Celebration</h3>
                  <p className="text-sm text-secondary">Welcome family and friends of all backgrounds to share in your joy</p>
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
                  <div className="text-3xl font-bold">{birthDate ? 'Set' : 'Pending'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Celebration Date</div>
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
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Baby Welcome Checklist</h2>

              {['planning', 'preparation', 'ceremony', 'gifts', 'celebration'].map(category => (
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
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Baby Welcome Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Create meaningful, inclusive celebrations that honor your family's values and traditions</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Baby className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Types of Baby Welcome Ceremonies</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Secular Naming Ceremony</h4>
                  <p className="text-secondary mb-3">
                    A non-religious celebration focused on community, love, and commitment to the child's well-being.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Name Announcement:</strong> Formally introduce your baby's name and share its meaning or significance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Guide Parents:</strong> Appoint special adults who commit to supporting your child's growth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Promises & Commitments:</strong> Parents and guides make pledges to nurture and support the child</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Readings:</strong> Share meaningful poems, quotes, or passages about children and parenting</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Interfaith & Multi-Cultural Ceremonies</h4>
                  <p className="text-secondary mb-3">
                    Blend traditions from different cultures and faiths to create a unique celebration that honors your family's diverse heritage.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Blessing Rituals:</strong> Incorporate meaningful blessings from various traditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Cultural Symbols:</strong> Use objects or rituals that represent your family's heritage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Multilingual Elements:</strong> Include words, songs, or prayers in ancestral languages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Unity Ceremonies:</strong> Symbolic acts that represent bringing families together</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Universal Baby Blessing Ideas</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Tree Planting:</strong> Plant a tree to grow alongside your child, symbolizing growth and rootedness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Candle Lighting:</strong> Light candles representing love, hope, wisdom, and joy for the child</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Water Blessing:</strong> Use water to symbolize purity, life, and spiritual cleansing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Circle of Love:</strong> Guests stand in a circle, passing the baby while sharing wishes and blessings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Time Capsule:</strong> Collect letters, photos, and mementos to open on a future birthday</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Hand/Footprint Art:</strong> Create keepsake art with baby's prints during the ceremony</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Sample Ceremony Structure</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-primary mb-2">1. Welcome & Opening Words</p>
                      <p className="text-sm text-secondary">Officiant or parent welcomes guests and explains the ceremony's purpose</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-primary mb-2">2. Name Announcement</p>
                      <p className="text-sm text-secondary">Introduce the baby's full name and share its meaning or story</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-primary mb-2">3. Readings & Blessings</p>
                      <p className="text-sm text-secondary">Share poems, quotes, or wisdom from loved ones</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-primary mb-2">4. Guide Parent Appointments</p>
                      <p className="text-sm text-secondary">Formally ask special people to serve as mentors and guides</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-primary mb-2">5. Promises & Commitments</p>
                      <p className="text-sm text-secondary">Parents and guides pledge their support and love</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-primary mb-2">6. Symbolic Ritual</p>
                      <p className="text-sm text-secondary">Candle lighting, tree planting, or other meaningful ceremony</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-primary mb-2">7. Closing & Celebration</p>
                      <p className="text-sm text-secondary">Final words of love followed by reception with food and fellowship</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Choosing a Meaningful Name</h3>
              </div>

              <div className="space-y-4 text-secondary">
                <p>
                  Your baby's name is one of the first gifts you give them. Whether you choose a family name, nature-inspired name, or one with special meaning, consider these approaches:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Honor Heritage</h4>
                    <ul className="text-sm space-y-1">
                      <li>Family names from ancestors</li>
                      <li>Cultural or ethnic traditions</li>
                      <li>Names from your native language</li>
                      <li>Historical figures you admire</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Meaningful Qualities</h4>
                    <ul className="text-sm space-y-1">
                      <li>Virtue names (Grace, Hope, Justice)</li>
                      <li>Nature names (River, Willow, Sky)</li>
                      <li>Names meaning joy, strength, wisdom</li>
                      <li>Literary or artistic inspirations</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4 mt-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Name Presentation Ideas</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Create a beautiful certificate explaining the name's meaning and why you chose it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Share a story about how you decided on the name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>If naming after someone, have them participate in the announcement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Create artwork with the baby's name to display at the ceremony</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Guide Parents & Mentors</h3>
              </div>

              <p className="text-secondary mb-4">
                Guide parents (similar to godparents in some traditions) are special adults who commit to supporting your child's journey through life. They provide mentorship, love, and guidance as your child grows.
              </p>

              <div className="space-y-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Choosing Guide Parents</h4>
                  <ul className="text-sm text-secondary space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Select people who share your values and will be present in your child's life</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Consider choosing 2-4 guide parents to provide diverse perspectives and support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>They can be family members, close friends, or mentors you deeply respect</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Discuss expectations and commitments before asking them formally</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Guide Parent Promises (Example)</h4>
                  <div className="text-sm text-secondary italic bg-white dark:bg-gray-800 rounded p-3 mt-2">
                    <p className="mb-2">"Do you promise to:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Be a loving presence in this child's life?</li>
                      <li>• Offer guidance, support, and encouragement as they grow?</li>
                      <li>• Share your wisdom, experiences, and values?</li>
                      <li>• Support the parents in nurturing this child?</li>
                      <li>• Be there in times of joy and in times of need?"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Readings, Poems & Blessings</h3>
              </div>

              <div className="space-y-4">
                <p className="text-secondary">
                  Incorporate meaningful words that express your hopes and dreams for your child. Here are some ideas:
                </p>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Classic Poems & Quotes</h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <p className="text-sm italic text-secondary">
                        "A new baby is like the beginning of all things—wonder, hope, a dream of possibilities." - Eda LeShan
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <p className="text-sm italic text-secondary">
                        "Making the decision to have a child is momentous. It is to decide forever to have your heart go walking around outside your body." - Elizabeth Stone
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <p className="text-sm italic text-secondary">
                        "Children are the hands by which we take hold of heaven." - Henry Ward Beecher
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Universal Blessing Examples</h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded p-4">
                      <p className="font-semibold text-primary mb-2">May You Be Blessed</p>
                      <p className="text-sm text-secondary italic">
                        May you be blessed with strength and courage,<br/>
                        May you know love in its fullness,<br/>
                        May you find joy in simple moments,<br/>
                        May you grow in wisdom and kindness,<br/>
                        May you always know you are cherished.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded p-4">
                      <p className="font-semibold text-primary mb-2">A Parent's Wish</p>
                      <p className="text-sm text-secondary italic">
                        We wish for you a life of wonder,<br/>
                        A heart full of compassion,<br/>
                        Hands that create and build,<br/>
                        A mind curious and open,<br/>
                        And the courage to be truly yourself.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Sources for Readings</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Children's literature (Dr. Seuss, Shel Silverstein, etc.)</li>
                    <li>• Poetry collections about childhood and parenting</li>
                    <li>• Philosophical texts about life and growth</li>
                    <li>• Nature writings about new beginnings</li>
                    <li>• Personal letters or writings from family members</li>
                    <li>• Song lyrics that hold special meaning</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Planning Tips & Reminders</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Keep It Personal</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Design a ceremony that reflects your family's unique values, not what you think you "should" do.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Consider Baby's Needs</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Schedule around feeding and nap times. Keep ceremonies under 30-45 minutes for everyone's comfort.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Involve Loved Ones</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Ask family and friends to do readings, share blessings, or participate in rituals.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Document Everything</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Hire a photographer or designate someone to capture photos and videos of this special day.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Prepare for Weather</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">If planning an outdoor ceremony, have a backup indoor location in case of bad weather.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Create Keepsakes</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Save programs, guest book messages, and ceremony elements for your child to treasure later.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Reception & Celebration Ideas</h3>
              </div>

              <div className="space-y-4 text-secondary">
                <p>
                  After the ceremony, celebrate with food, fellowship, and fun. Here are ideas for making your reception memorable:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Food & Drink</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Brunch, lunch, or afternoon tea</li>
                      <li>• Potluck contributions from guests</li>
                      <li>• Themed cake or dessert bar</li>
                      <li>• Special cultural dishes</li>
                      <li>• Non-alcoholic mocktails</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Activities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Guest book with wishes for baby</li>
                      <li>• Photo booth with props</li>
                      <li>• Children's activity corner</li>
                      <li>• Memory sharing circle</li>
                      <li>• Music and dancing</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Decorations</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Balloons and banners</li>
                      <li>• Photo displays of baby's first days</li>
                      <li>• Floral arrangements</li>
                      <li>• Themed color scheme</li>
                      <li>• Meaningful cultural symbols</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-2">Favors & Gifts</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Small plants or seed packets</li>
                      <li>• Personalized cookies or treats</li>
                      <li>• Charitable donations in baby's honor</li>
                      <li>• Photo magnets or bookmarks</li>
                      <li>• Thank you cards with baby's photo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Final Thoughts</h3>
              <p className="text-purple-600 dark:text-purple-400 mb-4">
                There is no single "right way" to welcome a baby into the world. The most important thing is that your ceremony reflects your love, values, and hopes for your child's future. Whether simple or elaborate, religious or secular, traditional or innovative—make it meaningful for your family.
              </p>
              <p className="text-purple-600 dark:text-purple-400">
                This is a celebration of new life, new beginnings, and the incredible journey of parenthood. Surround yourselves with people who love and support you, create beautiful memories, and most importantly, enjoy this precious time with your little one.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <WelcomeProductCatalog
              products={mockProducts}
              onAddToCart={onAddToCart}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
              onViewProduct={onViewProduct}
              onQuickView={onQuickView}
            />
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Your Wishlist</h2>
            <p className="text-muted">Save items you love for your baby's welcome celebration.</p>
          </div>
        )}

        {activeTab === 'registry' && (
          <UniversalRegistry
            registryType="celebration"
            availableProducts={mockProducts}
            onAddToCart={onAddToCart}
            viewMode="browse"
          />
        )}

        {activeTab === 'timeline' && (
          <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Planning Timeline</h2>
            <p className="text-muted mb-6">Plan your baby welcome celebration with this helpful timeline.</p>

            <div className="space-y-4">
              <div className="border-l-4 border-purple-600 pl-4 py-2">
                <h3 className="font-bold text-lg text-primary">4-6 Weeks Before</h3>
                <ul className="mt-2 space-y-1 text-secondary">
                  <li>• Choose ceremony date and location</li>
                  <li>• Decide on ceremony type and structure</li>
                  <li>• Select guide parents/mentors</li>
                  <li>• Create guest list</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-600 pl-4 py-2">
                <h3 className="font-bold text-lg text-primary">3-4 Weeks Before</h3>
                <ul className="mt-2 space-y-1 text-secondary">
                  <li>• Send invitations</li>
                  <li>• Book venue (if needed)</li>
                  <li>• Select readings and music</li>
                  <li>• Order decorations and supplies</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-600 pl-4 py-2">
                <h3 className="font-bold text-lg text-primary">1-2 Weeks Before</h3>
                <ul className="mt-2 space-y-1 text-secondary">
                  <li>• Finalize ceremony script</li>
                  <li>• Confirm catering/menu</li>
                  <li>• Arrange photographer</li>
                  <li>• Purchase baby outfit</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-600 pl-4 py-2">
                <h3 className="font-bold text-lg text-primary">Week of Ceremony</h3>
                <ul className="mt-2 space-y-1 text-secondary">
                  <li>• Confirm final headcount</li>
                  <li>• Set up venue/decorations</li>
                  <li>• Prepare programs or handouts</li>
                  <li>• Do final rehearsal</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ceremony' && (
          <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Ceremony Planning</h2>
            <p className="text-muted mb-6">Design your perfect baby welcome ceremony with these customizable elements.</p>

            <div className="space-y-6">
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Ceremony Location Ideas</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <h4 className="font-semibold text-primary mb-1">Home Ceremony</h4>
                    <p className="text-sm text-secondary">Intimate, personal, and cost-effective</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <h4 className="font-semibold text-primary mb-1">Garden/Park</h4>
                    <p className="text-sm text-secondary">Beautiful natural setting, weather permitting</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <h4 className="font-semibold text-primary mb-1">Community Center</h4>
                    <p className="text-sm text-secondary">Accessible venue with facilities</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <h4 className="font-semibold text-primary mb-1">Special Venue</h4>
                    <p className="text-sm text-secondary">Restaurant, garden, or meaningful location</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                <h3 className="font-bold text-lg text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Who Should Officiate?</h3>
                <ul className="space-y-2 text-secondary">
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Parent:</strong> One or both parents can lead the ceremony themselves</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Family Elder:</strong> Grandparent or respected family member</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Close Friend:</strong> Someone who knows you well and is comfortable speaking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Professional Celebrant:</strong> Trained officiant who specializes in secular ceremonies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
