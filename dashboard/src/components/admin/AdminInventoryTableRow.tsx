import { memo, useMemo } from 'react';
import { getStockStatus, getStockStatusConfig } from './inventoryDisplay';

export interface AdminInventoryRowItem {
  id: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string;
  last_restocked_at: string | null;
  product_name: string;
  sku: string;
  vendors?: {
    business_name: string;
    contact_email: string;
  };
  products?: {
    category: string;
    price: number;
  };
}

export const AdminInventoryTableRow = memo(function AdminInventoryTableRow({
  item,
}: {
  item: AdminInventoryRowItem;
}) {
  const status = useMemo(
    () => getStockStatus(item.quantity, item.low_stock_threshold),
    [item.quantity, item.low_stock_threshold]
  );
  const statusConfig = useMemo(() => getStockStatusConfig(status), [status]);
  const available = item.quantity - item.reserved_quantity;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{item.vendors?.business_name}</div>
        <div className="text-xs text-gray-500">{item.vendors?.contact_email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{item.product_name}</div>
        {item.products?.category && (
          <div className="text-xs text-gray-500 mt-1">
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">{item.products.category}</span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{item.sku}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-semibold text-gray-900">{item.quantity}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-purple-600 font-medium">{item.reserved_quantity}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`font-semibold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>{available}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.warehouse_location || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {item.last_restocked_at ? new Date(item.last_restocked_at).toLocaleDateString() : 'Never'}
      </td>
    </tr>
  );
});
