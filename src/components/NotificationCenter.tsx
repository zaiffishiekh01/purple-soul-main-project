import { X, Bell, TrendingDown, Package, Tag, Sparkles } from 'lucide-react';
import { Notification } from '../App';

interface NotificationCenterProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  onClose,
  onMarkRead,
  onClearAll,
}: NotificationCenterProps) {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'back_in_stock':
        return <Package className="w-5 h-5 text-purple-600" />;
      case 'sale':
        return <Tag className="w-5 h-5 text-red-600" />;
      case 'new_arrival':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'price_drop':
        return 'bg-green-50 border-green-200';
      case 'back_in_stock':
        return 'bg-purple-50 border-purple-200';
      case 'sale':
        return 'bg-red-50 border-red-200';
      case 'new_arrival':
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-surface rounded-2xl shadow-theme-2xl border border-default z-50 max-h-[calc(100vh-6rem)] flex flex-col">
      <div className="border-b border-default px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-bold text-primary">Notifications</h2>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-deep rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-deep rounded-full mb-4">
              <Bell className="w-8 h-8 text-muted" />
            </div>
            <p className="text-secondary font-medium mb-1">No notifications</p>
            <p className="text-sm text-muted">
              We'll notify you when there's something new
            </p>
          </div>
        ) : (
          <div className="divide-y divide-default">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => onMarkRead(notification.id)}
                className={`p-4 hover:bg-surface-deep transition-colors cursor-pointer ${
                  !notification.read ? 'bg-purple-50/50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center border`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-primary' : 'text-secondary'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <span className="w-2 h-2 bg-purple-600 rounded-full block"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-default p-3">
          <button
            onClick={onClearAll}
            className="w-full text-sm font-semibold text-purple-600 hover:text-purple-700 py-2 transition-colors"
          >
            Clear All Notifications
          </button>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
