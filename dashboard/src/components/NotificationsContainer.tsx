import { Notifications } from './Notifications';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationsContainer() {
  const { notifications, loading, markAsRead, deleteNotification } = useNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  return (
    <Notifications
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onDismiss={deleteNotification}
    />
  );
}
