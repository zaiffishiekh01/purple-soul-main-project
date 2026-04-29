import { Outlet, Navigate } from 'react-router-dom';
import { useDashboardAuth } from '../../contexts/DashboardAuthContext';
import { VendorLayout } from './VendorLayout';

export default function VendorShell() {
  const { loading, dashboardUser, vendor } = useDashboardAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardUser) {
    return <Navigate to="/" replace />;
  }

  if (dashboardUser.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  const isPendingApproval = vendor !== null && !vendor.is_approved;

  return (
    <VendorLayout>
      <Outlet />
    </VendorLayout>
  );
}
