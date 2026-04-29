import { VendorRoutes } from '@/src/next-routes/vendor-routes';

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const section = slug?.[0] ?? 'dashboard';
  return <VendorRoutes section={section} />;
}
