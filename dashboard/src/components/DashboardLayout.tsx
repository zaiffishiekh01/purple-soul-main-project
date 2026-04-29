import { useState, ReactNode, memo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Truck,
  RotateCcw,
  Archive,
  DollarSign,
  BarChart3,
  User,
  Settings,
  Bell,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ExternalLink,
  BookOpen,
  Warehouse,
  Beaker,
  Store,
  ChevronDown,
  ChevronRight,
  Plus,
  Upload,
  List,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  unreadNotifications: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'labels', label: 'Labels', icon: Tag },
  { id: 'shipping', label: 'Shippings', icon: Truck },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'inventory', label: 'Inventory', icon: Archive },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    subItems: [
      { id: 'products', label: 'Manage Products', icon: Package },
      { id: 'catalog-rules', label: 'Catalog Rules', icon: BookOpen },
    ],
  },
  { id: 'warehouse', label: 'US Warehouse', icon: Warehouse },
  { id: 'test-products', label: 'Test New Products', icon: Beaker },
  {
    id: 'finance',
    label: 'Finances',
    icon: DollarSign,
    subItems: [
      { id: 'finance', label: 'Overview & Payouts', icon: DollarSign },
      { id: 'fee-support', label: 'Fee Support Program', icon: FileText },
    ],
  },
  { id: 'analytics', label: 'Analytics / Insights', icon: BarChart3 },
  { id: 'profile', label: 'Vendor Profile', icon: User },
  { id: 'account', label: 'Account Mgt', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'guidelines', label: 'Product Guidelines', icon: BookOpen },
  {
    id: 'support',
    label: 'Support',
    icon: HelpCircle,
    subItems: [
      { id: 'support', label: 'Support Tickets', icon: MessageSquare },
      { id: 'fee-support', label: 'Fee Support Program', icon: FileText },
    ],
  },
];

const DashboardLayoutComponent = ({
  children,
  activeSection,
  onSectionChange,
  unreadNotifications,
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'support', 'finance']));
  const { signOut } = useAuth();

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
      <div className="lg:flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-sufi-light/30 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-sufi-light/30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-sufi-dark to-sufi-purple bg-clip-text text-transparent">
                    Purple Soul Collective by DKC
                  </h1>
                  <p className="text-xs text-gray-500 italic">Faith Based Big Ecommerce</p>
                  <p className="text-sm text-gray-600 mt-1">Vendor Dashboard</p>
                  <a
                    href="https://sufisciencecenter.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-sufi-purple hover:text-sufi-dark transition-colors mt-2 group"
                  >
                    <span>Visit Store</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-sufi-light/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const showBadge = item.id === 'notifications' && unreadNotifications > 0;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedMenus.has(item.id);
                const isAnySubItemActive = hasSubItems && item.subItems!.some(sub => activeSection === sub.id);

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (hasSubItems) {
                          toggleMenu(item.id);
                        } else {
                          onSectionChange(item.id);
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                        isActive || isAnySubItemActive
                          ? 'bg-gradient-to-r from-sufi-purple to-sufi-dark text-white shadow-lg shadow-sufi-purple/30'
                          : 'text-gray-700 hover:bg-sufi-light/30 hover:text-sufi-dark'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive || isAnySubItemActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                      <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                      {showBadge && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                      {hasSubItems && (
                        <span className="ml-auto">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>

                    {hasSubItems && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeSection === subItem.id;

                          return (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                onSectionChange(subItem.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                                isSubActive
                                  ? 'bg-emerald-100 text-emerald-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-sufi-light/30 space-y-3">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>

              <div className="bg-gradient-to-br from-sufi-light to-purple-100 rounded-xl p-4">
                <p className="text-xs text-sufi-dark font-medium mb-2">Need Help?</p>
                <p className="text-xs text-gray-600 mb-3">
                  Access our knowledge base and support resources
                </p>
                <button
                  onClick={() => onSectionChange('support')}
                  className="w-full bg-white text-sufi-dark px-3 py-2 rounded-lg text-xs font-medium hover:shadow-md transition-shadow"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-sufi-light/30">
            <div className="px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-sufi-light/20 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 lg:flex-none">
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {(() => {
                    const item = menuItems.find((item) => item.id === activeSection);
                    if (item) return item.label;

                    for (const menuItem of menuItems) {
                      if (menuItem.subItems) {
                        const subItem = menuItem.subItems.find((sub) => sub.id === activeSection);
                        if (subItem) return subItem.label;
                      }
                    }

                    return 'Dashboard';
                  })()}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://bolt.new/~/sb1-9ud13nd9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
                >
                  <Store className="w-4 h-4" />
                  <span className="text-sm font-medium">Customer Portal</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <button
                  onClick={() => onSectionChange('notifications')}
                  className="relative p-2 hover:bg-sufi-light/20 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => onSectionChange('profile')}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-sufi-purple to-sufi-dark flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow"
                >
                  V
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
