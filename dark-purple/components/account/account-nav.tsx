'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  MapPin,
  CreditCard,
  Package,
  Heart,
  Gift,
  ListTree,
  Users,
  Shield,
  HeadphonesIcon,
  RotateCcw,
  Truck,
  Bell,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/account',
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: 'Profile',
    href: '/account/profile',
    icon: User
  },
  {
    title: 'Addresses',
    href: '/account/addresses',
    icon: MapPin
  },
  {
    title: 'Payment Methods',
    href: '/account/payments',
    icon: CreditCard
  },
  {
    title: 'Orders',
    href: '/account/orders',
    icon: Package
  },
  {
    title: 'Order Tracking',
    href: '/account/order-tracking',
    icon: Truck
  },
  {
    title: 'Returns & Refunds',
    href: '/account/returns',
    icon: RotateCcw
  },
  {
    title: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart
  },
  {
    title: 'Gift Cards',
    href: '/account/gift-cards',
    icon: Gift
  },
  {
    title: 'Registries',
    href: '/account/registries',
    icon: ListTree
  },
  {
    title: 'Recipients',
    href: '/account/recipients',
    icon: Users
  },
  {
    title: 'Subscriptions',
    href: '/account/subscriptions',
    icon: Calendar
  },
  {
    title: 'Notifications',
    href: '/account/notifications',
    icon: Bell
  },
  {
    title: 'Security',
    href: '/account/security',
    icon: Shield
  },
  {
    title: 'Support',
    href: '/account/support',
    icon: HeadphonesIcon
  }
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-white/10 text-white border-l-2'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}
            style={isActive ? { borderLeftColor: '#d4af8a' } : undefined}
          >
            <Icon className="w-5 h-5" style={isActive ? { color: '#d4af8a' } : undefined} />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
