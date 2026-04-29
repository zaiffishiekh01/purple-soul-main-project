import { VendorProfile } from './VendorProfile';
import { useVendor } from '../hooks/useVendor';

export function VendorProfileContainer() {
  const { vendor, loading } = useVendor();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  return <VendorProfile vendor={vendor} />;
}
