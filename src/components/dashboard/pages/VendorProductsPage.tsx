import { useState, useMemo, useCallback } from 'react';
import { useDashboardAuth } from '../../../contexts/DashboardAuthContext';
import { useProducts } from '../../../hooks/useProducts';
import { Product } from '../../../types/dashboard';
import {
  Search,
  Filter,
  Download,
  Plus,
  Package,
  ChevronDown,
  Edit,
  Trash2,
  X,
  Check,
} from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getProductStatusBadgeClasses(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'published':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'draft':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    case 'archived':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

function getStockStatus(product: Product): { label: string; classes: string } {
  const qty = product.stock_quantity ?? 0;
  if (qty === 0) return { label: 'Out of Stock', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (qty <= 5) return { label: 'Low Stock', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'In Stock', classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
}

const PRODUCT_STATUSES = ['all', 'active', 'draft', 'archived', 'published'];

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
}

function AddProductModal({ isOpen, onClose, categories }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    cost: '',
    category: categories[0] || '',
    stock_quantity: '',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: would call addProduct from useProducts
    console.log('Add product:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl border border-default shadow-theme-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-default">
          <h2 className="text-lg font-semibold text-primary">Add New Product</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-deep text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">SKU</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="SKU-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="">Select category</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              placeholder="Product description..."
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-secondary hover:bg-surface-deep border border-default transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-theme-sm"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorProductsPage() {
  const { vendor, loading: authLoading } = useDashboardAuth();
  const { products, loading: productsLoading, deleteProduct, refetch } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loading = authLoading || productsLoading;

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesStatus = statusFilter === 'all' || product.status.toLowerCase() === statusFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [products, statusFilter, categoryFilter, searchQuery]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Status'];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.sku,
      p.category,
      p.price.toString(),
      p.cost.toString(),
      (p.stock_quantity ?? 0).toString(),
      p.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredProducts]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this product?')) return;
      try {
        setError(null);
        setDeletingId(id);
        await deleteProduct(id);
        await refetch();
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again.');
      } finally {
        setDeletingId(null);
      }
    },
    [deleteProduct, refetch],
  );

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  }, [filteredProducts, selectedIds]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading products...</p>
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Products</h1>
          <p className="text-sm text-muted mt-1">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredProducts.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-default text-sm font-medium text-secondary hover:text-primary hover:bg-surface-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-theme-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
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

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
            {selectedIds.size} product{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">Export Selected</button>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">Delete Selected</button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowCategoryDropdown(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-secondary hover:text-primary transition-colors"
            >
              <Filter className="w-4 h-4" />
              {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 bg-surface border border-default rounded-lg shadow-theme-xl z-20 py-1">
                  {PRODUCT_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-deep transition-colors ${
                        statusFilter === status ? 'text-purple-600 font-medium' : 'text-secondary'
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowStatusDropdown(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-secondary hover:text-primary transition-colors"
            >
              Category
              <ChevronDown className="w-4 h-4" />
            </button>
            {showCategoryDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-default rounded-lg shadow-theme-xl z-20 py-1 max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-deep transition-colors ${
                        categoryFilter === cat ? 'text-purple-600 font-medium' : 'text-secondary'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active filter count */}
        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Products table */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Package className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-base font-semibold text-primary">No products found</h3>
            <p className="text-sm text-muted mt-1">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Start by adding your first product.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-deep/60">
                  <th className="text-left px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-default text-purple-600 focus:ring-purple-600 cursor-pointer"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">SKU</th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Price</th>
                  <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Stock</th>
                  <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {filteredProducts.map((product) => {
                  const stock = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-surface-deep/30 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 rounded border-default text-purple-600 focus:ring-purple-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-primary">{product.name}</p>
                          <p className="text-xs text-muted">{product.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary font-mono">{product.sku}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary text-right">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${stock.classes}`}>
                          {product.stock_quantity ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getProductStatusBadgeClasses(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Edit"
                            className="p-1.5 rounded-md hover:bg-surface-deep text-muted hover:text-purple-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            title="Delete"
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-muted hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingId === product.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
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

      {/* Add product modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories.filter((c) => c !== 'all')}
      />
    </div>
  );
}
