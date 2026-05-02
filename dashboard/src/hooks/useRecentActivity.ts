import { useState, useEffect, useMemo, useRef } from 'react';
import { dashboardClient } from '../lib/data-client';

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'alert' | 'payment' | 'return' | 'delivery';
  created_at: string;
}

export function useRecentActivity(vendorId: string | undefined) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) return;

    const fetchRecentActivities = async () => {
      isFetchingRef.current = true;
      try {
        const allActivities: RecentActivity[] = [];

        const [ordersResult, returnsResult, inventoryResult, transactionsResult] = await Promise.all([
          dashboardClient
            .from('orders')
            .select('id, order_number, customer_name, total_amount, status, created_at, updated_at')
            .eq('vendor_id', vendorId)
            .order('updated_at', { ascending: false })
            .limit(5),

          dashboardClient
            .from('returns')
            .select('id, return_number, reason, status, created_at')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false })
            .limit(5),

          dashboardClient
            .from('inventory')
            .select('id, product_name, quantity, low_stock_threshold, updated_at')
            .eq('vendor_id', vendorId)
            .order('updated_at', { ascending: false })
            .limit(20),

          dashboardClient
            .from('transactions')
            .select('id, type, amount, status, created_at')
            .eq('vendor_id', vendorId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        if (ordersResult.data) {
          ordersResult.data.forEach((order) => {
            if (order.status === 'pending') {
              allActivities.push({
                id: `order-${order.id}`,
                title: 'New order received',
                description: `Order ${order.order_number} from ${order.customer_name}`,
                time: formatTime(order.created_at),
                type: 'order',
                created_at: order.created_at
              });
            } else if (order.status === 'delivered') {
              allActivities.push({
                id: `delivery-${order.id}`,
                title: 'Order delivered',
                description: `Order ${order.order_number} successfully delivered to ${order.customer_name}`,
                time: formatTime(order.updated_at),
                type: 'delivery',
                created_at: order.updated_at
              });
            }
          });
        }

        if (returnsResult.data) {
          returnsResult.data.forEach((returnItem) => {
            if (returnItem.status === 'pending' || returnItem.status === 'approved') {
              allActivities.push({
                id: `return-${returnItem.id}`,
                title: 'Product returned',
                description: `Return ${returnItem.return_number} - ${returnItem.reason}`,
                time: formatTime(returnItem.created_at),
                type: 'return',
                created_at: returnItem.created_at
              });
            }
          });
        }

        if (inventoryResult.data) {
          const qty = (v: unknown) => (typeof v === 'number' ? v : parseInt(String(v), 10) || 0);
          const thr = (v: unknown) => (typeof v === 'number' ? v : parseInt(String(v), 10) || 0);
          inventoryResult.data
            .filter((item) => qty(item.quantity) <= thr(item.low_stock_threshold))
            .slice(0, 3)
            .forEach((item) => {
              const name =
                typeof item.product_name === 'string' && item.product_name.trim()
                  ? item.product_name.trim()
                  : 'Product';
              allActivities.push({
                id: `inventory-${item.id}`,
                title: 'Low stock alert',
                description: `Product "${name}" has only ${qty(item.quantity)} items left`,
                time: formatTime(String(item.updated_at)),
                type: 'alert',
                created_at: String(item.updated_at),
              });
            });
        }

        if (transactionsResult.data) {
          transactionsResult.data.forEach((transaction) => {
            if (transaction.type === 'payment') {
              allActivities.push({
                id: `transaction-${transaction.id}`,
                title: 'Payment received',
                description: `$${transaction.amount.toFixed(2)} payment completed`,
                time: formatTime(transaction.created_at),
                type: 'payment',
                created_at: transaction.created_at
              });
            }
          });
        }

        allActivities.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivities(allActivities.slice(0, 6));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchRecentActivities();
  }, [vendorId]);

  return useMemo(() => ({
    activities,
    loading
  }), [activities, loading]);
}

function formatTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
