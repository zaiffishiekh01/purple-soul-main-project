import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productIds = searchParams.getAll('productIds');
  const categories = searchParams.getAll('categories');

  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_applicable_promotions', {
    p_product_ids: productIds,
    p_category_slugs: categories
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promotions: data || [] });
}
