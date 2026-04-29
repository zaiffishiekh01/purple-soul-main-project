import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const category = searchParams.get('category');
  const traditions = searchParams.getAll('traditions');
  const materials = searchParams.getAll('materials');
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');

  const supabase = createClient();

  let dbQuery = supabase
    .from('products')
    .select('*, vendors(business_name)', { count: 'exact' })
    .eq('is_active', true);

  if (query) {
    dbQuery = dbQuery.textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english'
    });

    const { data: user } = await supabase.auth.getUser();
    await supabase.rpc('increment_popular_search', { search_term: query });

    await supabase.from('search_queries').insert({
      user_id: user.user?.id || null,
      query_text: query,
      result_count: 0,
      filters_applied: {
        minPrice, maxPrice, category, traditions, materials
      }
    });
  }

  if (minPrice) {
    dbQuery = dbQuery.gte('price', parseFloat(minPrice));
  }

  if (maxPrice) {
    dbQuery = dbQuery.lte('price', parseFloat(maxPrice));
  }

  if (category) {
    dbQuery = dbQuery.or(`layer1_category_slug.eq.${category},layer2_category_slug.eq.${category}`);
  }

  if (traditions.length > 0) {
    dbQuery = dbQuery.overlaps('traditions', traditions);
  }

  if (materials.length > 0) {
    dbQuery = dbQuery.overlaps('materials', materials);
  }

  switch (sort) {
    case 'price_asc':
      dbQuery = dbQuery.order('price', { ascending: true });
      break;
    case 'price_desc':
      dbQuery = dbQuery.order('price', { ascending: false });
      break;
    case 'newest':
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
    case 'relevance':
    default:
      if (query) {
        dbQuery = dbQuery.order('search_vector', { ascending: false });
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false });
      }
  }

  const offset = (page - 1) * limit;
  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data: products, error, count } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}
