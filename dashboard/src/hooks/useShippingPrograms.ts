import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ShippingProgram {
  id: string;
  name: string;
  carrier: string;
  max_weight_kg: number;
  base_rate_usd: number;
  vendor_rate_usd: number;
  markup_usd: number;
  supports_returns: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export function useShippingPrograms() {
  const [programs, setPrograms] = useState<ShippingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_programs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching shipping programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const createProgram = async (program: Omit<ShippingProgram, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!admin) throw new Error('Admin user not found');

      const { error } = await supabase
        .from('shipping_programs')
        .insert({
          ...program,
          created_by: admin.id,
          updated_by: admin.id,
        });

      if (error) throw error;
      await fetchPrograms();
      return true;
    } catch (error) {
      console.error('Error creating shipping program:', error);
      throw error;
    }
  };

  const updateProgram = async (id: string, updates: Partial<ShippingProgram>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!admin) throw new Error('Admin user not found');

      const { error } = await supabase
        .from('shipping_programs')
        .update({
          ...updates,
          updated_by: admin.id,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchPrograms();
      return true;
    } catch (error) {
      console.error('Error updating shipping program:', error);
      throw error;
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shipping_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPrograms();
      return true;
    } catch (error) {
      console.error('Error deleting shipping program:', error);
      throw error;
    }
  };

  return {
    programs,
    loading,
    refetch: fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  };
}
