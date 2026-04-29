'use client';

import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { useCart } from '@/lib/cart-context';

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-card" style={{ borderRadius: 0 }}>
      <div className="mx-auto px-3 sm:px-4 max-w-[1920px]">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild className="2xl:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] glass-card border-white/20">
                <MobileNav />
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-2">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="soft-glow flex-shrink-0">
                <path d="M16 2L4 10V22L16 30L28 22V10L16 2Z" stroke="url(#sacred-gradient)" strokeWidth="1.5" fill="rgba(184, 160, 220, 0.1)" />
                <circle cx="16" cy="16" r="4" stroke="url(#sacred-gradient)" strokeWidth="1.5" fill="rgba(184, 160, 220, 0.2)" />
                <defs>
                  <linearGradient id="sacred-gradient" x1="4" y1="2" x2="28" y2="30">
                    <stop offset="0%" stopColor="#b8a0dc" />
                    <stop offset="50%" stopColor="#d4af8a" />
                    <stop offset="100%" stopColor="#b8a0dc" />
                  </linearGradient>
                </defs>
              </svg>
            </Link>

            <nav className="hidden 2xl:flex">
              <MainNav />
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10 relative h-9 w-9"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-gold text-celestial-indigo text-xs font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
