import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckSquare, Book, Cross, Church, Heart, Star, Clock, Navigation, ShoppingCart, Plane, BookOpen, CreditCard, TrendingUp, Users, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TravelPackageCard from './TravelPackageCard';
import PackageComparisonModal from './PackageComparisonModal';
import TravelPackageDetail from './TravelPackageDetail';
import PilgrimageEssentials from './PilgrimageEssentials';
import { Product } from '../App';
import { mockProducts } from '../data/products';

interface ChristianPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  significance: string;
  duration: string;
  highlights: string[];
}

interface Prayer {
  id: string;
  name: string;
  text: string;
  occasion: string;
}

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

export default function ChristianPilgrimagePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: ChristianPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'shopping' | 'itinerary' | 'checklist' | 'guide'>('overview');
  const [selectedDestination, setSelectedDestination] = useState<string>('jerusalem');
  const [travelDate, setTravelDate] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [travelPackages, setTravelPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageAddons, setPackageAddons] = useState<any[]>([]);
  const [comparePackages, setComparePackages] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Obtain valid passport (6+ months validity)', completed: false, category: 'documents' },
    { id: '2', text: 'Apply for visa to Israel/Palestine', completed: false, category: 'documents' },
    { id: '3', text: 'Get travel insurance', completed: false, category: 'documents' },
    { id: '4', text: 'Book pilgrimage package or accommodation', completed: false, category: 'documents' },
    { id: '5', text: 'Study Bible passages related to Holy Land', completed: false, category: 'spiritual' },
    { id: '6', text: 'Prepare spiritually through prayer and reflection', completed: false, category: 'spiritual' },
    { id: '7', text: 'Attend pre-pilgrimage orientation (if available)', completed: false, category: 'spiritual' },
    { id: '8', text: 'Get required vaccinations', completed: false, category: 'health' },
    { id: '9', text: 'Pack comfortable walking shoes', completed: false, category: 'packing', productTags: ['footwear'] },
    { id: '10', text: 'Pack modest clothing for sacred sites', completed: false, category: 'packing', productTags: ['clothing'] },
    { id: '11', text: 'Bring Bible, prayer book, and rosary', completed: false, category: 'packing', productTags: ['religious'] },
    { id: '12', text: 'Pack sun protection (hat, sunscreen)', completed: false, category: 'packing' },
  ]);

  const [itinerary] = useState<ItineraryItem[]>([
    {
      id: '1',
      day: 1,
      date: 'Day 1',
      location: 'Jerusalem - Old City',
      activities: [
        'Walk the Via Dolorosa (Way of Sorrows)',
        'Visit Church of the Holy Sepulchre',
        'Pray at Stations of the Cross',
        'Explore Christian Quarter'
      ],
      notes: 'Start early to avoid crowds. Dress modestly (covered shoulders and knees)'
    },
    {
      id: '2',
      day: 2,
      date: 'Day 2',
      location: 'Mount of Olives',
      activities: [
        'Visit Garden of Gethsemane',
        'Pray at Church of All Nations',
        'View Jerusalem from Mount of Olives',
        'Visit Church of the Ascension'
      ],
      notes: 'Bring water and wear comfortable shoes for walking'
    },
    {
      id: '3',
      day: 3,
      date: 'Day 3',
      location: 'Bethlehem',
      activities: [
        'Visit Church of the Nativity',
        'Pray at the Grotto (birthplace of Jesus)',
        'Explore Shepherds Field',
        'Visit Milk Grotto Chapel'
      ],
      notes: 'Check crossing times between Jerusalem and Bethlehem'
    },
    {
      id: '4',
      day: 4,
      date: 'Day 4',
      location: 'Galilee',
      activities: [
        'Visit Sea of Galilee',
        'Boat ride on the Sea of Galilee',
        'Church of the Multiplication (Tabgha)',
        'Mount of Beatitudes'
      ],
      notes: 'Full day trip from Jerusalem - depart early'
    },
    {
      id: '5',
      day: 5,
      date: 'Day 5',
      location: 'Nazareth & Cana',
      activities: [
        'Basilica of the Annunciation in Nazareth',
        'Visit Cana (wedding miracle site)',
        'Renewal of wedding vows ceremony (optional)',
        'Return to Jerusalem'
      ],
      notes: 'Consider bringing rings for vow renewal at Cana'
    },
  ]);

  const completedItems = checklist.filter(item => item.completed).length;

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  useEffect(() => {
    fetchTravelPackages();
  }, []);

  const fetchTravelPackages = async () => {
    const { data: packages } = await supabase
      .from('travel_packages')
      .select(`*,vendor:travel_vendors(name, logo_url, verified)`)
      .eq('pilgrimage_type', 'christian')
      .order('rating', { ascending: false });
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

  const destinations: Destination[] = [
    {
      id: 'jerusalem',
      name: 'Jerusalem',
      country: 'Israel',
      significance: 'Walk in the footsteps of Jesus Christ through the Holy Land',
      duration: '7-10 days',
      highlights: [
        'Church of the Holy Sepulchre',
        'Via Dolorosa (Way of Sorrows)',
        'Garden of Gethsemane',
        'Mount of Olives',
        'Western Wall',
        'Bethlehem - Church of the Nativity',
        'Room of the Last Supper',
        'Pool of Bethesda'
      ]
    },
    {
      id: 'rome',
      name: 'Rome & Vatican City',
      country: 'Italy',
      significance: 'Center of Catholic Christianity and seat of the Pope',
      duration: '5-7 days',
      highlights: [
        'St. Peter\'s Basilica',
        'Sistine Chapel',
        'Vatican Museums',
        'Papal Audience (Wednesdays)',
        'Catacombs of Rome',
        'San Giovanni in Laterano',
        'Santa Maria Maggiore',
        'St. Paul Outside the Walls'
      ]
    },
    {
      id: 'santiago',
      name: 'Camino de Santiago',
      country: 'Spain',
      significance: 'Ancient pilgrimage route to the tomb of St. James',
      duration: '30-35 days (full route)',
      highlights: [
        'Cathedral of Santiago de Compostela',
        'French Way (Camino Francés)',
        'Portuguese Way',
        'Northern Way',
        'Pilgrims\' passport (Credencial)',
        'Daily Mass for pilgrims',
        'Botafumeiro ceremony',
        'Finisterre (World\'s End)'
      ]
    }
  ];

  const prayers: Prayer[] = [
    {
      id: '1',
      name: 'Pilgrim\'s Prayer',
      occasion: 'Before beginning journey',
      text: 'Lord Jesus Christ, You are the way, the truth, and the life. Grant me the grace to follow in Your footsteps on this pilgrimage. May this journey strengthen my faith, deepen my love, and renew my commitment to You. Guide my steps and protect me on the road. May I return home transformed by Your grace. Amen.'
    },
    {
      id: '2',
      name: 'Prayer at Holy Sites',
      occasion: 'When visiting sacred places',
      text: 'Heavenly Father, I stand in this holy place where Your presence has been felt throughout the ages. Open my heart to receive Your grace and my mind to understand Your truth. May the faith of those who came before me inspire my own journey of faith. Through Christ our Lord. Amen.'
    },
    {
      id: '3',
      name: 'Stations of the Cross',
      occasion: 'Walking the Via Dolorosa',
      text: 'We adore You, O Christ, and we bless You, because by Your holy cross You have redeemed the world. Lord Jesus, You carried Your cross for love of me. Help me to carry my own crosses with patience and faith, following in Your footsteps. May I never forget Your sacrifice. Amen.'
    },
    {
      id: '4',
      name: 'Prayer of St. Francis',
      occasion: 'Daily meditation',
      text: 'Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; and where there is sadness, joy. Amen.'
    }
  ];

  const jerusalemItinerary = [
    {
      day: 1,
      title: 'Arrival & Old City Introduction',
      activities: ['Check into hotel', 'Evening walk through Old City', 'Visit Western Wall at sunset', 'Orientation tour'],
      spiritual: 'Reflect on arriving in the city where Jesus walked'
    },
    {
      day: 2,
      title: 'Via Dolorosa & Church of Holy Sepulchre',
      activities: ['Walk the 14 Stations of the Cross', 'Church of the Holy Sepulchre', 'Calvary & tomb of Christ', 'Attend Mass'],
      spiritual: 'Meditate on Christ\'s passion and resurrection'
    },
    {
      day: 3,
      title: 'Mount of Olives & Gethsemane',
      activities: ['Mount of Olives overlook', 'Church of All Nations', 'Garden of Gethsemane', 'Dominus Flevit Chapel'],
      spiritual: 'Contemplate Jesus\' agony and prayer in the garden'
    },
    {
      day: 4,
      title: 'Bethlehem Day Trip',
      activities: ['Church of the Nativity', 'Shepherd\'s Field', 'Milk Grotto Chapel', 'Bethlehem market'],
      spiritual: 'Celebrate the birth of our Savior'
    },
    {
      day: 5,
      title: 'Upper Room & Southern Jerusalem',
      activities: ['Cenacle (Last Supper room)', 'King David\'s Tomb', 'Pool of Siloam', 'City of David excavations'],
      spiritual: 'Remember the Last Supper and washing of feet'
    }
  ];

  const romeItinerary = [
    {
      day: 1,
      title: 'Vatican City',
      activities: ['St. Peter\'s Basilica', 'Climb the dome', 'Vatican Museums', 'Sistine Chapel', 'Papal tombs'],
      spiritual: 'Center of Catholic faith and universal Church'
    },
    {
      day: 2,
      title: 'Papal Audience & St. Peter\'s Square',
      activities: ['Wednesday Papal Audience', 'St. Peter\'s Square', 'Vatican gardens', 'Papal blessing'],
      spiritual: 'Receive the Pope\'s blessing and teaching'
    },
    {
      day: 3,
      title: 'Major Basilicas',
      activities: ['San Giovanni in Laterano', 'Holy Stairs (Scala Santa)', 'Santa Maria Maggiore', 'St. Paul Outside the Walls'],
      spiritual: 'Four major basilicas pilgrimage'
    },
    {
      day: 4,
      title: 'Ancient Christian Sites',
      activities: ['Catacombs tour', 'San Clemente Basilica', 'Mamertine Prison', 'Colosseum'],
      spiritual: 'Early Christian martyrs and persecution'
    }
  ];

  const santiagoGuide = [
    {
      stage: 'Preparation',
      duration: '3-6 months before',
      tasks: [
        'Physical training - walk 10-20km regularly',
        'Break in hiking boots thoroughly',
        'Book accommodations in advance (summer)',
        'Obtain Pilgrim\'s Credential (passport)',
        'Plan route and daily stages',
        'Study spiritual preparation materials'
      ]
    },
    {
      stage: 'The Journey',
      duration: '30-35 days',
      tasks: [
        'Start from St. Jean Pied de Port (France)',
        'Walk 20-25km per day average',
        'Collect stamps in Credential',
        'Stay in albergues (pilgrim hostels)',
        'Attend daily pilgrim Mass',
        'Join evening prayer gatherings'
      ]
    },
    {
      stage: 'Arrival',
      duration: 'Final days',
      tasks: [
        'Attend Pilgrim\'s Mass at Cathedral',
        'Witness Botafumeiro ceremony',
        'Obtain Compostela certificate',
        'Visit tomb of St. James',
        'Optional: walk to Finisterre',
        'Celebrate completion with fellow pilgrims'
      ]
    }
  ];

  const selectedProductsTotal = selectedProducts.reduce((sum, id) => sum + 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Christian Pilgrimage Planner</h1>
          </div>
          <p className="text-blue-100 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-blue-100">Travel Date</div>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-white w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div>
                  <div className="text-sm text-blue-100">Group Size</div>
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
                  <div className="text-sm text-blue-100">Progress</div>
                  <div className="text-2xl font-bold">0/10</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <div className="text-sm text-blue-100">Cart Total</div>
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
                    ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
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
        {/* Destinations Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sacred Destinations</h2>

            {destinations.map((dest) => (
              <div key={dest.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Church className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dest.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{dest.country}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Recommended</div>
                    <div className="font-bold text-purple-600">{dest.duration}</div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">{dest.significance}</p>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Must-Visit Sites:</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {dest.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                        <CheckSquare className="w-4 h-4 flex-shrink-0" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Jerusalem Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Purple Soul Verified Travel Packages</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Premium Christian pilgrimage packages from trusted, verified tour operators
                </p>
              </div>
              {comparePackages.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Compare ({comparePackages.length})
                </button>
              )}
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Holy Land Pilgrimage Itinerary</h2>

            {itinerary.map((day) => (
              <div key={day.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{day.date}</h3>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{day.location}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Activities:</h4>
                      <ul className="space-y-2">
                        {day.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
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
                          className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                          {item.text}
                        </span>
                      </label>
                      {item.productTags && !item.completed && (
                        <button
                          onClick={() => setActiveTab('shopping')}
                          className="ml-8 mt-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
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

        {activeTab === 'jerusalem-old' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Jerusalem Pilgrimage</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Walk in the footsteps of Jesus Christ through the city where He taught, suffered, died, and rose again.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                  <Star className="w-6 h-6 text-amber-600 mb-2" />
                  <div className="font-semibold text-amber-900 dark:text-amber-100">Sacred Sites</div>
                  <div className="text-2xl font-bold text-amber-600">15+</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <Clock className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="font-semibold text-purple-900 dark:text-purple-100">Duration</div>
                  <div className="text-2xl font-bold text-purple-600">7-10 days</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <Heart className="w-6 h-6 text-green-600 mb-2" />
                  <div className="font-semibold text-green-900 dark:text-green-100">Best Season</div>
                  <div className="text-2xl font-bold text-green-600">Spring/Fall</div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suggested Itinerary</h3>

            {jerusalemItinerary.map((day, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{day.title}</h4>
                    <ul className="space-y-2 mb-4">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                          <CheckSquare className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-sky-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-sky-800 dark:text-sky-200">
                          <strong>Spiritual Focus:</strong> {day.spiritual}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rome Tab */}
        {activeTab === 'rome-old' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rome & Vatican Pilgrimage</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Visit the heart of Catholic Christianity, home to the Pope and countless sacred sites.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <Church className="w-6 h-6 text-red-600 mb-2" />
                  <div className="font-semibold text-red-900 dark:text-red-100">Major Basilicas</div>
                  <div className="text-2xl font-bold text-red-600">4</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                  <Star className="w-6 h-6 text-amber-600 mb-2" />
                  <div className="font-semibold text-amber-900 dark:text-amber-100">Vatican Museums</div>
                  <div className="text-2xl font-bold text-amber-600">54 galleries</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="font-semibold text-purple-900 dark:text-purple-100">Papal Audience</div>
                  <div className="text-2xl font-bold text-purple-600">Wednesday</div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suggested Itinerary</h3>

            {romeItinerary.map((day, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-bold">{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{day.title}</h4>
                    <ul className="space-y-2 mb-4">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                          <CheckSquare className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>Spiritual Focus:</strong> {day.spiritual}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Santiago Tab */}
        {activeTab === 'santiago-old' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Camino de Santiago</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The ancient pilgrimage route to the tomb of St. James the Apostle in Santiago de Compostela, Spain. A transformative journey of faith, reflection, and endurance.
              </p>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                  <Navigation className="w-6 h-6 text-amber-600 mb-2" />
                  <div className="font-semibold text-amber-900 dark:text-amber-100">Distance</div>
                  <div className="text-2xl font-bold text-amber-600">800 km</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <Clock className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="font-semibold text-purple-900 dark:text-purple-100">Duration</div>
                  <div className="text-2xl font-bold text-purple-600">30-35 days</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <MapPin className="w-6 h-6 text-green-600 mb-2" />
                  <div className="font-semibold text-green-900 dark:text-green-100">Daily Average</div>
                  <div className="text-2xl font-bold text-green-600">25 km</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <Heart className="w-6 h-6 text-red-600 mb-2" />
                  <div className="font-semibold text-red-900 dark:text-red-100">Pilgrims/Year</div>
                  <div className="text-2xl font-bold text-red-600">300k+</div>
                </div>
              </div>
            </div>

            {santiagoGuide.map((stage, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{stage.stage}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{stage.duration}</p>
                    <ul className="space-y-2">
                      {stage.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                          <CheckSquare className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
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

        {/* Prayers Tab */}
        {activeTab === 'prayers-old' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pilgrim Prayers</h2>

            {prayers.map((prayer) => (
              <div key={prayer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{prayer.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">{prayer.occasion}</p>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {prayer.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pilgrimage Preparation Guide</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Spiritual Preparation
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Attend Mass and confession before departure</li>
                  <li>• Study Scripture related to pilgrimage sites</li>
                  <li>• Set spiritual intentions for your journey</li>
                  <li>• Learn about saints connected to sites</li>
                  <li>• Practice daily prayer and meditation</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  Practical Essentials
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Valid passport (6+ months)</li>
                  <li>• Comfortable walking shoes (broken in)</li>
                  <li>• Modest clothing for churches</li>
                  <li>• Rosary and prayer book</li>
                  <li>• Travel insurance</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Book className="w-5 h-5 text-purple-600" />
                  Recommended Reading
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• The Bible (New Testament)</li>
                  <li>• Lives of the Saints</li>
                  <li>• Pilgrimage guidebooks</li>
                  <li>• Church history texts</li>
                  <li>• Devotional literature</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Tips for Sacred Sites
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Dress modestly (cover shoulders and knees)</li>
                  <li>• Maintain silence in churches</li>
                  <li>• Participate in Mass when possible</li>
                  <li>• Be respectful of other pilgrims</li>
                  <li>• Take time for personal prayer</li>
                </ul>
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
