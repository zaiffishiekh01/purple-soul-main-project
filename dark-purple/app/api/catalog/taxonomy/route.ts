import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const EXTERNAL_CATALOG_URL = process.env.NEXT_PUBLIC_CATALOG_API_BASE_URL;

/**
 * GET /api/catalog/taxonomy
 *
 * Returns taxonomy structure for category pages.
 * Optional query param: category (slug) to filter by specific category.
 *
 * Fetches from external Admin Dashboard as the source of truth.
 * Falls back to local Supabase if external API is unavailable.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');

  if (EXTERNAL_CATALOG_URL) {
    try {
      const externalUrl = categorySlug
        ? `${EXTERNAL_CATALOG_URL}/api/catalog/taxonomy?category=${categorySlug}`
        : `${EXTERNAL_CATALOG_URL}/api/catalog/taxonomy`;

      const response = await fetch(externalUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      console.warn('External catalog API returned non-OK status:', response.status);
    } catch (error) {
      console.warn('Failed to fetch from external catalog API, using local fallback:', error);
    }
  }

  try {
    const supabase = createClient();

    if (categorySlug) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      const { data: subcategories, error: subError } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)
        .order('sort_order');

      if (subError) throw subError;

      return NextResponse.json({
        ...category,
        subcategories: subcategories || []
      });
    }

    const { data: layer1Data, error: layer1Error } = await supabase
      .from('categories')
      .select('*')
      .eq('layer', 1)
      .order('sort_order');

    if (layer1Error) throw layer1Error;

    const { data: layer2Data, error: layer2Error } = await supabase
      .from('categories')
      .select('*')
      .eq('layer', 2)
      .order('sort_order');

    if (layer2Error) throw layer2Error;

    const taxonomy = (layer1Data || []).map(cat => ({
      ...cat,
      subcategories: (layer2Data || []).filter(sub => sub.parent_id === cat.id)
    }));

    return NextResponse.json(taxonomy);
  } catch (error) {
    console.error('Error fetching taxonomy from fallback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch taxonomy' },
      { status: 500 }
    );
  }
}
