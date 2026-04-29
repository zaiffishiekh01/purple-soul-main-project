import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const { data: stats } = await supabase
    .from('vendor_dashboard_stats')
    .select('*')
    .eq('vendor_id', vendor.id)
    .single();

  const { data: productAnalytics } = await supabase
    .from('product_analytics')
    .select('*, products(title)')
    .in('product_id', (
      await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', vendor.id)
    ).data?.map(p => p.id) || [])
    .order('revenue', { ascending: false })
    .limit(10);

  return NextResponse.json({
    stats: stats || {
      total_orders: 0,
      total_revenue: 0,
      total_items_sold: 0,
      average_order_value: 0,
      total_products: 0,
      average_rating: 0,
      total_reviews: 0
    },
    productAnalytics: productAnalytics || []
  });
}
