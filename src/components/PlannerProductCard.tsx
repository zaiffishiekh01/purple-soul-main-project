import { Heart, Star, ShoppingCart, CheckSquare } from 'lucide-react';
import { Product } from '../App';

interface PlannerProductCardProps {
  product: Product;
  onViewProduct?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist: boolean;
  isInCart: boolean;
}

export default function PlannerProductCard({
  product,
  onViewProduct,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  isInCart,
}: PlannerProductCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all">
      <div className="relative cursor-pointer" onClick={() => onViewProduct?.(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView?.(product);
          }}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span className="bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm">
            Quick View
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <h4
          className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => onViewProduct?.(product)}
        >
          {product.name}
        </h4>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-purple-600">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          disabled={isInCart}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-theme-md hover:shadow-theme-lg ${
            isInCart
              ? 'bg-green-100 text-green-700 cursor-not-allowed dark:bg-green-900/30 dark:text-green-300'
              : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
          }`}
        >
          {isInCart ? (
            <>
              <CheckSquare className="w-4 h-4" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
