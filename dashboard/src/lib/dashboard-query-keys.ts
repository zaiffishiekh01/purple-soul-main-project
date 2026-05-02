/** Stable keys for TanStack Query — use for invalidation prefixes and deduped fetches. */
const D = 'dashboard' as const;

export const dashboardKeys = {
  all: [D] as const,

  orders: (p: { isAdmin: boolean; vendorId?: string | null }) =>
    [D, 'orders', p.isAdmin, p.vendorId ?? 'all'] as const,
  ordersPrefix: [D, 'orders'] as const,

  transactions: (p: { isAdmin: boolean; vendorId?: string | null }) =>
    [D, 'transactions', p.isAdmin, p.vendorId ?? 'all'] as const,
  transactionsPrefix: [D, 'transactions'] as const,

  products: (p: { isAdmin: boolean; vendorId?: string | null }) =>
    [D, 'products', p.isAdmin, p.vendorId ?? 'all'] as const,
  productsPrefix: [D, 'products'] as const,

  vendorsAdmin: [D, 'vendors', 'admin'] as const,

  inventoryVendor: (vendorId: string) => [D, 'inventory', 'vendor', vendorId] as const,
  inventoryPrefix: [D, 'inventory'] as const,

  shipmentsVendor: (vendorId: string) => [D, 'shipments', 'vendor', vendorId] as const,
  shipmentsPrefix: [D, 'shipments'] as const,

  returnsByUser: (userId: string) => [D, 'returns', 'by-user', userId] as const,
  returnsPrefix: [D, 'returns'] as const,

  adminReturns: (statusFilter: string) => [D, 'returns', 'admin', statusFilter] as const,
  adminReturnsPrefix: [D, 'returns', 'admin'] as const,
};
