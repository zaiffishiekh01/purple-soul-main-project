import { NextResponse } from 'next/server';
import { fetchSupabaseFunction } from '../../_shared/catalog';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const result = await fetchSupabaseFunction('get-catalog-navigation');
  return NextResponse.json(result.data, {
    status: result.status,
    headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
  });
}
