import { useState, useEffect } from 'react';
import { dashboardClient } from '../lib/data-client';

export interface ReturnRule {
  id: string;
  scope: 'GLOBAL' | 'CATEGORY';
  category: string | null;
  return_window_days: number;
  return_shipping_paid_by: 'MARKETPLACE' | 'VENDOR' | 'CUSTOMER';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export function useReturnRules() {
  const [rules, setRules] = useState<ReturnRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('return_rules')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching return rules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const createRule = async (rule: Omit<ReturnRule, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      const { data: { user } } = await dashboardClient.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: admin } = await dashboardClient
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!admin) throw new Error('Admin user not found');

      const { error } = await dashboardClient
        .from('return_rules')
        .insert({
          ...rule,
          created_by: admin.id,
          updated_by: admin.id,
        });

      if (error) throw error;
      await fetchRules();
      return true;
    } catch (error) {
      console.error('Error creating return rule:', error);
      throw error;
    }
  };

  const updateRule = async (id: string, updates: Partial<ReturnRule>) => {
    try {
      const { data: { user } } = await dashboardClient.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: admin } = await dashboardClient
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!admin) throw new Error('Admin user not found');

      const { error } = await dashboardClient
        .from('return_rules')
        .update({
          ...updates,
          updated_by: admin.id,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchRules();
      return true;
    } catch (error) {
      console.error('Error updating return rule:', error);
      throw error;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await dashboardClient
        .from('return_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRules();
      return true;
    } catch (error) {
      console.error('Error deleting return rule:', error);
      throw error;
    }
  };

  return {
    rules,
    loading,
    refetch: fetchRules,
    createRule,
    updateRule,
    deleteRule,
  };
}
