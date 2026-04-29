import { useState } from 'react';
import { Search, Filter, Download, Eye, MoreVertical, Tag } from 'lucide-react';
import { Order } from '../types';
import { exportOrders } from '../lib/export';
import { searchItems, filterItems } from '../lib/search';

interface OrderManagementProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

export function OrderManagement({ orders, onViewOrder }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const handleExport = () => {
    exportOrders(filteredOrders);
  };

  let filteredOrders = orders;

  if (searchTerm) {
    filteredOrders = searchItems(filteredOrders, searchTerm, [
      'order_number',
      'customer_name',
      'customer_display_name',
      'customer_email',
    ]);
  }

  if (statusFilter) {
    filteredOrders = filterItems(filteredOrders, { status: statusFilter });
  }
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      shipped: 'bg-purple-100 text-purple-700 border-purple-200',
      delivered: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600',
      paid: 'text-green-600',
      refunded: 'text-red-600',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders by number, customer name, or email..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filter</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold mb-3">Filters</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'All Orders', count: orders.length, status: '', active: statusFilter === '' },
            { label: 'Pending', count: orders.filter((o) => o.status === 'pending').length, status: 'pending', active: statusFilter === 'pending' },
            { label: 'Processing', count: orders.filter((o) => o.status === 'processing').length, status: 'processing', active: statusFilter === 'processing' },
            { label: 'Shipped', count: orders.filter((o) => o.status === 'shipped').length, status: 'shipped', active: statusFilter === 'shipped' },
            { label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length, status: 'delivered', active: statusFilter === 'delivered' },
          ].map((tab, index) => (
            <button
              key={index}
              onClick={() => setStatusFilter(tab.status)}
              className={`p-4 rounded-xl transition-all border ${
                tab.active
                  ? 'bg-gradient-to-br from-sufi-purple to-sufi-dark text-white border-sufi-purple shadow-lg'
                  : 'bg-white border-gray-200 hover:border-sufi-purple hover:shadow-md'
              }`}
            >
              <p className={`text-2xl font-bold ${tab.active ? 'text-white' : 'text-gray-900'}`}>
                {tab.count}
              </p>
              <p className={`text-sm mt-1 ${tab.active ? 'text-white/90' : 'text-gray-600'}`}>
                {tab.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-sufi-light/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                      <button className="text-gray-400 hover:text-sufi-purple transition-colors">
                        <Tag className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customer_display_name || order.customer_name}
                      </p>
                      {order.proxy_email && (
                        <p className="text-sm text-gray-500" title="Marketplace proxy email">
                          {order.proxy_email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewOrder(order.id)}
                        className="p-2 hover:bg-sufi-light/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-sufi-light/20 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
