import {
  LayoutDashboard,
  User,
  MapPin,
  CreditCard,
  Package,
  Heart,
  Gift,
  Users,
  Shield,
  HeadphonesIcon,
  RotateCcw,
  Truck,
  Bell,
  Calendar,
  Sparkles,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface AccountNavProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  onClose?: () => void;
  mobileOpen?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { title: 'Dashboard', href: 'dashboard', icon: LayoutDashboard, exact: true },
  { title: 'Profile', href: 'profile', icon: User },
  { title: 'Addresses', href: 'addresses', icon: MapPin },
  { title: 'Payment Methods', href: 'payments', icon: CreditCard },
  { title: 'Orders', href: 'orders', icon: Package },
  { title: 'Order Tracking', href: 'order-tracking', icon: Truck },
  { title: 'Returns & Refunds', href: 'returns', icon: RotateCcw },
  { title: 'Wishlist', href: 'wishlist', icon: Heart },
  { title: 'Gift Cards', href: 'gift-cards', icon: Gift },
  { title: 'Recipients', href: 'recipients', icon: Users },
  { title: 'Subscriptions', href: 'subscriptions', icon: Calendar },
  { title: 'Notifications', href: 'notifications', icon: Bell },
  { title: 'Security', href: 'security', icon: Shield },
  { title: 'Support', href: 'support', icon: HeadphonesIcon },
  { title: 'Services', href: 'services', icon: Sparkles },
  { title: 'Account Dashboard', href: 'account-dashboard', icon: LayoutDashboard },
];

export default function AccountNav({ onNavigate, activeSection, onClose, mobileOpen, collapsed, onToggleCollapse }: AccountNavProps) {
  return (
    <>
      {mobileOpen && (<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />)}

      <nav
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-72'}
          w-72
          bg-surface lg:bg-transparent border-r border-default lg:border-0
          overflow-y-auto lg:overflow-visible
        `}
      >
        <div className="p-6 lg:p-0">
          {/* Mobile header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-bold text-primary">Navigation</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <div className="hidden lg:flex justify-end mb-4">
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-surface-elevated transition-colors text-secondary hover:text-primary"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? activeSection === 'dashboard' : activeSection === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => { onNavigate(item.href); onClose?.(); }}
                  className={`
                    w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all
                    ${collapsed ? 'lg:justify-center lg:px-3 lg:py-3' : 'px-4 py-3'}
                    ${isActive
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-l-4 border-purple-600 dark:border-purple-500'
                      : 'text-secondary hover:bg-surface-elevated hover:text-primary'
                    }
                  `}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

