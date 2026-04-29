import React from 'react';
import { Star, MapPin, Award } from 'lucide-react';
import { Artisan } from '../lib/supabase';

interface ArtisanCardProps {
  artisan: Artisan;
  onClick: () => void;
}

export default function ArtisanCard({ artisan, onClick }: ArtisanCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-surface rounded-lg shadow-theme-md overflow-hidden cursor-pointer hover:shadow-theme-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-48">
        <img
          src={artisan.cover_image || 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg'}
          alt={artisan.display_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute -bottom-12 left-6">
          <img
            src={artisan.profile_image || 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg'}
            alt={artisan.display_name}
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-theme-lg"
          />
        </div>
      </div>

      <div className="pt-14 px-6 pb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-primary">{artisan.display_name}</h3>
              {artisan.verified && (
                <Award className="w-5 h-5 text-purple-600" fill="currentColor" />
              )}
            </div>
            <p className="text-secondary text-sm">{artisan.business_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
          <span className="font-semibold text-primary">{artisan.rating.toFixed(1)}</span>
          <span className="text-secondary text-sm">({artisan.total_sales} sales)</span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-secondary text-sm">
          <MapPin className="w-4 h-4" />
          <span>{artisan.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {artisan.traditions.slice(0, 3).map((tradition, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
            >
              {tradition}
            </span>
          ))}
          {artisan.traditions.length > 3 && (
            <span className="px-3 py-1 bg-surface-deep text-secondary rounded-full text-xs font-medium">
              +{artisan.traditions.length - 3} more
            </span>
          )}
        </div>

        <p className="text-secondary text-sm line-clamp-3 mb-4">{artisan.bio}</p>

        <button className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium">
          View Profile
        </button>
      </div>
    </div>
  );
}
