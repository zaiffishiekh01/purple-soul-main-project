'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Heart,
  Gift,
  MapPin,
  CreditCard,
  Users,
  ArrowRight,
  TruckIcon,
  Calendar
} from 'lucide-react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  ordersCount: number;
  wishlistCount: number;
  giftCardBalance: number;
  recipientsCount: number;
  activeShipments: any[];
  recentOrders: any[];
}

export default function AccountDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    ordersCount: 0,
    wishlistCount: 0,
    giftCardBalance: 0,
    recipientsCount: 0,
    activeShipments: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const ordersPromise = supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user?.id);

      const wishlistPromise = supabase
        .from('wishlist_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      const giftCardsPromise = supabase
        .from('gift_cards')
        .select('current_balance')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      const recipientsPromise = supabase
        .from('recipients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      const shipmentsPromise = supabase
        .from('order_shipments')
        .select('*, orders!inner(*)')
        .eq('orders.customer_id', user?.id)
        .in('status', ['pending', 'label_created', 'shipped', 'in_transit'])
        .order('created_at', { ascending: false })
        .limit(5);

      const recentOrdersPromise = supabase
        .from('orders')
        .select('*, order_items(count)')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const [orders, wishlist, giftCards, recipients, shipments, recentOrders] = await Promise.all([
        ordersPromise,
        wishlistPromise,
        giftCardsPromise,
        recipientsPromise,
        shipmentsPromise,
        recentOrdersPromise
      ]);

      const totalBalance = giftCards.data?.reduce((sum, card) =>
        sum + parseFloat(card.current_balance || '0'), 0) || 0;

      setStats({
        ordersCount: orders.count || 0,
        wishlistCount: wishlist.count || 0,
        giftCardBalance: totalBalance,
        recipientsCount: recipients.count || 0,
        activeShipments: shipments.data || [],
        recentOrders: recentOrders.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-1/4"></div>
              <div className="h-4 bg-white/5 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Welcome Back!</CardTitle>
          <CardDescription className="text-white/60">
            Here's an overview of your account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/account/orders">
              <Card className="glass-card glass-card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8" style={{ color: '#d4af8a' }} />
                    <Badge className="bg-white/10 text-white border-white/20">{stats.ordersCount}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg text-white">Orders</h3>
                  <p className="text-sm text-white/60">View all orders</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/account/wishlist">
              <Card className="glass-card glass-card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-8 h-8" style={{ color: '#d4af8a' }} />
                    <Badge className="bg-white/10 text-white border-white/20">{stats.wishlistCount}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg text-white">Wishlist</h3>
                  <p className="text-sm text-white/60">Saved items</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/account/gift-cards">
              <Card className="glass-card glass-card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Gift className="w-8 h-8" style={{ color: '#d4af8a' }} />
                    <Badge className="bg-white/10 text-white border-white/20">
                      ${stats.giftCardBalance.toFixed(2)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg text-white">Gift Cards</h3>
                  <p className="text-sm text-white/60">Balance</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/account/recipients">
              <Card className="glass-card glass-card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8" style={{ color: '#d4af8a' }} />
                    <Badge className="bg-white/10 text-white border-white/20">{stats.recipientsCount}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg text-white">Recipients</h3>
                  <p className="text-sm text-white/60">Saved people</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TruckIcon className="w-5 h-5" />
              Active Shipments
            </CardTitle>
            <CardDescription className="text-white/60">Track your ongoing deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.activeShipments.length > 0 ? (
              <div className="space-y-4">
                {stats.activeShipments.map((shipment) => (
                  <div key={shipment.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-white">{shipment.carrier || 'Standard Shipping'}</p>
                        <p className="text-sm text-white/60">{shipment.tracking_number}</p>
                      </div>
                      <Badge className="bg-white/10 text-white border-white/20 capitalize">
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {shipment.estimated_delivery && (
                      <p className="text-xs text-white/50">
                        Est. delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active shipments</p>
                <Link href="/account/orders">
                  <Button variant="link" className="mt-2 text-white/70 hover:text-white">
                    View all orders <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-white/60">Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/account/orders">
              <Button variant="outline" className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10">
                <Package className="w-4 h-4 mr-2" />
                Track Package
              </Button>
            </Link>
            <Link href="/account/addresses">
              <Button variant="outline" className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10">
                <MapPin className="w-4 h-4 mr-2" />
                Manage Addresses
              </Button>
            </Link>
            <Link href="/account/payments">
              <Button variant="outline" className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Methods
              </Button>
            </Link>
            <Link href="/account/support">
              <Button variant="outline" className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10">
                <Package className="w-4 h-4 mr-2" />
                Get Help
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
          <CardDescription className="text-white/60">Your latest purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`}>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white">Order #{order.order_number}</p>
                        <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${parseFloat(order.total).toFixed(2)}</p>
                        <Badge className="bg-white/10 text-white border-white/20 capitalize mt-1">
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/account/orders">
                <Button variant="link" className="w-full text-white/70 hover:text-white">
                  View all orders <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
              <Link href="/">
                <Button variant="link" className="mt-2 text-white/70 hover:text-white">
                  Start shopping <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
