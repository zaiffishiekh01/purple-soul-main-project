import { Star, Users, Calendar, MapPin, Check, Shield, TrendingUp } from 'lucide-react';

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

interface TravelPackageCardProps {
  package: TravelPackage;
  onSelect: (pkg: TravelPackage) => void;
  onCompare: (pkg: TravelPackage) => void;
  isComparing?: boolean;
}

export default function TravelPackageCard({ package: pkg, onSelect, onCompare, isComparing }: TravelPackageCardProps) {
  const discount = pkg.original_price
    ? Math.round((1 - pkg.price / pkg.original_price) * 100)
    : 0;

  const accommodationLabels: Record<string, string> = {
    economy: 'Economy',
    standard: 'Standard',
    premium: 'Premium',
    luxury: 'Luxury'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
      {/* Image Header */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={pkg.image_url}
          alt={pkg.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Save {discount}%
          </div>
        )}
        <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {pkg.duration_days} Days
        </div>
        <button
          onClick={() => onCompare(pkg)}
          className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg font-medium transition-all ${
            isComparing
              ? 'bg-purple-600 text-white'
              : 'bg-white/90 text-gray-900 hover:bg-white'
          }`}
        >
          {isComparing ? 'Remove' : 'Compare'}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Vendor Info */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={pkg.vendor_logo}
            alt={pkg.vendor_name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {pkg.vendor_name}
              </span>
              {pkg.vendor_verified && (
                <Shield className="w-4 h-4 text-purple-600" title="Purple Soul Verified" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{pkg.rating}</span>
          </div>
        </div>

        {/* Package Name */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {pkg.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {pkg.description}
        </p>

        {/* Highlights */}
        <div className="space-y-2 mb-4">
          {pkg.highlights.slice(0, 3).map((highlight, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{highlight}</span>
            </div>
          ))}
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{pkg.group_size_min}-{pkg.group_size_max} people</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{accommodationLabels[pkg.accommodation_level]}</span>
          </div>
        </div>

        {/* Bookings Badge */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {pkg.total_bookings}+ travelers booked
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Starting from</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-purple-600">${pkg.price.toLocaleString()}</span>
              {pkg.original_price && (
                <span className="text-lg text-gray-400 line-through">${pkg.original_price.toLocaleString()}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">per person</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(pkg)}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
        >
          View Details & Book
        </button>
      </div>
    </div>
  );
}
