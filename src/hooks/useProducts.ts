import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/dashboard';
import { useDashboardAuth } from '../contexts/DashboardAuthContext';

/**
 * Hook for fetching and managing products in the dashboard.
 * Automatically scopes to vendor or admin based on auth context.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, vendor } = useDashboardAuth();

  const vendorId = vendor?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select('*');

        if (!isAdmin && vendorId) {
          query = query.eq('vendor_id', vendorId);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId || isAdmin) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [vendorId, isAdmin]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({ ...product, vendor_id: vendorId })
        .select()
        .single();

      if (error) throw error;
      setProducts((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }, [vendorId]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      let query = supabase
        .from('products')
        .select('*');

      if (!isAdmin && vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error refetching products:', error);
    }
  }, [vendorId, isAdmin]);

  return useMemo(() => ({
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch,
  }), [products, loading, addProduct, updateProduct, deleteProduct, refetch]);
}
