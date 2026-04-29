import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Vendor } from '../types';

export function useAdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // Fetch vendors, excluding users who are also admins
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out vendors who are also admins
      const vendorUserIds = data?.map(v => v.user_id) || [];
      
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('user_id')
        .in('user_id', vendorUserIds);
      
      const adminUserIds = new Set(adminUsers?.map(au => au.user_id) || []);
      
      const filteredVendors = (data || []).filter(v => !adminUserIds.has(v.user_id));
      
      setVendors(filteredVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId: string, status: string, additionalUpdates?: Partial<Vendor>) => {
    try {
      const updates = { status, updated_at: new Date().toISOString(), ...additionalUpdates };
      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(vendors.map(v =>
        v.id === vendorId ? { ...v, ...updates } : v
      ));
    } catch (error) {
      console.error('Error updating vendor status:', error);
      throw error;
    }
  };

  const approveVendor = async (vendorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('vendors')
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(vendors.map(v =>
        v.id === vendorId ? { ...v, is_approved: true, status: 'active', approved_at: new Date().toISOString() } : v
      ));
    } catch (error) {
      console.error('Error approving vendor:', error);
      throw error;
    }
  };

  const rejectVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          is_approved: false,
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(vendors.map(v =>
        v.id === vendorId ? { ...v, is_approved: false, status: 'suspended' } : v
      ));
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      throw error;
    }
  };

  const updateVendor = async (vendorId: string, updates: Partial<Vendor>) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', vendorId);

      if (error) throw error;

      setVendors(vendors.map(v =>
        v.id === vendorId ? { ...v, ...updates } : v
      ));
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  };

  const deleteVendor = async (vendorId: string) => {
    try {
      // First, try using a database function to bypass RLS
      const { data: result, error: rpcError } = await supabase.rpc('delete_vendor_bypass', {
        p_vendor_id: vendorId,
      });

      if (rpcError) {
        console.error('RPC error, trying direct delete:', rpcError);
        
        // Fallback to direct delete
        const { error: deleteError } = await supabase
          .from('vendors')
          .delete()
          .eq('id', vendorId);

        if (deleteError) throw deleteError;
      }

      // Update local state
      setVendors(vendors.filter(v => v.id !== vendorId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  };

  return {
    vendors,
    loading,
    updateVendorStatus,
    approveVendor,
    rejectVendor,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors,
  };
}
