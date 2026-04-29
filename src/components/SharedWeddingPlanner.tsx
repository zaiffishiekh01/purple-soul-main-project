import { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, ShoppingCart, Sparkles, Heart, Book, Clock, Package, Globe, Gift, Plane, ListChecks, User, MapPin, Star, CheckCircle, DollarSign, Plus, Minus, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import WeddingProductCatalog from './WeddingProductCatalog';
import WeddingRegistry from './WeddingRegistry';

interface SharedWeddingPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function SharedWeddingPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: SharedWeddingPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'budget' | 'ceremony' | 'packages' | 'registry' | 'wishlist' | 'shopping' | 'guide'>('overview');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState(0);

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

  // Budget state
  const [budgetCategories, setBudgetCategories] = useState([
    { id: 'venue', name: 'Venue & Catering', allocated: 8000, spent: 0, min: 2000, max: 25000 },
    { id: 'attire', name: 'Attire & Accessories', allocated: 3000, spent: 0, min: 1000, max: 12000 },
    { id: 'photography', name: 'Photography & Video', allocated: 2500, spent: 0, min: 500, max: 10000 },
    { id: 'flowers', name: 'Flowers & Decorations', allocated: 2000, spent: 0, min: 500, max: 8000 },
    { id: 'music', name: 'Music & Entertainment', allocated: 1500, spent: 0, min: 500, max: 6000 },
    { id: 'cake', name: 'Cake & Desserts', allocated: 1000, spent: 0, min: 300, max: 4000 },
    { id: 'invitations', name: 'Invitations & Stationery', allocated: 500, spent: 0, min: 200, max: 2000 },
    { id: 'misc', name: 'Miscellaneous', allocated: 500, spent: 0, min: 100, max: 3000 }
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

  const selectedProductsTotal = selectedProducts.reduce((sum, id) => sum + 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Shared Wedding Planner</h1>
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
                  <div className="text-2xl font-bold">{completedTasks}/20</div>
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
              { id: 'ceremony', label: 'Ceremony', icon: Globe },
              { id: 'packages', label: 'Tour Packages', icon: Plane },
              { id: 'registry', label: 'Registry', icon: ListChecks },
              { id: 'wishlist', label: 'Wishlist', icon: Heart },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'guide', label: 'Interfaith Guide', icon: Book }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-accent" />
                <h2 className="text-2xl font-bold text-primary">Shared Wedding Planner</h2>
              </div>
              <p className="text-secondary mb-6">
                Plan your interfaith or multicultural wedding celebration that honors both traditions. Create a ceremony that respects and blends your diverse backgrounds while celebrating your unique love story.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Heart className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Blended Ceremony</h3>
                  <p className="text-sm text-secondary">Incorporate traditions from both backgrounds meaningfully</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Globe className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Cultural Respect</h3>
                  <p className="text-sm text-secondary">Honor both families' customs and values</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <Sparkles className="w-6 h-6 text-accent mb-2" />
                  <h3 className="font-bold text-primary mb-1">Unique Unity</h3>
                  <p className="text-sm text-secondary">Create new traditions that celebrate your union</p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">Browse Wedding Products</h3>
              <p className="text-secondary mb-4">
                Discover multicultural wedding decorations, interfaith ceremony items, and unique wedding essentials
              </p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Browse Products
              </button>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Wedding Checklist</h2>
            <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
              <CheckSquare className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">Plan Your Perfect Day</h3>
              <p className="text-secondary">
                Create and track tasks for your interfaith wedding ceremony and reception
              </p>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Wedding Timeline</h2>
            <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
              <Clock className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">Track Your Progress</h3>
              <p className="text-secondary">
                Organize your wedding preparation timeline from engagement to the big day
              </p>
            </div>
          </div>
        )}

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
                  <div key={category.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
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
                          className="w-full h-2 bg-gray-200 dark:bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-amber-600"
                          style={{
                            background: `linear-gradient(to right, rgb(217, 119, 6) 0%, rgb(217, 119, 6) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) 100%)`
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                        <span className="font-semibold text-accent">
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
                    <div className="text-2xl font-bold text-green-600">
                      ${budgetCategories.reduce((sum, cat) => sum + (cat.allocated - cat.spent), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ceremony' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary">Ceremony Planning</h2>
                <p className="text-secondary mt-1">Create a meaningful ceremony that honors all traditions and beliefs</p>
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

            {/* Officiant Booking Section */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Book Your Officiant</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 'officiant-1',
                    name: 'Rev. Maria Sanchez',
                    type: 'Interfaith Minister',
                    location: 'San Francisco, CA',
                    experience: '16+ years',
                    languages: 'English, Spanish, Portuguese',
                    rating: 5.0,
                    reviews: 178,
                    price: 700,
                    specialties: ['Interfaith Ceremonies', 'LGBTQ+ Weddings', 'Bilingual Services']
                  },
                  {
                    id: 'officiant-2',
                    name: 'Dr. James Anderson',
                    type: 'Universal Life Minister',
                    location: 'Seattle, WA',
                    experience: '20+ years',
                    languages: 'English, French',
                    rating: 4.9,
                    reviews: 212,
                    price: 650,
                    specialties: ['Secular Ceremonies', 'Personalized Vows', 'Multicultural Weddings']
                  },
                  {
                    id: 'officiant-3',
                    name: 'Rev. Aisha Patel',
                    type: 'Spiritual Celebrant',
                    location: 'Austin, TX',
                    experience: '14+ years',
                    languages: 'English, Hindi, Gujarati',
                    rating: 4.9,
                    reviews: 145,
                    price: 600,
                    specialties: ['Hindu-Christian Blend', 'Cultural Fusion', 'Destination Weddings']
                  }
                ].map((officiant) => (
                  <div
                    key={officiant.id}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedOfficiant === officiant.id
                        ? 'border-amber-600 bg-purple-100 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                    }`}
                    onClick={() => setSelectedOfficiant(officiant.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-primary">{officiant.name}</h4>
                        <p className="text-sm text-accent dark:text-amber-400 font-semibold">{officiant.type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-secondary">{officiant.location}</p>
                        </div>
                      </div>
                      {selectedOfficiant === officiant.id && (
                        <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-primary">{officiant.rating}</span>
                      <span className="text-sm text-secondary">({officiant.reviews} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-secondary">{officiant.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Book className="w-4 h-4 text-gray-400" />
                        <span className="text-secondary">{officiant.languages}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                      <p className="text-xs text-secondary mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {officiant.specialties.map((specialty, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-surface-elevated text-secondary px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-accent">${officiant.price}</div>
                      <button className="text-sm text-accent hover:text-amber-700 font-semibold">View Profile</button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOfficiant && (
                <div className="mt-6 bg-purple-100 dark:bg-purple-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
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
                <h3 className="text-2xl font-bold text-primary">Ceremony Package Options</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'basic',
                    name: 'Simple Union',
                    price: 1000,
                    description: 'Intimate ceremony essentials',
                    features: [
                      'Officiant services',
                      'Basic ceremony script',
                      'Marriage certificate processing',
                      'Virtual pre-ceremony consultation',
                      'Basic venue coordination'
                    ],
                    popular: false
                  },
                  {
                    id: 'premium',
                    name: 'Cultural Fusion',
                    price: 2200,
                    description: 'Blended traditions ceremony',
                    features: [
                      'Everything in Simple Union',
                      'Personalized ceremony script',
                      'Unity ceremony inclusion',
                      'Cultural ritual coordination',
                      'Bilingual ceremony option',
                      'Photography (2 hours)',
                      'Decorative ceremony elements'
                    ],
                    popular: true
                  },
                  {
                    id: 'luxury',
                    name: 'Grand Celebration',
                    price: 4000,
                    description: 'Complete luxury experience',
                    features: [
                      'Everything in Cultural Fusion',
                      'Multiple cultural elements',
                      'Live music coordination',
                      'Custom ceremony design',
                      'Full-day photography & videography',
                      'Reception coordination',
                      'Guest cultural education materials',
                      'Wedding coordinator',
                      'Welcome gifts'
                    ],
                    popular: false
                  }
                ].map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedCeremonyPackage === pkg.id
                        ? 'border-amber-600 bg-purple-100 dark:bg-purple-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">one-time payment</p>
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
                          : 'bg-gray-100 dark:bg-surface-elevated text-primary hover:bg-amber-100 dark:hover:bg-amber-900/30'
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
                      'Confirm officiant booking and ceremony time',
                      'Discuss cultural elements to include',
                      'Finalize ceremony script and vows',
                      'Coordinate unity ceremony details',
                      'Schedule ceremony rehearsal',
                      'Prepare family participation roles'
                    ]
                  },
                  {
                    category: 'Ceremony Day',
                    items: [
                      'Arrive 1 hour before ceremony',
                      'Setup unity ceremony elements',
                      'Have marriage license ready',
                      'Coordinate family seating arrangements',
                      'Brief wedding party on ceremony flow',
                      'Test audio/music equipment'
                    ]
                  },
                  {
                    category: 'Required Items',
                    items: [
                      'Marriage license from local authority',
                      'Valid IDs for bride and groom',
                      'Rings for exchange',
                      'Unity ceremony materials (if applicable)',
                      'Witness signatures (usually 2)',
                      'Ceremony programs for guests'
                    ]
                  },
                  {
                    category: 'Post-Ceremony',
                    items: [
                      'Collect signed marriage certificate',
                      'Submit to county clerk for registration',
                      'Obtain certified copies',
                      'Update legal documents',
                      'Send thank you notes to participants',
                      'Preserve ceremony elements as keepsakes'
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
                <h3 className="text-2xl font-bold text-primary">Required Items for Ceremony</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    category: 'Documentation',
                    icon: Book,
                    items: [
                      'Marriage license',
                      'Valid IDs (both parties)',
                      'Witness identification',
                      'Officiant credentials',
                      'Ceremony script'
                    ]
                  },
                  {
                    category: 'Ceremony Essentials',
                    icon: Globe,
                    items: [
                      'Wedding rings',
                      'Unity ceremony materials',
                      'Microphone/sound system',
                      'Ceremony programs',
                      'Guest seating arrangements'
                    ]
                  },
                  {
                    category: 'Optional Ceremonial',
                    icon: Heart,
                    items: [
                      'Unity candles',
                      'Sand ceremony vessels',
                      'Cultural ritual items',
                      'Family blessing elements',
                      'Memorial tributes'
                    ]
                  }
                ].map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-5">
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
                      { id: 'decor-arch', name: 'Ceremony Arch/Arbor', price: 450 },
                      { id: 'decor-aisle', name: 'Aisle Decorations', price: 300 },
                      { id: 'decor-lighting', name: 'Ambient Lighting Setup', price: 350 },
                      { id: 'decor-floral', name: 'Floral Arrangements', price: 500 },
                      { id: 'decor-cultural', name: 'Cultural Decor Elements', price: 400 },
                      { id: 'decor-backdrop', name: 'Photo Backdrop', price: 250 }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          ceremonyDecorAddons.includes(addon.id)
                            ? 'border-amber-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
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
                      { id: 'hosp-cocktail', name: 'Cocktail Hour Service', price: 800, guests: '100 guests' },
                      { id: 'hosp-beverages', name: 'Beverage Station', price: 300, guests: '75 guests' },
                      { id: 'hosp-appetizers', name: 'Appetizer Platters', price: 500, guests: '100 guests' },
                      { id: 'hosp-dessert', name: 'Dessert Bar', price: 400, guests: '80 guests' },
                      { id: 'hosp-cultural', name: 'Cultural Food Station', price: 600, guests: '100 guests' },
                      { id: 'hosp-staff', name: 'Professional Service Staff', price: 350, guests: '4 hours' }
                    ].map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          ceremonyHospitalityAddons.includes(addon.id)
                            ? 'border-amber-600 bg-purple-100 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
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
                      <span className="font-bold">$650</span>
                    </div>
                  )}
                  {selectedCeremonyPackage && (
                    <div className="flex justify-between items-center">
                      <span>
                        {selectedCeremonyPackage === 'basic' && 'Simple Union Package'}
                        {selectedCeremonyPackage === 'premium' && 'Cultural Fusion Package'}
                        {selectedCeremonyPackage === 'luxury' && 'Grand Celebration Package'}
                      </span>
                      <span className="font-bold">
                        ${selectedCeremonyPackage === 'basic' ? 1000 : selectedCeremonyPackage === 'premium' ? 2200 : 4000}
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
                  <h3 className="text-xl font-bold text-primary">Multicultural Travel Experiences</h3>
                  <p className="text-secondary">Explore destinations that celebrate diversity and culture</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Bali & Indonesia</h4>
                  <p className="text-sm text-secondary mb-4">Spiritual harmony and diverse cultural experiences</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $3,500</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 8 days / 7 nights</li>
                    <li>• Temples, beaches, rice terraces</li>
                    <li>• Cultural ceremonies</li>
                    <li>• Luxury villa accommodations</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Morocco Adventure</h4>
                  <p className="text-sm text-secondary mb-4">Blend of African, Arab, and European cultures</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $3,200</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 7 days / 6 nights</li>
                    <li>• Marrakech, Sahara, Fez</li>
                    <li>• Cultural immersion tours</li>
                    <li>• Riads and desert camps</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6">
                  <h4 className="font-bold text-primary mb-2">Japan Experience</h4>
                  <p className="text-sm text-secondary mb-4">Ancient traditions meet modern harmony</p>
                  <div className="text-2xl font-bold text-accent mb-4">From $4,500</div>
                  <ul className="space-y-1 text-sm text-secondary mb-4">
                    <li>• 10 days / 9 nights</li>
                    <li>• Tokyo, Kyoto, temples</li>
                    <li>• Cultural ceremonies</li>
                    <li>• Traditional ryokans</li>
                  </ul>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registry' && (
          <WeddingRegistry
            availableProducts={mockProducts}
            onAddToCart={onAddToCart}
            viewMode="browse"
          />
        )}

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
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Your wishlist is empty. Start browsing to add items!
              </div>
            )}
          </div>
        )}

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

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Interfaith & Multicultural Wedding Guide</h2>
              <p className="text-amber-50">Create a beautiful ceremony that honors both traditions and celebrates your unique love story</p>
            </div>

            {/* Planning Approach */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">The Interfaith Journey</h3>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5 mb-6">
                <p className="text-secondary mb-4">
                  An interfaith or multicultural wedding is a beautiful celebration that brings together two families, traditions, and cultures. It requires thoughtful communication, mutual respect, and creativity to create a ceremony that honors both backgrounds while celebrating your unique union.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-6 h-6 text-accent" />
                    <h4 className="font-bold text-primary">Communication</h4>
                  </div>
                  <p className="text-sm text-secondary">Open, honest dialogue with both families from the beginning. Address concerns and expectations early.</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-6 h-6 text-accent" />
                    <h4 className="font-bold text-primary">Respect</h4>
                  </div>
                  <p className="text-sm text-secondary">Honor both traditions equally. Neither should feel diminished or overshadowed by the other.</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 text-accent" />
                    <h4 className="font-bold text-primary">Creativity</h4>
                  </div>
                  <p className="text-sm text-secondary">Find meaningful ways to blend rituals and create new traditions unique to your relationship.</p>
                </div>
              </div>
            </div>

            {/* Planning Timeline */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Planning Timeline</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-amber-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">9-12 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Have honest conversations with both families about expectations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Research and discuss which traditions are most important to each of you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Find officiant(s) experienced in interfaith ceremonies or consider co-officiants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Choose venue that can accommodate both traditions' requirements</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">6-9 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Meet with officiant(s) to design ceremony structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Decide which cultural elements to include from each tradition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Plan catering menu that respects both families' dietary needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Create guest education materials about ceremony elements</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-400 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">3-6 Months Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Finalize ceremony script with both families' input</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Design ceremony program explaining each tradition and ritual</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Select music that represents both cultures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Address any family concerns or objections sensitively</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-300 pl-6 py-2">
                  <h4 className="text-lg font-bold text-primary mb-3">1 Month Before</h4>
                  <ul className="space-y-2 text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Hold rehearsal with explanations for unfamiliar participants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Brief wedding party on their roles in cultural rituals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prepare translations if using multiple languages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Finalize all cultural items needed for ceremony</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ceremony Design */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Designing Your Ceremony</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-primary mb-4">Ceremony Structure Options:</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-5">
                      <h5 className="font-semibold text-amber-900 dark:text-purple-50 mb-3">Blended Ceremony</h5>
                      <p className="text-sm text-secondary mb-3">Weave elements from both traditions throughout a single ceremony.</p>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Most integrated approach</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Creates unified experience</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Requires careful balance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Best with flexible traditions</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-5">
                      <h5 className="font-semibold text-amber-900 dark:text-purple-50 mb-3">Sequential Ceremonies</h5>
                      <p className="text-sm text-secondary mb-3">Conduct two distinct ceremonies, one after another, each honoring its tradition fully.</p>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Each tradition fully honored</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Clearer for guests to follow</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Longer overall ceremony</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Works with strict requirements</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-5">
                      <h5 className="font-semibold text-amber-900 dark:text-purple-50 mb-3">Selective Integration</h5>
                      <p className="text-sm text-secondary mb-3">Choose 2-3 meaningful elements from each tradition to incorporate.</p>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Focused and meaningful</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Easier for guests to understand</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Moderate ceremony length</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Highlights most important customs</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-2 border-amber-200 dark:border-amber-800 rounded-lg p-5">
                      <h5 className="font-semibold text-amber-900 dark:text-purple-50 mb-3">Secular with Cultural Touches</h5>
                      <p className="text-sm text-secondary mb-3">Mainly secular ceremony with cultural (not religious) elements from both backgrounds.</p>
                      <ul className="space-y-1 text-sm text-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>More neutral approach</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Respects cultural heritage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Avoids religious conflicts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>May disappoint some family</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Considerations */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Key Considerations</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-amber-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Family Communication</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Include both families in planning discussions early</li>
                      <li>• Listen to concerns without being defensive</li>
                      <li>• Explain your choices thoughtfully</li>
                      <li>• Find compromises that honor everyone</li>
                      <li>• Set boundaries respectfully when needed</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Officiant Selection</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Find interfaith-friendly officiant or use co-officiants</li>
                      <li>• Ensure they respect both traditions equally</li>
                      <li>• Discuss ceremony structure in detail</li>
                      <li>• Ask about their experience with your specific faiths</li>
                      <li>• Review and approve final ceremony script</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Dietary Considerations</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Research both traditions' dietary laws</li>
                      <li>• Choose caterer who can accommodate all needs</li>
                      <li>• Clearly label food for guests' awareness</li>
                      <li>• Consider buffet stations by dietary type</li>
                      <li>• Have vegetarian/vegan options available</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-amber-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Guest Education</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Create detailed ceremony program</li>
                      <li>• Explain meaning of each ritual/tradition</li>
                      <li>• Provide dress code guidance if needed</li>
                      <li>• Include wedding website with FAQs</li>
                      <li>• Brief wedding party on participation</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Legal Requirements</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Ensure officiant is legally authorized</li>
                      <li>• Obtain marriage license in advance</li>
                      <li>• Understand your jurisdiction's requirements</li>
                      <li>• Plan for witnesses as needed</li>
                      <li>• Keep marriage certificate safe</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4 py-2">
                    <h4 className="font-semibold text-primary mb-2">Shared Values</h4>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Focus on common values: love, commitment, family</li>
                      <li>• Highlight universal themes in ceremony</li>
                      <li>• Create new traditions that represent both of you</li>
                      <li>• Celebrate diversity as strength</li>
                      <li>• Remember it's YOUR wedding - make it meaningful to you</li>
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
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Avoiding Difficult Conversations</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Address family concerns early. Don't wait until close to the wedding to discuss sensitive issues.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Treating One Tradition as "Main"</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Both traditions should have equal weight and respect. Avoid making one seem like an add-on.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Assuming Guest Knowledge</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Don't assume guests understand unfamiliar rituals. Provide clear explanations in program.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Ignoring Religious Requirements</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Research what's actually required vs. optional in each tradition. Some things can't be modified.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Overcomplicated Ceremony</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Including too many elements can be overwhelming. Choose the most meaningful traditions.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Forgetting Your Relationship</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">While honoring families is important, the ceremony should reflect YOU as a couple.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Best Practices for Success</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Start Conversations Early</h4>
                      <p className="text-sm text-secondary">Discuss interfaith plans when you get engaged. Give families time to process and provide input.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Book className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Educate Yourselves</h4>
                      <p className="text-sm text-secondary">Learn about each other's traditions deeply. Understanding shows respect and helps with decisions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Create Detailed Program</h4>
                      <p className="text-sm text-secondary">Explain each element's significance. Help guests appreciate the beauty of both traditions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Embrace Symbolism</h4>
                      <p className="text-sm text-secondary">Use symbols that resonate with both traditions - unity candles, sand ceremonies, hand-fasting.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Celebrate Diversity</h4>
                      <p className="text-sm text-secondary">Frame differences as richness, not obstacles. Your diversity makes your union unique and beautiful.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Practice Ceremony</h4>
                      <p className="text-sm text-secondary">Rehearse unfamiliar elements. Everyone feels more comfortable when they know what to expect.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Honor Your Story</h4>
                      <p className="text-sm text-secondary">Weave your unique love story into the ceremony. Make it personal, not just traditional.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Find Experienced Vendors</h4>
                      <p className="text-sm text-secondary">Work with vendors who have interfaith wedding experience. They'll anticipate challenges.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Helpful Resources</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Finding Officiants</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Interfaith ministers</li>
                    <li>• Universal Life Church</li>
                    <li>• Humanist celebrants</li>
                    <li>• Progressive clergy from each tradition</li>
                  </ul>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Support Organizations</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Interfaith Family Project</li>
                    <li>• InterfaithFamily.com</li>
                    <li>• Local interfaith councils</li>
                    <li>• Support groups for couples</li>
                  </ul>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Planning Books</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Interfaith wedding guides</li>
                    <li>• Cultural wedding books</li>
                    <li>• Ceremony design resources</li>
                    <li>• Family communication guides</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Future Planning */}
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold text-primary">Planning Your Interfaith Future</h3>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-5">
                <p className="text-secondary mb-4">
                  Your wedding is just the beginning. Discuss how you'll handle holidays, children's religious education, and family traditions moving forward.
                </p>
                <ul className="space-y-2 text-secondary">
                  <li className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Decide which holidays you'll celebrate and how</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Plan for children's religious upbringing if having kids</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Create new family traditions that blend both cultures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Maintain open communication about faith and values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Build community with other interfaith couples</span>
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
