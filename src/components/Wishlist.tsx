import { Heart, ShoppingBag, X, Star } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';

interface WishlistProps {
  wishlist: string[];
  onViewProduct: (product: Product) => void;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function Wishlist({
  wishlist,
  onViewProduct,
  onToggleWishlist,
  onAddToCart,
}: WishlistProps) {
  const wishlistProducts = mockProducts.filter((p) => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-surface-deep rounded-full mb-6">
            <Heart className="w-12 h-12 text-muted" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4">Your wishlist is empty</h2>
          <p className="text-secondary mb-8">
            Save items you love and they'll show up here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">My Wishlist</h1>
        <p className="text-secondary">{wishlistProducts.length} items saved</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-surface rounded-xl overflow-hidden shadow-theme-md hover:shadow-theme-xl transition-all"
          >
            <div className="relative aspect-square overflow-hidden bg-surface-deep">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                onClick={() => onViewProduct(product)}
              />
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="absolute top-3 right-3 bg-surface rounded-full p-2 shadow-theme-lg hover:bg-red-50 transition-colors"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="w-full bg-surface text-primary py-2 rounded-lg font-semibold hover:bg-surface-deep transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
            <div
              className="p-4 cursor-pointer"
              onClick={() => onViewProduct(product)}
            >
              <div className="flex items-center gap-1 mb-2">
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
                <span className="text-sm text-secondary ml-1">({product.reviews})</span>
              </div>
              <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold text-lg">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-muted line-through text-sm">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {!product.inStock && (
                <p className="text-red-500 text-sm mt-2 font-medium">Out of Stock</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
