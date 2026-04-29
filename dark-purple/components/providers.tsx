'use client';

import { CartProvider } from '@/lib/cart-context';
import { CheckoutProvider } from '@/lib/checkout/context';
import { APIAuthProvider } from '@/lib/auth/api-context';
import { WishlistProvider } from '@/lib/wishlist/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <APIAuthProvider>
      <WishlistProvider>
        <CartProvider>
          <CheckoutProvider>
            {children}
          </CheckoutProvider>
        </CartProvider>
      </WishlistProvider>
    </APIAuthProvider>
  );
}
