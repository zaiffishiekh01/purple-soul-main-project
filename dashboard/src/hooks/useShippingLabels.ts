import { useState, useEffect, useContext } from 'react';
import { dashboardClient } from '../lib/data-client';
import { VendorContext } from '../contexts/VendorContext';

export interface ShippingLabel {
  id: string;
  vendor_id: string;
  order_id: string;

  order_date: string;
  product_names: string;
  sku: string;
  quantity: number;
  product_weight: number;
  product_length: number;
  product_width: number;
  product_height: number;
  product_category: string;

  vendor_name: string;
  pickup_name: string;
  pickup_address: string;
  pickup_phone: string;
  pickup_email: string;
  pickup_city: string;
  pickup_state: string;
  pickup_pincode: string;
  pickup_country: string;

  customer_name: string;
  shipping_address: string;
  shipping_landmark: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  customer_phone: string;
  customer_email: string;

  courier_partner: string;
  shipping_method: string;
  tracking_preference: string;
  pickup_date: string | null;
  pickup_slot: string;

  package_weight: number;
  package_length: number;
  package_width: number;
  package_height: number;
  number_of_packages: number;
  package_type: string;

  hsn_code: string;
  hts_code: string;
  country_of_origin: string;
  item_description: string;
  customs_value: number;
  customs_category: string;
  invoice_number: string;
  export_reason: string;

  awb_number: string;
  tracking_number: string;
  barcode: string;
  qr_code: string;
  routing_code: string;
  order_barcode: string;

  status: string;
  label_url: string;
  printed_at: string | null;

  created_at: string;
  updated_at: string;
}

export function useShippingLabels() {
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
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
      fetchLabels();
    } else {
      setLoading(false);
    }
  }, [vendorId, vendorLoading]);

  const fetchLabels = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await dashboardClient
        .from('shipping_labels')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching shipping labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (label: Omit<ShippingLabel, 'id' | 'vendor_id' | 'created_at' | 'updated_at'>) => {
    if (!vendorId) return;

    try {
      const { data, error } = await dashboardClient
        .from('shipping_labels')
        .insert({ ...label, vendor_id: vendorId })
        .select()
        .single();

      if (error) throw error;
      setLabels([data, ...labels]);
      return data;
    } catch (error) {
      console.error('Error creating shipping label:', error);
      throw error;
    }
  };

  const updateLabel = async (id: string, updates: Partial<ShippingLabel>) => {
    try {
      const { data, error } = await dashboardClient
        .from('shipping_labels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLabels(labels.map((l) => (l.id === id ? data : l)));
      return data;
    } catch (error) {
      console.error('Error updating shipping label:', error);
      throw error;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const { error } = await dashboardClient.from('shipping_labels').delete().eq('id', id);

      if (error) throw error;
      setLabels(labels.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Error deleting shipping label:', error);
      throw error;
    }
  };

  const generateAWB = () => {
    return 'AWB' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const generateTrackingNumber = () => {
    return 'TRK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  return {
    labels,
    loading,
    createLabel,
    updateLabel,
    deleteLabel,
    refetch: fetchLabels,
    generateAWB,
    generateTrackingNumber
  };
}
