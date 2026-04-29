import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { code, cart_total } = await request.json();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: code,
    p_user_id: user?.id || null,
    p_cart_total: cart_total
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
