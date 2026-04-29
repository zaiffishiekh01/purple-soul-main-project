import { Bell, Package, DollarSign, AlertTriangle, CheckCircle, X, MessageSquare } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function Notifications({ notifications, onMarkAsRead, onDismiss }: NotificationsProps) {
  const getNotificationIcon = (type: string) => {
    const icons = {
      order: Package,
      inventory: AlertTriangle,
      payment: DollarSign,
      system: Bell,
      admin_message: MessageSquare,
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      order: 'from-blue-500 to-blue-600',
      inventory: 'from-orange-500 to-orange-600',
      payment: 'from-green-500 to-green-600',
      system: 'from-purple-500 to-purple-600',
      admin_message: 'from-emerald-500 to-emerald-600',
    };
    return colors[type as keyof typeof colors] || colors.system;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">All Notifications</h3>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
              Mark all as read
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
              Clear all
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`p-5 rounded-xl border transition-all ${
                  notification.is_read
                    ? 'bg-white border-gray-200'
                    : 'bg-sufi-light/10 border-sufi-purple/30 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <button
                        onClick={() => onDismiss(notification.id)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        {notification.action_url && (
                          <button className="px-3 py-1 bg-sufi-light/30 text-sufi-dark rounded-lg hover:bg-sufi-light/50 transition-colors text-sm font-medium">
                            View Details
                          </button>
                        )}
                        {!notification.is_read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="px-3 py-1 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-sufi-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-sufi-purple" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">You have no notifications at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}
