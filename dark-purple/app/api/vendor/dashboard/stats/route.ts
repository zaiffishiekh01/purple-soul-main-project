import { NextRequest, NextResponse } from 'next/server';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const supabase = createClient();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: revenueData, error: revenueError } = await supabase
        .from('order_items')
        .select('quantity, unit_price, orders!inner(status, created_at, vendor_id)')
        .eq('orders.vendor_id', ctx.vendorId)
        .in('orders.status', ['completed', 'shipped', 'delivered'])
        .gte('orders.created_at', thirtyDaysAgo.toISOString());

      if (revenueError) {
        console.error('Revenue query error:', revenueError);
        throw revenueError;
      }

      const totalRevenue = revenueData?.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0) || 0;

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, created_at')
        .eq('vendor_id', ctx.vendorId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (ordersError) {
        console.error('Orders query error:', ordersError);
        throw ordersError;
      }

      const totalOrders = ordersData?.length || 0;
      const pendingOrders = ordersData?.filter(o => o.status === 'pending').length || 0;
      const processingOrders = ordersData?.filter(o => o.status === 'processing').length || 0;

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, stock_quantity, low_stock_threshold')
        .eq('vendor_id', ctx.vendorId);

      if (productsError) {
        console.error('Products query error:', productsError);
        throw productsError;
      }

      const totalProducts = productsData?.length || 0;
      const lowStockProducts = productsData?.filter(p =>
        p.stock_quantity <= (p.low_stock_threshold || 5)
      ).length || 0;

      const outOfStockProducts = productsData?.filter(p =>
        p.stock_quantity === 0
      ).length || 0;

      const stats = {
        revenue: {
          total: totalRevenue,
          period: '30_days',
          currency: 'USD'
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          period: '30_days'
        },
        products: {
          total: totalProducts,
          low_stock: lowStockProducts,
          out_of_stock: outOfStockProducts
        },
        alerts: {
          low_stock: lowStockProducts,
          pending_orders: pendingOrders
        }
      };

      await logVendorAction(
        ctx.userId,
        'view_dashboard_stats',
        'vendor_stats',
        ctx.vendorId,
        request
      );

      return NextResponse.json(stats);
    } catch (error) {
      console.error('Vendor stats error:', error);

      await logVendorAction(
        ctx.userId,
        'view_dashboard_stats',
        'vendor_stats',
        ctx.vendorId,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json(
        { error: 'Failed to fetch vendor statistics' },
        { status: 500 }
      );
    }
  });
}
