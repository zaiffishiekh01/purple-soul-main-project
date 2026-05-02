import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { dashboardClient } from '../../lib/data-client';
import { loadAdminInventoryWithRelations } from '../../lib/dashboard-relational-loaders';
import { AdminInventoryTableRow } from './AdminInventoryTableRow';
import { getStockStatus } from './inventoryDisplay';

interface InventoryItem {
  id: string;
  vendor_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string;
  last_restocked_at: string | null;
  created_at: string;
  vendors?: {
    business_name: string;
    contact_email: string;
  };
  products?: {
    category: string;
    price: number;
  };
}

interface Vendor {
  id: string;
  business_name: string;
}

export function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryRows, vendorsRes] = await Promise.all([
        loadAdminInventoryWithRelations(),
        dashboardClient
          .from('vendors')
          .select('id, business_name')
          .eq('status', 'active')
          .order('business_name'),
      ]);

      const formattedData = inventoryRows.map((item) => ({
        ...item,
        product_name: item.products?.name || 'Unknown Product',
        sku: item.products?.sku || 'N/A',
      }));
      setInventory(formattedData as InventoryItem[]);
      if (vendorsRes.data) setVendors(vendorsRes.data as Vendor[]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    // Search filter
    const matchesSearch =
      (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vendors?.business_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Vendor filter
    const matchesVendor = selectedVendor === 'all' || item.vendor_id === selectedVendor;

    // Stock filter
    const status = getStockStatus(item.quantity, item.low_stock_threshold);
    const matchesStock = stockFilter === 'all' || status === stockFilter;

    return matchesSearch && matchesVendor && matchesStock;
  });

  // Calculate statistics
  const totalItems = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalReserved = filteredInventory.reduce((sum, item) => sum + item.reserved_quantity, 0);
  const lowStockCount = filteredInventory.filter(item => {
    const status = getStockStatus(item.quantity, item.low_stock_threshold);
    return status === 'low_stock';
  }).length;
  const outOfStockCount = filteredInventory.filter(item => item.quantity === 0).length;

  const exportToCSV = () => {
    const headers = ['Vendor', 'Product', 'SKU', 'Quantity', 'Reserved', 'Available', 'Threshold', 'Location', 'Status'];
    const rows = filteredInventory.map(item => [
      item.vendors?.business_name || 'N/A',
      item.product_name,
      item.sku,
      item.quantity,
      item.reserved_quantity,
      item.quantity - item.reserved_quantity,
      item.low_stock_threshold,
      item.warehouse_location || 'N/A',
      getStockStatusConfig(getStockStatus(item.quantity, item.low_stock_threshold)).label
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
            <Package className="w-8 h-8 text-emerald-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Monitor all vendor inventory across the platform</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-white"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">{filteredInventory.length} SKUs</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Total Items</h3>
          <p className="text-3xl font-bold">{totalItems.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Reserved</span>
          </div>
          <h3 className="text-sm opacity-90 mb-1">Reserved Stock</h3>
          <p className="text-3xl font-bold">{totalReserved.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            {lowStockCount > 0 && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">Alert</span>
            )}
          </div>
          <h3 className="text-sm opacity-90 mb-1">Low Stock</h3>
          <p className="text-3xl font-bold">{lowStockCount}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 opacity-80" />
            {outOfStockCount > 0 && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">Critical</span>
            )}
          </div>
          <h3 className="text-sm opacity-90 mb-1">Out of Stock</h3>
          <p className="text-3xl font-bold">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
              showFilters ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {/* Vendor Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Vendors ({inventory.length} items)</option>
                {vendors.map(vendor => {
                  const count = inventory.filter(item => item.vendor_id === vendor.id).length;
                  return (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.business_name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock ({inventory.filter(i => getStockStatus(i.quantity, i.low_stock_threshold) === 'in_stock').length})</option>
                <option value="low_stock">Low Stock ({lowStockCount})</option>
                <option value="out_of_stock">Out of Stock ({outOfStockCount})</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedVendor('all');
                  setStockFilter('all');
                }}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredInventory.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{inventory.length}</span> items
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Qty
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Restocked
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <AdminInventoryTableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No inventory items found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
