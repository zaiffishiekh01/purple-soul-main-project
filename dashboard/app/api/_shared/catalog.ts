const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function fetchSupabaseFunction(functionName: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      status: 500,
      data: {
        success: false,
        error: 'Server is missing required Supabase configuration',
      },
    };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
    });

    return {
      status: response.status,
      data: await response.json(),
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
