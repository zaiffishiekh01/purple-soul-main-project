'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Category {
  id: string;
  slug: string;
  name: string;
  layer: number;
  parent_id: string | null;
  sort_order: number;
  subcategories?: Category[];
}

const EMERGENCY_MENU: Category[] = [
  {
    id: 'emergency-home',
    slug: 'collections',
    name: 'Shop',
    layer: 1,
    parent_id: null,
    sort_order: 1,
    subcategories: []
  }
];

export function MobileNav() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await fetch('/api/catalog/navigation', {
        next: { revalidate: 3600 },
      });
      if (!response.ok) {
        setCategories(EMERGENCY_MENU);
        return;
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setCategories(EMERGENCY_MENU);
    }
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-2">Shop by Category</h2>
      </div>

      {categories.map((category) => (
        <Collapsible
          key={category.slug}
          open={openCategory === category.slug}
          onOpenChange={(open) => setOpenCategory(open ? category.slug : null)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-white hover:bg-white/10 hover:text-white"
            >
              <span className="text-left">{category.name}</span>
              {openCategory === category.slug ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 py-2 space-y-2">
            {category.subcategories?.map((sub) => (
              <Link
                key={sub.slug}
                href={`/c/${category.slug}/${sub.slug}`}
                className="block text-sm text-white/80 hover:text-white py-1.5"
              >
                {sub.name}
              </Link>
            ))}
            <Link
              href={`/c/${category.slug}`}
              className="block text-sm text-rose-gold hover:text-white py-1.5 font-medium"
            >
              View All {category.name} →
            </Link>
          </CollapsibleContent>
        </Collapsible>
      ))}

      <div className="mt-4 pt-4 border-t border-white/10">
        <Link
          href="/collections"
          className="block text-white hover:text-purple-300 py-2 font-medium"
        >
          Collections
        </Link>
        <Link
          href="/about"
          className="block text-white hover:text-purple-300 py-2 font-medium"
        >
          About
        </Link>
        <Link
          href="/search"
          className="block text-white hover:text-purple-300 py-2 font-medium"
        >
          Search
        </Link>
        <Link
          href="/become-vendor"
          className="block text-rose-gold hover:text-rose-gold/80 py-2 font-medium"
        >
          Sell With Us
        </Link>
        <a
          href="https://vendor.sufisciencecenter.info"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-white hover:text-purple-300 py-2 font-medium"
        >
          Vendor Portal
        </a>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <h3 className="text-sm font-semibold text-white/60 mb-2">My Account</h3>
        <Link
          href="/account"
          className="block text-white hover:text-purple-300 py-2"
        >
          Dashboard
        </Link>
        <Link
          href="/account/orders"
          className="block text-white hover:text-purple-300 py-2"
        >
          My Orders
        </Link>
        <Link
          href="/account/wishlist"
          className="block text-white hover:text-purple-300 py-2"
        >
          Wishlist
        </Link>
        <Link
          href="/account/gift-cards"
          className="block text-white hover:text-purple-300 py-2"
        >
          Gift Cards
        </Link>
        <Link
          href="/account/registries"
          className="block text-white hover:text-purple-300 py-2"
        >
          Registries
        </Link>
        <Link
          href="/account/recipients"
          className="block text-white hover:text-purple-300 py-2"
        >
          Recipients
        </Link>
      </div>
    </div>
  );
}
