import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { Product } from '../types';
import { exportProducts } from '../lib/export';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  onBulkUpload?: () => void;
  onImportHistory?: () => void;
}

type FilterStatus = 'all' | 'active' | 'draft' | 'archived';

export function ProductManagement({ products, onAddProduct, onEditProduct, onDeleteProduct, onBulkUpload, onImportHistory }: ProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const handleExport = () => {
    exportProducts(filteredProducts);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      archived: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU, or category..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
              />
            </div>
            <button
              onClick={onAddProduct}
              className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <button
              onClick={onBulkUpload}
              className="px-4 py-3 border-2 border-dashed border-sufi-purple/50 text-sufi-dark rounded-xl hover:bg-sufi-light/20 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Export Products
            </button>
            <button
              onClick={onImportHistory}
              className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Import History
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { label: 'All Products', value: 'all' as FilterStatus },
              { label: 'Active', value: 'active' as FilterStatus },
              { label: 'Draft', value: 'draft' as FilterStatus },
              { label: 'Archived', value: 'archived' as FilterStatus }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all border ${
                  filterStatus === tab.value
                    ? 'bg-sufi-purple text-white border-sufi-purple'
                    : 'bg-white border-gray-200 hover:border-sufi-purple'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 font-medium whitespace-nowrap ml-4">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery ? 'Try adjusting your search terms' : 'Add your first product to get started'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="aspect-square bg-gradient-to-br from-sufi-light to-purple-100 relative overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Eye className="w-16 h-16 text-sufi-purple/30" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Cost: ${product.cost.toFixed(2)}</p>
                </div>
                {product.category && (
                  <span className="px-3 py-1 bg-sufi-light/30 text-sufi-dark text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditProduct(product.id)}
                  className="flex-1 px-4 py-2 bg-sufi-light/30 text-sufi-dark rounded-lg hover:bg-sufi-light/50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                {onDeleteProduct && (
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {products.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-sufi-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-10 h-10 text-sufi-purple" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-6">Start building your catalog by adding your first product</p>
          <button
            onClick={onAddProduct}
            className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
}
