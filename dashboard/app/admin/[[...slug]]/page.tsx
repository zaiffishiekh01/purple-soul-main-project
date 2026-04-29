import { AdminRoutes } from '@/src/next-routes/admin-routes';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const section = resolvedParams.slug?.[0] ?? 'dashboard';
  return <AdminRoutes section={section} />;
}
