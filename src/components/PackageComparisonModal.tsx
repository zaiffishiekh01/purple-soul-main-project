import { X, Check, Star, Users, Calendar, Shield } from 'lucide-react';

interface TravelPackage {
  id: string;
  name: string;
  vendor_name: string;
  vendor_verified: boolean;
  price: number;
  original_price?: number;
  duration_days: number;
  rating: number;
  accommodation_level: string;
  group_size_min: number;
  group_size_max: number;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  image_url: string;
}

interface PackageComparisonModalProps {
  packages: TravelPackage[];
  onClose: () => void;
  onRemove: (packageId: string) => void;
  onSelect: (pkg: TravelPackage) => void;
}

export default function PackageComparisonModal({
  packages,
  onClose,
  onRemove,
  onSelect,
}: PackageComparisonModalProps) {
  if (packages.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compare Packages</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Compare up to 3 packages side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="space-y-4">
                  {/* Package Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-xl p-4 relative">
                    <button
                      onClick={() => onRemove(pkg.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <img
                      src={pkg.image_url}
                      alt={pkg.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {pkg.vendor_name}
                      </span>
                      {pkg.vendor_verified && (
                        <Shield className="w-4 h-4 text-purple-600" />
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {pkg.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-purple-600">
                        ${pkg.price.toLocaleString()}
                      </span>
                      {pkg.original_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${pkg.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{pkg.duration_days} days</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{pkg.rating} rating</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4" />
                        <span>{pkg.group_size_min}-{pkg.group_size_max} people</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      Highlights
                    </h4>
                    <div className="space-y-2">
                      {pkg.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      What's Included
                    </h4>
                    <div className="space-y-2">
                      {pkg.inclusions.slice(0, 5).map((inclusion, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {inclusion}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onSelect(pkg);
                      onClose();
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Select This Package
                  </button>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: 3 - packages.length }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex items-center justify-center"
                >
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Add another package to compare</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
