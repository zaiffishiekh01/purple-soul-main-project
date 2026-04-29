import { useState } from 'react';
import {
  Package, Heart, Gift, Users, ArrowRight, TruckIcon, Calendar,
  MapPin, CreditCard, Sparkles, Menu, LayoutDashboard, ArrowLeft,
} from 'lucide-react';
import AccountNav from './AccountNav';
import ProfilePage from './ProfilePage';
import AddressesPage from './AddressesPage';
import PaymentsPage from './PaymentsPage';
import OrdersPage from './OrdersPage';
import OrderTrackingPage from './OrderTrackingPage';
import ReturnsPage from './ReturnsPage';
import SubscriptionsPage from './SubscriptionsPage';
import SecurityPage from './SecurityPage';
import NotificationsPage from './NotificationsPage';
import SupportPage from './SupportPage';
import WishlistPage from './WishlistPage';
import GiftCardsPage from './GiftCardsPage';
import RecipientsPage from './RecipientsPage';
import ServicesPage from './ServicesPage';

interface AccountPageProps { onNavigate: (section: string) => void; }

const subPages: Record<string, React.FC<{ onBack?: () => void }>> = {
  'profile': ProfilePage, 'addresses': AddressesPage, 'payments': PaymentsPage,
  'orders': OrdersPage, 'order-tracking': OrderTrackingPage, 'returns': ReturnsPage,
  'subscriptions': SubscriptionsPage, 'security': SecurityPage,
  'notifications': NotificationsPage, 'support': SupportPage,
  'wishlist': WishlistPage, 'gift-cards': GiftCardsPage,
  'recipients': RecipientsPage, 'services': ServicesPage,
};

const subPageTitles: Record<string, string> = {
  'profile': 'Profile Settings',
  'addresses': 'Address Book',
  'payments': 'Payment Methods',
  'orders': 'My Orders',
  'order-tracking': 'Order Tracking',
  'returns': 'Returns & Refunds',
  'subscriptions': 'Subscriptions',
  'security': 'Security & Activity',
  'notifications': 'Notifications',
  'support': 'Support Center',
  'wishlist': 'My Wishlist',
  'gift-cards': 'Gift Cards',
  'recipients': 'Recipients',
  'services': 'Our Services',
};

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    onNavigate(section);
  };

  const stats = { ordersCount: 12, wishlistCount: 8, giftCardBalance: 150.00, recipientsCount: 5 };
  const recentOrders = [
    { id: '1', orderNumber: 'ORD-20260315-7821', total: 89.99, status: 'delivered', createdAt: '2026-03-15' },
    { id: '2', orderNumber: 'ORD-20260310-4532', total: 245.00, status: 'shipped', createdAt: '2026-03-10' },
    { id: '3', orderNumber: 'ORD-20260305-1298', total: 67.50, status: 'processing', createdAt: '2026-03-05' },
  ];
  const activeShipments = [
    { id: '1', carrier: 'FedEx Express', trackingNumber: '1Z999AA10123456784', status: 'in_transit', estimatedDelivery: '2026-03-20' },
  ];

  const isSubPage = !!subPages[activeSection];
  const pageTitle = isSubPage ? (subPageTitles[activeSection] || 'Account') : 'My Account';

  // Sidebar content - shared between dashboard and sub-pages
  const sidebar = (
    <div className={`${sidebarCollapsed ? 'lg:sticky lg:top-24 lg:w-20' : 'lg:sticky lg:top-24'} transition-all duration-300`}>
      <AccountNav
        onNavigate={handleNavigate}
        activeSection={activeSection}
        onClose={() => setMobileMenuOpen(false)}
        mobileOpen={mobileMenuOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />
    </div>
  );

  // Main content for dashboard
  const dashboardContent = (
    <div className="space-y-6">
      <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
        <div className="mb-6"><h2 className="text-2xl font-bold text-primary mb-2">Welcome Back!</h2><p className="text-secondary">Here's an overview of your account activity</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Orders', count: stats.ordersCount, icon: Package, color: 'purple', nav: 'orders' },
            { label: 'Wishlist', count: stats.wishlistCount, icon: Heart, color: 'pink', nav: 'wishlist' },
            { label: 'Gift Cards', count: `$${stats.giftCardBalance.toFixed(2)}`, icon: Gift, color: 'purple', nav: 'gift-cards' },
            { label: 'Recipients', count: stats.recipientsCount, icon: Users, color: 'blue', nav: 'recipients' },
          ].map((item) => (
            <button key={item.label} onClick={() => handleNavigate(item.nav)} className="bg-surface-elevated border border-default rounded-xl p-6 hover:shadow-theme-lg transition-all text-left">
              <div className="flex items-center justify-between mb-2">
                <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                <span className={`px-3 py-1 bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-300 text-sm font-semibold rounded-full`}>{item.count}</span>
              </div>
              <h3 className="font-semibold text-lg text-primary">{item.label}</h3>
              <p className="text-sm text-secondary">View all</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
          <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg"><TruckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div><h3 className="text-lg font-bold text-primary">Active Shipments</h3></div>
          {activeShipments.length > 0 ? (
            <div className="space-y-4">{activeShipments.map(s => (
              <div key={s.id} className="p-4 rounded-lg bg-surface-elevated border border-default">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="font-medium text-primary">{s.carrier}</p><p className="text-sm text-secondary">{s.trackingNumber}</p></div>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full capitalize">{s.status.replace('_', ' ')}</span>
                </div>
                {s.estimatedDelivery && <p className="text-xs text-secondary mt-2">Est. delivery: {new Date(s.estimatedDelivery).toLocaleDateString()}</p>}
              </div>
            ))}</div>
          ) : (<div className="text-center py-8 text-secondary"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No active shipments</p></div>)}
        </div>

        <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
          <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg"><Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div><h3 className="text-lg font-bold text-primary">Quick Actions</h3></div>
          <div className="space-y-3">
            {[
              { label: 'Track Package', icon: Package, nav: 'orders' },
              { label: 'Manage Addresses', icon: MapPin, nav: 'addresses' },
              { label: 'Payment Methods', icon: CreditCard, nav: 'payments' },
            ].map(item => (
              <button key={item.label} onClick={() => handleNavigate(item.nav)} className="w-full flex items-center gap-3 px-4 py-3 bg-surface-elevated border border-default rounded-xl hover:bg-surface-deep transition-all text-left">
                <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" /><span className="font-medium text-primary">{item.label}</span>
              </button>
            ))}
            <button onClick={() => handleNavigate('services')} className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:opacity-90 transition-all text-left shadow-theme-md">
              <Sparkles className="w-5 h-5" /><span className="font-medium">Explore Services</span><ArrowRight className="w-4 h-4 ml-auto" />
            </button>
            <button onClick={() => handleNavigate('account-dashboard')} className="w-full flex items-center gap-3 px-4 py-3 bg-surface-elevated border-2 border-purple-300 dark:border-purple-600 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left">
              <LayoutDashboard className="w-5 h-5 text-purple-600 dark:text-purple-400" /><span className="font-medium text-primary">Account Dashboard</span><ArrowRight className="w-4 h-4 ml-auto text-purple-600 dark:text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h3 className="text-lg font-bold text-primary">Recent Orders</h3><p className="text-sm text-secondary">Your latest purchases</p></div>
          <button onClick={() => handleNavigate('orders')} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></button>
        </div>
        {recentOrders.length > 0 ? (
          <div className="space-y-4">{recentOrders.map(order => (
            <div key={order.id} className="p-4 rounded-lg bg-surface-elevated border border-default hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer" onClick={() => handleNavigate('orders')}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-primary">Order #{order.orderNumber}</p>
                  <p className="text-sm text-secondary flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600 dark:text-purple-400">${order.total.toFixed(2)}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full capitalize">{order.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}</div>
        ) : (<div className="text-center py-8 text-secondary"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No orders yet</p></div>)}
      </div>
    </div>
  );

  // Sub-page content
  const SubPageComponent = subPages[activeSection];
  const subPageContent = SubPageComponent ? (
    <SubPageComponent onBack={() => handleNavigate('dashboard')} />
  ) : dashboardContent;

  return (
    <div className="min-h-screen bg-page">
      {/* Mobile menu bar */}
      <div className="lg:hidden sticky top-16 z-30 bg-surface/80 backdrop-blur-sm border-b border-default px-4 py-3">
        <button onClick={() => setMobileMenuOpen(true)} className="flex items-center gap-2 text-primary font-medium">
          <Menu className="w-5 h-5" /> Menu
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          {isSubPage && (
            <button
              onClick={() => handleNavigate('dashboard')}
              className="p-2 rounded-lg hover:bg-surface-elevated transition-colors text-secondary hover:text-primary"
              title="Back to Account"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">{pageTitle}</h1>
            {!isSubPage && <p className="text-secondary">Manage your account settings and preferences</p>}
          </div>
        </div>

        {/* Layout: Sidebar + Main */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
          {/* Sidebar */}
          <aside>
            {sidebar}
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            {isSubPage ? subPageContent : dashboardContent}
          </main>
        </div>
      </div>
    </div>
  );
}
