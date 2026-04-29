'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { AdminDashboardLayout } from '@/src/components/admin/AdminDashboardLayout';
import { AdminOverview } from '@/src/components/admin/AdminOverview';
import { AdminManagement } from '@/src/components/admin/AdminManagement';
import { VendorManagement } from '@/src/components/admin/VendorManagement';
import { AdminCustomers } from '@/src/components/admin/AdminCustomers';
import { AdminOrders } from '@/src/components/admin/AdminOrders';
import { AdminProducts } from '@/src/components/admin/AdminProducts';
import { AdminInventory } from '@/src/components/admin/AdminInventory';
import { AdminCategories } from '@/src/components/admin/AdminCategories';
import { AdminFacets } from '@/src/components/admin/AdminFacets';
import { AdminNavigation } from '@/src/components/admin/AdminNavigation';
import AdminShipping from '@/src/components/admin/AdminShipping';
import AdminReturns from '@/src/components/admin/AdminReturns';
import AdminLabels from '@/src/components/admin/AdminLabels';
import AdminWarehouse from '@/src/components/admin/AdminWarehouse';
import { AdminTestProductOffers } from '@/src/components/admin/AdminTestProductOffers';
import { AdminFeeWaiverRequests } from '@/src/components/admin/AdminFeeWaiverRequests';
import { AdminPricingRules } from '@/src/components/admin/AdminPricingRules';
import { AdminFinance } from '@/src/components/admin/AdminFinance';
import { AdminPayouts } from '@/src/components/admin/AdminPayouts';
import { AdminAnalytics } from '@/src/components/admin/AdminAnalytics';
import { AdminGuidelines } from '@/src/components/admin/AdminGuidelines';
import { AdminSettings } from '@/src/components/admin/AdminSettings';

function AdminContent({ section }: { section: string }) {
  switch (section) {
    case 'dashboard':
      return <AdminOverview />;
    case 'admins':
      return <AdminManagement />;
    case 'vendors':
      return <VendorManagement />;
    case 'customers':
      return <AdminCustomers />;
    case 'orders':
      return <AdminOrders />;
    case 'products':
      return <AdminProducts />;
    case 'inventory':
      return <AdminInventory />;
    case 'categories':
      return <AdminCategories />;
    case 'facets':
      return <AdminFacets />;
    case 'navigation':
      return <AdminNavigation />;
    case 'shipping':
      return <AdminShipping />;
    case 'returns':
      return <AdminReturns />;
    case 'labels':
      return <AdminLabels />;
    case 'warehouse':
      return <AdminWarehouse />;
    case 'test-products':
      return <AdminTestProductOffers />;
    case 'fee-waivers':
      return <AdminFeeWaiverRequests />;
    case 'pricing':
      return <AdminPricingRules />;
    case 'finance':
      return <AdminFinance />;
    case 'payouts':
      return <AdminPayouts />;
    case 'analytics':
      return <AdminAnalytics />;
    case 'guidelines':
      return <AdminGuidelines />;
    case 'settings':
      return <AdminSettings />;
    default:
      return null;
  }
}

function AdminShell({ section }: { section: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeSection = useMemo(() => pathname.split('/')[2] || 'dashboard', [pathname]);
  const content = <AdminContent section={section} />;
  const isInvalidSection = content === null;

  useEffect(() => {
    if (isInvalidSection) {
      router.replace('/admin/dashboard');
    }
  }, [isInvalidSection, router]);
  if (isInvalidSection) return null;

  return (
    <AdminDashboardLayout
      activeSection={activeSection}
      onSectionChange={(nextSection) => router.push(`/admin/${nextSection}`)}
      unreadNotifications={0}
    >
      {content}
    </AdminDashboardLayout>
  );
}

export function AdminRoutes({ section }: { section: string }) {
  return (
    <ProtectedRoute requireAdmin>
      <AdminShell section={section} />
    </ProtectedRoute>
  );
}
