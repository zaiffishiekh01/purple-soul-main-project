import { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { VendorContext } from '../contexts/VendorContext';

export interface Shipment {
  id: string;
  order_id: string;
  vendor_id: string;
  tracking_number: string;
  carrier: string;
  shipping_method: string;
  status: string;
  shipped_at: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  shipping_label_id?: string | null;
  order_number?: string;
  customer_name?: string;
  has_label?: boolean;
}

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const vendorContext = useContext(VendorContext);
  const vendor = vendorContext?.vendor ?? null;
  const vendorLoading = vendorContext?.loading ?? false;
  const vendorId = vendor?.id;

  useEffect(() => {
    if (vendorLoading) {
      return;
    }
    if (vendorId) {
      fetchShipments();
    } else {
      setLoading(false);
    }
  }, [vendorId, vendorLoading]);

  const fetchShipments = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          orders (
            order_number,
            customer_name
          ),
          shipping_labels:shipping_label_id (
            id
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const shipmentsWithOrderInfo = data?.map((shipment: any) => ({
        ...shipment,
        order_number: shipment.orders?.order_number,
        customer_name: shipment.orders?.customer_name,
        has_label: !!shipment.shipping_label_id,
      })) || [];

      setShipments(shipmentsWithOrderInfo);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (shipment: Omit<Shipment, 'id' | 'vendor_id' | 'created_at' | 'updated_at' | 'order_number' | 'customer_name'>) => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert({ ...shipment, vendor_id: vendorId })
        .select()
        .single();

      if (error) throw error;
      await fetchShipments();
      return data;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  };

  const updateShipment = async (id: string, updates: Partial<Shipment>) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setShipments(shipments.map((s) => (s.id === id ? { ...s, ...data } : s)));
      return data;
    } catch (error) {
      console.error('Error updating shipment:', error);
      throw error;
    }
  };

  const deleteShipment = async (id: string) => {
    try {
      const { error } = await supabase.from('shipments').delete().eq('id', id);

      if (error) throw error;
      setShipments(shipments.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting shipment:', error);
      throw error;
    }
  };

  return { shipments, loading, createShipment, updateShipment, deleteShipment, refetch: fetchShipments };
}
