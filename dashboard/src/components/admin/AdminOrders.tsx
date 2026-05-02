'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { OrderDetailsModal } from '../modals/OrderDetailsModal';
import { Order } from '../../types';
import { AdminOrderTableRow } from './AdminOrderTableRow';

export function AdminOrders() {
  const router = useRouter();
  const { orders, loading, updateOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleNavigateToLabels = () => {
    if (selectedOrder) {
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
      router.push('/admin/labels');
      setSelectedOrder(null);
    }
  };

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-emerald-600" />
            All Orders
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage all platform orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-200">
          <div className="text-sm text-yellow-700">Pending</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
          <div className="text-sm text-blue-700">Processing</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.processing}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-200">
          <div className="text-sm text-purple-700">Shipped</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{stats.shipped}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
          <div className="text-sm text-green-700">Delivered</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{stats.delivered}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <AdminOrderTableRow key={order.id} order={order} onView={handleViewOrder} />
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No orders found matching your criteria
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={async (status: string) => {
            try {
              const updatedOrder = await updateOrder(selectedOrder.id, { status });
              setSelectedOrder(updatedOrder);
              alert(`Order status updated to ${status} successfully!`);
            } catch (error) {
              console.error('Error updating order status:', error);
              alert('Failed to update order status. Please try again.');
            }
          }}
          onNavigateToLabels={handleNavigateToLabels}
        />
      )}
    </div>
  );
}
