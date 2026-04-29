'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { PendingApproval } from '@/src/components/PendingApproval';
import { DashboardLayout } from '@/src/components/DashboardLayout';
import { DashboardContainer } from '@/src/components/DashboardContainer';
import { OrderManagementContainer } from '@/src/components/OrderManagementContainer';
import { LabelManagementContainer } from '@/src/components/LabelManagementContainer';
import { ShippingManagementContainer } from '@/src/components/ShippingManagementContainer';
import { ReturnManagementContainer } from '@/src/components/ReturnManagementContainer';
import { InventoryManagementContainer } from '@/src/components/InventoryManagementContainer';
import { ProductManagementContainer } from '@/src/components/ProductManagementContainer';
import { VendorCatalogRules } from '@/src/components/vendor/VendorCatalogRules';
import { FinanceManagementContainer } from '@/src/components/FinanceManagementContainer';
import { Analytics } from '@/src/components/Analytics';
import { VendorProfileContainer } from '@/src/components/VendorProfileContainer';
import { AccountManagement } from '@/src/components/AccountManagement';
import { NotificationsContainer } from '@/src/components/NotificationsContainer';
import { ProductGuidelines } from '@/src/components/ProductGuidelines';
import { SupportContainer } from '@/src/components/SupportContainer';
import { FeeSupportContainer } from '@/src/components/FeeSupportContainer';
import { VendorWarehouseViewOnly } from '@/src/components/VendorWarehouseViewOnly';
import { VendorTestProducts } from '@/src/components/vendor/VendorTestProducts';
import { VendorProvider, useVendorContext } from '@/src/contexts/VendorContext';

function WarehouseContainer() {
  const { vendor } = useVendorContext();
  if (!vendor) return <div>Loading...</div>;
  return <VendorWarehouseViewOnly vendorId={vendor.id} />;
}

function VendorContent({ section, onNavigate }: { section: string; onNavigate: (section: string) => void }) {
  switch (section) {
    case 'dashboard':
      return <DashboardContainer onNavigate={onNavigate} />;
    case 'orders':
      return <OrderManagementContainer />;
    case 'labels':
      return <LabelManagementContainer />;
    case 'shipping':
      return <ShippingManagementContainer />;
    case 'returns':
      return <ReturnManagementContainer />;
    case 'inventory':
      return <InventoryManagementContainer />;
    case 'products':
      return <ProductManagementContainer />;
    case 'catalog-rules':
      return <VendorCatalogRules />;
    case 'finance':
      return <FinanceManagementContainer />;
    case 'analytics':
      return (
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
      );
    case 'profile':
      return <VendorProfileContainer />;
    case 'account':
      return <AccountManagement />;
    case 'warehouse':
      return <WarehouseContainer />;
    case 'test-products':
      return <VendorTestProducts />;
    case 'notifications':
      return <NotificationsContainer />;
    case 'guidelines':
      return <ProductGuidelines />;
    case 'support':
      return <SupportContainer />;
    case 'fee-support':
      return <FeeSupportContainer />;
    default:
      return null;
  }
}

function VendorShell({ section }: { section: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { vendor, loading: vendorLoading } = useVendorContext();

  const activeSection = useMemo(() => pathname.split('/')[2] || 'dashboard', [pathname]);

  if (vendorLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your vendor profile...</div>;
  }

  if (vendor && !vendor.is_approved) {
    return <PendingApproval />;
  }

  if (!vendor && !vendorLoading) {
    return <PendingApproval />;
  }

  const content = <VendorContent section={section} onNavigate={(nextSection) => router.push(`/vendor/${nextSection}`)} />;
  if (content === null) {
    return <VendorRedirectToDashboard />;
  }

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={(nextSection) => router.push(`/vendor/${nextSection}`)}
      unreadNotifications={0}
    >
      {content}
    </DashboardLayout>
  );
}

function VendorRedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/vendor/dashboard');
  }, [router]);
  return null;
}

export function VendorRoutes({ section }: { section: string }) {
  return (
    <ProtectedRoute requireVendor>
      <VendorProvider>
        <VendorShell section={section} />
      </VendorProvider>
    </ProtectedRoute>
  );
}
