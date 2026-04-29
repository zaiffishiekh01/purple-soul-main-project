import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Home, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import HomeBlessingProductCatalog from './HomeBlessingProductCatalog';

interface JewishHomeBlessingPlannerProps {
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
  category: 'spiritual' | 'preparation' | 'ceremony' | 'kitchen' | 'celebration';
}

interface TimelineEvent {
  id: string;
  title: string;
  timeframe: string;
  tasks: string[];
  completed: boolean;
}

export default function JewishHomeBlessingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: JewishHomeBlessingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'blessing' | 'mezuzah' | 'decoration' | 'hospitality' | 'shopping' | 'guide'>('overview');
  const [moveInDate, setMoveInDate] = useState('');
  const [homeType, setHomeType] = useState('');
  const [familySize, setFamilySize] = useState('');
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
    { id: '1', text: 'Purchase kosher mezuzot for all doorways', completed: false, category: 'spiritual' },
    { id: '2', text: 'Have mezuzot checked by a sofer (scribe)', completed: false, category: 'spiritual' },
    { id: '3', text: 'Clean and prepare home for blessing', completed: false, category: 'preparation' },
    { id: '4', text: 'Plan Chanukat HaBayit ceremony date', completed: false, category: 'ceremony' },
    { id: '5', text: 'Invite rabbi or knowledgeable person to lead blessings', completed: false, category: 'ceremony' },
    { id: '6', text: 'Affix mezuzot with proper blessings', completed: false, category: 'ceremony' },
    { id: '7', text: 'Kasher kitchen (if needed)', completed: false, category: 'kitchen' },
    { id: '8', text: 'Set up kosher dishes and utensils', completed: false, category: 'kitchen' },
    { id: '9', text: 'Invite family and community for celebration', completed: false, category: 'celebration' },
    { id: '10', text: 'Prepare festive meal with challah and wine', completed: false, category: 'celebration' },
    { id: '11', text: 'Arrange for words of Torah to be shared', completed: false, category: 'celebration' },
    { id: '12', text: 'Purchase Jewish home decorations', completed: false, category: 'preparation' },
    { id: '13', text: 'Obtain charity box (tzedakah pushke)', completed: false, category: 'spiritual' },
    { id: '14', text: 'Set up Shabbat candles and candlesticks', completed: false, category: 'spiritual' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Chanukat HaBayit', estimated: 800, actual: 0, icon: Home },
    { name: 'Mezuzot', estimated: 600, actual: 0, icon: Star },
    { name: 'Kosher Kitchen Setup', estimated: 1200, actual: 0, icon: Gift },
    { name: 'Judaica Decor', estimated: 800, actual: 0, icon: Package },
    { name: 'Reception & Food', estimated: 1000, actual: 0, icon: Heart },
    { name: 'Books & Educational', estimated: 300, actual: 0, icon: Book },
    { name: 'Charity & Giving', estimated: 300, actual: 0, icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Jewish Home Blessing Planner</h1>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-lg mb-6">Plan a meaningful Chanukat HaBayit and welcome the Divine Presence into your new home</p>

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
                  <input
                    type="text"
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                    placeholder="House, apartment..."
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Family Size</div>
                  <input
                    type="text"
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                    placeholder="Number of people"
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
              { id: 'blessing', label: 'Blessing', icon: Star },
              { id: 'mezuzah', label: 'Mezuzah', icon: Book },
              { id: 'decoration', label: 'Decoration', icon: Gift },
              { id: 'hospitality', label: 'Hospitality', icon: Heart },
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome the Shechinah into Your New Home</h2>
              <p className="text-secondary mb-6">
                Celebrate your new home with the sacred traditions of Chanukat HaBayit (dedication of the home), mezuzah affixing, and creating a space filled with holiness, warmth, and Jewish values. This planner guides you through transforming your house into a Jewish home.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Home className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Chanukat HaBayit</h3>
                  <p className="text-sm text-secondary">Plan a meaningful home dedication ceremony</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Mezuzah Affixing</h3>
                  <p className="text-sm text-secondary">Place mezuzot on doorways with proper blessings</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Kosher Kitchen</h3>
                  <p className="text-sm text-secondary">Set up your kitchen according to kashrut laws</p>
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
                  <div className="text-3xl font-bold">{moveInDate ? 'Scheduled' : 'Not Set'}</div>
                  <div className="text-purple-600 dark:text-purple-400 text-sm">Blessing Date</div>
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
              <h2 className="text-2xl font-bold text-primary mb-6">Jewish Home Blessing Checklist</h2>

              {['spiritual', 'preparation', 'ceremony', 'kitchen', 'celebration'].map(category => (
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
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-2">Before Move-In</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Purchase kosher mezuzot from a reliable source</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Have mezuzot checked by a qualified sofer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Order Jewish home decorations and Judaica items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Plan kosher kitchen setup if applicable</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-2">Moving Day</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Affix mezuzah on main entrance immediately upon arrival</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Say the Shehecheyanu blessing for this milestone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Set up charity box (tzedakah pushke) in visible place</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-2">Within 30 Days</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Affix remaining mezuzot on all qualifying doorways</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Plan and hold Chanukat HaBayit celebration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Invite rabbi or Torah scholar to speak at celebration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Complete kosher kitchen setup</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-xl font-bold text-primary mb-2">Ongoing</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Establish regular Torah learning in your home</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Practice regular acts of hospitality (hachnasat orchim)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Check mezuzot every few years for kashrut</span>
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
            </div>
          </div>
        )}

        {activeTab === 'blessing' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Chanukat HaBayit - Home Dedication</h2>
              <p className="text-purple-600 dark:text-purple-400">Sacred blessings and prayers for your new Jewish home</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Mezuzah Blessing</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4">Blessing for Affixing a Mezuzah</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                      <p className="text-muted text-sm mb-3">Hebrew:</p>
                      <p className="text-2xl text-gray-900 dark:text-gray-100 mb-4 text-right font-hebrew leading-relaxed">
                        בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ לִקְבֹּעַ מְזוּזָה
                      </p>
                      <p className="text-muted text-sm mb-2">Transliteration:</p>
                      <p className="text-gray-800 dark:text-gray-200 mb-3 italic">
                        Baruch atah Adonai, Eloheinu melech ha-olam, asher kid'shanu b'mitzvotav v'tzivanu likbo'a mezuzah.
                      </p>
                      <p className="text-muted text-sm mb-2">Translation:</p>
                      <p className="text-gray-800 dark:text-gray-200">
                        Blessed are You, Lord our God, Ruler of the universe, who has sanctified us with His commandments and commanded us to affix a mezuzah.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4">Shehecheyanu Blessing (First Time)</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                    <p className="text-muted text-sm mb-3">Hebrew:</p>
                    <p className="text-2xl text-gray-900 dark:text-gray-100 mb-4 text-right font-hebrew leading-relaxed">
                      בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה
                    </p>
                    <p className="text-muted text-sm mb-2">Transliteration:</p>
                    <p className="text-gray-800 dark:text-gray-200 mb-3 italic">
                      Baruch atah Adonai, Eloheinu melech ha-olam, shehecheyanu v'kiy'manu v'higiyanu laz'man hazeh.
                    </p>
                    <p className="text-muted text-sm mb-2">Translation:</p>
                    <p className="text-gray-800 dark:text-gray-200">
                      Blessed are You, Lord our God, Ruler of the universe, who has kept us alive, sustained us, and brought us to this season.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Room-by-Room Prayers</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Living Room</h4>
                  <p className="text-sm text-secondary">
                    "May this space be filled with Torah study, meaningful conversations, and the joy of welcoming guests."
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Kitchen</h4>
                  <p className="text-sm text-secondary">
                    "May this kitchen produce nourishing meals prepared with love, and may we always remember those in need."
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Bedrooms</h4>
                  <p className="text-sm text-secondary">
                    "May we rise each morning with gratitude and lie down each night in peace and security."
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Entrance</h4>
                  <p className="text-sm text-secondary">
                    "May all who enter this home feel warmth and blessing, and may we go forth with purpose."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mezuzah' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Complete Mezuzah Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Everything you need to know about selecting, checking, and affixing mezuzot</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">What is a Mezuzah?</h3>
              </div>

              <div className="space-y-4">
                <p className="text-secondary">
                  A mezuzah is a parchment scroll containing two sections from the Torah (Deuteronomy 6:4-9 and 11:13-21),
                  written by a trained scribe. It is placed in a decorative case and affixed to the doorposts of Jewish homes
                  as a fulfillment of the biblical commandment.
                </p>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">The Shema and V'ahavta</h4>
                  <p className="text-secondary mb-3">
                    The mezuzah contains the words:
                  </p>
                  <blockquote className="border-l-4 border-purple-600 pl-4 italic text-secondary">
                    "And you shall write them on the doorposts of your house and on your gates." (Deuteronomy 6:9)
                  </blockquote>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-2xl font-bold text-primary mb-6">Where to Place Mezuzot</h3>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-primary mb-2">Required Doorways</h4>
                      <ul className="space-y-1 text-secondary text-sm">
                        <li>Main entrance to the home</li>
                        <li>Entrance to each bedroom</li>
                        <li>Living room entrance</li>
                        <li>Dining room entrance</li>
                        <li>Finished basement rooms</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5 flex-shrink-0">✗</span>
                    <div>
                      <h4 className="font-bold text-primary mb-2">Exempt Doorways</h4>
                      <ul className="space-y-1 text-secondary text-sm">
                        <li>Bathrooms and restrooms</li>
                        <li>Small closets</li>
                        <li>Doorways less than 10 handbreadths (approx. 32 inches) high</li>
                        <li>Temporary structures (unless lived in year-round)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h3 className="text-2xl font-bold text-primary mb-6">How to Affix a Mezuzah</h3>

              <div className="space-y-4">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Placement Instructions</h4>
                  <ol className="space-y-3 text-secondary">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">1.</span>
                      <span><strong>Location:</strong> Affix on the right doorpost as you enter, within the upper third of the doorway (but at least one handbreadth from the top)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">2.</span>
                      <span><strong>Angle:</strong> Place at a slight angle, with the top tilted toward the room you're entering (Ashkenazi custom), or vertically (Sephardic custom)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">3.</span>
                      <span><strong>Blessing:</strong> Say the blessing before affixing. When affixing multiple mezuzot, say one blessing before the first one</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">4.</span>
                      <span><strong>Securing:</strong> Use nails or strong adhesive appropriate for your doorpost material</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Important Notes</h4>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Have your mezuzot checked by a qualified sofer (scribe) before affixing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Check mezuzot every 3.5 years in Israel, every 7 years in the Diaspora</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Handle the parchment with care; the writing is sacred</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Mezuzot must be written on parchment from a kosher animal</span>
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
              <h2 className="text-2xl font-bold text-primary mb-6">Jewish Home Decoration Ideas</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Essential Judaica Items</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Mezuzah cases for each doorway</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Shabbat candlesticks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Kiddush cup and wine decanter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Challah board and cover</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Havdalah set (candle, spice box, wine cup)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Chanukah menorah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Tzedakah box (charity box)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Jewish Library</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Tanakh (Hebrew Bible)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Siddur (prayer book)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Chumash (Five Books of Moses)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Passover Haggadah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Jewish holiday guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Jewish philosophy and thought books</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Wall Decorations</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Jewish artwork and prints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Hebrew calligraphy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Birkat HaBayit (Home Blessing plaque)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Jerusalem or Israel imagery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Jewish calendar</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <h3 className="font-bold text-primary mb-3">Meaningful Symbols</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Hamsa (Hand of Miriam) - protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Star of David</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Chai (life) symbol</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Pomegranate imagery (abundance)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Olive branches (peace)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hospitality' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-primary">Hachnasat Orchim - Welcoming Guests</h2>
              </div>

              <p className="text-secondary mb-6">
                Jewish tradition considers hospitality one of the greatest virtues. Your Chanukat HaBayit celebration is
                the perfect opportunity to begin this beautiful practice in your new home.
              </p>

              <div className="space-y-6">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4">Planning Your Celebration</h3>
                  <div className="space-y-3 text-secondary">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Guest List:</strong> Include family, friends, neighbors, and rabbi or Torah scholars
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Timing:</strong> Consider hosting on Shabbat, a holiday, or after afternoon/evening prayers
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Mezuzah Ceremony:</strong> Affix mezuzot during the celebration with guests present
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Torah Learning:</strong> Invite someone to share a d'var Torah (Torah teaching)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4">Suggested Menu</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Traditional Items</h4>
                      <ul className="space-y-1 text-secondary text-sm">
                        <li>• Challah bread (with hamotzi blessing)</li>
                        <li>• Wine or grape juice (for kiddush)</li>
                        <li>• Round challah for special occasions</li>
                        <li>• Fish (symbol of blessing)</li>
                        <li>• Sweet foods (for a sweet beginning)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Modern Additions</h4>
                      <ul className="space-y-1 text-secondary text-sm">
                        <li>• Mezze platter</li>
                        <li>• Israeli salads</li>
                        <li>• Kosher appetizers</li>
                        <li>• Fresh fruits and vegetables</li>
                        <li>• Desserts and pastries</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h3 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-4">Program Suggestions</h3>
                  <ol className="space-y-3 text-secondary">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">1.</span>
                      <span>Welcome guests and offer refreshments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">2.</span>
                      <span>Tour the home with prayers for each room</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">3.</span>
                      <span>Mezuzah affixing ceremony with blessings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">4.</span>
                      <span>D'var Torah (Torah teaching) about the Jewish home</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">5.</span>
                      <span>Hamotzi over challah and festive meal</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">6.</span>
                      <span>Birkat Hamazon (Grace After Meals) and closing prayers</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Jewish Home Guide</h2>
              <p className="text-purple-600 dark:text-purple-400">Create a dwelling place for the Divine Presence</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">The Jewish Home</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Mikdash Me'at - A Miniature Sanctuary</h4>
                  <p className="text-secondary mb-3">
                    The Jewish home is called a "mikdash me'at" (miniature sanctuary), reflecting the holiness of the ancient Temple.
                    Just as the Temple was the dwelling place of God's presence, our homes can become sanctuaries through mitzvot,
                    Torah study, acts of kindness, and spiritual practices.
                  </p>
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4 mt-3">
                    <p className="text-gray-800 dark:text-gray-200 italic">
                      "Make for Me a sanctuary, and I will dwell among them" (Exodus 25:8)
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Essential Elements of a Jewish Home</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-primary mb-1">Mezuzot</h5>
                          <p className="text-sm text-secondary">
                            Remind us of God's presence and protection every time we enter or leave a room
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-primary mb-1">Torah Learning</h5>
                          <p className="text-sm text-secondary">
                            Regular study fills the home with wisdom and connects us to our heritage
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-primary mb-1">Shabbat Observance</h5>
                          <p className="text-sm text-secondary">
                            Candle lighting, kiddush, and festive meals sanctify time and bring the family together
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-primary mb-1">Tzedakah (Charity)</h5>
                          <p className="text-sm text-secondary">
                            A charity box reminds us to give regularly and think of those in need
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-primary mb-1">Hospitality (Hachnasat Orchim)</h5>
                          <p className="text-sm text-secondary">
                            Following Abraham's example by welcoming guests with warmth and generosity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Kosher Kitchen Guide</h3>
              </div>

              <div className="space-y-4">
                <p className="text-secondary">
                  A kosher kitchen is central to Jewish home life. Here are the essential principles:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Meat and Dairy Separation</h4>
                    <ul className="space-y-2 text-secondary text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Separate dishes for meat and dairy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Separate utensils and cookware</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Separate sinks or sink inserts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Separate dish towels and sponges</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Wait 1-6 hours between eating meat and dairy</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Kashering New Items</h4>
                    <ul className="space-y-2 text-secondary text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Purchase new or kashered appliances</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Immerse new dishes in mikvah (ritual bath)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Consult rabbi about kashering ovens/stoves</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Label cabinets clearly (meat/dairy/pareve)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Keep separate cutting boards</span>
                      </li>
                    </ul>
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
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Quality Mezuzot</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">
                        Invest in hand-written mezuzot from a reliable sofer. Computer-printed mezuzot are not kosher.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Consult a Rabbi</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">
                        For specific questions about kosher kitchen setup or mezuzah placement, consult a knowledgeable rabbi.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Share the Joy</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">
                        Invite community members to your Chanukat HaBayit to share in the mitzvah and create connections.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-1">Daily Practices</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400">
                        Establish daily Torah study, prayer, and acts of kindness to maintain the holiness of your home.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-primary">Traditional Jewish Blessings for the Home</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Birkat HaBayit (Home Blessing)</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-muted text-sm mb-2">Traditional Home Blessing (often displayed on wall):</p>
                    <p className="text-gray-800 dark:text-gray-200 mb-3">
                      "Let no sadness come through this gate. Let no trouble come to this dwelling. Let no fear come through this door.
                      Let no conflict be in this place. Let this home be filled with the blessing of joy and peace."
                    </p>
                  </div>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 dark:text-purple-600 dark:text-purple-400 mb-3">Prayer for Peace in the Home</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 mb-2 italic">
                      "Shalom Aleichem, peace be upon you. May this home be a sanctuary of love, understanding, and harmony.
                      May all who dwell here find comfort, joy, and the presence of the Shechinah (Divine Presence)."
                    </p>
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
