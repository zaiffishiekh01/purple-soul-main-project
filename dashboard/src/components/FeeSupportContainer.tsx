import { useState, useEffect } from 'react';
import { FeeWaiverSection } from './FeeWaiverSection';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function FeeSupportContainer() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchVendorId();
    }
  }, [user?.id]);

  const fetchVendorId = async () => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (vendorData) {
        setVendorId(vendorData.id);
      }
    } catch (error) {
      console.error('Error fetching vendor ID:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">Unable to load vendor information.</p>
      </div>
    );
  }

  return <FeeWaiverSection vendorId={vendorId} />;
}
