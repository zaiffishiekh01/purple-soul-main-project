import { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, Package, Search, Filter, RefreshCw, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { downloadCSV } from '../lib/export';

interface InventoryItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string;
  last_restocked_at: string | null;
  vendor_id: string;
  products?: {
    name: string;
    vendor_id: string;
    vendors?: {
      business_name: string;
    };
  };
  vendors?: {
    business_name: string;
  };
}

interface InventoryManagementProps {
  inventory: InventoryItem[];
  vendors?: Array<{ id: string; business_name: string }>;
  onRefresh?: () => void;
}

export function InventoryManagement({ inventory, vendors = [], onRefresh }: InventoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>('product_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const getStockStatus = (quantity: number, reserved: number, threshold: number) => {
    const available = quantity - reserved;
    if (available === 0) return 'out-of-stock';
    if (available <= threshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
      case 'low-stock':
        return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' };
      case 'in-stock':
        return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalQty = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalReserved = inventory.reduce((sum, item) => sum + item.reserved_quantity, 0);
    const lowStock = inventory.filter((item) => {
      const available = item.quantity - item.reserved_quantity;
      return available > 0 && available <= item.low_stock_threshold;
    }).length;
    const outOfStock = inventory.filter((item) => {
      const available = item.quantity - item.reserved_quantity;
      return available === 0;
    }).length;

    return {
      totalQty,
      totalReserved,
      totalSKUs: inventory.length,
      lowStock,
      outOfStock,
    };
  }, [inventory]);

  // Filter and search inventory
  const filteredInventory = useMemo(() => {
    let filtered = [...inventory];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(search) ||
          item.sku?.toLowerCase().includes(search) ||
          item.vendors?.business_name?.toLowerCase().includes(search) ||
          item.products?.vendors?.business_name?.toLowerCase().includes(search)
      );
    }

    // Vendor filter
    if (selectedVendor !== 'all') {
      filtered = filtered.filter((item) => item.vendor_id === selectedVendor);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((item) => {
        const status = getStockStatus(
          item.quantity,
          item.reserved_quantity,
          item.low_stock_threshold
        );
        return status === selectedStatus;
      });
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter((item) =>
        item.warehouse_location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'product_name':
          aValue = a.product_name?.toLowerCase() || '';
          bValue = b.product_name?.toLowerCase() || '';
          break;
        case 'sku':
          aValue = a.sku?.toLowerCase() || '';
          bValue = b.sku?.toLowerCase() || '';
          break;
        case 'vendor':
          aValue = (a.vendors?.business_name || a.products?.vendors?.business_name || '').toLowerCase();
          bValue = (b.vendors?.business_name || b.products?.vendors?.business_name || '').toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'available':
          aValue = a.quantity - a.reserved_quantity;
          bValue = b.quantity - b.reserved_quantity;
          break;
        case 'location':
          aValue = a.warehouse_location?.toLowerCase() || '';
          bValue = b.warehouse_location?.toLowerCase() || '';
          break;
        case 'last_restocked':
          aValue = a.last_restocked_at ? new Date(a.last_restocked_at).getTime() : 0;
          bValue = b.last_restocked_at ? new Date(b.last_restocked_at).getTime() : 0;
          break;
        default:
          aValue = a.product_name?.toLowerCase() || '';
          bValue = b.product_name?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [inventory, searchTerm, selectedVendor, selectedStatus, locationFilter, sortField, sortDirection]);

  const handleExportCSV = () => {
    const exportData = filteredInventory.map((item) => ({
      Vendor: item.vendors?.business_name || item.products?.vendors?.business_name || 'N/A',
      Product: item.product_name || 'N/A',
      SKU: item.sku || 'N/A',
      'Total Qty': item.quantity,
      Reserved: item.reserved_quantity,
      Available: item.quantity - item.reserved_quantity,
      Location: item.warehouse_location || 'N/A',
      Status: getStockStatusLabel(
        getStockStatus(item.quantity, item.reserved_quantity, item.low_stock_threshold)
      ).label,
      'Last Restocked': item.last_restocked_at
        ? new Date(item.last_restocked_at).toLocaleDateString()
        : 'Never',
    }));

    downloadCSV(exportData, 'inventory-export');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedVendor('all');
    setSelectedStatus('all');
    setLocationFilter('all');
    setSortField('product_name');
    setSortDirection('asc');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-emerald-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-emerald-600" />
    );
  };

  // Get unique warehouse locations for filter
  const warehouseLocations = useMemo(() => {
    const locations = new Set(inventory.map(item => item.warehouse_location).filter(Boolean));
    return Array.from(locations).sort();
  }, [inventory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-600" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Monitor all vendor inventory across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">{stats.totalSKUs} SKUs</span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Items</h3>
          <p className="text-3xl font-bold">{stats.totalQty.toLocaleString()}</p>
        </div>

        <div className="bg-purple-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
              Reserved
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Reserved Stock</h3>
          <p className="text-3xl font-bold">{stats.totalReserved.toLocaleString()}</p>
        </div>

        <div className="bg-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            {stats.lowStock > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">Alert</span>
            )}
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Low Stock</h3>
          <p className="text-3xl font-bold">{stats.lowStock}</p>
        </div>

        <div className="bg-red-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            {stats.outOfStock > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
                Critical
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Out of Stock</h3>
          <p className="text-3xl font-bold">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Vendors ({inventory.length} items)</option>
                {vendors.map((vendor) => {
                  const count = inventory.filter((item) => item.vendor_id === vendor.id).length;
                  return (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.business_name} ({count} items)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {warehouseLocations.map((location) => {
                  const count = inventory.filter((item) => item.warehouse_location === location).length;
                  return (
                    <option key={location} value={location}>
                      {location} ({count} items)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 mb-4">
          Showing <span className="font-semibold">{filteredInventory.length}</span> of{' '}
          <span className="font-semibold">{inventory.length}</span> items
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center gap-2">
                    Vendor
                    <SortIcon field="vendor" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('product_name')}
                >
                  <div className="flex items-center gap-2">
                    Product
                    <SortIcon field="product_name" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center gap-2">
                    SKU
                    <SortIcon field="sku" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center gap-2">
                    Total Qty
                    <SortIcon field="quantity" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reserved
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('available')}
                >
                  <div className="flex items-center gap-2">
                    Available
                    <SortIcon field="available" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-2">
                    Location
                    <SortIcon field="location" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('last_restocked')}
                >
                  <div className="flex items-center gap-2">
                    Last Restocked
                    <SortIcon field="last_restocked" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No inventory items found</p>
                    {(searchTerm || selectedVendor !== 'all' || selectedStatus !== 'all') && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const available = item.quantity - item.reserved_quantity;
                  const status = getStockStatus(
                    item.quantity,
                    item.reserved_quantity,
                    item.low_stock_threshold
                  );
                  const statusDisplay = getStockStatusLabel(status);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.vendors?.business_name ||
                            item.products?.vendors?.business_name ||
                            'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-mono">{item.sku || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{item.reserved_quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{available}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {item.warehouse_location || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.color}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {item.last_restocked_at
                            ? new Date(item.last_restocked_at).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
