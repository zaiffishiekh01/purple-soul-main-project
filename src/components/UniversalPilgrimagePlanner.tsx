import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckSquare, Globe, Heart, Compass, Users, Book, Clock, Star, ShoppingCart, Plane, BookOpen, CreditCard, TrendingUp, Sparkles } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import TravelPackageCard from './TravelPackageCard';
import PackageComparisonModal from './PackageComparisonModal';
import TravelPackageDetail from './TravelPackageDetail';
import PilgrimageEssentials from './PilgrimageEssentials';

interface UniversalPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

interface Destination {
  id: string;
  name: string;
  tradition: string;
  location: string;
  description: string;
  bestTime: string;
  duration: string;
}

interface ItineraryItem {
  id: string;
  day: number;
  date: string;
  location: string;
  activities: string[];
  notes: string;
}

export default function UniversalPilgrimagePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: UniversalPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'shopping' | 'itinerary' | 'checklist' | 'guide'>('overview');
  const [selectedTradition, setSelectedTradition] = useState<'all' | 'islamic' | 'christian' | 'jewish'>('all');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [destination, setDestination] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [budget, setBudget] = useState(5000);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [travelPackages, setTravelPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageAddons, setPackageAddons] = useState<any[]>([]);
  const [comparePackages, setComparePackages] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const [itinerary] = useState<ItineraryItem[]>([
    {
      id: '1',
      day: 1,
      date: 'Day 1',
      location: 'Arrival & Orientation',
      activities: [
        'Arrive at pilgrimage destination',
        'Check into accommodation',
        'Attend orientation session',
        'Light evening prayer or meditation'
      ],
      notes: 'Rest well to prepare for the spiritual journey ahead'
    },
    {
      id: '2',
      day: 2,
      date: 'Day 2',
      location: 'Primary Sacred Sites',
      activities: [
        'Visit main holy site (mosque/church/temple)',
        'Participate in guided spiritual reflection',
        'Prayer or meditation session',
        'Evening group discussion'
      ],
      notes: 'Dress modestly and respectfully according to tradition'
    },
    {
      id: '3',
      day: 3,
      date: 'Day 3',
      location: 'Historical & Cultural Sites',
      activities: [
        'Explore historical religious sites',
        'Visit museum or heritage center',
        'Learn about local faith traditions',
        'Personal reflection time'
      ],
      notes: 'Bring camera but check photography restrictions'
    },
    {
      id: '4',
      day: 4,
      date: 'Day 4',
      location: 'Nature & Contemplation',
      activities: [
        'Visit natural sacred sites (mountains, springs, gardens)',
        'Walking meditation or pilgrimage route',
        'Quiet contemplation in nature',
        'Journaling or artistic expression'
      ],
      notes: 'Wear comfortable walking shoes and bring water'
    },
    {
      id: '5',
      day: 5,
      date: 'Day 5',
      location: 'Community & Service',
      activities: [
        'Meet local faith community members',
        'Participate in service project (optional)',
        'Attend communal prayer or ceremony',
        'Share experiences with fellow pilgrims'
      ],
      notes: 'Open heart and mind to interfaith dialogue'
    },
    {
      id: '6',
      day: 6,
      date: 'Day 6',
      location: 'Final Blessings & Departure',
      activities: [
        'Final visit to primary sacred site',
        'Receive blessings or participate in closing ceremony',
        'Purchase meaningful souvenirs or religious items',
        'Prepare for departure'
      ],
      notes: 'Take time to internalize lessons learned during pilgrimage'
    },
  ]);

  useEffect(() => {
    fetchTravelPackages();
  }, [selectedTradition]);

  const fetchTravelPackages = async () => {
    let query = supabase
      .from('travel_packages')
      .select(`*,vendor:travel_vendors(name, logo_url, verified)`)
      .order('rating', { ascending: false });

    if (selectedTradition !== 'all') {
      query = query.eq('pilgrimage_type', selectedTradition);
    }

    const { data: packages } = await query;
    if (packages) {
      setTravelPackages(packages.map(pkg => ({
        ...pkg,
        vendor_name: pkg.vendor.name,
        vendor_logo: pkg.vendor.logo_url,
        vendor_verified: pkg.vendor.verified,
      })));
    }
  };

  const handlePackageSelect = async (pkg: any) => {
    setSelectedPackage(pkg);
    const { data: addons } = await supabase.from('package_addons').select('*').eq('package_id', pkg.id);
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

  const [checklist, setChecklist] = useState([
    { id: '1', text: 'Research destination and significance', completed: false, category: 'Planning' },
    { id: '2', text: 'Check passport validity (6+ months)', completed: false, category: 'Documents' },
    { id: '3', text: 'Apply for visa if required', completed: false, category: 'Documents' },
    { id: '4', text: 'Get required vaccinations', completed: false, category: 'Health' },
    { id: '5', text: 'Book flights', completed: false, category: 'Travel' },
    { id: '6', text: 'Reserve accommodations', completed: false, category: 'Travel' },
    { id: '7', text: 'Purchase travel insurance', completed: false, category: 'Insurance' },
    { id: '8', text: 'Arrange local transportation', completed: false, category: 'Travel' },
    { id: '9', text: 'Learn about local customs', completed: false, category: 'Cultural' },
    { id: '10', text: 'Study religious significance', completed: false, category: 'Spiritual' },
    { id: '11', text: 'Pack appropriate clothing', completed: false, category: 'Packing' },
    { id: '12', text: 'Prepare spiritual materials', completed: false, category: 'Spiritual' },
    { id: '13', text: 'Notify family and emergency contacts', completed: false, category: 'Safety' },
    { id: '14', text: 'Exchange currency', completed: false, category: 'Financial' },
    { id: '15', text: 'Download offline maps', completed: false, category: 'Technology' },
  ]);

  const destinations: Destination[] = [
    {
      id: '1',
      name: 'Makkah & Madinah',
      tradition: 'Islamic',
      location: 'Saudi Arabia',
      description: 'Hajj and Umrah pilgrimage to Islam\'s holiest cities',
      bestTime: 'Ramadan or year-round for Umrah',
      duration: '7-14 days'
    },
    {
      id: '2',
      name: 'Jerusalem',
      tradition: 'Multi-faith',
      location: 'Israel',
      description: 'Sacred to Judaism, Christianity, and Islam',
      bestTime: 'Spring or Fall',
      duration: '7-10 days'
    },
    {
      id: '3',
      name: 'Vatican & Rome',
      tradition: 'Christian',
      location: 'Italy',
      description: 'Center of Catholic Christianity',
      bestTime: 'Spring or Fall',
      duration: '5-7 days'
    },
    {
      id: '4',
      name: 'Camino de Santiago',
      tradition: 'Christian',
      location: 'Spain',
      description: 'Ancient pilgrimage route to tomb of St. James',
      bestTime: 'May-September',
      duration: '30-40 days'
    }
  ];

  const preparationGuide = [
    {
      category: 'Spiritual Preparation',
      icon: Heart,
      items: [
        'Research the spiritual significance of your destination',
        'Study the history and traditions',
        'Learn relevant prayers, mantras, or meditations',
        'Set clear intentions for your journey',
        'Practice relevant rituals beforehand',
        'Seek guidance from spiritual leaders'
      ]
    },
    {
      category: 'Physical Preparation',
      icon: Users,
      items: [
        'Get a health check-up before departure',
        'Build endurance if pilgrimage involves walking',
        'Get required vaccinations',
        'Prepare for climate and altitude',
        'Pack necessary medications',
        'Ensure adequate rest before departure'
      ]
    },
    {
      category: 'Cultural Preparation',
      icon: Globe,
      items: [
        'Learn basic phrases in local language',
        'Understand dress code requirements',
        'Study local customs and etiquette',
        'Research appropriate behavior at sacred sites',
        'Understand gender-specific rules if applicable',
        'Learn about local food and dietary considerations'
      ]
    },
    {
      category: 'Practical Preparation',
      icon: CheckSquare,
      items: [
        'Make copies of important documents',
        'Inform bank of travel plans',
        'Set up international phone plan',
        'Research emergency contacts at destination',
        'Create itinerary with backup plans',
        'Share travel plans with family/friends'
      ]
    }
  ];

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const filteredDestinations = selectedTradition === 'all'
    ? destinations
    : destinations.filter(d => d.tradition.toLowerCase().includes(selectedTradition));

  const selectedProductsTotal = selectedProducts.reduce((sum, id) => sum + 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Universal Pilgrimage Planner</h1>
          </div>
          <p className="text-slate-200 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-slate-200">Travel Date</div>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div>
                  <div className="text-sm text-slate-200">Group Size</div>
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
                  <div className="text-sm text-slate-200">Progress</div>
                  <div className="text-2xl font-bold">{completedItems}/{checklist.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <div className="text-sm text-slate-200">Cart Total</div>
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
              { id: 'guide', label: 'Guide', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-slate-700 text-slate-700 dark:border-slate-400 dark:text-slate-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-400'
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
        {/* My Plan Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Trip Overview</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Makkah, Jerusalem, Varanasi"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Budget (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Per person: ${Math.round(budget / groupSize).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Estimated Budget Breakdown</h3>
              <div className="space-y-3">
                {[
                  { category: 'Flights', percentage: 35 },
                  { category: 'Accommodation', percentage: 30 },
                  { category: 'Food & Meals', percentage: 15 },
                  { category: 'Local Transportation', percentage: 10 },
                  { category: 'Activities & Entry Fees', percentage: 5 },
                  { category: 'Emergency Fund', percentage: 5 },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${Math.round((budget * item.percentage) / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-slate-600 dark:bg-slate-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Destinations Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Universal Pilgrimage Packages</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore sacred journeys across all spiritual traditions
                </p>
              </div>
              {comparePackages.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Compare ({comparePackages.length})
                </button>
              )}
            </div>

            {/* Tradition Filter */}
            <div className="flex flex-wrap gap-3">
              {['all', 'islamic', 'christian', 'jewish'].map((tradition) => (
                <button
                  key={tradition}
                  onClick={() => setSelectedTradition(tradition as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTradition === tradition
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tradition.charAt(0).toUpperCase() + tradition.slice(1)}
                </button>
              ))}
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

        {activeTab === 'shopping' && (
          <div className="space-y-8">
            <PilgrimageEssentials
              products={mockProducts}
              onAddToCart={onAddToCart}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
              onViewProduct={onViewProduct}
              onQuickView={onQuickView}
            />
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Universal Pilgrimage Itinerary</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A flexible framework adaptable to any faith tradition
            </p>

            {itinerary.map((day) => (
              <div key={day.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{day.date}</h3>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{day.location}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Activities:</h4>
                      <ul className="space-y-2">
                        {day.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                            <CheckSquare className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-1 flex-shrink-0" />
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

        {activeTab === 'destinations-old' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sacred Destinations</h2>
              <select
                value={selectedTradition}
                onChange={(e) => setSelectedTradition(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Traditions</option>
                <option value="islamic">Islamic</option>
                <option value="christian">Christian</option>
                <option value="jewish">Jewish</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredDestinations.map((dest) => (
                <div key={dest.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dest.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <MapPin className="w-4 h-4" />
                        {dest.location}
                      </div>
                    </div>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                      {dest.tradition}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">{dest.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{dest.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Star className="w-4 h-4" />
                      <span>{dest.bestTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preparation Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preparation Checklist</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {completedItems} of {checklist.length} completed ({Math.round((completedItems / checklist.length) * 100)}%)
              </div>
            </div>

            {['Planning', 'Documents', 'Travel', 'Health', 'Spiritual', 'Cultural', 'Packing', 'Safety', 'Financial', 'Technology', 'Insurance'].map((category) => {
              const categoryItems = checklist.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{category}</h3>
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="w-5 h-5 text-slate-600 rounded border-gray-300 focus:ring-slate-500 mt-0.5"
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors`}>
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

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comprehensive Preparation Guide</h2>

            {preparationGuide.map((section, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-8 h-8 text-slate-600" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.category}</h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckSquare className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* General Tips */}
            <div className="bg-surface rounded-xl shadow-theme-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                General Pilgrimage Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h4 className="font-semibold mb-2">Before You Go</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Make digital and physical copies of all documents</li>
                    <li>• Register with your embassy at destination</li>
                    <li>• Learn emergency phrases in local language</li>
                    <li>• Download offline maps and translation apps</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">During Your Journey</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Stay hydrated and maintain energy levels</li>
                    <li>• Respect local customs and dress codes</li>
                    <li>• Keep emergency contacts accessible</li>
                    <li>• Journal your spiritual experiences</li>
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
