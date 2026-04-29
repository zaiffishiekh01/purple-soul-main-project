import { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { VendorContext } from '../contexts/VendorContext';

export interface Label {
  id: string;
  vendor_id: string;
  name: string;
  color: string;
  description: string;
  created_at: string;
}

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const vendorContext = useContext(VendorContext);
  const vendor = vendorContext?.vendor ?? null;
  const vendorLoading = vendorContext?.loading ?? false;
  const vendorId = vendor?.id;

  const fetchLabels = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const addLabel = async (label: Omit<Label, 'id' | 'vendor_id' | 'created_at'>) => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('labels')
        .insert({ ...label, vendor_id: vendorId })
        .select()
        .single();

      if (error) throw error;
      setLabels([data, ...labels]);
      return data;
    } catch (error) {
      console.error('Error adding label:', error);
      throw error;
    }
  };

  const updateLabel = async (id: string, updates: Partial<Label>) => {
    try {
      const { data, error } = await supabase
        .from('labels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLabels(labels.map((l) => (l.id === id ? data : l)));
      return data;
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const { error } = await supabase.from('labels').delete().eq('id', id);

      if (error) throw error;
      setLabels(labels.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
    }
  };

  return { labels, loading, addLabel, updateLabel, deleteLabel, refetch: fetchLabels };
}
