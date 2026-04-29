import { Outlet, Navigate } from 'react-router-dom';
import { useDashboardAuth } from '../../contexts/DashboardAuthContext';
import { AdminLayout } from './AdminLayout';

export default function AdminShell() {
  const { loading, dashboardUser } = useDashboardAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!dashboardUser) {
    return <Navigate to="/" replace />;
  }

  if (dashboardUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
