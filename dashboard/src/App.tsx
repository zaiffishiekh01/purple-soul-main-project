import { useCallback, useMemo, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { PublicRoute } from './components/PublicRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleSelection } from './components/RoleSelection';
import { Auth } from './components/Auth';
import { ResetPassword } from './components/ResetPassword';
import { PendingApproval } from './components/PendingApproval';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardContainer } from './components/DashboardContainer';
import { OrderManagementContainer } from './components/OrderManagementContainer';
import { LabelManagementContainer } from './components/LabelManagementContainer';
import { ShippingManagementContainer } from './components/ShippingManagementContainer';
import { ReturnManagementContainer } from './components/ReturnManagementContainer';
import { InventoryManagementContainer } from './components/InventoryManagementContainer';
import { ProductManagementContainer } from './components/ProductManagementContainer';
import { FinanceManagementContainer } from './components/FinanceManagementContainer';
import { FeeSupportContainer } from './components/FeeSupportContainer';
import { Analytics } from './components/Analytics';
import { VendorProfileContainer } from './components/VendorProfileContainer';
import { AccountManagement } from './components/AccountManagement';
import { NotificationsContainer } from './components/NotificationsContainer';
import { ProductGuidelines } from './components/ProductGuidelines';
import { SupportContainer } from './components/SupportContainer';
import { VendorWarehouseViewOnly } from './components/VendorWarehouseViewOnly';
import { VendorTestProducts } from './components/vendor/VendorTestProducts';
import { VendorCatalogRules } from './components/vendor/VendorCatalogRules';
import { AdminDashboardLayout } from './components/admin/AdminDashboardLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { VendorManagement } from './components/admin/VendorManagement';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminFacets } from './components/admin/AdminFacets';
import { AdminNavigation } from './components/admin/AdminNavigation';
import { AdminFinance } from './components/admin/AdminFinance';
import { AdminPayouts } from './components/admin/AdminPayouts';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminPricingRules } from './components/admin/AdminPricingRules';
import { AdminManagement } from './components/admin/AdminManagement';
import { AdminGuidelines } from './components/admin/AdminGuidelines';
import { AdminFeeWaiverRequests } from './components/admin/AdminFeeWaiverRequests';
import AdminShipping from './components/admin/AdminShipping';
import AdminReturns from './components/admin/AdminReturns';
import AdminLabels from './components/admin/AdminLabels';
import AdminWarehouse from './components/admin/AdminWarehouse';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminTestProductOffers } from './components/admin/AdminTestProductOffers';
import { VendorProvider, useVendorContext } from './contexts/VendorContext';
import { DebugRenderTest } from './components/DebugRenderTest';
import { TestDashboardBasic } from './components/TestDashboardBasic';

function WarehouseContainer() {
  const { vendor } = useVendorContext();
  if (!vendor) return <div>Loading...</div>;
  return <VendorWarehouseViewOnly vendorId={vendor.id} />;
}

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Debug / test routes */}
        <Route path="/debug" element={<DebugRenderTest />} />
        <Route path="/test-basic" element={<TestDashboardBasic />} />
        <Route path="/vendor/test-unprotected" element={<TestDashboardBasic />} />

        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <RoleSelection />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/:role"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/login/:role"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Vendor routes (nested) */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute requireVendor>
              <VendorProvider>
                <VendorShell />
              </VendorProvider>
            </ProtectedRoute>
          }
        >
          {/* /vendor → redirect to /vendor/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route
            path="dashboard"
            element={<DashboardContainerWrapper />}
          />
          <Route path="orders" element={<OrderManagementContainer />} />
          <Route path="labels" element={<LabelManagementContainer />} />
          <Route path="shipping" element={<ShippingManagementContainer />} />
          <Route path="returns" element={<ReturnManagementContainer />} />
          <Route path="inventory" element={<InventoryManagementContainer />} />
          <Route path="products" element={<ProductManagementContainer />} />
          <Route path="catalog-rules" element={<VendorCatalogRules />} />
          <Route path="finance" element={<FinanceManagementContainer />} />
          <Route
            path="analytics"
            element={
              <Analytics
                stats={{
                  totalRevenue: 8750,
                  revenueGrowth: 8.3,
                  totalOrders: 42,
                  ordersGrowth: 12.5,
                  avgOrderValue: 208.33,
                  avgOrderGrowth: 5.2,
                  conversionRate: 3.8,
                  conversionGrowth: 0.5,
                }}
              />
            }
          />
          <Route path="profile" element={<VendorProfileContainer />} />
          <Route path="account" element={<AccountManagement />} />
          <Route path="warehouse" element={<WarehouseContainer />} />
          <Route path="test-products" element={<VendorTestProducts />} />
          <Route path="notifications" element={<NotificationsContainer />} />
          <Route path="guidelines" element={<ProductGuidelines />} />
          <Route path="support" element={<SupportContainer />} />
          <Route path="fee-support" element={<FeeSupportContainer />} />
          {/* unknown vendor subpath → dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin routes (nested) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="facets" element={<AdminFacets />} />
          <Route path="navigation" element={<AdminNavigation />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="labels" element={<AdminLabels />} />
          <Route path="warehouse" element={<AdminWarehouse />} />
          <Route path="test-products" element={<AdminTestProductOffers />} />
          <Route path="fee-waivers" element={<AdminFeeWaiverRequests />} />
          <Route path="pricing" element={<AdminPricingRules />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="guidelines" element={<AdminGuidelines />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

/**
 * VendorShell:
 * - handles vendor loading / approval
 * - wraps content in DashboardLayout
 * - uses <Outlet /> to render nested vendor routes
 */
function VendorShell() {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log('🔵 VendorShell render:', renderCountRef.current);

  const navigate = useNavigate();
  const location = useLocation();
  const { vendor, loading: vendorLoading } = useVendorContext();

  const handleSectionChange = useCallback(
    (section: string) => {
      navigate(`/vendor/${section}`);
    },
    [navigate]
  );

  const activeSection = useMemo(
    () => location.pathname.split('/')[2] || 'dashboard',
    [location.pathname]
  );

  // Show loading state while vendor data is being fetched
  if (vendorLoading) {
    console.log('⏳ VendorShell: Still loading vendor data...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your vendor profile...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Show pending approval screen if vendor exists but is not approved
  if (vendor && !vendor.is_approved) {
    console.log('⚠️ VendorShell: Vendor is pending approval');
    return <PendingApproval />;
  }

  // If vendor is null after loading, something went wrong
  if (!vendor && !vendorLoading) {
    console.warn('⚠️ VendorShell: Vendor is null after loading');
    return <PendingApproval />;
  }

  console.log('✅ VendorShell: Rendering dashboard for vendor:', vendor?.id);

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      unreadNotifications={0}
    >
      <Outlet />
    </DashboardLayout>
  );
}

/**
 * Wrapper so DashboardContainer gets onNavigate without recreating layout.
 */
function DashboardContainerWrapper() {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (section: string) => {
      navigate(`/vendor/${section}`);
    },
    [navigate]
  );

  return <DashboardContainer onNavigate={handleNavigate} />;
}

/**
 * AdminShell:
 * - wraps admin routes in AdminDashboardLayout
 * - uses <Outlet /> for nested admin content
 */
function AdminShell() {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log('🟠 AdminShell render:', renderCountRef.current);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionChange = useCallback(
    (section: string) => {
      navigate(`/admin/${section}`);
    },
    [navigate]
  );

  const activeSection = useMemo(
    () => location.pathname.split('/')[2] || 'dashboard',
    [location.pathname]
  );

  return (
    <AdminDashboardLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      unreadNotifications={0}
    >
      <Outlet />
    </AdminDashboardLayout>
  );
}

export default App;
