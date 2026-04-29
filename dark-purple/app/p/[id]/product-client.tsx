'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductReviews } from '@/components/products/product-reviews';

interface ProductClientProps {
  product: any;
  relatedProducts: any[];
}

export function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCartDialog, setShowCartDialog] = useState(false);
  const { addItem, totalItems } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      image: product.images[0] || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg',
      traditions: product.traditions
    });

    setShowCartDialog(true);
  };

  const mainImage = product.images[0] || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg';

  return (
    <>
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e] border-white/20">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Added to Cart!</h3>
              <p className="text-purple-200/70">
                {product.title} has been added to your cart
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 w-full border border-white/10">
              <div className="flex items-center justify-between text-purple-200">
                <span>Items in cart:</span>
                <span className="font-semibold text-white">{totalItems}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
              <Button
                onClick={() => setShowCartDialog(false)}
                variant="outline"
                className="flex-1 border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/40"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => router.push('/cart')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart
              </Button>
            </div>

            <Button
              onClick={() => router.push('/checkout/customer')}
              variant="ghost"
              className="w-full text-purple-300 hover:text-white hover:bg-white/5"
            >
              Proceed to Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
        <nav className="text-sm text-white/60 mb-8 flex items-center gap-2">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-white/90">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="mx-2">/</span>
          <Link href="/" className="hover:text-white/90">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/c/${product.layer1_category_slug}`} className="hover:text-white/90">
            {product.layer1_category_slug}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/90">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="glass-card p-4">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="hero-text font-serif text-white mb-4 leading-tight">{product.title}</h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {product.traditions && product.traditions.map((tradition: string) => (
                  <span key={tradition} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm border border-white/20">
                    {tradition}
                  </span>
                ))}
                {product.purposes && product.purposes.map((purpose: string) => (
                  <span key={purpose} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm border border-white/20">
                    {purpose}
                  </span>
                ))}
              </div>

              <p className="text-white/70 leading-relaxed mb-8 text-lg">
                {product.description}
              </p>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-5xl font-serif text-rose-gold">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="celestial-button w-full flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>

            <div className="glass-card p-6 space-y-4 mt-8">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-1 opacity-70">
                  <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                </svg>
                <div>
                  <h4 className="text-white font-medium mb-1">Curated with Care</h4>
                  <p className="text-white/60 text-sm">Every item is carefully selected for authenticity and quality</p>
                </div>
              </div>
              <div className="ethereal-divider"></div>
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-1 opacity-70">
                  <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                </svg>
                <div>
                  <h4 className="text-white font-medium mb-1">Secure Shipping</h4>
                  <p className="text-white/60 text-sm">Carefully packaged and shipped with respect</p>
                </div>
              </div>
              {product.time_to_make && (
                <>
                  <div className="ethereal-divider"></div>
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-1 opacity-70">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
                      <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    </svg>
                    <div>
                      <h4 className="text-white font-medium mb-1">Time to Make</h4>
                      <p className="text-white/60 text-sm">Approx. {product.time_to_make}</p>
                    </div>
                  </div>
                </>
              )}
              <div className="ethereal-divider"></div>
              <div className="flex items-start gap-3">
                <div className="text-white/50 text-xs leading-relaxed italic">
                  This item supports spiritual practice. It does not promise outcomes.
                </div>
              </div>
            </div>
          </div>
        </div>

        {product.purpose_description && (
          <div className="mb-16 glass-card p-8">
            <div className="flex items-start gap-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mt-1 opacity-70 flex-shrink-0">
                <path d="M12 2L4 7V14L12 20L20 14V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              <div>
                <h3 className="text-white font-serif text-2xl mb-3">Why This Exists</h3>
                <p className="text-white/70 leading-relaxed">
                  {product.purpose_description}
                </p>
              </div>
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div>
            <div className="ethereal-divider mb-12"></div>
            <h2 className="section-title font-serif text-center text-white mb-12">Related Selections</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/p/${relatedProduct.id}`}>
                  <div className="product-card overflow-hidden">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/10 to-transparent">
                      <Image
                        src={relatedProduct.images[0] || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'}
                        alt={relatedProduct.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-5 text-center">
                      <h3 className="text-white/95 font-light mb-3 line-clamp-2 text-base leading-snug">{relatedProduct.title}</h3>
                      <p className="text-rose-gold font-medium text-lg">${parseFloat(relatedProduct.price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16">
          <h2 className="section-title font-serif text-center text-white mb-12">Customer Reviews</h2>
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
    </>
  );
}
