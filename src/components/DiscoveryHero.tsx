import React from 'react';
import { MapPin, Award, Package, Sparkles, Globe, Palette } from 'lucide-react';

interface Badge {
  icon?: 'location' | 'heritage' | 'craft' | 'tradition' | 'global' | 'art';
  label: string;
}

interface Chip {
  label: string;
  onClick?: () => void;
}

interface DiscoveryHeroProps {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  subtitle?: string;
  description: string;
  badges?: Badge[];
  chips?: Chip[];
  visualType?: 'gradient' | 'pattern' | 'image';
  visualContent?: string;
  accentColor?: string;
  insightCard?: {
    title: string;
    content: string;
  };
  cta?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  location: MapPin,
  heritage: Award,
  craft: Package,
  tradition: Sparkles,
  global: Globe,
  art: Palette,
};

export default function DiscoveryHero({
  breadcrumbs,
  title,
  subtitle,
  description,
  badges = [],
  chips = [],
  visualType = 'gradient',
  visualContent,
  accentColor = 'emerald',
  insightCard,
  cta,
}: DiscoveryHeroProps) {
  const gradientMap: Record<string, string> = {
    emerald: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
    amber: 'from-amber-500/10 via-orange-500/10 to-red-500/10',
    blue: 'from-blue-500/10 via-indigo-500/10 to-violet-500/10',
    rose: 'from-rose-500/10 via-pink-500/10 to-fuchsia-500/10',
    slate: 'from-slate-500/10 via-gray-500/10 to-zinc-500/10',
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-900 dark:text-white font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Content */}
          <div className="space-y-6">
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className={`text-xl font-medium text-${accentColor}-600 dark:text-${accentColor}-400`}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {badges.map((badge, index) => {
                  const Icon = badge.icon ? iconMap[badge.icon] : Sparkles;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <Icon className={`w-4 h-4 text-${accentColor}-600 dark:text-${accentColor}-400`} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Chips */}
            {chips.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Explore
                </h3>
                <div className="flex flex-wrap gap-2">
                  {chips.map((chip, index) => (
                    <button
                      key={index}
                      onClick={chip.onClick}
                      className={`px-3 py-1.5 bg-${accentColor}-50 dark:bg-${accentColor}-900/20 text-${accentColor}-700 dark:text-${accentColor}-300 rounded-full text-sm font-medium hover:bg-${accentColor}-100 dark:hover:bg-${accentColor}-900/30 transition-colors`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {cta && (
              <button
                onClick={cta.onClick}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white rounded-lg font-medium transition-colors`}
              >
                {cta.label}
              </button>
            )}
          </div>

          {/* Right Column - Visual */}
          <div className="space-y-4">
            {/* Visual Panel */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
              {visualType === 'gradient' && (
                <div className={`h-64 lg:h-80 bg-gradient-to-br ${gradientMap[accentColor] || gradientMap.emerald} backdrop-blur-sm flex items-center justify-center`}>
                  <div className="text-center space-y-3 p-8">
                    <Sparkles className={`w-16 h-16 text-${accentColor}-600 dark:text-${accentColor}-400 mx-auto opacity-40`} />
                    {visualContent && (
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {visualContent}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {visualType === 'pattern' && (
                <div className="h-64 lg:h-80 bg-white dark:bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-8 gap-4 p-4 h-full">
                      {[...Array(64)].map((_, i) => (
                        <div key={i} className={`bg-${accentColor}-600 rounded`} />
                      ))}
                    </div>
                  </div>
                  <div className="relative h-full flex items-center justify-center">
                    {visualContent && (
                      <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300 p-8">
                        {visualContent}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {visualType === 'image' && visualContent && (
                <img
                  src={visualContent}
                  alt={title}
                  className="w-full h-64 lg:h-80 object-cover"
                />
              )}
            </div>

            {/* Insight Card */}
            {insightCard && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h3 className={`text-sm font-semibold text-${accentColor}-600 dark:text-${accentColor}-400 uppercase tracking-wide mb-2`}>
                  {insightCard.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {insightCard.content}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
