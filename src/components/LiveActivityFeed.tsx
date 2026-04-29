import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Camera, TrendingUp } from 'lucide-react';
import { supabase, LiveActivity } from '../lib/supabase';

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    loadActivities();

    const interval = setInterval(loadActivities, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadActivities() {
    const { data } = await supabase
      .from('live_activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setActivities(data);
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4 fill-current" />;
      case 'gallery_post':
        return <Camera className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  }

  function getRelativeTime(timestamp: string) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  if (!visible || activities.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm">
      <div className="bg-surface rounded-lg shadow-theme-2xl border border-default overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Live Activity</h3>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-white hover:text-purple-200"
          >
            ✕
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`px-4 py-3 flex items-start gap-3 border-b border-gray-100 animate-fadeIn ${
                index === 0 ? 'bg-amber-50' : 'hover:bg-surface-deep'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-2 rounded-full ${
                activity.activity_type === 'purchase'
                  ? 'bg-green-100 text-green-600'
                  : activity.activity_type === 'review'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {getActivityIcon(activity.activity_type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-primary leading-snug">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted">{activity.user_location}</span>
                  <span className="text-xs text-muted">•</span>
                  <span className="text-xs text-muted">{getRelativeTime(activity.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-2 bg-surface-deep text-center">
          <button
            onClick={() => setVisible(false)}
            className="text-xs text-secondary hover:text-primary"
          >
            Hide updates
          </button>
        </div>
      </div>
    </div>
  );
}
