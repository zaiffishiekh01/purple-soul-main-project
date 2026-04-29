import { X, Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../App';
import { useState } from 'react';

interface QuickViewProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
  isInWishlist: boolean;
  onToggleWishlist: (id: string) => void;
  onViewFull: () => void;
}

export default function QuickView({
  product,
  onClose,
  onAddToCart,
  isInWishlist,
  onToggleWishlist,
  onViewFull,
}: QuickViewProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-default px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-deep rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          <div>
            <div className="aspect-square bg-surface-deep rounded-xl overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-purple-600 ring-2 ring-purple-200'
                        : 'border-default hover:border-hover'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-2">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-secondary">({product.reviews} reviews)</span>
                </div>
              </div>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="p-2 rounded-full bg-surface-deep hover:bg-surface-elevated transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist ? 'fill-red-500 text-red-500' : 'text-secondary'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-purple-600">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted line-through">
                    ${product.originalPrice}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-semibold">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-secondary mb-6 line-clamp-3">{product.description}</p>

            {product.colors && (
              <div className="mb-4">
                <h4 className="font-semibold text-primary mb-2">Color: {selectedColor}</h4>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 rounded-lg border-2 text-sm transition-all ${
                        selectedColor === color
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-default hover:border-hover'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && (
              <div className="mb-6">
                <h4 className="font-semibold text-primary mb-2">Size: {selectedSize}</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 rounded-lg border-2 text-sm transition-all ${
                        selectedSize === size
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-default hover:border-hover'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onAddToCart(product, selectedColor, selectedSize);
                  onClose();
                }}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={onViewFull}
                className="px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Full Details
              </button>
            </div>

            {product.inStock ? (
              <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                In Stock
              </p>
            ) : (
              <p className="text-red-600 text-sm mt-3">Out of Stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
