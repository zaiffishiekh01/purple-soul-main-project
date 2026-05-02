import { useState, useEffect } from 'react';
import { dashboardClient } from '../lib/data-client';

export function useOrderLabels(orderId: string) {
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderLabels();
    }
  }, [orderId]);

  const fetchOrderLabels = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('order_labels')
        .select('label_id')
        .eq('order_id', orderId);

      if (error) throw error;
      setLabelIds(data?.map((item) => item.label_id) || []);
    } catch (error) {
      console.error('Error fetching order labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLabelToOrder = async (labelId: string) => {
    try {
      const { error } = await dashboardClient
        .from('order_labels')
        .insert({ order_id: orderId, label_id: labelId });

      if (error) throw error;
      setLabelIds([...labelIds, labelId]);
    } catch (error) {
      console.error('Error adding label to order:', error);
      throw error;
    }
  };

  const removeLabelFromOrder = async (labelId: string) => {
    try {
      const { error } = await dashboardClient
        .from('order_labels')
        .delete()
        .eq('order_id', orderId)
        .eq('label_id', labelId);

      if (error) throw error;
      setLabelIds(labelIds.filter((id) => id !== labelId));
    } catch (error) {
      console.error('Error removing label from order:', error);
      throw error;
    }
  };

  return { labelIds, loading, addLabelToOrder, removeLabelFromOrder, refetch: fetchOrderLabels };
}
