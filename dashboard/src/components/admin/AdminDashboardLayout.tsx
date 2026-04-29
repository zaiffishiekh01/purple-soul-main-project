import { useState, ReactNode, memo, useMemo } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Shield,
  Menu,
  X,
  UserCog,
  BookOpen,
  FolderTree,
  Truck,
  RotateCcw,
  Tag,
  FileText,
  Warehouse,
  Beaker,
  Store,
  ExternalLink,
  Filter,
  Eye,
  ChevronDown,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';

const ROLE_BADGE: Record<string, { label: string; classes: string }> = {
  super_admin: { label: 'Super Admin', classes: 'bg-emerald-100 text-emerald-700' },
  admin: { label: 'Admin', classes: 'bg-blue-100 text-blue-700' },
  management: { label: 'Management', classes: 'bg-amber-100 text-amber-700' },
  support: { label: 'Support', classes: 'bg-gray-100 text-gray-600' },
};

interface AdminDashboardLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  unreadNotifications?: number;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: null },
  { id: 'admins', label: 'Admin Management', icon: UserCog, permission: 'is_super_admin' },
  { id: 'vendors', label: 'Vendors', icon: Users, permission: 'vendor_management' },
  { id: 'customers', label: 'Customers', icon: Users, permission: null },
  { id: 'orders', label: 'All Orders', icon: ShoppingCart, permission: 'order_management' },
  { id: 'products', label: 'All Products', icon: Package, permission: 'product_management' },
  { id: 'inventory', label: 'All Inventory', icon: Package, permission: 'product_management' },
  {
    id: 'catalog',
    label: 'Catalog Governance',
    icon: FolderTree,
    permission: 'product_management',
    children: [
      { id: 'categories', label: 'Category Management', icon: FolderTree, permission: 'product_management' },
      { id: 'facets', label: 'Facets & Filters', icon: Filter, permission: 'product_management' },
      { id: 'navigation', label: 'Navigation & Visibility', icon: Eye, permission: 'product_management' },
    ]
  },
  { id: 'shipping', label: 'Shipping', icon: Truck, permission: 'order_management' },
  { id: 'returns', label: 'Returns', icon: RotateCcw, permission: 'order_management' },
  { id: 'labels', label: 'Shipping Labels', icon: Tag, permission: 'order_management' },
  { id: 'warehouse', label: 'US Warehouse', icon: Warehouse, permission: 'order_management' },
  { id: 'test-products', label: 'Test New Product Offers', icon: Beaker, permission: 'product_management' },
  { id: 'fee-waivers', label: 'Fee Waivers', icon: FileText, permission: 'finance_management' },
  { id: 'pricing', label: 'Pricing Rules', icon: DollarSign, permission: 'finance_management' },
  { id: 'finance', label: 'Finance', icon: DollarSign, permission: 'finance_management' },
  { id: 'payouts', label: 'Payouts', icon: DollarSign, permission: 'finance_management' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics_monitoring' },
  { id: 'guidelines', label: 'Product Guidelines', icon: BookOpen, permission: null },
  { id: 'settings', label: 'Settings', icon: Settings, permission: null },
];

const AdminDashboardLayoutComponent = ({
  children,
  activeSection,
  onSectionChange,
  unreadNotifications = 0,
}: AdminDashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['catalog']));
  const { signOut, userEmail } = useAuth();
  const { permissions, loading: permissionsLoading } = useAdminPermissions();

  const currentRole = permissions.is_super_admin ? 'super_admin' : (permissions.role || 'admin');
  const roleBadge = ROLE_BADGE[currentRole] || ROLE_BADGE.admin;

  const visibleMenuItems = useMemo(() => {
    if (permissionsLoading) {
      // While loading, show no items (or we could show a skeleton)
      // Returning empty array prevents flash of all items
      return [];
    }
    return menuItems.filter(item => {
      if (!item.permission) return true;
      if (permissions.is_super_admin) return true;
      return permissions[item.permission as keyof typeof permissions] === true;
    });
  }, [permissions, permissionsLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="lg:flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-800">
                        Purple Soul Collective by DKC
                      </h1>
                      <p className="text-xs text-slate-500 italic">Faith Based Big Ecommerce</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 ml-12">Admin Portal</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {permissionsLoading ? (
                // Loading skeleton
                <div className="space-y-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 px-4 rounded-xl bg-gray-200 animate-pulse"
                      style={{ animationDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
              ) : (
                visibleMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const hasChildren = 'children' in item && item.children;
                  const isExpanded = expandedSections.has(item.id);
                  const isChildActive = hasChildren && item.children?.some(child => child.id === activeSection);

                  const toggleSection = () => {
                    setExpandedSections(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(item.id)) {
                        newSet.delete(item.id);
                      } else {
                        newSet.add(item.id);
                      }
                      return newSet;
                    });
                  };

                  return (
                    <div key={item.id}>
                      {hasChildren ? (
                        <>
                          <button
                            onClick={toggleSection}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                              isChildActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <span className="font-medium text-sm">{item.label}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="ml-4 mt-1 space-y-1">
                              {item.children?.map((child) => {
                                const ChildIcon = child.icon;
                                const isChildItemActive = activeSection === child.id;

                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => {
                                      onSectionChange(child.id);
                                      setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                                      isChildItemActive
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600'
                                    }`}
                                  >
                                    <ChildIcon className={`w-4 h-4 ${isChildItemActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                                    <span className="font-medium text-sm">{child.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            onSectionChange(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                          <span className="font-medium text-sm">{item.label}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </nav>

            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                  currentRole === 'super_admin'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : currentRole === 'management'
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  {currentRole === 'super_admin' ? <Crown className="w-4 h-4" /> : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{userEmail || 'Admin User'}</p>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${roleBadge.classes}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 lg:flex-none">
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {visibleMenuItems.find((item) => item.id === activeSection)?.label || 'Dashboard'}
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
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => onSectionChange('settings')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow ${
                    currentRole === 'super_admin'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                      : currentRole === 'management'
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}
                  title={roleBadge.label}
                >
                  {currentRole === 'super_admin' ? <Crown className="w-4 h-4" /> : 'A'}
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

export const AdminDashboardLayout = memo(AdminDashboardLayoutComponent);
