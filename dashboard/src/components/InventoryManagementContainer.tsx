import { useEffect, useState } from 'react';
import { InventoryManagement } from './InventoryManagement';
import { useInventory } from '../hooks/useInventory';
import { dashboardClient } from '../lib/data-client';

export function InventoryManagementContainer() {
  const { inventory, loading, refetch } = useInventory();
  const [vendors, setVendors] = useState<Array<{ id: string; business_name: string }>>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data, error } = await dashboardClient
          .from('vendors')
          .select('id, business_name')
          .eq('status', 'active')
          .order('business_name');

        if (error) throw error;
        setVendors(data || []);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading || loadingVendors) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return <InventoryManagement inventory={inventory} vendors={vendors} onRefresh={refetch} />;
}
