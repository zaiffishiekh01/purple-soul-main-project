import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Baby, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import WelcomeProductCatalog from './WelcomeProductCatalog';
import UniversalRegistry from './UniversalRegistry';

interface JewishWelcomePlannerProps {
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
  category: 'spiritual' | 'preparation' | 'ceremony' | 'gifts' | 'celebration';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function JewishWelcomePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: JewishWelcomePlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'ceremony' | 'packages' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [hebrewName, setHebrewName] = useState('');
  const [babyGender, setBabyGender] = useState<'boy' | 'girl' | ''>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [budget, setBudget] = useState(3000);

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
    { id: '1', text: 'Select mohel/rabbi for ceremony', completed: false, category: 'preparation' },
    { id: '2', text: 'Choose Hebrew name', completed: false, category: 'preparation' },
    { id: '3', text: 'Select sandek (godfather)', completed: false, category: 'preparation' },
    { id: '4', text: 'Choose kvater/kvaterin (godparents who carry baby)', completed: false, category: 'preparation' },
    { id: '5', text: 'Plan Brit Milah ceremony (8th day for boy)', completed: false, category: 'ceremony' },
    { id: '6', text: 'Plan Simchat Bat ceremony (for girl)', completed: false, category: 'ceremony' },
    { id: '7', text: 'Prepare kiddush/reception food', completed: false, category: 'celebration' },
    { id: '8', text: 'Order tallit/kippot for guests', completed: false, category: 'ceremony' },
    { id: '9', text: 'Prepare naming certificate', completed: false, category: 'spiritual' },
    { id: '10', text: 'Invite family and community', completed: false, category: 'celebration' },
    { id: '11', text: 'Arrange synagogue or home venue', completed: false, category: 'preparation' },
    { id: '12', text: 'Purchase baby Judaica gifts', completed: false, category: 'gifts' },
    { id: '13', text: 'Prepare wine/grape juice for blessings', completed: false, category: 'ceremony' },
    { id: '14', text: 'Check if Pidyon HaBen needed (firstborn boy, 30 days)', completed: false, category: 'spiritual' },
    { id: '15', text: 'Prepare Elijah\'s chair (for Brit Milah)', completed: false, category: 'ceremony' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Mohel/Rabbi Fees', estimated: 600, actual: 0, icon: User },
    { name: 'Ceremony Venue', estimated: 400, actual: 0, icon: Baby },
    { name: 'Reception & Food', estimated: 800, actual: 0, icon: Gift },
    { name: 'Baby Judaica Gifts', estimated: 500, actual: 0, icon: Package },
    { name: 'Kippot & Tallit', estimated: 200, actual: 0, icon: Star },
    { name: 'Photography/Videography', estimated: 300, actual: 0, icon: CheckCircle },
    { name: 'Invitations & Printing', estimated: 200, actual: 0, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Baby className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Jewish New Birth & Welcome Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Plan a blessed Brit Milah or Simchat Bat ceremony and welcome your new baby with Jewish traditions</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
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
                  <div className="text-sm text-purple-600 dark:text-purple-400">Baby Gender</div>
                  <select
                    value={babyGender}
                    onChange={(e) => setBabyGender(e.target.value as 'boy' | 'girl' | '')}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  >
                    <option value="" className="text-gray-900">Select</option>
                    <option value="boy" className="text-gray-900">Boy</option>
                    <option value="girl" className="text-gray-900">Girl</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Hebrew Name</div>
                  <input
                    type="text"
                    value={hebrewName}
                    onChange={(e) => setHebrewName(e.target.value)}
                    placeholder="Hebrew name"
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
              { id: 'guide', label: 'Jewish Guide', icon: Book }
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome Your New Baby with Jewish Traditions</h2>
              <p className="text-secondary mb-6">
                Celebrate the arrival of your precious gift from HaShem with the beautiful Jewish traditions of Brit Milah (for boys) or Simchat Bat (for girls). This planner guides you through every meaningful step of welcoming your newborn into the covenant.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Baby className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Brit Milah / Simchat Bat</h3>
                  <p className="text-sm text-secondary">Plan the traditional covenant ceremony for your baby</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Hebrew Names</h3>
                  <p className="text-sm text-secondary">Choose a beautiful Hebrew name with meaning and tradition</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Sacred Traditions</h3>
                  <p className="text-sm text-secondary">Follow meaningful Jewish practices for welcoming new life</p>
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
                  <div className="text-3xl font-bold">{birthDate && babyGender === 'boy' ? '8 days' : birthDate ? 'TBD' : '-'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Until Ceremony</div>
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
              <h2 className="text-2xl font-bold text-primary mb-6">Jewish Welcome Checklist</h2>

              {['spiritual', 'preparation', 'ceremony', 'gifts', 'celebration'].map(category => (
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Jewish New Birth Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Welcome your baby with the sacred traditions of Jewish covenant and naming</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Baby className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Jewish Traditions for Newborns</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Brit Milah - Covenant of Circumcision (Boys)</h4>
                  <p className="text-secondary mb-3">
                    The Brit Milah is performed on the 8th day after birth (unless health concerns require delay). It is one of the most ancient and fundamental Jewish practices, dating back to Abraham.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Timing:</strong> 8th day after birth, even if it falls on Shabbat or Yom Kippur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Mohel:</strong> Specially trained practitioner who performs the circumcision</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Sandek:</strong> The honored person (usually grandfather) who holds the baby during the ceremony</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Kvater/Kvaterin:</strong> Godparents who carry the baby to and from the ceremony</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Elijah's Chair:</strong> A special chair set aside symbolically for the prophet Elijah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Naming:</strong> The baby receives his Hebrew name during the ceremony</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Simchat Bat / Zeved HaBat - Naming Ceremony (Girls)</h4>
                  <p className="text-secondary mb-3">
                    The naming ceremony for girls celebrates the birth and formally gives the baby her Hebrew name. While customs vary, it is often held in the synagogue or at home within the first few weeks.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Timing:</strong> Often on first Shabbat or within first month, varies by community</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Location:</strong> Synagogue during Torah reading, or at home ceremony</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Blessings:</strong> Special prayers, Hebrew name announcement, often Mi Shebeirach blessing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Ceremony:</strong> May include candle lighting, Torah readings, and special songs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Modern Customs:</strong> Some families create elaborate ceremonies similar to Brit Milah structure</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Hebrew Naming Traditions</h4>
                  <p className="text-secondary mb-3">
                    Hebrew names connect children to Jewish heritage and often honor deceased relatives or biblical figures.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Ashkenazi Custom:</strong> Name after deceased relatives to honor their memory</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Sephardi Custom:</strong> May name after living grandparents as a sign of respect</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Biblical Names:</strong> Names from Torah (Sarah, Rebecca, David, Jacob, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Format:</strong> [Name] son/daughter of [Father's Hebrew name] - Example: "Moshe ben Avraham"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Meaningful Names:</strong> Choose names with beautiful meanings and positive associations</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Pidyon HaBen - Redemption of the Firstborn</h4>
                  <p className="text-secondary mb-3">
                    For firstborn sons (to the mother, born naturally), a special ceremony is held on the 31st day.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Criteria:</strong> First child born to mother, natural birth, not if father is Kohen or Levi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Timing:</strong> 31st day after birth (30 days must pass)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Ceremony:</strong> Symbolic redemption with five silver coins given to a Kohen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Celebration:</strong> Often includes festive meal and gathering of family</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Traditional Blessings & Prayers</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Blessing over Wine (Kiddush):</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2 font-hebrew">בָּרוּךְ אַתָּה ה' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הַגָּפֶן</p>
                      <p className="text-sm text-secondary">"Blessed are You, Lord our God, King of the universe, who creates the fruit of the vine"</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Shehecheyanu (for joyous occasions):</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2 font-hebrew">בָּרוּךְ אַתָּה ה' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה</p>
                      <p className="text-sm text-secondary">"Blessed are You, Lord our God, King of the universe, who has granted us life, sustained us, and enabled us to reach this occasion"</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Traditional Wish at Brit Milah:</p>
                      <p className="text-gray-800 dark:text-gray-200 text-lg mb-2 font-hebrew">כְּשֵׁם שֶׁנִּכְנַס לַבְּרִית, כֵּן יִכָּנֵס לְתוֹרָה לְחֻפָּה וּלְמַעֲשִׂים טוֹבִים</p>
                      <p className="text-sm text-secondary">"Just as he has entered into the covenant, so may he enter into Torah, the wedding canopy, and good deeds"</p>
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
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Book Mohel Early</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Experienced mohalim are often booked in advance. Contact them during pregnancy if possible.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Health First</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Brit Milah is delayed if baby is unwell or premature. Baby's health always takes priority.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Prepare Festive Meal</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">A Seudah (festive meal) is a mitzvah. Even simple refreshments honor the occasion.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Meaningful Hebrew Name</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Research names carefully - this name will be used for all religious occasions throughout life.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Community Celebration</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Invite synagogue community - these ceremonies strengthen Jewish communal bonds.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Document Everything</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Take photos, videos, and keep naming certificate - these become precious family heirlooms.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Traditional Jewish Baby Gifts</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Religious Items</h4>
                  <ul className="space-y-1 text-sm text-secondary">
                    <li>• Kiddush cup for baby's future use</li>
                    <li>• Shabbat candlesticks (for girls)</li>
                    <li>• Tzedakah (charity) box</li>
                    <li>• Baby's first siddur (prayer book)</li>
                    <li>• Mezuzah for nursery door</li>
                    <li>• Tallit and tefillin (for boys, future use)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Keepsakes & Practical</h4>
                  <ul className="space-y-1 text-sm text-secondary">
                    <li>• Naming certificate in decorative frame</li>
                    <li>• Jewish baby blessing artwork</li>
                    <li>• Hebrew name wall art</li>
                    <li>• Jewish children's books</li>
                    <li>• Hand-embroidered challah cover</li>
                    <li>• Silver savings bonds (traditional gift)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Planning Timeline</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-purple-600 dark:text-purple-400">Before Birth</div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-1 text-sm text-secondary">
                      <li>• Research and contact mohel/rabbi</li>
                      <li>• Consider potential Hebrew names</li>
                      <li>• Discuss sandek and kvater roles with family</li>
                      <li>• Plan potential ceremony location</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-purple-600 dark:text-purple-400">Day 1-2</div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-1 text-sm text-secondary">
                      <li>• Confirm mohel for 8th day (boys)</li>
                      <li>• Finalize Hebrew name</li>
                      <li>• Notify family and close friends</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-purple-600 dark:text-purple-400">Day 3-7</div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-1 text-sm text-secondary">
                      <li>• Finalize ceremony details and location</li>
                      <li>• Order/prepare food for kiddush</li>
                      <li>• Prepare Elijah's chair (for boys)</li>
                      <li>• Send invitations to community</li>
                      <li>• Arrange photographer if desired</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-purple-600 dark:text-purple-400">Day 8 (Boys)</div>
                  <div className="flex-1 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Brit Milah Ceremony & Celebration</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-purple-600 dark:text-purple-400">Week 1-4 (Girls)</div>
                  <div className="flex-1 bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">Simchat Bat Naming Ceremony (timing flexible)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-24 text-sm font-semibold text-purple-600 dark:text-purple-400">Day 31</div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-secondary">Pidyon HaBen if applicable (firstborn sons)</p>
                  </div>
                </div>
              </div>
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

        {activeTab === 'ceremony' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Ceremony Details</h2>

              {babyGender === 'boy' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">Brit Milah - 8th Day Covenant</h3>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-secondary mb-4">
                      The Brit Milah ceremony marks the entrance of your son into the covenant between God and the Jewish people.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <span className="text-secondary"><strong>When:</strong> 8th day after birth</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <span className="text-secondary"><strong>Who:</strong> Mohel performs circumcision, Sandek holds baby, parents present</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <span className="text-secondary"><strong>What to Prepare:</strong> Wine, Elijah's chair, naming certificate, festive meal</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {babyGender === 'girl' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">Simchat Bat - Naming Ceremony</h3>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-secondary mb-4">
                      The Simchat Bat ceremony celebrates your daughter's birth and formally gives her Hebrew name.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <span className="text-secondary"><strong>When:</strong> First Shabbat or within first month (flexible)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <span className="text-secondary"><strong>Where:</strong> Synagogue during Torah reading or home ceremony</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <span className="text-secondary"><strong>What to Prepare:</strong> Coordinate with rabbi, prepare readings, plan celebration</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!babyGender && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                  <p className="text-muted">Select baby's gender above to see specific ceremony details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Ceremony Timeline</h2>

            <div className="space-y-4">
              {babyGender === 'boy' ? (
                <>
                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h4 className="font-bold text-primary">Day 8 - Brit Milah</h4>
                    <p className="text-sm text-muted">Circumcision ceremony and Hebrew naming</p>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h4 className="font-bold text-primary">Day 31 - Check Pidyon HaBen</h4>
                    <p className="text-sm text-muted">If firstborn son, redemption ceremony may be needed</p>
                  </div>
                </>
              ) : babyGender === 'girl' ? (
                <>
                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h4 className="font-bold text-primary">First Shabbat or Within First Month</h4>
                    <p className="text-sm text-muted">Simchat Bat naming ceremony</p>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                  <p className="text-muted">Select baby's gender to see timeline details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
