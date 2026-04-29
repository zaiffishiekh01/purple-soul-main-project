import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderManagement } from './OrderManagement';
import { OrderDetailsModal } from './modals/OrderDetailsModal';
import { useOrders } from '../hooks/useOrders';
import { useVendorContext } from '../contexts/VendorContext';
import { Order } from '../types';

export function OrderManagementContainer() {
  const navigate = useNavigate();
  const { vendor } = useVendorContext();
  const { orders, loading, updateOrder } = useOrders(vendor?.id);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;

    try {
      const updatedOrder = await updateOrder(selectedOrder.id, { status });
      setSelectedOrder(updatedOrder);
      alert(`Order status updated to ${status} successfully!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleNavigateToLabels = () => {
    if (selectedOrder) {
      // Store order data in sessionStorage for pre-filling
      sessionStorage.setItem('labelOrderData', JSON.stringify({
        orderId: selectedOrder.id,
        orderNumber: selectedOrder.order_number,
        customerName: selectedOrder.customer_name,
        customerEmail: selectedOrder.customer_email,
        customerPhone: selectedOrder.customer_phone,
        shippingAddress: selectedOrder.shipping_address,
        paymentStatus: selectedOrder.payment_status,
        totalAmount: selectedOrder.total_amount,
        subtotal: selectedOrder.subtotal,
        taxAmount: selectedOrder.tax_amount,
        shippingCost: selectedOrder.shipping_cost,
      }));

      // Navigate to labels page
      navigate('/vendor/labels');
      setSelectedOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  return (
    <>
      <OrderManagement orders={orders} onViewOrder={handleViewOrder} />
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onNavigateToLabels={handleNavigateToLabels}
        />
      )}
    </>
  );
}
