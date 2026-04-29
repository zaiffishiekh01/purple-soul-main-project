import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export const revalidate = 3600;

export async function GET() {
  try {
    const supabase = createClient();

    const { data: layer1Data, error: layer1Error } = await supabase
      .from('categories')
      .select('id, slug, name, layer, parent_id, sort_order')
      .eq('layer', 1)
      .order('sort_order');

    if (layer1Error) throw layer1Error;

    const { data: layer2Data, error: layer2Error } = await supabase
      .from('categories')
      .select('id, slug, name, layer, parent_id, sort_order')
      .eq('layer', 2)
      .order('sort_order');

    if (layer2Error) throw layer2Error;

    const navigation = (layer1Data || []).map(cat => ({
      ...cat,
      subcategories: (layer2Data || []).filter(sub => sub.parent_id === cat.id)
    }));

    return NextResponse.json(navigation, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return NextResponse.json([], { status: 200 });
  }
}
