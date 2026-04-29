import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface InventoryItem {
  id: string;
  vendor_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string | null;
  last_restocked_at: string | null;
  updated_at: string;
  products?: {
    name: string;
    sku: string;
  };
}

export function useInventory(vendorId?: string) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const vendorIdRef = useRef(vendorId);

  useEffect(() => {
    vendorIdRef.current = vendorId;
  }, [vendorId]);

  useEffect(() => {
    if (isFetchingRef.current) return;

    const fetchInventory = async () => {
      if (!vendorId) {
        setInventory([]);
        setLoading(false);
        return;
      }

      isFetchingRef.current = true;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inventory')
          .select(`
            *,
            products (
              name,
              sku
            )
          `)
          .eq('vendor_id', vendorId)
          .order('quantity', { ascending: true });

        if (error) throw error;

        const formattedData = (data || []).map(item => ({
          ...item,
          product_name: item.products?.name,
          sku: item.products?.sku
        }));

        setInventory(formattedData);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setInventory([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchInventory();
  }, [vendorId]);

  const updateInventory = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setInventory(prev => prev.map((item) => (item.id === id ? data : item)));
      return data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }, []);

  const restockItem = useCallback(async (id: string, additionalQuantity: number) => {
    try {
      setInventory(prev => {
        const item = prev.find((i) => i.id === id);
        if (!item) throw new Error('Inventory item not found');

        const newQuantity = item.quantity + additionalQuantity;
        supabase
          .from('inventory')
          .update({
            quantity: newQuantity,
            last_restocked_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()
          .then(({ data, error }) => {
            if (error) throw error;
            setInventory(p => p.map((i) => (i.id === id ? data : i)));
          })
          .catch(error => console.error('Error restocking item:', error));

        return prev;
      });
    } catch (error) {
      console.error('Error restocking item:', error);
      throw error;
    }
  }, []);

  const refetch = useCallback(async () => {
    const currentVendorId = vendorIdRef.current;
    if (!currentVendorId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            name,
            sku
          )
        `)
        .eq('vendor_id', currentVendorId)
        .order('quantity', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        product_name: item.products?.name,
        sku: item.products?.sku
      }));

      setInventory(formattedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    inventory,
    loading,
    updateInventory,
    restockItem,
    refetch,
  }), [inventory, loading, updateInventory, restockItem, refetch]);
}
