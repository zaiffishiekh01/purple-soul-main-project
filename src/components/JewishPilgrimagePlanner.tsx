import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CheckSquare, Book, Star, Heart, Clock, Bookmark, ShoppingCart, Plane, BookOpen, CreditCard, TrendingUp, Users, Sparkles } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import TravelPackageCard from './TravelPackageCard';
import PackageComparisonModal from './PackageComparisonModal';
import TravelPackageDetail from './TravelPackageDetail';
import PilgrimageEssentials from './PilgrimageEssentials';

interface JewishPlannerProps {
  onAddToCart?: (product: Product, selectedColor?: string, selectedSize?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

interface Site {
  id: string;
  name: string;
  location: string;
  significance: string;
  activities: string[];
  prayerTimes: string;
}

interface Prayer {
  id: string;
  name: string;
  hebrew: string;
  transliteration: string;
  translation: string;
  occasion: string;
}

export default function JewishPilgrimagePlanner({ onAddToCart, wishlist = [], onToggleWishlist, onViewProduct, onQuickView }: JewishPlannerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'shopping' | 'itinerary' | 'checklist' | 'guide'>('overview');
  const [travelDate, setTravelDate] = useState('');
  const [duration, setDuration] = useState(10);
  const [groupSize, setGroupSize] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [travelPackages, setTravelPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageAddons, setPackageAddons] = useState<any[]>([]);
  const [comparePackages, setComparePackages] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchTravelPackages();
  }, []);

  const fetchTravelPackages = async () => {
    const { data: packages } = await supabase
      .from('travel_packages')
      .select(`*,vendor:travel_vendors(name, logo_url, verified)`)
      .eq('pilgrimage_type', 'jewish')
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

  const [checklist, setChecklist] = useState([
    { id: '1', text: 'Obtain valid passport', completed: false },
    { id: '2', text: 'Apply for Israeli visa (if required)', completed: false },
    { id: '3', text: 'Book flights to Tel Aviv', completed: false },
    { id: '4', text: 'Reserve accommodations', completed: false },
    { id: '5', text: 'Pack tallit and tefillin', completed: false },
    { id: '6', text: 'Bring prayer book (Siddur)', completed: false },
    { id: '7', text: 'Study sites\' history and significance', completed: false },
    { id: '8', text: 'Learn key prayers and blessings', completed: false },
    { id: '9', text: 'Arrange travel insurance', completed: false },
    { id: '10', text: 'Modest clothing for holy sites', completed: false },
  ]);

  const jerusalemSites: Site[] = [
    {
      id: '1',
      name: 'Western Wall (Kotel)',
      location: 'Old City, Jerusalem',
      significance: 'Holiest site in Judaism, remnant of the Second Temple',
      activities: [
        'Pray at the Wall',
        'Write prayer notes to place in cracks',
        'Attend daily minyanim',
        'Bar/Bat Mitzvah ceremonies',
        'Tisha B\'Av commemorations'
      ],
      prayerTimes: 'Open 24/7'
    },
    {
      id: '2',
      name: 'Temple Mount',
      location: 'Old City, Jerusalem',
      significance: 'Site of First and Second Temples',
      activities: [
        'View from surrounding areas',
        'Understand historical significance',
        'Visit Davidson Center archaeological park',
        'See Southern Wall excavations'
      ],
      prayerTimes: 'Limited visiting hours (check current status)'
    },
    {
      id: '3',
      name: 'Mount of Olives',
      location: 'East Jerusalem',
      significance: 'Ancient Jewish cemetery, prophetic significance',
      activities: [
        'Visit graves of prophets',
        'Panoramic view of Old City',
        'Visit Church of All Nations site',
        'Walk through ancient cemetery'
      ],
      prayerTimes: 'Sunrise to sunset'
    },
    {
      id: '4',
      name: 'City of David',
      location: 'Southeast of Old City',
      significance: 'Original site of ancient Jerusalem',
      activities: [
        'Hezekiah\'s Tunnel water walk',
        'Archaeological excavations tour',
        'Warren\'s Shaft',
        'Ancient water systems'
      ],
      prayerTimes: 'Tour hours: 8am-5pm'
    }
  ];

  const israelSites: Site[] = [
    {
      id: '1',
      name: 'Rachel\'s Tomb',
      location: 'Bethlehem',
      significance: 'Burial place of Matriarch Rachel',
      activities: [
        'Pray for children and fertility',
        'Light candles',
        'Read Psalms',
        'Personal prayers and supplications'
      ],
      prayerTimes: 'Open daily, hours vary'
    },
    {
      id: '2',
      name: 'Cave of Machpelah',
      location: 'Hebron',
      significance: 'Burial place of Abraham, Isaac, Jacob, Sarah, Rebecca, Leah',
      activities: [
        'Visit tomb of the Patriarchs',
        'Prayer services',
        'Study Torah',
        'Spiritual reflection'
      ],
      prayerTimes: 'Check current access schedule'
    },
    {
      id: '3',
      name: 'Mount Meron',
      location: 'Upper Galilee',
      significance: 'Tomb of Rabbi Shimon bar Yochai',
      activities: [
        'Lag B\'Omer celebrations',
        'Study Kabbalah',
        'Light candles',
        'Prayer and meditation'
      ],
      prayerTimes: 'Open daily'
    },
    {
      id: '4',
      name: 'Tzfat (Safed)',
      location: 'Northern Israel',
      significance: 'Center of Kabbalah and Jewish mysticism',
      activities: [
        'Visit ancient synagogues',
        'Ari\'s Mikvah',
        'Old cemetery with kabbalist graves',
        'Artists\' quarter',
        'Mystical study sessions'
      ],
      prayerTimes: 'Varies by synagogue'
    },
    {
      id: '5',
      name: 'Tiberias',
      location: 'Sea of Galilee',
      significance: 'Tomb of Maimonides, site of Talmud compilation',
      activities: [
        'Visit Rambam\'s tomb',
        'Graves of other sages',
        'Hot springs',
        'Sea of Galilee sites'
      ],
      prayerTimes: 'Open daily'
    }
  ];

  const prayers: Prayer[] = [
    {
      id: '1',
      name: 'Prayer at the Kotel',
      hebrew: 'מִי שֶׁעָנָה אֶת אֲבוֹתֵינוּ עַל יַם סוּף, הוּא יַעֲנֵנוּ',
      transliteration: 'Mi she\'ana et avoteinu al yam suf, hu ya\'anenu',
      translation: 'May He who answered our fathers at the Red Sea answer us',
      occasion: 'When praying at the Western Wall'
    },
    {
      id: '2',
      name: 'Shehecheyanu',
      hebrew: 'בָּרוּךְ אַתָּה ה\' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה',
      transliteration: 'Baruch atah Adonai Eloheinu melech ha\'olam, shehecheyanu v\'kiy\'manu v\'higi\'anu laz\'man hazeh',
      translation: 'Blessed are You, Lord our God, King of the universe, who has granted us life, sustained us, and enabled us to reach this occasion',
      occasion: 'Upon arriving in Jerusalem or visiting for the first time'
    },
    {
      id: '3',
      name: 'Prayer for Jerusalem',
      hebrew: 'שָׁלוֹם עֲלֵיכֶם יְרוּשָׁלַיִם. בּוֹנֵה יְרוּשָׁלַיִם ה\', נִדְחֵי יִשְׂרָאֵל יְכַנֵּס',
      transliteration: 'Shalom aleichem Yerushalayim. Boneh Yerushalayim Adonai, nidchei Yisrael yechaneis',
      translation: 'Peace be upon you, Jerusalem. The Lord builds Jerusalem, He gathers the dispersed of Israel',
      occasion: 'General prayer for Jerusalem'
    },
    {
      id: '4',
      name: 'Traveler\'s Prayer (Tefilat HaDerech)',
      hebrew: 'יְהִי רָצוֹן מִלְּפָנֶיךָ ה\' אֱלֹהֵינוּ... שֶׁתּוֹלִיכֵנוּ לְשָׁלוֹם',
      transliteration: 'Yehi ratzon milfanecha... shetolicheinu l\'shalom',
      translation: 'May it be Your will... that You lead us to peace, guide our steps to peace, and bring us to our destination in life, joy, and peace',
      occasion: 'Before beginning journey'
    }
  ];

  const customs = [
    {
      category: 'At the Western Wall',
      practices: [
        'Men and women pray in separate sections',
        'Approach the Wall with respect and reverence',
        'Place written prayers between the stones',
        'Do not turn your back when leaving - walk backwards',
        'Wear appropriate head covering (kippah for men)',
        'Bring your own siddur or use provided prayer books'
      ]
    },
    {
      category: 'Visiting Graves of Tzaddikim',
      practices: [
        'Light candles at the gravesite',
        'Read Psalms (especially Psalm 33)',
        'Make personal requests through merit of the righteous',
        'Give charity before praying',
        'Study Torah or Mishnah',
        'Pray for the deceased and their merit'
      ]
    },
    {
      category: 'Shabbat in Jerusalem',
      practices: [
        'Attend Kabbalat Shabbat at the Kotel',
        'Join communal meals',
        'Visit different synagogues',
        'Walk through Shabbat-observant neighborhoods',
        'Experience the spiritual elevation',
        'Havdalah at the Kotel on Saturday night'
      ]
    },
    {
      category: 'Proper Conduct',
      practices: [
        'Dress modestly at all holy sites',
        'Show respect for all sacred spaces',
        'Follow local customs and traditions',
        'Be mindful of prayer times',
        'Ask permission before taking photos',
        'Maintain appropriate decorum'
      ]
    }
  ];

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedItems = checklist.filter(item => item.completed).length;

  const selectedProductsTotal = selectedProducts.reduce((sum, id) => sum + 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Smart Jewish Pilgrimage Planner</h1>
          </div>
          <p className="text-indigo-100 text-lg mb-6">AI-powered planning with personalized shopping recommendations</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-sm text-indigo-100">Travel Date</div>
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
                  <div className="text-sm text-indigo-100">Group Size</div>
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
                  <div className="text-sm text-indigo-100">Progress</div>
                  <div className="text-2xl font-bold">{completedItems}/{checklist.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <div>
                  <div className="text-sm text-indigo-100">Cart Total</div>
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
                    ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400'
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Jewish Pilgrimage to Israel</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The Land of Israel holds profound spiritual significance in Judaism. Visiting the Holy Land is considered a great mitzvah, offering the opportunity to connect with thousands of years of Jewish history, pray at sacred sites, and walk in the footsteps of our ancestors.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-sky-900 dark:text-sky-100 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Spiritual Significance
                  </h3>
                  <ul className="text-sm text-sky-800 dark:text-sky-200 space-y-1">
                    <li>• Fulfill mitzvah of dwelling in Eretz Yisrael</li>
                    <li>• Pray at the holiest site in Judaism</li>
                    <li>• Connect with Jewish heritage</li>
                    <li>• Visit graves of righteous leaders</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recommended Duration
                  </h3>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• Minimum: 7-10 days</li>
                    <li>• Ideal: 2-3 weeks</li>
                    <li>• Jerusalem focus: 5-7 days</li>
                    <li>• Full tour: 10-14 days</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <MapPin className="w-8 h-8 text-sky-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">20+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sacred Sites</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Star className="w-8 h-8 text-sky-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">3000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years History</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Heart className="w-8 h-8 text-sky-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Kotel Access</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <Book className="w-8 h-8 text-sky-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Blessings</div>
              </div>
            </div>
          </div>
        )}

        {/* Jerusalem Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Purple Soul Verified Travel Packages</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Premium Jewish pilgrimage packages from trusted, verified tour operators
                </p>
              </div>
              {comparePackages.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center gap-2"
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Jerusalem Holy Sites</h2>

            {jerusalemSites.map((site) => (
              <div key={site.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Star className="w-8 h-8 text-sky-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{site.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      {site.location}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic mb-4">{site.significance}</p>

                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-sky-900 dark:text-sky-100 mb-3">Activities & Experiences:</h4>
                      <ul className="space-y-2">
                        {site.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sky-800 dark:text-sky-200">
                            <CheckSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {site.prayerTimes}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Israel Sites Tab */}
        {/* Jerusalem Sites - Part of Itinerary */}
        {activeTab === 'itinerary-old' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sacred Sites Across Israel</h2>

            {israelSites.map((site) => (
              <div key={site.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <MapPin className="w-8 h-8 text-sky-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{site.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      {site.location}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic mb-4">{site.significance}</p>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">What to Do:</h4>
                      <ul className="space-y-2">
                        {site.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                            <CheckSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {site.prayerTimes}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prayers Tab */}
        {/* Combine prayers and customs into guide */}
        {activeTab === 'guide' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Jewish Pilgrimage Guide</h2>

            {/* Prayers Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Essential Prayers</h3>
              <div className="space-y-6">
                {prayers.map((prayer) => (
                  <div key={prayer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Heart className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{prayer.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{prayer.occasion}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-right text-2xl text-blue-900 dark:text-blue-100 leading-loose">
                          {prayer.hebrew}
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Transliteration:</div>
                        <div className="text-blue-800 dark:text-blue-200 italic">{prayer.transliteration}</div>
                      </div>

                      <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4">
                        <div className="text-sm font-semibold text-sky-900 dark:text-sky-100 mb-1">Translation:</div>
                        <div className="text-sky-800 dark:text-sky-200">{prayer.translation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customs and Tips */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customs & Tips</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-sky-600" />
                    Western Wall Customs
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Dress modestly when visiting</li>
                    <li>• Men should wear a head covering</li>
                    <li>• Separate sections for men and women</li>
                    <li>• Place prayer notes in wall crevices</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sky-600" />
                    Shabbat Observance
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Public transport stops on Shabbat</li>
                    <li>• Many sites close Friday afternoon</li>
                    <li>• Plan activities accordingly</li>
                    <li>• Respect local customs and traditions</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-600" />
                    Sacred Site Etiquette
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Remove shoes when entering synagogues</li>
                    <li>• Photography may be restricted</li>
                    <li>• Maintain respectful silence</li>
                    <li>• Follow local guidance and signs</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-sky-600" />
                    Spiritual Preparation
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Study history of sites beforehand</li>
                    <li>• Bring tallit and tefillin</li>
                    <li>• Carry a Siddur (prayer book)</li>
                    <li>• Prepare intentions and prayers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prayers-old' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Essential Prayers & Blessings</h2>

            {prayers.map((prayer) => (
              <div key={prayer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Heart className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{prayer.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">{prayer.occasion}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4">
                    <div className="text-right text-2xl text-sky-900 dark:text-sky-100 leading-loose">
                      {prayer.hebrew}
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">Transliteration:</div>
                    <div className="text-purple-800 dark:text-purple-200 italic">{prayer.transliteration}</div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Translation:</div>
                    <div className="text-indigo-800 dark:text-indigo-200">{prayer.translation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customs Tab */}
        {activeTab === 'customs-old' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customs & Traditions</h2>

            {customs.map((custom, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bookmark className="w-6 h-6 text-sky-600" />
                  {custom.category}
                </h3>
                <ul className="space-y-3">
                  {custom.practices.map((practice, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckSquare className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      {practice}
                    </li>
                  ))}
                </ul>
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

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="space-y-3">
                {checklist.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500 mt-0.5"
                    />
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'} group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors`}>
                      {item.text}
                    </span>
                  </label>
                ))}
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
