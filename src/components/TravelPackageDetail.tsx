import { useState } from 'react';
import { X, Star, Users, Calendar, MapPin, Check, Shield, Plus, Minus, ShoppingCart, CreditCard } from 'lucide-react';

interface PackageAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  required: boolean;
}

interface TravelPackage {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  pilgrimage_type: string;
  duration_days: number;
  price: number;
  original_price?: number;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  accommodation_level: string;
  group_size_min: number;
  group_size_max: number;
  rating: number;
  total_bookings: number;
  image_url: string;
  vendor_name: string;
  vendor_verified: boolean;
  vendor_logo: string;
}

interface TravelPackageDetailProps {
  package: TravelPackage;
  addons: PackageAddon[];
  onClose: () => void;
  onCheckout: (pkg: TravelPackage, travelers: number, selectedAddons: PackageAddon[], total: number) => void;
}

export default function TravelPackageDetail({
  package: pkg,
  addons,
  onClose,
  onCheckout,
}: TravelPackageDetailProps) {
  const [travelers, setTravelers] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [departureDate, setDepartureDate] = useState('');

  const toggleAddon = (addonId: string) => {
    const newSelected = new Set(selectedAddons);
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId);
    } else {
      newSelected.add(addonId);
    }
    setSelectedAddons(newSelected);
  };

  const selectedAddonsList = addons.filter(addon => selectedAddons.has(addon.id));
  const addonsTotal = selectedAddonsList.reduce((sum, addon) => sum + addon.price, 0);
  const packageTotal = pkg.price * travelers;
  const grandTotal = packageTotal + addonsTotal;

  const discount = pkg.original_price
    ? Math.round((1 - pkg.price / pkg.original_price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="relative">
          <img
            src={pkg.image_url}
            alt={pkg.name}
            className="w-full h-80 object-cover rounded-t-2xl"
          />
          {discount > 0 && (
            <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
              Save {discount}%
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <div className="p-8">
          {/* Vendor Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={pkg.vendor_logo}
              alt={pkg.vendor_name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pkg.vendor_name}
                </span>
                {pkg.vendor_verified && (
                  <Shield className="w-5 h-5 text-purple-600" title="Purple Soul Verified" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{pkg.rating}</span>
                <span className="text-sm text-gray-500">• {pkg.total_bookings}+ bookings</span>
              </div>
            </div>
          </div>

          {/* Package Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{pkg.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{pkg.description}</p>

          {/* Key Info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <Calendar className="w-6 h-6 text-purple-600 mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{pkg.duration_days} Days</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Group Size</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{pkg.group_size_min}-{pkg.group_size_max}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <MapPin className="w-6 h-6 text-purple-600 mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Accommodation</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{pkg.accommodation_level}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Highlights */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Highlights</h3>
              <div className="space-y-2">
                {pkg.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What's Included</h3>
              <div className="space-y-2">
                {pkg.inclusions.map((inclusion, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{inclusion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Add-ons */}
          {addons.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Smart Add-Ons - Enhance Your Journey
              </h3>
              <div className="space-y-3">
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAddons.has(addon.id)
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                    onClick={() => !addon.required && toggleAddon(addon.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{addon.name}</h4>
                          {addon.required && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{addon.description}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-lg font-bold text-purple-600">${addon.price}</span>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedAddons.has(addon.id)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedAddons.has(addon.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Section */}
          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Book Your Journey</h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Number of Travelers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Travelers
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white w-16 text-center">
                    {travelers}
                  </span>
                  <button
                    onClick={() => setTravelers(Math.min(pkg.group_size_max, travelers + 1))}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Departure Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Package ({travelers} {travelers === 1 ? 'traveler' : 'travelers'})</span>
                <span className="font-semibold">${packageTotal.toLocaleString()}</span>
              </div>
              {selectedAddonsList.map((addon) => (
                <div key={addon.id} className="flex justify-between text-gray-700 dark:text-gray-300 text-sm">
                  <span>{addon.name}</span>
                  <span>${addon.price}</span>
                </div>
              ))}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-purple-600">${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onCheckout(pkg, travelers, selectedAddonsList, grandTotal)}
                className="bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>
              <button
                onClick={() => {
                  /* Add to cart logic */
                }}
                className="bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 py-4 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
