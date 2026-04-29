import { NextRequest, NextResponse } from 'next/server';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const supabase = createClient();
      const searchParams = request.nextUrl.searchParams;
      const search = searchParams.get('search');
      const category = searchParams.get('category');
      const status = searchParams.get('status');
      const stockStatus = searchParams.get('stock_status');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '20', 10);
      const sortBy = searchParams.get('sort_by') || 'created_at';
      const sortOrder = searchParams.get('sort_order') || 'desc';

      const offset = (page - 1) * limit;

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          sku,
          description,
          price,
          compare_at_price,
          stock_quantity,
          low_stock_threshold,
          status,
          images,
          created_at,
          updated_at,
          categories(
            id,
            name,
            slug
          )
        `, { count: 'exact' })
        .eq('vendor_id', ctx.vendorId);

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (category) {
        query = query.eq('category_id', category);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (stockStatus === 'low') {
        query = query.lte('stock_quantity', supabase.rpc('low_stock_threshold'));
      } else if (stockStatus === 'out') {
        query = query.eq('stock_quantity', 0);
      } else if (stockStatus === 'in_stock') {
        query = query.gt('stock_quantity', 0);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data: products, error, count } = await query;

      if (error) {
        console.error('Products query error:', error);
        throw error;
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;

      await logVendorAction(
        ctx.userId,
        'list_products',
        'vendor_products',
        null,
        request
      );

      return NextResponse.json({
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages
        }
      });
    } catch (error) {
      console.error('Vendor products error:', error);

      await logVendorAction(
        ctx.userId,
        'list_products',
        'vendor_products',
        null,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
  });
}
