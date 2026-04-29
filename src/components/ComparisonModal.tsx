import { X, Star, Check, Eye } from 'lucide-react';
import { mockProducts } from '../data/products';
import { Product } from '../App';

interface ComparisonModalProps {
  productIds: string[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onViewProduct: (product: Product) => void;
}

export default function ComparisonModal({
  productIds,
  onClose,
  onRemove,
  onViewProduct,
}: ComparisonModalProps) {
  const products = mockProducts.filter(p => productIds.includes(p.id));

  if (products.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl max-w-2xl w-full p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Product Comparison</h2>
            <p className="text-secondary mb-6">
              No products selected for comparison. Add products from the catalog to compare.
            </p>
            <button
              onClick={onClose}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-default px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-primary">Compare Products</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-deep rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-surface-deep rounded-xl p-4 relative">
                <button
                  onClick={() => onRemove(product.id)}
                  className="absolute top-2 right-2 p-1 bg-surface rounded-full shadow-theme-md hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>

                <div className="aspect-square bg-surface rounded-lg overflow-hidden mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-semibold text-primary mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-muted mb-1">Price</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-purple-600">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-secondary ml-1">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">Category</p>
                    <p className="text-sm font-medium text-primary">{product.category}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted mb-1">Availability</p>
                    <p className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>

                  {product.colors && (
                    <div>
                      <p className="text-xs text-muted mb-1">Colors</p>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.map(color => (
                          <span
                            key={color}
                            className="text-xs bg-surface px-2 py-1 rounded border border-default"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.sizes && (
                    <div>
                      <p className="text-xs text-muted mb-1">Sizes</p>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.slice(0, 3).map(size => (
                          <span
                            key={size}
                            className="text-xs bg-surface px-2 py-1 rounded border border-default"
                          >
                            {size}
                          </span>
                        ))}
                        {product.sizes.length > 3 && (
                          <span className="text-xs text-muted">
                            +{product.sizes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted mb-1">Features</p>
                    <div className="space-y-1">
                      {product.tags.slice(0, 3).map(tag => (
                        <div key={tag} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-secondary capitalize">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            ))}

            {products.length < 4 && (
              <div className="bg-surface-deep rounded-xl p-4 flex items-center justify-center border-2 border-dashed border-default">
                <div className="text-center text-muted">
                  <p className="text-sm font-medium mb-1">Add more products</p>
                  <p className="text-xs">Compare up to 4 products</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
