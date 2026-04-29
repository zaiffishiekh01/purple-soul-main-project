import { useState, useCallback, useMemo, ReactNode } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboardAuth } from '../../contexts/DashboardAuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  UserCircle,
  ShoppingCart,
  Package,
  Warehouse,
  FolderTree,
  Truck,
  ArrowLeftRight,
  Tags,
  DollarSign,
  Send,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Bell,
} from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  permission?: keyof NonNullable<ReturnType<typeof useDashboardAuth>['permissions']>;
}

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, permissions, signOut } = useDashboardAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activePath = location.pathname;

  const allMenuItems: MenuItem[] = useMemo(
    () => [
      { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Admins', path: '/admin/admins', icon: Users, permission: 'is_super_admin' },
      { label: 'Vendors', path: '/admin/vendors', icon: Store, permission: 'vendor_management' },
      { label: 'Customers', path: '/admin/customers', icon: UserCircle },
      { label: 'Orders', path: '/admin/orders', icon: ShoppingCart, permission: 'order_management' },
      { label: 'Products', path: '/admin/products', icon: Package, permission: 'product_management' },
      { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
      { label: 'Categories', path: '/admin/categories', icon: FolderTree },
      { label: 'Shipping', path: '/admin/shipping', icon: Truck, permission: 'order_management' },
      { label: 'Returns', path: '/admin/returns', icon: ArrowLeftRight, permission: 'order_management' },
      { label: 'Pricing', path: '/admin/pricing', icon: Tags, permission: 'finance_management' },
      { label: 'Finance', path: '/admin/finance', icon: DollarSign, permission: 'finance_management' },
      { label: 'Payouts', path: '/admin/payouts', icon: Send, permission: 'finance_management' },
      { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, permission: 'analytics_monitoring' },
      { label: 'Settings', path: '/admin/settings', icon: Settings, permission: 'is_super_admin' },
    ],
    [],
  );

  const menuItems = useMemo(() => {
    if (!permissions) return allMenuItems;
    if (permissions.is_super_admin) return allMenuItems;
    return allMenuItems.filter((item) => {
      if (!item.permission) return true;
      return !!permissions[item.permission];
    });
  }, [allMenuItems, permissions]);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      setSidebarOpen(false);
    },
    [navigate],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';

  const currentLabel = useMemo(
    () => menuItems.find((m) => activePath === m.path || activePath.startsWith(m.path + '/'))?.label || 'Admin',
    [menuItems, activePath],
  );

  return (
    <div className="min-h-screen bg-page flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 ${sidebarWidth} bg-surface border-r border-default flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-default">
          {!sidebarCollapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-deep text-muted transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activePath === item.path || activePath.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-theme-sm'
                    : 'text-secondary hover:bg-surface-deep hover:text-primary'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-default">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title={sidebarCollapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-surface border-b border-default flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-deep text-muted transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-primary">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/storefront"
              className="hidden sm:flex items-center gap-2 text-sm text-secondary hover:text-emerald-600 transition-colors"
            >
              <Store className="w-4 h-4" />
              Customer Portal
            </a>
            <button
              className="relative p-2 rounded-lg hover:bg-surface-deep text-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            {admin && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-deep">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-secondary">{admin.role}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const AdminLayout = React.memo(AdminLayoutInner);
