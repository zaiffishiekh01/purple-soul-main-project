import React, { useState, useEffect } from 'react';
import { Package, Sparkles, ShoppingCart, Tag, Heart } from 'lucide-react';
import { ProductBundle } from '../lib/recommendations';

interface SmartBundlesProps {
  bundles: ProductBundle[];
  onAddToCart: (bundle: ProductBundle) => void;
  onViewProduct: (productId: string) => void;
}

export default function SmartBundles({ bundles, onAddToCart, onViewProduct }: SmartBundlesProps) {
  if (bundles.length === 0) return null;

  return (
    <div className="my-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600" />
          Smart Bundles - Save More
        </h2>
        <p className="text-secondary">
          Thoughtfully curated collections for special occasions and traditions
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="bg-surface rounded-lg shadow-theme-lg overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all"
          >
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">{bundle.name}</h3>
                <div className="bg-surface text-purple-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  Save {bundle.savingsPercent}%
                </div>
              </div>
              <p className="text-purple-100 text-sm">{bundle.description}</p>
              {bundle.occasion && (
                <div className="mt-2">
                  <span className="bg-purple-700 px-3 py-1 rounded-full text-xs">
                    Perfect for {bundle.occasion}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-secondary mb-2 font-medium">This bundle includes:</p>
                <div className="space-y-2">
                  {bundle.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-surface-deep rounded-lg cursor-pointer hover:bg-surface-deep transition-colors"
                      onClick={() => onViewProduct(product.id)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{product.name}</p>
                        <p className="text-xs text-secondary">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-secondary">Regular Price:</span>
                  <span className="text-muted line-through">${bundle.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary">Bundle Price:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${bundle.discountedPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-green-600 font-semibold text-sm">
                    You save ${(bundle.totalPrice - bundle.discountedPrice).toFixed(2)}!
                  </span>
                </div>
              </div>

              <button
                onClick={() => onAddToCart(bundle)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Add Bundle to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BundleRecommendations({ productId }: { productId: string }) {
  return (
    <div className="mt-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
      <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <Package className="w-6 h-6 text-purple-600" />
        Complete Your Collection
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">Prayer & Meditation Set</h4>
          <p className="text-sm text-secondary mb-3">
            This item pairs beautifully with prayer essentials
          </p>
          <div className="flex items-center justify-between">
            <span className="text-purple-600 font-semibold">Save 15%</span>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
              View Bundle
            </button>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">Sacred Home Collection</h4>
          <p className="text-sm text-secondary mb-3">
            Create a spiritual sanctuary with coordinated pieces
          </p>
          <div className="flex items-center justify-between">
            <span className="text-purple-600 font-semibold">Save 20%</span>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
              View Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FrequentlyBoughtTogether({ products }: { products: any[] }) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    setSelectedProducts(products.map(p => p.id));
  }, [products]);

  const totalPrice = products
    .filter(p => selectedProducts.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  const discountedPrice = totalPrice * 0.9;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-200">
      <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6 text-purple-600" />
        Frequently Bought Together
      </h3>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {products.map((product, index) => (
          <div key={product.id} className="relative">
            {index > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold z-10">
                +
              </div>
            )}
            <div className="bg-surface p-4 rounded-lg border-2 border-default">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts([...selectedProducts, product.id]);
                    } else {
                      setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                    }
                  }}
                  className="mt-1 w-4 h-4 text-purple-600"
                />
                <div className="flex-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="font-medium text-primary text-sm mb-1">{product.name}</p>
                  <p className="text-purple-600 font-semibold">${product.price.toFixed(2)}</p>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-secondary">Total Price:</p>
            <p className="text-sm text-muted line-through">${totalPrice.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-semibold">Bundle Price:</p>
            <p className="text-2xl font-bold text-purple-600">${discountedPrice.toFixed(2)}</p>
          </div>
        </div>

        <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Add Selected Items ({selectedProducts.length})
        </button>
      </div>
    </div>
  );
}
