import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Baby, Book, Clock, Gift, Package, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import WelcomeProductCatalog from './WelcomeProductCatalog';
import UniversalRegistry from './UniversalRegistry';

interface ChristianWelcomePlannerProps {
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

export default function ChristianWelcomePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: ChristianWelcomePlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'ceremony' | 'packages' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
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
    { id: '1', text: 'Schedule baptism/dedication date with church', completed: false, category: 'preparation' },
    { id: '2', text: 'Choose godparents/sponsors', completed: false, category: 'preparation' },
    { id: '3', text: 'Meet with pastor/priest for baptism counseling', completed: false, category: 'spiritual' },
    { id: '4', text: 'Register baby with church', completed: false, category: 'preparation' },
    { id: '5', text: 'Select baptismal gown or christening outfit', completed: false, category: 'ceremony' },
    { id: '6', text: 'Purchase or prepare baptismal candle', completed: false, category: 'ceremony' },
    { id: '7', text: 'Arrange photography/videography', completed: false, category: 'ceremony' },
    { id: '8', text: 'Plan reception venue and catering', completed: false, category: 'celebration' },
    { id: '9', text: 'Send invitations to family and friends', completed: false, category: 'celebration' },
    { id: '10', text: 'Prepare baby\'s baptismal certificate keepsake box', completed: false, category: 'gifts' },
    { id: '11', text: 'Choose Bible or prayer book for baby', completed: false, category: 'gifts' },
    { id: '12', text: 'Plan baptism cake or special dessert', completed: false, category: 'celebration' },
    { id: '13', text: 'Prepare thank you gifts for godparents', completed: false, category: 'gifts' },
    { id: '14', text: 'Arrange baptismal rehearsal if needed', completed: false, category: 'ceremony' },
    { id: '15', text: 'Pray for baby\'s spiritual journey', completed: false, category: 'spiritual' },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const budgetCategories = [
    { name: 'Baptism/Dedication Ceremony', estimated: 500, actual: 0, icon: Baby },
    { name: 'Christening Gown & Outfit', estimated: 300, actual: 0, icon: Heart },
    { name: 'Reception & Catering', estimated: 800, actual: 0, icon: Gift },
    { name: 'Photography & Videography', estimated: 400, actual: 0, icon: CheckCircle },
    { name: 'Baptismal Gifts & Keepsakes', estimated: 400, actual: 0, icon: Package },
    { name: 'Invitations & Decorations', estimated: 300, actual: 0, icon: Star },
    { name: 'Godparent Gifts', estimated: 300, actual: 0, icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-page">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Baby className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Christian Baptism & Baby Welcome Planner</h1>
          </div>
          <p className="text-purple-600 text-lg mb-6">Plan a blessed baptism or dedication ceremony to welcome your precious gift from God</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Birth Date</div>
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
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Baby Name</div>
                  <input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="Christian name"
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
              { id: 'ceremony', label: 'Baptism', icon: Baby },
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
                    ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-600 dark:border-purple-600'
                    : 'text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-600'
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
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome Your New Baby with Christian Traditions</h2>
              <p className="text-secondary mb-6">
                Celebrate the arrival of your precious blessing from God with the beautiful Christian traditions of baptism, dedication, and baby blessings. This planner guides you through every sacred step of welcoming your newborn into the family of faith.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Baby className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Baptism Ceremony</h3>
                  <p className="text-sm text-secondary">Plan a meaningful baptism or christening celebration</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Book className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Christian Names</h3>
                  <p className="text-sm text-secondary">Choose a meaningful Christian name with biblical significance</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-bold text-primary mb-2">Godparents</h3>
                  <p className="text-sm text-secondary">Select spiritual mentors to guide your child's faith journey</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Progress Summary</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-3xl font-bold">{checklist.filter(i => i.completed).length}</div>
                  <div className="text-purple-600 text-sm">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{birthDate ? 'Scheduled' : 'TBD'}</div>
                  <div className="text-purple-600 text-sm">Baptism Date</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{selectedProducts.length}</div>
                  <div className="text-purple-600 text-sm">Items Selected</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">${budget.toLocaleString()}</div>
                  <div className="text-purple-600 text-sm">Total Budget</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Baptism & Dedication Checklist</h2>

              {['spiritual', 'preparation', 'ceremony', 'gifts', 'celebration'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="font-bold text-lg text-purple-600 dark:text-purple-600 mb-3 capitalize">{category}</h3>
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
                        <category.icon className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-primary">{category.name}</span>
                      </div>
                      <span className="text-purple-600 font-bold">${category.estimated}</span>
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
                  <span className="text-2xl font-bold text-purple-600">
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
              <h2 className="text-3xl font-bold mb-2">Comprehensive Christian Baby Welcome Guide</h2>
              <p className="text-purple-600">Welcome your baby into the Christian faith with sacred traditions and blessings</p>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Baby className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-primary">Baptism vs. Dedication: Understanding the Difference</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Infant Baptism (Christening)</h4>
                  <p className="text-secondary mb-3">
                    Practiced by Catholic, Orthodox, Anglican, Lutheran, and some other denominations. Baptism is seen as a sacrament that cleanses original sin and initiates the child into the Christian faith.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Water Baptism:</strong> The priest or minister uses water (sprinkling, pouring, or immersion) in the name of the Father, Son, and Holy Spirit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Godparents:</strong> Chosen to support the child's spiritual development and faith journey</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>White Garment:</strong> Traditional white christening gown symbolizes purity and new life in Christ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Baptismal Candle:</strong> Lit from the Paschal candle, representing Christ as the light of the world</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Baby Dedication</h4>
                  <p className="text-secondary mb-3">
                    Common in Baptist, Pentecostal, non-denominational, and evangelical churches. Baby dedication is a ceremony where parents publicly commit to raising their child in the Christian faith, but baptism is reserved for when the child can make their own decision.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Parental Vows:</strong> Parents promise to raise the child in a Christian home with biblical values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Church Commitment:</strong> The congregation pledges to support the family in the child's spiritual upbringing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Prayer & Blessing:</strong> The pastor prays over the child and blesses them in Jesus' name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Future Baptism:</strong> The child will be baptized later when they personally accept Christ</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Choosing Godparents (for Baptism)</h4>
                  <p className="text-secondary mb-3">
                    Godparents play a sacred role in the spiritual life of your child. Choose wisely those who will be faithful guides.
                  </p>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Active Faith:</strong> Should be practicing Christians who attend church regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Already Baptized:</strong> Must have received the sacrament of baptism themselves (and confirmation in Catholic tradition)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Good Role Models:</strong> Living Christian values and willing to mentor your child spiritually</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Committed Relationship:</strong> Ready to stay involved in your child's life long-term</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Number:</strong> Traditionally one or two godparents (often one male and one female)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                  <h4 className="font-bold text-purple-600 dark:text-purple-600 mb-3">Understanding Baptismal Vows</h4>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Renunciation of Evil:</p>
                      <p className="text-gray-800 dark:text-gray-200 mb-2">"Do you reject Satan and all his works and empty promises?"</p>
                      <p className="text-sm text-secondary italic">Parents and godparents renounce evil on behalf of the child</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Profession of Faith:</p>
                      <p className="text-gray-800 dark:text-gray-200 mb-2">"Do you believe in God, the Father Almighty, Creator of heaven and earth?"</p>
                      <p className="text-sm text-secondary italic">Profession of belief in the Holy Trinity and the teachings of the Church</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-muted mb-2">Commitment to Raise in Faith:</p>
                      <p className="text-gray-800 dark:text-gray-200 mb-2">"Do you promise to raise this child in the practice of the faith?"</p>
                      <p className="text-sm text-secondary italic">Parents commit to teaching Christian values and bringing the child to church</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Christian Naming Traditions</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Biblical Names:</strong> Names from Scripture (David, Daniel, Sarah, Ruth, Noah, Grace, Faith, Hope)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Saint Names:</strong> Named after Christian saints (Michael, Gabriel, Catherine, Elizabeth, Anthony, Mary)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Virtue Names:</strong> Names representing Christian virtues (Charity, Mercy, Joy, Peace, Patience)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Book className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Middle Name Tradition:</strong> Often a saint's name or family name is given as a middle name</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-primary">Biblical Blessings for Your Baby</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted mb-2">Numbers 6:24-26 (The Priestly Blessing):</p>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                    "The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you; the LORD turn his face toward you and give you peace."
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted mb-2">Psalm 127:3:</p>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                    "Children are a heritage from the LORD, offspring a reward from him."
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted mb-2">Jeremiah 29:11:</p>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                    "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future."
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted mb-2">Proverbs 22:6:</p>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                    "Train up a child in the way he should go; even when he is old he will not depart from it."
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-muted mb-2">Mark 10:14-16 (Jesus Blesses the Children):</p>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                    "Let the little children come to me, and do not hinder them, for the kingdom of God belongs to such as these... And he took the children in his arms, placed his hands on them and blessed them."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-primary">Planning the Baptism Ceremony</h3>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">Before the Ceremony</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Schedule Early:</strong> Book the baptism date 2-3 months in advance with your church</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Baptism Classes:</strong> Attend required preparation classes for parents and godparents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Documentation:</strong> Provide baby's birth certificate and parents' marriage certificate if required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Godparent Letters:</strong> Godparents may need to provide letters of eligibility from their parish</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">During the Ceremony</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Reception at Church Door:</strong> The family is welcomed into the church community</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Sign of the Cross:</strong> Marked on the baby's forehead as a sign of Christ's love</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Scripture Readings:</strong> Biblical passages about baptism and God's love for children</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Baptismal Water:</strong> The pouring or sprinkling of blessed water three times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Anointing with Chrism:</strong> Sacred oil blessed by the bishop (in some traditions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>White Garment:</strong> Presented as a symbol of purity and new life in Christ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Baptismal Candle:</strong> Lit to symbolize Christ as the light of the world</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-primary">Important Reminders & Traditions</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">+</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-600 mb-1">Timing of Baptism</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600">Catholic tradition encourages baptism within the first few weeks or months of life. Protestant traditions vary widely.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">+</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-600 mb-1">Baptismal Gown</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600">White symbolizes purity. Many families pass down christening gowns through generations as precious heirlooms.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">+</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-600 mb-1">Photography Etiquette</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600">Check church policies about photography during the ceremony. Some allow it, others prefer no flash or video.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">+</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-600 mb-1">Reception Celebration</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600">Host a gathering after the ceremony to celebrate with family and friends. Traditional foods vary by culture.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">+</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-600 mb-1">Baptismal Certificate</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600">Keep the official baptismal certificate in a safe place. It may be needed for sacraments like First Communion or Confirmation.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">+</span>
                    <div>
                      <h4 className="font-semibold text-purple-600 dark:text-purple-600 mb-1">Gift Traditions</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 dark:text-purple-600">Common baptism gifts include silver crosses, rosaries, children's Bibles, prayer books, and religious keepsakes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-primary">Cultural Baptism Traditions</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Latin American</h4>
                  <p className="text-sm text-secondary">Large celebrations with extended family, special meals, baptism favor bags (bolos), and sometimes mariachi music</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Greek Orthodox</h4>
                  <p className="text-sm text-secondary">Full immersion baptism, Jordan almonds (koufeta), and the godparent provides everything needed for the ceremony</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Irish Catholic</h4>
                  <p className="text-sm text-secondary">Traditional Irish christening gown, often lace, passed through generations. Reception with tea and cake</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-600/20 dark:to-purple-700/20 rounded-lg p-4">
                  <h4 className="font-bold text-primary mb-2">Southern Baptist</h4>
                  <p className="text-sm text-secondary">Baby dedication service with congregational support, followed by church potluck or family gathering</p>
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
            <p className="text-muted">Save items you love for your baby's baptism celebration.</p>
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
              <h2 className="text-2xl font-bold text-primary mb-4">Baptism Ceremony Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Church Name</label>
                  <input
                    type="text"
                    placeholder="Enter church name"
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Baptism Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Godparents</label>
                  <textarea
                    placeholder="Enter godparent names"
                    rows={3}
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Officiant (Pastor/Priest)</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="w-full px-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-theme-lg border border-default p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Baptism Planning Timeline</h2>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">2-3 Months Before</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Schedule baptism date with church</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Choose and ask godparents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Register for baptism preparation classes</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">6-8 Weeks Before</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Send invitations to family and friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Book reception venue and caterer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Order baptismal gown</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">3-4 Weeks Before</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Book photographer/videographer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Order baptism cake and favors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Purchase godparent gifts</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">1 Week Before</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Confirm final guest count</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Attend baptismal rehearsal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Prepare baptismal outfit</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h3 className="text-lg font-bold text-primary mb-2">Day Before</h3>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Confirm all vendors and times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Prepare reception setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Rest and pray for the special day</span>
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
