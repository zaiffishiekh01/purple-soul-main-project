import { useState } from 'react';
import {
  Bell, BellOff, Mail, Smartphone, Package, DollarSign,
  Heart, Gift, CheckCircle2, Trash2, Sparkles, Settings,
} from 'lucide-react';

interface NotificationsPageProps { onBack?: () => void; }

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'order', title: 'Order Shipped', message: 'Your order #ORD-20260310-4532 has been shipped via USPS. Tracking: 9400100000000000000000', date: '2026-04-07T10:30:00Z', read: false },
  { id: '2', type: 'price', title: 'Price Drop Alert', message: 'An item in your wishlist has dropped in price by 15%', date: '2026-04-06T15:20:00Z', read: false },
  { id: '3', type: 'gift', title: 'Gift Card Redeemed', message: 'Your gift card ending in 5678 has been redeemed successfully.', date: '2026-04-05T09:15:00Z', read: true },
  { id: '4', type: 'return', title: 'Return Approved', message: 'Your return request RET-20260301-1234 has been approved. Please ship the item back.', date: '2026-04-03T14:00:00Z', read: true },
];

const typeIcons: Record<string, typeof Package> = {
  order: Package,
  price: DollarSign,
  gift: Gift,
  return: Heart,
};

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setSuccessMessage('All notifications marked as read');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Stay Updated</span>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Notifications</h2>
        <p className="text-secondary">Manage your notification preferences and view recent alerts</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Email Notifications', desc: 'Receive order updates and promotions via email', checked: emailNotifs, onChange: setEmailNotifs, icon: Mail },
            { label: 'SMS Notifications', desc: 'Get delivery updates via text message', checked: smsNotifs, onChange: setSmsNotifs, icon: Smartphone },
            { label: 'Push Notifications', desc: 'Browser push notifications for real-time updates', checked: pushNotifs, onChange: setPushNotifs, icon: Bell },
            { label: 'Promotional Emails', desc: 'Special offers, new arrivals, and exclusive deals', checked: promoNotifs, onChange: setPromoNotifs, icon: Gift },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-surface-elevated border border-default rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-primary">{item.label}</p>
                  <p className="text-sm text-secondary">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => item.onChange(!item.checked)}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${item.checked ? 'bg-purple-600' : 'bg-surface-deep'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${item.checked ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-primary flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Recent Notifications
            </h3>
            <p className="text-sm text-secondary">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-surface-elevated border border-default">
              <BellOff className="w-10 h-10 text-muted" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">No notifications</h4>
            <p className="text-secondary">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => {
              const TypeIcon = typeIcons[notification.type] || Bell;
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    notification.read
                      ? 'bg-surface-elevated border-default'
                      : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.read
                        ? 'bg-surface-deep'
                        : 'bg-purple-100 dark:bg-purple-900/40'
                    }`}>
                      <TypeIcon className={`w-5 h-5 ${
                        notification.read ? 'text-muted' : 'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-primary">{notification.title}</p>
                          <p className="text-sm text-secondary mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 hover:bg-surface rounded transition-colors text-muted hover:text-primary"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-muted hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted mt-2">{new Date(notification.date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
