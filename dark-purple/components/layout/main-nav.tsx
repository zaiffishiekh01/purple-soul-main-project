'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

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

export function MainNav() {
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
    <NavigationMenu>
      <NavigationMenuList className="space-x-0.5">
        {categories.map((category) => (
          <NavigationMenuItem key={category.slug}>
            <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10 data-[state=open]:bg-white/10 h-9 px-3 text-sm">
              {category.name}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-[#1a1a1a] border-white/10">
                {category.subcategories?.map((sub) => (
                  <li key={sub.slug}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/c/${category.slug}/${sub.slug}`}
                        className={cn(
                          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white',
                          'text-white/90'
                        )}
                      >
                        <div className="text-sm font-medium leading-none">
                          {sub.name}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
                <li className="col-span-full">
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/c/${category.slug}`}
                      className="block select-none rounded-md p-3 text-center text-sm font-medium text-rose-gold hover:bg-white/10 hover:text-white transition-colors"
                    >
                      View All {category.name} →
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        <NavigationMenuItem>
          <Link href="/collections" legacyBehavior passHref>
            <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50">
              Collections
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50">
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/become-vendor" legacyBehavior passHref>
            <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-rose-gold/20 border border-rose-gold/30 px-4 py-2 text-sm font-medium text-rose-gold transition-colors hover:bg-rose-gold/30 hover:text-white focus:bg-rose-gold/30 focus:text-white focus:outline-none">
              Sell With Us
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <a
            href="https://vendor.sufisciencecenter.info"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            Vendor Portal
          </a>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
