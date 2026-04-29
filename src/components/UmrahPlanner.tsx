import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckSquare, Package, DollarSign, Book, Clock, Heart, Star, ShoppingCart, Sparkles, TrendingUp, Plane, CreditCard, BookOpen, Users, Bell } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { getUmrahRecommendations, matchProductsToRecommendations, createSmartPacks } from '../lib/plannerRecommendations';
import { supabase } from '../lib/supabase';
import PlannerProductCard from './PlannerProductCard';
import TravelPackageCard from './TravelPackageCard';
import PackageComparisonModal from './PackageComparisonModal';
import TravelPackageDetail from './TravelPackageDetail';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface DuaItem {
  id: string;
  occasion: string;
  arabic: string;
  transliteration: string;
  translation: string;
}

interface BudgetItem {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  min: number;
  max: number;
}

interface UmrahPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function UmrahPlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: UmrahPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'shopping' | 'itinerary' | 'checklist' | 'budget' | 'guide'>('overview');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [travelPackages, setTravelPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageAddons, setPackageAddons] = useState<any[]>([]);
  const [comparePackages, setComparePackages] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const recommendations = getUmrahRecommendations();
  const matchedRecommendations = matchProductsToRecommendations(recommendations, mockProducts);
  const smartPacks = createSmartPacks(mockProducts, 'umrah');
  const [umrahDate, setUmrahDate] = useState('');
  const [duration, setDuration] = useState(7);
  const [groupSize, setGroupSize] = useState(1);

  // Location filtering state
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

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
      .eq('pilgrimage_type', 'umrah');

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

  const handleCheckout = () => {
    window.location.href = '#cart';
  };

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Obtain valid passport', completed: false, priority: 'high' },
    { id: '2', text: 'Apply for Umrah visa', completed: false, priority: 'high' },
    { id: '3', text: 'Get Meningitis vaccination', completed: false, priority: 'high' },
    { id: '4', text: 'Book flights to Jeddah/Madinah', completed: false, priority: 'high' },
    { id: '5', text: 'Book hotel near Haram', completed: false, priority: 'high' },
    { id: '6', text: 'Purchase Ihram clothing', completed: false, priority: 'medium' },
    { id: '7', text: 'Study Umrah rituals', completed: false, priority: 'high' },
    { id: '8', text: 'Learn key duas and prayers', completed: false, priority: 'medium' },
    { id: '9', text: 'Arrange travel insurance', completed: false, priority: 'medium' },
    { id: '10', text: 'Pack unscented toiletries', completed: false, priority: 'low' },
  ]);

  const duas: DuaItem[] = [
    {
      id: '1',
      occasion: 'Entering the state of Ihram',
      arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيْكَ لَكَ لَبَّيْكَ',
      transliteration: 'Labbayk Allahumma labbayk, labbayka la shareeka laka labbayk',
      translation: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am'
    },
    {
      id: '2',
      occasion: 'Upon seeing the Kaaba',
      arabic: 'اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً',
      transliteration: 'Allahumma zid hadha al-bayta tashreefan wa ta\'zeeman wa takreeman wa mahabah',
      translation: 'O Allah, increase this House in honor, esteem, respect and reverence'
    },
    {
      id: '3',
      occasion: 'During Tawaf (each circuit)',
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar',
      translation: 'Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire'
    },
    {
      id: '4',
      occasion: 'During Sa\'i (between Safa and Marwah)',
      arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
      transliteration: 'Inna as-Safa wal-Marwata min sha\'a\'irillah',
      translation: 'Indeed, Safa and Marwah are among the symbols of Allah'
    }
  ];

  const umrahSteps = [
    {
      step: 1,
      title: 'Enter state of Ihram',
      location: 'Miqat (boundary)',
      description: 'Make intention (niyyah) for Umrah, wear Ihram clothing, recite Talbiyah',
      details: [
        'Perform ghusl (ritual bath) before Ihram',
        'Men: wear two white unstitched cloths',
        'Women: wear modest clothing',
        'Make sincere intention for Umrah',
        'Begin reciting Talbiyah frequently'
      ],
      duration: '1-2 hours'
    },
    {
      step: 2,
      title: 'Perform Tawaf',
      location: 'Masjid al-Haram, Makkah',
      description: 'Circle the Kaaba seven times counterclockwise, starting from the Black Stone',
      details: [
        'Begin at the Black Stone corner',
        'Circle the Kaaba 7 times counterclockwise',
        'Men: uncover right shoulder (Idtiba)',
        'First 3 circuits: walk briskly (Raml) for men',
        'Make dua throughout Tawaf',
        'Pray 2 rakats at Maqam Ibrahim'
      ],
      duration: '1-2 hours'
    },
    {
      step: 3,
      title: 'Perform Sa\'i',
      location: 'Between Safa and Marwah',
      description: 'Walk seven times between the hills of Safa and Marwah',
      details: [
        'Start at Safa, facing the Kaaba',
        'Walk to Marwah (1st circuit)',
        'Walk back to Safa (2nd circuit)',
        'Complete 7 circuits total',
        'Men: jog between green markers',
        'Make dua throughout Sa\'i'
      ],
      duration: '45-90 minutes'
    },
    {
      step: 4,
      title: 'Halq or Taqsir',
      location: 'Makkah',
      description: 'Shave head completely (Halq) or trim hair (Taqsir) to exit Ihram',
      details: [
        'Men: shave entire head or trim at least 1 inch',
        'Women: trim a fingertip length of hair',
        'Umrah is now complete',
        'Exit state of Ihram',
        'Regular clothing can be worn'
      ],
      duration: '15-30 minutes'
    }
  ];

  const [budget, setBudget] = useState<BudgetItem[]>([
    { id: 'travel-package', name: 'Travel Package', allocated: 3000, spent: 0, min: 1000, max: 10000 },
    { id: 'flights', name: 'Flights', allocated: 1000, spent: 0, min: 400, max: 4000 },
    { id: 'accommodation-makkah', name: 'Accommodation in Makkah', allocated: 1200, spent: 0, min: 400, max: 6000 },
    { id: 'accommodation-madinah', name: 'Accommodation in Madinah', allocated: 800, spent: 0, min: 200, max: 4000 },
    { id: 'food-meals', name: 'Food & Meals', allocated: 500, spent: 0, min: 150, max: 2000 },
    { id: 'transportation', name: 'Transportation', allocated: 300, spent: 0, min: 100, max: 1500 },
    { id: 'pilgrimage-items', name: 'Ihram & Pilgrimage Items', allocated: 250, spent: 0, min: 100, max: 1000 },
    { id: 'gifts-souvenirs', name: 'Gifts & Souvenirs', allocated: 300, spent: 0, min: 100, max: 1500 },
    { id: 'emergency-fund', name: 'Emergency Fund', allocated: 400, spent: 0, min: 150, max: 2000 },
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

  const handleAddToCart = (product: Product) => {
    onAddToCart?.(product);
    setSelectedProducts([...selectedProducts, product.id]);
  };

  const handleAddPackToCart = (pack: any) => {
    pack.products.forEach((product: Product) => {
      onAddToCart?.(product);
    });
    setSelectedProducts([...selectedProducts, ...pack.products.map((p: Product) => p.id)]);
  };

  const selectedProductsTotal = mockProducts
    .filter(p => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const completedItems = checklist.filter(item => item.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Umrah Journey Planner</h1>
          </div>
          <p className="text-purple-100 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-purple-100">Umrah Date</div>
                  <input
                    type="date"
                    value={umrahDate}
                    onChange={(e) => setUmrahDate(e.target.value)}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Umrah</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Umrah is a pilgrimage to Makkah that can be performed at any time of the year, unlike Hajj which has specific dates. While not obligatory, it is highly recommended and brings immense spiritual rewards.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Spiritual Benefits
                  </h3>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• Forgiveness of sins</li>
                    <li>• Accepted duas and prayers</li>
                    <li>• Spiritual purification</li>
                    <li>• Closeness to Allah</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Commitment
                  </h3>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• Umrah rituals: 3-5 hours</li>
                    <li>• Recommended stay: 7-14 days</li>
                    <li>• Visit Madinah: 3-7 days</li>
                    <li>• Flexible year-round</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Main Steps</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">3-5h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">365</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days/Year</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rewards</div>
              </div>
            </div>
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Smart Shopping for Umrah</h2>
              <p className="text-gray-600 dark:text-gray-300">Curated products for your spiritual journey</p>
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
                          <span className="text-purple-100 line-through">${pack.totalPrice + pack.savings}</span>
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
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {products.slice(0, 3).map((product) => (
                      <PlannerProductCard
                        key={product.id}
                        product={product}
                        onViewProduct={onViewProduct}
                        onQuickView={onQuickView}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={onToggleWishlist}
                        isInWishlist={wishlist.includes(product.id)}
                        isInCart={selectedProducts.includes(product.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Steps Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Purple Soul Verified Travel Packages</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Premium Umrah packages from trusted, verified tour operators
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

        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">The 4 Steps of Umrah</h2>

            {umrahSteps.map((step, index) => (
              <div key={step.step} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 dark:text-purple-400">{step.step}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {step.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {step.duration}
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4">{step.description}</p>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Detailed Instructions:</h4>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                            <CheckSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
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
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold mb-2">Comprehensive Umrah Guide</h2>
              <p className="text-emerald-50">Complete guide to performing a blessed and spiritually fulfilling Umrah</p>
            </div>

            {/* Preparation Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Preparation Timeline</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-emerald-600 pl-6 py-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3-6 Months Before</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Apply for Umrah visa through authorized agent - Book flights and hotel near Haram - Get Meningitis vaccination</span>
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1 Month Before</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckSquare className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Purchase Ihram clothing - Buy unscented toiletries - Memorize essential duas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4 Steps - Condensed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">The 4 Steps of Umrah</h3>
              </div>

              <div className="space-y-4">
                {umrahSteps.map((step) => (
                  <div key={step.step} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Essential Duas - Keep existing content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Essential Duas</h3>
              </div>

              <div className="space-y-6">
                {duas.map((dua) => (
                  <div key={dua.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Heart className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{dua.occasion}</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-right text-2xl text-emerald-900 dark:text-purple-100 leading-loose font-arabic">
                          {dua.arabic}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm font-semibold text-emerald-900 dark:text-purple-100 mb-1">Transliteration:</div>
                        <div className="text-emerald-800 dark:text-emerald-200 italic">{dua.transliteration}</div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Translation:</div>
                        <div className="text-blue-800 dark:text-blue-200">{dua.translation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Common Mistakes to Avoid</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Using Scented Products in Ihram</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Only use unscented soaps and products when in state of Ihram.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Rushing Through Rituals</h4>
                      <p className="text-sm text-red-800 dark:text-red-200">Perform each step thoughtfully with proper intention and focus.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tips - Enhanced */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro Tips</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-emerald-600 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Best Times to Visit
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Ramadan: Most rewarding but very crowded</li>
                    <li>• Off-peak months: Less crowded access</li>
                    <li>• Early morning (2-5 AM): Least crowded</li>
                  </ul>
                </div>

                <div className="border-l-4 border-emerald-600 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Accommodation Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Stay close to Haram for easy access</li>
                    <li>• Book well in advance for best prices</li>
                    <li>• Consider hotels with Haram view</li>
                  </ul>
                </div>

                <div className="border-l-4 border-emerald-600 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    Spiritual Preparation
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Memorize key duas before departure</li>
                    <li>• Make sincere repentance (Tawbah)</li>
                    <li>• Create list of people to pray for</li>
                  </ul>
                </div>

                <div className="border-l-4 border-emerald-600 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Practical Advice
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Bring comfortable walking shoes</li>
                    <li>• Carry reusable water bottle</li>
                    <li>• Download offline Quran apps</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Helpful Resources</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Mobile Apps</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Eatmarna (Umrah permit)</li>
                    <li>• Umrah Step by Step</li>
                    <li>• Offline Quran apps</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Learning Materials</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Umrah guidebooks</li>
                    <li>• Video tutorials (YouTube)</li>
                    <li>• Local mosque classes</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">In Makkah</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• 24/7 medical centers</li>
                    <li>• Free wheelchair services</li>
                    <li>• Translation services</li>
                  </ul>
                </div>
              </div>
            </div>
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

            {['high', 'medium', 'low'].map((priority) => (
              <div key={priority} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 capitalize flex items-center gap-2">
                  {priority === 'high' && <span className="text-red-600">🔴</span>}
                  {priority === 'medium' && <span className="text-amber-600">🟡</span>}
                  {priority === 'low' && <span className="text-green-600">🟢</span>}
                  {priority} Priority
                </h3>
                <div className="space-y-3">
                  {checklist.filter(item => item.priority === priority).map((item) => (
                    <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="w-5 h-5 text-purple-600 dark:text-purple-400 rounded border-gray-300 focus:ring-teal-500 mt-0.5"
                      />
                      <span className={`flex-1 ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} group-hover:text-purple-600 dark:text-purple-400 dark:group-hover:text-purple-400 transition-colors`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checkout Section */}
        {selectedProducts.length > 0 && activeTab === 'shopping' && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 sticky bottom-0 mt-8">
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
