import { useState, useMemo, useCallback } from 'react';
import { useDashboardAuth } from '../../../contexts/DashboardAuthContext';
import { useProducts } from '../../../hooks/useProducts';
import { Product } from '../../../types/dashboard';
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  ChevronDown,
  ArrowUpRight,
  TrendingDown,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const REORDER_THRESHOLD_DEFAULT = 10;

type StockFilterOption = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

interface StockStatusInfo {
  label: string;
  badgeClasses: string;
  icon: typeof CheckCircle;
  iconColor: string;
}

function getStockStatus(product: Product, threshold: number): StockStatusInfo {
  const qty = product.stock_quantity ?? 0;
  if (qty === 0) {
    return {
      label: 'Out of Stock',
      badgeClasses: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: XCircle,
      iconColor: 'text-red-500',
    };
  }
  if (qty <= threshold) {
    return {
      label: 'Low Stock',
      badgeClasses: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    };
  }
  return {
    label: 'In Stock',
    badgeClasses: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  };
}

const STOCK_FILTER_OPTIONS: { value: StockFilterOption; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

function matchesStockFilter(product: Product, threshold: number, filter: StockFilterOption): boolean {
  const qty = product.stock_quantity ?? 0;
  switch (filter) {
    case 'all':
      return true;
    case 'in_stock':
      return qty > threshold;
    case 'low_stock':
      return qty > 0 && qty <= threshold;
    case 'out_of_stock':
      return qty === 0;
    default:
      return true;
  }
}

export default function VendorInventoryPage() {
  const { vendor, loading: authLoading } = useDashboardAuth();
  const { products, loading: productsLoading, updateProduct, refetch } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilterOption>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [reorderThreshold, setReorderThreshold] = useState(REORDER_THRESHOLD_DEFAULT);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = authLoading || productsLoading;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesStock = matchesStockFilter(product, reorderThreshold, stockFilter);
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStock && matchesSearch;
    });
  }, [products, stockFilter, reorderThreshold, searchQuery]);

  const lowStockAlerts = useMemo(() => {
    return products.filter((p) => {
      const qty = p.stock_quantity ?? 0;
      return qty > 0 && qty <= reorderThreshold;
    });
  }, [products, reorderThreshold]);

  const outOfStockItems = useMemo(() => {
    return products.filter((p) => (p.stock_quantity ?? 0) === 0);
  }, [products]);

  const inventorySummary = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => (p.stock_quantity ?? 0) > reorderThreshold).length;
    const lowStock = products.filter((p) => {
      const qty = p.stock_quantity ?? 0;
      return qty > 0 && qty <= reorderThreshold;
    }).length;
    const outOfStock = products.filter((p) => (p.stock_quantity ?? 0) === 0).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * (p.stock_quantity ?? 0), 0);
    return { total, inStock, lowStock, outOfStock, totalValue };
  }, [products, reorderThreshold]);

  const handleUpdateThreshold = useCallback(
    async (productId: string, newThreshold: number) => {
      try {
        setError(null);
        setUpdatingId(productId);
        // Store threshold in a custom field or update product metadata
        // For now, we just update locally in the UI
        await refetch();
      } catch (err) {
        console.error('Error updating threshold:', err);
        setError('Failed to update threshold. Please try again.');
      } finally {
        setUpdatingId(null);
      }
    },
    [refetch],
  );

  const handleQuickRestock = useCallback(
    async (product: Product) => {
      const newQty = reorderThreshold * 2;
      try {
        setError(null);
        setUpdatingId(product.id);
        await updateProduct(product.id, { stock_quantity: newQty });
        await refetch();
      } catch (err) {
        console.error('Error restocking product:', err);
        setError('Failed to update stock quantity. Please try again.');
      } finally {
        setUpdatingId(null);
      }
    },
    [updateProduct, refetch, reorderThreshold],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-primary">No vendor profile found</h2>
        <p className="text-sm text-muted mt-1">Please contact support to set up your vendor account.</p>
      </div>
    );
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Inventory</h1>
        <p className="text-sm text-muted mt-1">Manage your product stock levels and reorder thresholds</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center justify-between">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Inventory summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-default p-5 shadow-theme-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Total Products</p>
              <p className="text-xl font-bold text-primary">{inventorySummary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-default p-5 shadow-theme-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">In Stock</p>
              <p className="text-xl font-bold text-primary">{inventorySummary.inStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-default p-5 shadow-theme-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Low Stock</p>
              <p className="text-xl font-bold text-primary">{inventorySummary.lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-default p-5 shadow-theme-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Inventory Value</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(inventorySummary.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock alerts banner */}
      {(lowStockAlerts.length > 0 || outOfStockItems.length > 0) && (
        <div className="space-y-3">
          {outOfStockItems.length > 0 && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                    {outOfStockItems.length} Product{outOfStockItems.length !== 1 ? 's' : ''} Out of Stock
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {outOfStockItems.slice(0, 5).map((p) => (
                      <span key={p.id} className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-md">
                        {p.name}
                      </span>
                    ))}
                    {outOfStockItems.length > 5 && (
                      <span className="text-xs text-red-600 dark:text-red-400">+{outOfStockItems.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {lowStockAlerts.length > 0 && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {lowStockAlerts.length} Product{lowStockAlerts.length !== 1 ? 's' : ''} Running Low
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {lowStockAlerts.slice(0, 5).map((p) => (
                      <span key={p.id} className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md">
                        {p.name} ({p.stock_quantity} left)
                      </span>
                    ))}
                    {lowStockAlerts.length > 5 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">+{lowStockAlerts.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reorder threshold control */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-medium text-secondary">Reorder Alert Threshold:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReorderThreshold(Math.max(1, reorderThreshold - 5))}
              className="w-8 h-8 rounded-lg bg-surface-deep border border-default text-muted hover:text-primary hover:bg-surface-deep/80 transition-colors flex items-center justify-center"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-semibold text-primary">{reorderThreshold}</span>
            <button
              onClick={() => setReorderThreshold(reorderThreshold + 5)}
              className="w-8 h-8 rounded-lg bg-surface-deep border border-default text-muted hover:text-primary hover:bg-surface-deep/80 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
          <span className="text-xs text-muted">Products at or below this quantity will be flagged as low stock</span>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Stock status filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-secondary hover:text-primary transition-colors"
            >
              <Filter className="w-4 h-4" />
              {STOCK_FILTER_OPTIONS.find((o) => o.value === stockFilter)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFilterDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-default rounded-lg shadow-theme-xl z-20 py-1">
                  {STOCK_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStockFilter(option.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-deep transition-colors ${
                        stockFilter === option.value ? 'text-purple-600 font-medium' : 'text-secondary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {(searchQuery || stockFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStockFilter('all');
              }}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Inventory table */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Package className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-base font-semibold text-primary">No products found</h3>
            <p className="text-sm text-muted mt-1">
              {searchQuery || stockFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No products in your inventory yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-deep/60">
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">SKU</th>
                  <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Current Stock</th>
                  <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Reorder Threshold</th>
                  <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product, reorderThreshold);
                  const StatusIcon = status.icon;
                  const qty = product.stock_quantity ?? 0;

                  return (
                    <tr key={product.id} className="hover:bg-surface-deep/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-4 h-4 ${status.iconColor} shrink-0`} />
                          <div>
                            <p className="text-sm font-medium text-primary">{product.name}</p>
                            <p className="text-xs text-muted">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary font-mono">{product.sku}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-semibold ${
                          qty === 0 ? 'text-red-600' : qty <= reorderThreshold ? 'text-amber-600' : 'text-primary'
                        }`}>
                          {qty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-secondary">{reorderThreshold}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.badgeClasses}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(qty === 0 || qty <= reorderThreshold) && (
                            <button
                              onClick={() => handleQuickRestock(product)}
                              disabled={updatingId === product.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                            >
                              {updatingId === product.id ? (
                                <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <ArrowUpRight className="w-3 h-3" />
                                  Quick Restock
                                </>
                              )}
                            </button>
                          )}
                          <a
                            href={`/vendor/products`}
                            className="text-xs text-secondary hover:text-purple-600 transition-colors"
                          >
                            Edit
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
