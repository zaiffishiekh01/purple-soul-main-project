import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const resolvedParams = await params;
  return NextResponse.json(
    {
      success: false,
      error: 'API endpoint not found',
      path: `/api/${resolvedParams.path?.join('/') ?? ''}`,
      available_endpoints: [
        '/api/health',
        '/api/catalog/navigation',
        '/api/catalog/taxonomy',
        '/api/catalog/facets',
      ],
    },
    { status: 404, headers: corsHeaders }
  );
}
