export function getStockStatus(quantity: number, threshold: number) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}

export function getStockStatusConfig(status: string) {
  const configs = {
    in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' },
    low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' },
  } as const;
  return configs[status as keyof typeof configs] ?? configs.in_stock;
}
