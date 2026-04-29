import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { CartItem } from '../App';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, color?: string, size?: string, bundleId?: string) => void;
  onRemove: (productId: string, color?: string, size?: string, bundleId?: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export default function Cart({
  cart,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onContinueShopping,
}: CartProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const bundleDiscount = cart.reduce((sum, item) => {
    if (item.bundleDiscount && item.bundleId) {
      return sum + (item.price * item.quantity * item.bundleDiscount / 100);
    }
    return sum;
  }, 0);

  const savings = cart.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const subtotalAfterBundleDiscount = subtotal - bundleDiscount;
  const tax = subtotalAfterBundleDiscount * 0.1;
  const shipping = subtotalAfterBundleDiscount > 50 ? 0 : 10;
  const total = subtotalAfterBundleDiscount + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-surface-deep rounded-full mb-6">
            <ShoppingBag className="w-12 h-12 text-muted" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4">Your cart is empty</h2>
          <p className="text-secondary mb-8">
            Looks like you haven't added anything to your cart yet
          </p>
          <button
            onClick={onContinueShopping}
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-all inline-flex items-center gap-2"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl shadow-theme-sm overflow-hidden">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${item.bundleId || 'nobundle'}`}
                className="flex gap-6 p-6 border-b border-default last:border-b-0 hover:bg-surface-elevated transition-colors"
              >
                <div className="w-32 h-32 bg-surface-deep rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-primary text-lg mb-1">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-secondary">
                        {item.selectedColor && (
                          <span className="flex items-center gap-1">
                            Color: <span className="font-medium">{item.selectedColor}</span>
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="flex items-center gap-1">
                            Size: <span className="font-medium">{item.selectedSize}</span>
                          </span>
                        )}
                      </div>
                      {item.bundleId && item.bundleDiscount && (
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md text-xs font-medium">
                            <Tag className="w-3 h-3" />
                            Bundle: {Math.round(item.bundleDiscount * 100)}% off
                          </div>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Changing quantity will remove bundle discount
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemove(item.id, item.selectedColor, item.selectedSize, item.bundleId)}
                      className="text-red-500 hover:text-red-700 p-2 -mt-2 -mr-2 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-surface-deep rounded-lg p-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            item.quantity - 1,
                            item.selectedColor,
                            item.selectedSize,
                            item.bundleId
                          )
                        }
                        className="w-8 h-8 rounded-md hover:bg-surface transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold w-8 text-center text-primary">{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            item.quantity + 1,
                            item.selectedColor,
                            item.selectedSize,
                            item.bundleId
                          )
                        }
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        className="w-8 h-8 rounded-md hover:bg-surface transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {item.stock !== undefined && item.stock <= 20 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Only {item.stock} left in stock
                      </p>
                    )}

                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      {item.originalPrice && (
                        <div className="text-sm text-muted line-through">
                          ${(item.originalPrice * item.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onContinueShopping}
            className="mt-6 text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            ← Continue Shopping
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl shadow-theme-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-secondary">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              {savings > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Savings
                  </span>
                  <span className="font-semibold">-${savings.toFixed(2)}</span>
                </div>
              )}

              {bundleDiscount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Bundle Discount
                  </span>
                  <span className="font-semibold">-${bundleDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-secondary">
                <span>Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-green-600 dark:text-green-400">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-secondary">
                <span>Tax (10%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>

              {subtotal < 50 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm text-purple-700 dark:text-purple-300">
                  Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                </div>
              )}
            </div>

            <div className="border-t border-default pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-primary">Total</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all hover:shadow-theme-lg flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-secondary">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Free returns within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
