import { memo, useMemo } from 'react';
import { Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Order } from '../../types';

function getStatusConfig(status: string) {
  const configs = {
    pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Processing', icon: Package },
    shipped: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Shipped', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Delivered', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelled', icon: XCircle },
  } as const;
  return configs[status as keyof typeof configs] ?? configs.pending;
}

export const AdminOrderTableRow = memo(function AdminOrderTableRow({
  order,
  onView,
}: {
  order: Order;
  onView: (order: Order) => void;
}) {
  const statusConfig = useMemo(() => getStatusConfig(order.status), [order.status]);
  const StatusIcon = statusConfig.icon;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="font-mono text-sm font-medium text-gray-900">{order.order_number}</div>
      </td>
      <td className="py-4 px-4">
        <div className="font-medium text-gray-900">{order.customer_name}</div>
        <div className="text-sm text-gray-600">{order.customer_email}</div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-700">
          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="font-semibold text-gray-900">${Number(order.total_amount).toFixed(2)}</div>
      </td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</div>
      </td>
      <td className="py-4 px-4">
        <button
          type="button"
          onClick={() => onView(order)}
          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});
