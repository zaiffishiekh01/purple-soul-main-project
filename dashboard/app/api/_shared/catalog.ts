import { query } from '@/src/lib/server/db';

export async function fetchSupabaseFunction(functionName: string) {
  try {
    if (functionName === 'get-catalog-navigation') {
      const result = await query(
        `SELECT * FROM navigation_links WHERE is_active = true ORDER BY display_order ASC, created_at ASC`,
      );
      return { status: 200, data: { success: true, data: result.rows } };
    }
    if (functionName === 'get-catalog-taxonomy') {
      const result = await query(
        `SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC, name ASC`,
      );
      return { status: 200, data: { success: true, data: result.rows } };
    }
    if (functionName === 'get-catalog-facets') {
      const result = await query(
        `SELECT * FROM facets WHERE is_active = true ORDER BY display_order ASC, name ASC`,
      );
      return { status: 200, data: { success: true, data: result.rows } };
    }
    return {
      status: 404,
      data: { success: false, error: `Unknown catalog function: ${functionName}` },
    };
  } catch (error) {
    return {
      status: 500,
      data: {
        success: false,
        error: 'Failed to fetch data from backend',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
