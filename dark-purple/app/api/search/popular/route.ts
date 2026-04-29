import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('popular_searches')
    .select('query_text, search_count')
    .order('search_count', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ popularSearches: data });
}
