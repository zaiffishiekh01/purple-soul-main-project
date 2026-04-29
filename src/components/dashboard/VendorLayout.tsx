import { useState, useCallback, useMemo, ReactNode } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboardAuth } from '../../contexts/DashboardAuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Truck,
  ArrowLeftRight,
  DollarSign,
  BarChart3,
  User,
  Bell,
  BookOpen,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Menu,
  Store,
  LogOut,
} from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
  { label: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
  { label: 'Products', path: '/vendor/products', icon: Package },
  { label: 'Inventory', path: '/vendor/inventory', icon: Warehouse },
  { label: 'Shipping', path: '/vendor/shipping', icon: Truck },
  { label: 'Returns', path: '/vendor/returns', icon: ArrowLeftRight },
  { label: 'Finance', path: '/vendor/finance', icon: DollarSign },
  { label: 'Analytics', path: '/vendor/analytics', icon: BarChart3 },
  { label: 'Profile', path: '/vendor/profile', icon: User },
  { label: 'Notifications', path: '/vendor/notifications', icon: Bell },
  { label: 'Guidelines', path: '/vendor/guidelines', icon: BookOpen },
  { label: 'Support', path: '/vendor/support', icon: LifeBuoy },
];

interface VendorLayoutProps {
  children: ReactNode;
}

function VendorLayoutInner({ children }: VendorLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor, signOut } = useDashboardAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activePath = location.pathname;

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

  const isPendingApproval = useMemo(
    () => vendor !== null && !vendor.is_approved,
    [vendor],
  );

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';

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
            <span className="text-lg font-bold text-gradient-purple">
              Vendor Portal
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
          {MENU_ITEMS.map((item) => {
            const isActive = activePath === item.path || activePath.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-theme-sm'
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
            <h1 className="text-lg font-semibold text-primary">
              {MENU_ITEMS.find((m) => activePath === m.path || activePath.startsWith(m.path + '/'))
                ?.label || 'Vendor'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/storefront"
              className="hidden sm:flex items-center gap-2 text-sm text-secondary hover:text-purple-600 transition-colors"
            >
              <Store className="w-4 h-4" />
              Customer Portal
            </a>
            <button
              onClick={() => handleNavigate('/vendor/notifications')}
              className="relative p-2 rounded-lg hover:bg-surface-deep text-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {isPendingApproval && (
            <div className="mx-4 mt-4 lg:mx-6">
              <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 shadow-theme-sm">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                      Account Pending Approval
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      Your vendor account is awaiting admin approval. You can explore the dashboard,
                      but some features may be limited until your account is approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const VendorLayout = React.memo(VendorLayoutInner);
