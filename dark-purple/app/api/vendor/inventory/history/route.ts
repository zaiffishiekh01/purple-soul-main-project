import { NextRequest, NextResponse } from 'next/server';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const supabase = createClient();
      const searchParams = request.nextUrl.searchParams;
      const productId = searchParams.get('product_id');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);

      const offset = (page - 1) * limit;

      let query = supabase
        .from('inventory_history')
        .select(`
          id,
          product_id,
          change_type,
          quantity_change,
          quantity_before,
          quantity_after,
          reason,
          reference_id,
          reference_type,
          notes,
          created_at,
          created_by,
          products!inner(
            id,
            name,
            sku,
            vendor_id
          )
        `, { count: 'exact' })
        .eq('products.vendor_id', ctx.vendorId);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: history, error, count } = await query;

      if (error) {
        console.error('Inventory history query error:', error);
        throw error;
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;

      await logVendorAction(
        ctx.userId,
        'view_inventory_history',
        'inventory_history',
        productId,
        request
      );

      return NextResponse.json({
        history: history || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages
        }
      });
    } catch (error) {
      console.error('Vendor inventory history error:', error);

      await logVendorAction(
        ctx.userId,
        'view_inventory_history',
        'inventory_history',
        null,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json(
        { error: 'Failed to fetch inventory history' },
        { status: 500 }
      );
    }
  });
}
