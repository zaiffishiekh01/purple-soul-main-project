import { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckSquare, Package, DollarSign, Book, ShoppingCart, Clock, Users, Bell, Heart, Star, TrendingUp, CreditCard, Sparkles, Plane, BookOpen } from 'lucide-react';
import { Product, CartItem } from '../App';
import { mockProducts } from '../data/products';
import { getHajjRecommendations, matchProductsToRecommendations, createSmartPacks } from '../lib/plannerRecommendations';
import { supabase } from '../lib/supabase';
import TravelPackageCard from './TravelPackageCard';
import PackageComparisonModal from './PackageComparisonModal';
import TravelPackageDetail from './TravelPackageDetail';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'spiritual' | 'documents' | 'health' | 'packing';
  productTags?: string[];
}

interface ItineraryItem {
  id: string;
  day: number;
  date: string;
  location: string;
  activities: string[];
  notes: string;
}

interface BudgetItem {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  min: number;
  max: number;
}

interface HajjPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function HajjPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: HajjPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'shopping' | 'itinerary' | 'checklist' | 'budget' | 'guide'>('overview');
  const [hajjDate, setHajjDate] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [travelPackages, setTravelPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageAddons, setPackageAddons] = useState<any[]>([]);
  const [comparePackages, setComparePackages] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Location filtering state
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const recommendations = getHajjRecommendations();
  const matchedRecommendations = matchProductsToRecommendations(recommendations, mockProducts);
  const smartPacks = createSmartPacks(mockProducts, 'hajj');

  useEffect(() => {
    loadCountries();
    fetchTravelPackages();
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

  useEffect(() => {
    fetchTravelPackages();
  }, [selectedCountry, selectedState, selectedCity]);

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

  const fetchTravelPackages = async () => {
    let query = supabase
      .from('travel_packages')
      .select(`
        *,
        vendor:travel_vendors(name, logo_url, verified)
      `)
      .eq('pilgrimage_type', 'hajj');

    if (selectedCountry) {
      query = query.eq('country_id', selectedCountry);
    }
    if (selectedState) {
      query = query.eq('state_id', selectedState);
    }
    if (selectedCity) {
      query = query.eq('city_id', selectedCity);
    }

    const { data: packages } = await query.order('rating', { ascending: false });

    if (packages) {
      const formattedPackages = packages.map(pkg => ({
        ...pkg,
        vendor_name: pkg.vendor.name,
        vendor_logo: pkg.vendor.logo_url,
        vendor_verified: pkg.vendor.verified,
      }));
      setTravelPackages(formattedPackages);
    }
  };

  const handlePackageSelect = async (pkg: any) => {
    setSelectedPackage(pkg);

    const { data: addons } = await supabase
      .from('package_addons')
      .select('*')
      .eq('package_id', pkg.id);

    setPackageAddons(addons || []);
  };

  const handlePackageCompare = (pkg: any) => {
    const isAlreadyComparing = comparePackages.some(p => p.id === pkg.id);
    if (isAlreadyComparing) {
      setComparePackages(comparePackages.filter(p => p.id !== pkg.id));
    } else if (comparePackages.length < 3) {
      setComparePackages([...comparePackages, pkg]);
    }
  };

  const handleCheckout = (pkg: any, travelers: number, selectedAddons: any[], total: number) => {
    window.location.href = '#checkout';
  };

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Obtain valid passport (6+ months validity)', completed: false, category: 'documents' },
    { id: '2', text: 'Apply for Hajj visa', completed: false, category: 'documents' },
    { id: '3', text: 'Get required vaccinations (Meningitis, COVID-19)', completed: false, category: 'health' },
    { id: '4', text: 'Book Hajj package with approved operator', completed: false, category: 'documents' },
    { id: '5', text: 'Study Hajj rituals and prayers', completed: false, category: 'spiritual' },
    { id: '6', text: 'Purchase Ihram clothing', completed: false, category: 'packing', productTags: ['islamic', 'pilgrimage', 'journey-before'] },
    { id: '7', text: 'Get travel prayer mat', completed: false, category: 'packing', productTags: ['prayer-reflection', 'pilgrimage'] },
    { id: '8', text: 'Purchase Hajj guidebook', completed: false, category: 'packing', productTags: ['pilgrimage', 'journey-before'] },
    { id: '9', text: 'Get unscented toiletries', completed: false, category: 'packing', productTags: ['pilgrimage', 'journey-during'] },
    { id: '10', text: 'Buy comfortable walking shoes', completed: false, category: 'packing' },
  ]);

  const [itinerary] = useState<ItineraryItem[]>([
    { id: '1', day: 1, date: '8th Dhul Hijjah', location: 'Mina', activities: ['Enter state of Ihram', 'Pray Fajr in Makkah', 'Travel to Mina', 'Spend day in prayer'], notes: 'Stay in tent, reflect and prepare' },
    { id: '2', day: 2, date: '9th Dhul Hijjah', location: 'Arafat', activities: ['Stand at Arafat (Wuquf)', 'Zuhr and Asr prayers combined', 'Make extensive dua', 'Travel to Muzdalifah after sunset'], notes: 'Most important day - focus on sincere supplication' },
    { id: '3', day: 3, date: '10th Dhul Hijjah', location: 'Mina', activities: ['Collect pebbles in Muzdalifah', 'Stone Jamarat al-Aqaba', 'Sacrifice animal (Qurbani)', 'Shave head/trim hair', 'Tawaf al-Ifadah'], notes: 'Eid day - partial exit from Ihram' },
    { id: '4', day: 4, date: '11th Dhul Hijjah', location: 'Mina', activities: ['Stone all three Jamarat', 'Spend night in Mina'], notes: 'Days of Tashriq' },
    { id: '5', day: 5, date: '12th Dhul Hijjah', location: 'Mina/Makkah', activities: ['Stone all three Jamarat', 'Optional: Leave Mina before sunset', 'Tawaf al-Wada (Farewell Tawaf)'], notes: 'Can depart if left before sunset' },
  ]);

  const [budget, setBudget] = useState<BudgetItem[]>([
    { id: 'travel-package', name: 'Travel Package', allocated: 5000, spent: 0, min: 2000, max: 15000 },
    { id: 'flights', name: 'Flights', allocated: 1200, spent: 0, min: 500, max: 5000 },
    { id: 'accommodation-makkah', name: 'Accommodation in Makkah', allocated: 1500, spent: 0, min: 500, max: 8000 },
    { id: 'accommodation-madinah', name: 'Accommodation in Madinah', allocated: 1000, spent: 0, min: 300, max: 5000 },
    { id: 'food-meals', name: 'Food & Meals', allocated: 800, spent: 0, min: 200, max: 3000 },
    { id: 'transportation', name: 'Transportation', allocated: 400, spent: 0, min: 100, max: 2000 },
    { id: 'ihram-items', name: 'Ihram & Pilgrimage Items', allocated: 300, spent: 0, min: 100, max: 1500 },
    { id: 'qurbani', name: 'Qurbani/Sacrifice', allocated: 200, spent: 0, min: 100, max: 1000 },
    { id: 'gifts-souvenirs', name: 'Gifts & Souvenirs', allocated: 400, spent: 0, min: 100, max: 2000 },
    { id: 'emergency-fund', name: 'Emergency Fund', allocated: 500, spent: 0, min: 200, max: 3000 },
  ]);

  const updateBudgetAllocation = (id: string, value: number) => {
    setBudget(categories =>
      categories.map(cat =>
        cat.id === id ? { ...cat, allocated: value } : cat
      )
    );
  };

  const updateBudgetSpent = (id: string, value: number) => {
    setBudget(categories =>
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

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
      toggleProductSelection(product.id);
    }
  };

  const handleAddPackToCart = (pack: typeof smartPacks[0]) => {
    pack.products.forEach(productId => {
      const product = mockProducts.find(p => p.id === productId);
      if (product && onAddToCart) {
        onAddToCart(product);
      }
    });
  };

  const totalPlanned = budget.reduce((sum, item) => sum + item.allocated, 0);
  const totalActual = budget.reduce((sum, item) => sum + item.spent, 0);
  const completedItems = checklist.filter(item => item.completed).length;
  const selectedProductsTotal = selectedProducts.reduce((sum, id) => {
    const product = mockProducts.find(p => p.id === id);
    return sum + (product?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Hajj Journey Planner</h1>
          </div>
          <p className="text-purple-100 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-100">Hajj Date</div>
                  <input
                    type="date"
                    value={hajjDate}
                    onChange={(e) => setHajjDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-100">Group Size</div>
                  <input
                    type="number"
                    min="1"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value))}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-100">Progress</div>
                  <div className="text-2xl font-bold">{completedItems}/{checklist.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <div className="text-sm text-purple-100">Cart Total</div>
                  <div className="text-2xl font-bold">${selectedProductsTotal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Book },
              { id: 'packages', label: 'Travel Packages', icon: Plane },
              { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
              { id: 'itinerary', label: 'Itinerary', icon: MapPin },
              { id: 'checklist', label: 'Checklist', icon: CheckSquare },
              { id: 'budget', label: 'Budget', icon: DollarSign },
              { id: 'guide', label: 'Guide', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Hajj</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Hajj is the annual Islamic pilgrimage to Makkah, Saudi Arabia. It is one of the five pillars of Islam and obligatory for all able Muslims at least once in their lifetime.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Key Dates 2026</h3>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>8th Dhul Hijjah - Day of Tarwiyah (Mina)</li>
                    <li>9th Dhul Hijjah - Day of Arafat</li>
                    <li>10th Dhul Hijjah - Eid al-Adha</li>
                    <li>11-13th Dhul Hijjah - Days of Tashriq</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Essential Requirements</h3>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>Valid passport (6+ months)</li>
                    <li>Hajj visa approval</li>
                    <li>Required vaccinations</li>
                    <li>Physical fitness preparation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">5-7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days Duration</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Holy Sites</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round((completedItems/checklist.length)*100)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ready</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalPlanned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Budget</div>
              </div>
            </div>
          </div>
        )}

        {/* Travel Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Purple Soul Verified Travel Packages</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Premium Hajj packages from trusted, verified tour operators
                </p>
              </div>
              {comparePackages.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Compare ({comparePackages.length})
                </button>
              )}
            </div>

            {/* Location Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter by Package Location</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State/Province</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={!selectedCountry}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

            {travelPackages.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading travel packages...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {travelPackages.map((pkg) => (
                  <TravelPackageCard
                    key={pkg.id}
                    package={pkg}
                    onSelect={handlePackageSelect}
                    onCompare={handlePackageCompare}
                    isComparing={comparePackages.some(p => p.id === pkg.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Shopping Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Smart Shopping Recommendations</h2>
              <p className="text-gray-600 dark:text-gray-300">Curated products based on your Hajj needs</p>
            </div>

            {/* Smart Packs */}
            {smartPacks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Bundles</h3>
                </div>
                {smartPacks.map((pack) => (
                  <div key={pack.id} className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5" />
                          <h4 className="text-2xl font-bold">{pack.name}</h4>
                        </div>
                        <p className="text-purple-50 mb-4">{pack.description}</p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold">${pack.totalPrice}</span>
                          <span className="text-purple-100 line-through">$<span className="line-through">{pack.totalPrice + pack.savings}</span></span>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Save ${pack.savings}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddPackToCart(pack)}
                        className="bg-white text-purple-600 dark:text-purple-400 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add Bundle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Category Recommendations */}
            {matchedRecommendations.map(({ recommendation, products }) => (
              products.length > 0 && (
                <div key={recommendation.title} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{recommendation.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{recommendation.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {recommendation.priority === 'essential' && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Essential</span>
                        )}
                        {recommendation.priority === 'recommended' && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Recommended</span>
                        )}
                        {recommendation.priority === 'optional' && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">Optional</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {products.slice(0, 3).map((product) => (
                      <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all">
                        <div className="relative cursor-pointer" onClick={() => onViewProduct?.(product)}>
                          <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView?.(product);
                            }}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <span className="bg-white text-purple-600 dark:text-purple-400 px-4 py-2 rounded-full font-semibold text-sm">Quick View</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist?.(product.id);
                            }}
                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"
                          >
                            <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                          </button>
                          {product.originalPrice && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4
                            className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 cursor-pointer hover:text-purple-600 dark:text-purple-400 transition-colors"
                            onClick={() => onViewProduct?.(product)}
                          >
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{product.rating}</span>
                            <span className="text-sm text-gray-500">({product.reviews})</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={selectedProducts.includes(product.id)}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-theme-md hover:shadow-theme-lg ${
                              selectedProducts.includes(product.id)
                                ? 'bg-green-100 text-green-700 cursor-not-allowed dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                            }`}
                          >
                            {selectedProducts.includes(product.id) ? (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                Added to Cart
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {/* Checkout Section */}
            {selectedProducts.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 sticky bottom-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Selected Items</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedProducts.length} products</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">${selectedProductsTotal}</div>
                    <a
                      href="#cart"
                      className="mt-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 inline-flex"
                    >
                      <CreditCard className="w-5 h-5" />
                      Proceed to Checkout
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hajj Itinerary</h2>

            {itinerary.map((day) => (
              <div key={day.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400 dark:text-purple-400 font-bold">{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{day.date}</h3>
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 dark:text-purple-400 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{day.location}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Activities:</h4>
                      <ul className="space-y-2">
                        {day.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                            <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Note:</strong> {day.notes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preparation Checklist</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {completedItems} of {checklist.length} completed
              </div>
            </div>

            {['spiritual', 'documents', 'health', 'packing'].map((category) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 capitalize">
                  {category} Preparation
                </h3>
                <div className="space-y-3">
                  {checklist.filter(item => item.category === category).map((item) => (
                    <div key={item.id}>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="w-5 h-5 text-purple-600 dark:text-purple-400 rounded border-gray-300 focus:ring-purple-500 mt-0.5"
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} group-hover:text-purple-600 dark:text-purple-400 dark:group-hover:text-purple-400 transition-colors`}>
                          {item.text}
                        </span>
                      </label>
                      {item.productTags && !item.completed && (
                        <button
                          onClick={() => setActiveTab('shopping')}
                          className="ml-8 mt-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium"
                        >
                          Shop recommended items →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Planner</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${budget.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="space-y-8">
                {budget.map((category) => (
                  <div key={category.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg text-gray-900 dark:text-white">{category.name}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">${category.allocated.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Allocated: ${category.allocated.toLocaleString()}
                      </div>
                    </div>

                    {/* Allocation Slider */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Budget Allocation
                        </label>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
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
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          style={{
                            background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) ${((category.allocated - category.min) / (category.max - category.min)) * 100}%, rgb(229, 231, 235) 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Spent Input */}
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
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
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          of ${category.allocated.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(category.spent / category.allocated) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Spent: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">${category.spent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Remaining: </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${(category.allocated - category.spent).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ${budget.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</div>
                    <div className="text-2xl font-bold text-red-600">
                      ${budget.reduce((sum, cat) => sum + cat.spent, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Remaining</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${budget.reduce((sum, cat) => sum + (cat.allocated - cat.spent), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Hajj Guide</h2>
              <p className="text-purple-50">Everything you need to know for a blessed and successful Hajj journey</p>
            </div>

            {/* Preparation Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Preparation Timeline</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">6-12 Months Before</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Apply for Hajj visa through approved travel operator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Get required vaccinations (Meningitis ACWY, COVID-19, seasonal flu)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Book Hajj package with verified operator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Ensure passport has 6+ months validity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Begin physical conditioning - walking and stamina building</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Study Hajj rituals and duas systematically</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-6 py-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3-6 Months Before</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Attend Hajj preparation classes at local mosque</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Purchase Ihram clothing and comfortable walking shoes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Settle all debts and make amends with people</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Write will and make family provisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Practice Hajj rituals and memorize essential duas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Check health conditions, consult doctor if needed</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-400 pl-6 py-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1 Month Before</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Finalize packing list - unscented toiletries, medications, etc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Make copies of important documents (passport, visa, insurance)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Increase duas and spiritual preparation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Seek forgiveness from family and friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Review Hajj procedures one final time</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-300 pl-6 py-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Week of Departure</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Perform 2 rakaat Salat al-Hajah (prayer of need)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Give sadaqah (charity) and make sincere repentance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Pack emergency medications and health supplies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Confirm all travel arrangements and group meeting points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Make list of people to make dua for during Hajj</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Rituals Guide */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Hajj Rituals Step-by-Step</h3>
              </div>

              <div className="space-y-6">
                {[
                  {
                    day: '8th Dhul Hijjah',
                    name: 'Day of Tarwiyah',
                    location: 'Mina',
                    rituals: [
                      'Enter state of Ihram at Miqat with intention for Hajj',
                      'Recite Talbiyah: "Labbayk Allahumma labbayk..."',
                      'Pray Fajr in Makkah',
                      'Travel to Mina after sunrise',
                      'Pray Dhuhr, Asr, Maghrib, Isha (shortened but not combined) in Mina',
                      'Spend night in Mina in worship and reflection'
                    ],
                    tips: ['Stay hydrated', 'Rest well for next day', 'Prepare mentally for Arafat']
                  },
                  {
                    day: '9th Dhul Hijjah',
                    name: 'Day of Arafat',
                    location: 'Arafat then Muzdalifah',
                    rituals: [
                      'Travel to Arafat after Fajr in Mina',
                      'Stand at Arafat (Wuquf) - MOST IMPORTANT pillar of Hajj',
                      'Make extensive dua from noon until sunset',
                      'Pray Dhuhr and Asr combined and shortened',
                      'After sunset, proceed to Muzdalifah (do NOT pray Maghrib in Arafat)',
                      'Pray Maghrib and Isha combined in Muzdalifah',
                      'Collect 49-70 pebbles for stoning',
                      'Spend night under open sky in Muzdalifah'
                    ],
                    tips: ['This is the most sacred day - focus on sincere dua', 'Stay in boundaries of Arafat', 'Bring water and shade']
                  },
                  {
                    day: '10th Dhul Hijjah',
                    name: 'Eid al-Adha',
                    location: 'Muzdalifah to Mina',
                    rituals: [
                      'Leave Muzdalifah after Fajr',
                      'Stone Jamarat al-Aqaba (big pillar) with 7 pebbles',
                      'Offer sacrifice (Qurbani) - can be done through agent',
                      'Shave head completely (men) or trim fingertip length (women)',
                      'Partial release from Ihram - normal clothes allowed',
                      'Go to Makkah for Tawaf al-Ifadah (7 circuits)',
                      'Perform Sa\'i between Safa and Marwah (7 rounds)',
                      'Return to Mina to spend night'
                    ],
                    tips: ['Complete rituals in order if possible', 'Can do Tawaf later if crowded', 'Full Ihram restrictions lifted after Tawaf and Sa\'i']
                  },
                  {
                    day: '11th-12th Dhul Hijjah',
                    name: 'Days of Tashriq',
                    location: 'Mina',
                    rituals: [
                      'Stay in Mina both nights',
                      'Each day after Dhuhr: stone all 3 Jamarat (small, medium, large)',
                      'Stone each Jamarat with 7 pebbles (21 total per day)',
                      'Make dua after first and middle Jamarat',
                      'May leave Mina before sunset on 12th if in hurry',
                      'Otherwise stay until 13th and stone Jamarat again'
                    ],
                    tips: ['Stone during allowed times to avoid crowds', 'Don\'t throw belongings/shoes', 'Be patient and gentle']
                  },
                  {
                    day: 'Before Departure',
                    name: 'Farewell Tawaf',
                    location: 'Makkah',
                    rituals: [
                      'Perform Tawaf al-Wada (Farewell Tawaf) before leaving Makkah',
                      '7 circuits around Kaaba',
                      'This should be last act in Makkah',
                      'Make heartfelt duas for acceptance',
                      'Visit Masjid an-Nabawi in Madinah if time permits'
                    ],
                    tips: ['Don\'t engage in shopping after Tawaf al-Wada', 'Leave Makkah with heavy heart', 'Pray for return visit']
                  }
                ].map((day, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{day.day}: {day.name}</h4>
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 dark:text-purple-400 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{day.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Rituals & Actions:</h5>
                      <ol className="space-y-2">
                        {day.rituals.map((ritual, ridx) => (
                          <li key={ridx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            <span className="text-purple-600 dark:text-purple-400 font-bold mt-0.5">{ridx + 1}.</span>
                            <span>{ritual}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Important Tips:</span>
                      </div>
                      <ul className="space-y-1">
                        {day.tips.map((tip, tidx) => (
                          <li key={tidx} className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                            <span>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Common Mistakes Pilgrims Make</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Not Staying in Arafat Boundaries</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">If you're not within Arafat boundaries during Wuquf, your Hajj is invalid. Verify your location.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Rushing or Skipping Rituals</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Each ritual has specific requirements. Don't rush or skip steps. Ask scholars if unsure.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Using Scented Products in Ihram</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Perfumes, scented soaps, and deodorants are prohibited in Ihram. Use only unscented products.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Neglecting Health & Hydration</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Drink plenty of water, rest when needed. Heatstroke and dehydration are serious risks.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Arguing or Losing Patience</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Hajj tests patience. Avoid arguments, harsh words, and losing temper. Stay calm and kind.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Focusing on Photos Over Spirituality</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">While photos are permissible, don't let them distract from worship and reflection.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Safety */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Health & Safety Tips</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Before You Go</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Get comprehensive travel health insurance</li>
                      <li>• Consult doctor about fitness for Hajj</li>
                      <li>• Bring sufficient medications (30+ days supply)</li>
                      <li>• Carry medication list and prescriptions</li>
                      <li>• Practice walking long distances</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Packing Essentials</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Comfortable, broken-in walking shoes</li>
                      <li>• Ihram clothing (2-3 sets)</li>
                      <li>• Unscented toiletries and soap</li>
                      <li>• Reusable water bottle</li>
                      <li>• Sun protection (umbrella, hat when not in Ihram)</li>
                      <li>• First aid kit and medications</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">During Hajj</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Drink water constantly (3-4 liters daily)</li>
                      <li>• Rest during hottest hours when possible</li>
                      <li>• Wear comfortable footwear to prevent blisters</li>
                      <li>• Keep emergency contacts with you always</li>
                      <li>• Stay with your group; don't wander alone</li>
                      <li>• Protect yourself from sun exposure</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Emergency Situations</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Know location of nearest medical tent</li>
                      <li>• Memorize: Emergency 997, Red Crescent 997</li>
                      <li>• Carry identification and medical info</li>
                      <li>• Don't hesitate to seek medical help</li>
                      <li>• Have embassy contact information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Spiritual Preparation */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Spiritual Preparation</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Before Departing:</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Make sincere repentance (Tawbah) for all past sins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Settle all debts and financial obligations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Seek forgiveness from those you've wronged</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Purify your intention - do Hajj solely for Allah</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Study the significance and history of Hajj rituals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Increase worship, Quran recitation, and voluntary prayers</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">During Hajj:</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Maintain constant remembrance of Allah (dhikr)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Be patient, humble, and kind to all pilgrims</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Make extensive dua especially at Arafat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Avoid arguments, obscene talk, and evil deeds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Help other pilgrims when you can</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Reflect on the unity of Muslims worldwide</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">After Hajj (Hajj Mabrur):</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Maintain the spiritual high - don't return to old sins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Continue increased worship and good deeds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Share knowledge and experience with others</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Be patient, humble, and improved in character</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Make dua for return visit to Haramain</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Additional Resources</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Learning Materials</h4>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• Hajj guidebooks in your language</li>
                    <li>• Video tutorials of rituals</li>
                    <li>• Dua compilations</li>
                    <li>• Mobile apps (e.g., Hajj Guide, Manasikana)</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Official Resources</h4>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• Ministry of Hajj and Umrah website</li>
                    <li>• Nusuk app for services</li>
                    <li>• Official Hajj portal</li>
                    <li>• Your country's Hajj mission</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Support Services</h4>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• 24/7 medical services</li>
                    <li>• Lost and found</li>
                    <li>• Translation services</li>
                    <li>• Guidance officers at holy sites</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <TravelPackageDetail
          package={selectedPackage}
          addons={packageAddons}
          onClose={() => setSelectedPackage(null)}
          onCheckout={handleCheckout}
        />
      )}

      {/* Package Comparison Modal */}
      {showComparison && comparePackages.length > 0 && (
        <PackageComparisonModal
          packages={comparePackages}
          onClose={() => setShowComparison(false)}
          onRemove={(id) => setComparePackages(comparePackages.filter(p => p.id !== id))}
          onSelect={handlePackageSelect}
        />
      )}
    </div>
  );
}
