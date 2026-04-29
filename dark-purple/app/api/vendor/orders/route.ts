import { NextRequest, NextResponse } from 'next/server';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const supabase = createClient();
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);
      const sortBy = searchParams.get('sort_by') || 'created_at';
      const sortOrder = searchParams.get('sort_order') || 'desc';

      const offset = (page - 1) * limit;

      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          updated_at,
          customer_email,
          shipping_address,
          order_items!inner(
            id,
            quantity,
            unit_price,
            subtotal,
            products(
              id,
              name,
              sku
            )
          )
        `, { count: 'exact' })
        .eq('vendor_id', ctx.vendorId);

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data: orders, error, count } = await query;

      if (error) {
        console.error('Orders query error:', error);
        throw error;
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;

      await logVendorAction(
        ctx.userId,
        'list_orders',
        'vendor_orders',
        null,
        request
      );

      return NextResponse.json({
        orders: orders || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages
        }
      });
    } catch (error) {
      console.error('Vendor orders error:', error);

      await logVendorAction(
        ctx.userId,
        'list_orders',
        'vendor_orders',
        null,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }
  });
}
